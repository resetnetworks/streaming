// /webhooks/webhookController.js

import Stripe from "stripe";
import crypto from "crypto";
import { markTransactionPaid, updateUserAfterPurchase } from "../services/paymentService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------------------
// ✅ STRIPE WEBHOOK HANDLER
// ---------------------------
export const stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (err) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    const paymentIntentId = paymentIntent.id;
    const transactionId = paymentIntent.metadata?.transactionId || null;

    const transaction = await markTransactionPaid({
      gateway: "stripe",
      paymentIntentId,
    });

    if (transaction) {
      await updateUserAfterPurchase(transaction, paymentIntentId);
      console.log("✅ Stripe: Transaction and user updated");
    } else {
      console.warn("⚠️ Stripe: Transaction already paid or not found");
    }
  }

  res.status(200).json({ received: true });
};

// ---------------------------
// ✅ RAZORPAY WEBHOOK HANDLER
// ---------------------------
export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("❌ Invalid Razorpay signature");
    return res.status(400).json({ message: "Invalid signature" });
  }

  const event = req.body.event;

  if (event === "payment.captured") {
    const paymentEntity = req.body.payload.payment.entity;
    const razorpayOrderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    const transaction = await markTransactionPaid({
      gateway: "razorpay",
      razorpayOrderId,
    });

    if (transaction) {
      await updateUserAfterPurchase(transaction, paymentId);
      console.log("✅ Razorpay: Transaction and user updated");
    } else {
      console.warn("⚠️ Razorpay: Transaction already paid or not found");
    }
  }

  res.status(200).json({ status: "ok" });
};
