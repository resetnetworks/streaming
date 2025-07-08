import { StatusCodes } from "http-status-codes";
import { Subscription } from "../models/Subscription.js";
import { Artist } from "../models/Artist.js";
import { Transaction } from "../models/Transaction.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { createStripePaymentIntent } from "../utils/stripe.js";
import { createRazorpayOrder } from "../utils/razorpay.js";

// ✅ Initiate artist subscription via Stripe or Razorpay
export const initiateArtistSubscription = async (req, res) => {
  const userId = req.user._id;
  const { gateway } = req.body;
  const { artistId } = req.params;

  // 1. Validate gateway
  if (!["stripe", "razorpay"].includes(gateway)) {
    throw new BadRequestError("Invalid payment gateway. Must be 'stripe' or 'razorpay'.");
  }

  // 2. Check artist validity
  const artist = await Artist.findById(artistId);
  if (!artist) throw new NotFoundError("Artist not found.");

  // 3. Check for existing active subscription
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

  // 5. Create empty transaction first
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

  // 6. Call utility to create gateway session with transactionId
  let paymentIntentId = null;
  let razorpayOrderId = null;
  let clientSecret = null;

  if (gateway === "stripe") {
    const stripeRes = await createStripePaymentIntent(amount, userId, {
      itemType: "artist-subscription",
      itemId: artistId,
      transactionId: transaction._id.toString(), // ✅ very important!
    });

    paymentIntentId = stripeRes.id;
    clientSecret = stripeRes.client_secret;
    transaction.paymentIntentId = paymentIntentId;
  } else {
    const razorpayRes = await createRazorpayOrder(amount, userId, {
      itemType: "artist-subscription",
      itemId: artistId,
      transactionId: transaction._id.toString(), // ✅ very important!
    });

    razorpayOrderId = razorpayRes.id;
    transaction.razorpayOrderId = razorpayOrderId;
  }

  // 7. Save updated transaction
  await transaction.save();

  // 8. Respond
  return res.status(StatusCodes.CREATED).json({
    success: true,
    transactionId: transaction._id,
    gateway,
    ...(gateway === "stripe"
      ? { clientSecret }
      : { razorpayOrderId }),
  });
};
