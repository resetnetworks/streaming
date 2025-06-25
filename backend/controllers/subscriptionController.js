import { Subscription } from "../models/Subscription.js";
import { Artist } from "../models/Artist.js";
import { Transaction } from "../models/Transaction.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { createStripePaymentIntent } from "../utils/stripe.js";
import { createRazorpayOrder } from "../utils/razorpay.js";

export const initiateArtistSubscription = async (req, res) => {
  const userId = req.user._id;
  const { gateway } = req.body;
  const { artistId } = req.params;

  // 1. Validate input
  if (!["stripe", "razorpay"].includes(gateway)) {
    throw new BadRequestError("Invalid payment gateway.");
  }

  const artist = await Artist.findById(artistId);
  if (!artist) throw new NotFoundError("Artist not found");

  // 2. Check for existing subscription
  const existing = await Subscription.findOne({
    userId,
    artistId,
    status: "active",
    validUntil: { $gt: new Date() },
  });

  if (existing) {
    throw new BadRequestError("You already have an active subscription to this artist.");
  }

  // 3. Calculate amount (in paise or cents)
  const amount = artist.subscriptionPrice;
  if (!amount || amount <= 0) {
    throw new BadRequestError("Artist subscription price is invalid.");
  }

  let paymentIntentId = null;
  let razorpayOrderId = null;
  let clientSecret = null;

  // 4. Create payment
  if (gateway === "stripe") {
    const payment = await createStripePaymentIntent(amount, userId);
    paymentIntentId = payment.id;
    clientSecret = payment.client_secret;
  } else if (gateway === "razorpay") {
    const order = await createRazorpayOrder(amount, userId);
    razorpayOrderId = order.id;
  }

  // 5. Save initial Transaction
  const transaction = await Transaction.create({
    userId,
    itemType: "artist-subscription",
    itemId: artist._id,
    artistId: artist._id,
    gateway,
    amount,
    currency: "INR", // or "USD"
    status: "pending",
    paymentIntentId,
    razorpayOrderId,
  });

  return res.status(201).json({
    success: true,
    transactionId: transaction._id,
    gateway,
    ...(gateway === "stripe" ? { clientSecret } : { razorpayOrderId }),
  });
};
