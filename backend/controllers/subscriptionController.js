import { StatusCodes } from "http-status-codes";
import { Subscription } from "../models/Subscription.js";
import { Artist } from "../models/Artist.js";
import { Transaction } from "../models/Transaction.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { createRazorpayOrder } from "../utils/razorpay.js";
import { getOrCreateStripeCustomer } from "../utils/stripe.js";
import Stripe from "stripe";
import {User} from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Initiate artist subscription via Stripe or Razorpay
export const initiateArtistSubscription = async (req, res) => {
  const userId = req.user._id;
  const { gateway } = req.body;
  const { artistId } = req.params;

  // 1. Validate gateway
  if (!["stripe", "razorpay"].includes(gateway)) {
    throw new BadRequestError("Invalid payment gateway. Must be 'stripe' or 'razorpay'.");
  }

  // 2. Validate artist
  const artist = await Artist.findById(artistId);
  if (!artist) throw new NotFoundError("Artist not found.");
  if (!artist.stripePriceId && gateway === "stripe") {
    throw new BadRequestError("Artist does not have a Stripe recurring price configured.");
  }

  // 3. Check if user already has an active subscription
  const existingSub = await Subscription.findOne({
    userId,
    artistId,
    status: "active",
    validUntil: { $gt: new Date() },
  });

  if (existingSub) {
    throw new BadRequestError("You already have an active subscription to this artist.");
  }

  // 4. Validate subscription price
  const amount = artist.subscriptionPrice;
  if (!amount || amount <= 0) {
    throw new BadRequestError("Artist subscription price is invalid.");
  }

  // 5. Create transaction
  const transaction = await Transaction.create({
    userId,
    itemType: "artist-subscription",
    itemId: artistId,
    artistId,
    amount,
    currency: "INR",
    status: "pending",
    gateway,
  });
const transactionId = transaction._id;
  let clientSecret = null;
  let paymentIntentId = null;
  let razorpayOrderId = null;

  // 6. Stripe recurring subscription flow
  if (gateway === "stripe") {
  const user = await User.findById(userId);
  const customerId = await getOrCreateStripeCustomer(user);
  const price = artist.stripePriceId;
  const { paymentMethodId } = req.body;

  // Step 1: Validate and attach payment method
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

  if (paymentMethod.customer && paymentMethod.customer !== customerId) {
    throw new BadRequestError("This card is already associated with another account.");
  }

  if (!paymentMethod.customer) {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  // Step 2: Set as default for future invoices
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  // Step 3: Create subscription
let priceId = artist.stripePriceId;
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  default_payment_method: paymentMethodId, // ✅ CRUCIAL LINE
  metadata: {
    userId: userId.toString(),
    artistId,
    transactionId: transaction._id.toString(),
    itemType: 'artist-subscription',
  },
  expand: ['latest_invoice.payment_intent'],
  payment_settings: {
  payment_method_types: ['card'],
  save_default_payment_method: 'on_subscription',
},
});
console.log("Stripe subscription created:", subscription);
const paymentIntent = subscription.latest_invoice.payment_intent;
console.log("PaymentIntent Status:", paymentIntent.status);


// ✅ Fetch latest invoice separately and expand the payment intent
const invoice = await stripe.invoices.retrieve(subscription.latest_invoice, {
  expand: ["payment_intent"],
});
console.log("invoice----------------",invoice);




if (!paymentIntent?.id || !paymentIntent?.client_secret) {
  throw new Error("Stripe payment intent could not be created.");
}

  // Step 4: Manually fetch latest invoice with payment intent
  

  if (!paymentIntent?.id || !paymentIntent?.client_secret) {
    throw new Error("Stripe payment intent could not be created.");
  }

  paymentIntentId = paymentIntent.id;
  clientSecret = paymentIntent.client_secret;

  // Step 5: Save IDs to transaction
  transaction.paymentIntentId = paymentIntentId;
  transaction.stripeSubscriptionId = subscription.id;
}


  // 7. Razorpay order flow
  else {
    const razorpayRes = await createRazorpayOrder(amount, userId, {
      itemType: "artist-subscription",
      itemId: artistId,
      transactionId: transaction._id.toString(),
    });

    razorpayOrderId = razorpayRes.id;
    transaction.razorpayOrderId = razorpayOrderId;
  }

  // 8. Save transaction
  await transaction.save();

  // 9. Send response
  return res.status(StatusCodes.CREATED).json({
    success: true,
    transactionId: transaction._id,
    gateway,
    ...(gateway === "stripe"
      ? { clientSecret }
      : { razorpayOrderId }),
  });
};



export const cancelArtistSubscription = async (req, res) => {
  const { artistId } = req.params;
  const userId = req.user._id;

  const sub = await Subscription.findOne({
    userId,
    artistId,
    status: "active",
    validUntil: { $gt: new Date() },
  });

  if (!sub) {
    return res.status(404).json({ message: "No active subscription found." });
  }

  sub.status = "cancelled";
  sub.validUntil = new Date(); // immediately invalid
  await sub.save();

  // Optional: cancel from Stripe if using recurring
  if (sub.gateway === "stripe" && sub.externalSubscriptionId) {
    try {
      await stripe.subscriptions.update(sub.externalSubscriptionId, {
        cancel_at_period_end: true,
      });
      console.log("⛔ Stripe subscription set to cancel at end of period");
    } catch (err) {
      console.warn("⚠️ Error cancelling Stripe sub:", err.message);
    }
  }

  return res.status(200).json({ success: true, message: "Subscription cancelled." });
};

// controllers/paymentController.js
export const createSetupIntent = async (req, res) => {
  const user = await User.findById(req.user._id);
  const customerId = await getOrCreateStripeCustomer(user);

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    usage: "off_session", // for subscriptions
  });

  res.status(200).json({ clientSecret: setupIntent.client_secret });
};
