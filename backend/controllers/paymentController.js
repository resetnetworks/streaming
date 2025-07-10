import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/index.js";
import { Transaction } from "../models/Transaction.js";
import { createStripePaymentIntent } from "../utils/stripe.js";

// ✅ Stripe: Purchase song or album
export const createStripePayment = async (req, res) => {
  const { itemType, itemId, amount, currency = "INR" } = req.body;
  const userId = req.user._id;

  // ✅ Validate item type
  if (!["song", "album", "artist-subscription"].includes(itemType)) {
    throw new BadRequestError("Invalid item type. Must be 'song', 'album', or 'artist-subscription'.");
  }

  // ✅ Create Transaction first
  const transaction = await Transaction.create({
    userId,
    itemType,
    itemId,
    artistId: itemType === "artist-subscription" ? itemId : undefined,
    amount,
    currency,
    gateway: "stripe",
    status: "pending",
  });

  // ✅ Create Stripe PaymentIntent with metadata including transactionId
  const stripePayment = await createStripePaymentIntent(amount, userId, {
    itemType,
    itemId,
    transactionId: transaction._id,
  });

  // ✅ Update paymentIntentId in Transaction
  transaction.paymentIntentId = stripePayment.id;
  await transaction.save();

  // ✅ Respond with client secret
  return res.status(StatusCodes.CREATED).json({
    success: true,
    clientSecret: stripePayment.client_secret,
  });
};


// ✅ Razorpay: Purchase song or album
export const createRazorpayOrder = async (req, res) => {
  const { itemType, itemId, amount, currency = "INR" } = req.body;
  const userId = req.user._id;

  if (!["song", "album"].includes(itemType)) {
    throw new BadRequestError("Invalid item type. Must be 'song' or 'album'.");
  }

  const razorpayOrder = await createRazorpayOrderUtil(amount, userId);

  await Transaction.create({
    userId,
    itemType,
    itemId,
    amount,
    currency,
    gateway: "razorpay",
    status: "pending",
    razorpayOrderId: razorpayOrder.id,
  });

  return res.status(StatusCodes.CREATED).json({
    success: true,
    order: razorpayOrder,
  });
};

