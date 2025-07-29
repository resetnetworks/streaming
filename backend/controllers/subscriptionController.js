import { StatusCodes } from "http-status-codes";
import { Subscription } from "../models/Subscription.js";
import { Artist } from "../models/Artist.js";
import { Transaction } from "../models/Transaction.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { createRazorpayOrder } from "../utils/razorpay.js";
import { getOrCreateStripeCustomer } from "../utils/stripe.js";
import Stripe from "stripe";
import {User} from "../models/User.js";
import Razorpay from "razorpay";
import { createRazorpayPlan } from "../utils/razorpay.js";
import { razorpay } from "../utils/razorpay.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const initiateArtistSubscription = async (req, res) => {
  const userId = req.user._id;
  const { paymentMethodId, gateway } = req.body;
  const { artistId } = req.params;
  const {line1, city, state, postal_code, country} = req.body
  const address = {
    line1,
    city,
    state,
    postal_code,
    country,
  };

  if (gateway !== 'stripe') {
    return res.status(400).json({ message: 'Invalid gateway' });
  }

  // ✅ Check if subscription is already in process or active
const existingActiveSub = await Subscription.findOne({
  userId,
  artistId,
  status: "active",
  validUntil: { $gt: new Date() }, // still valid
});

if (existingActiveSub) {
  return res.status(400).json({ message: 'Subscription already active.' });
}

  // const user = await User.findById(userId);
  // const artist = await Artist.findById(artistId);

  const [user, artist] = await Promise.all([
    User.findById(userId),
    Artist.findById(artistId)
  ]);

  if (!user || !artist) {
    return res.status(404).json({ message: 'User or artist not found' });
  }
let customerId = user.stripeCustomerId;
  // Ensure customer exists or create
 if (!customerId) {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    address: address,
  });
  customerId = customer.id;
  user.stripeCustomerId = customerId;
  await user.save();
} else {
  // 👇 Ensure address is present even for existing customers
  await stripe.customers.update(customerId, {
    name: user.name,
    address: address,
  });
}

  await stripe.paymentMethods.attach(paymentMethodId, {
  customer: customerId,
});

// 2. Set as default for invoices
await stripe.customers.update(customerId, {
  invoice_settings: {
    default_payment_method: paymentMethodId,
  },
});

  // Create Stripe subscription using saved payment method
 const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: artist.stripePriceId }],
  payment_behavior: 'default_incomplete', // 👈 ensures first payment must be confirmed
  expand: ['latest_invoice.payment_intent'],
  default_payment_method: paymentMethodId, // ✅ set default method for subscription
  payment_settings: {
    payment_method_types: ['card'],
    save_default_payment_method: 'on_subscription', // ✅ important for recurring payments
  },
  metadata: {
    userId: userId.toString(),
    artistId: artistId.toString(),
  },
});



  // Create transaction in DB
  const transaction = await Transaction.create({
    userId,
    artistId,
    itemId: artistId,
    itemType: 'artist-subscription',
    amount: artist.subscriptionPrice || 500,
    currency: 'inr',
    status: 'pending',
    gateway: 'stripe',
    stripeSubscriptionId: subscription.id,
  });


let clientSecret = null;
if (subscription.latest_invoice && !subscription.latest_invoice.payment_intent) {
  // Set payment method on the invoice if missing
  if (!subscription.latest_invoice.default_payment_method) {
    await stripe.invoices.update(subscription.latest_invoice.id, {
      default_payment_method: paymentMethodId,
    });
  }
  // Attempt payment
  await stripe.invoices.pay(subscription.latest_invoice.id);
  // Fetch the invoice again with expanded payment_intent
  const invoice = await stripe.invoices.retrieve(subscription.latest_invoice.id, {
    expand: ['payment_intent'],
  });
  clientSecret = invoice.payment_intent?.client_secret || null;
} else {
  clientSecret = subscription.latest_invoice?.payment_intent?.client_secret || null;
}

  // Safely get clientSecret if available (needed for SCA)
  //const clientSecret = subscription?.latest_invoice?.payment_intent?.client_secret || null;
   console.log("🧾 Returning clientSecret for first invoice:", clientSecret);
   console.log("DEBUG subscription.latest_invoice:", subscription.latest_invoice);
   console.log("DEBUG subscription.latest_invoice.payment_intent:", subscription.latest_invoice?.payment_intent);



  res.status(200).json({
    message: 'Subscription initiated',
    subscriptionId: subscription.id,
    clientSecret, // will be null if not required
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
  // sub.validUntil = new Date(); // immediately invalid
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


export const createRazorpaySubscription = async (req, res) => {
  const { artistId } = req.params;
  const user = req.user;
  console.log(artistId, user._id);
  

  const artist = await Artist.findById(artistId).select(
    "razorpayPlanId subscriptionPrice"
  );
  if (!artist || !artist.razorpayPlanId) {
    throw new Error("Artist subscription not available");
  }

  const subscription = await razorpay.subscriptions.create({
    plan_id: artist.razorpayPlanId,
    total_count: 12, // 12 months, or set null for "infinite until cancel"
    customer_notify: 1,
    notes: {
      userId: user._id.toString(),
      artistId: artistId.toString(),
    },
  });

  // ✅ Save transaction as pending
  await Transaction.create({
    userId: user._id,
    itemType: "artist-subscription",
    itemId: artistId,
    artistId,
    amount: artist.subscriptionPrice,
    currency: "INR",
    gateway: "razorpay",
    status: "pending",
    metadata: { razorpaySubscriptionId: subscription.id },
  });

  res.status(201).json({
    success: true,
    subscriptionId: subscription.id,
  });
};