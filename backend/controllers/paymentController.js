import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/index.js";
import { Transaction } from "../models/Transaction.js";
import { createStripePaymentIntent } from "../utils/stripe.js";
import { createRazorpayOrder as createRazorpayOrderUtil } from "../utils/razorpay.js";

// ✅ Stripe: Purchase song or album
export const createStripePayment = async (req, res) => {
  const { itemType, itemId, amount, currency = "INR" } = req.body;
  const userId = req.user._id;

  // Validate item type
  if (!["song", "album"].includes(itemType)) {
    throw new BadRequestError("Invalid item type. Must be 'song' or 'album'.");
  }

  // Create Stripe PaymentIntent
  const stripePayment = await createStripePaymentIntent(amount, userId, {
    itemType,
    itemId,
  });

  // Create Transaction
  await Transaction.create({
    userId,
    itemType,
    itemId,
    amount,
    currency,
    gateway: "stripe",
    status: "pending",
    paymentIntentId: stripePayment.id,
  });

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
