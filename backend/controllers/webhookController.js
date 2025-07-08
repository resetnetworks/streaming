// /webhooks/webhookController.js
import Stripe from "stripe";
import crypto from "crypto";
import { markTransactionPaid, updateUserAfterPurchase } from "../services/paymentService.js";
import { Transaction } from "../models/Transaction.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Stripe webhook controller
export const stripeWebhook = async (req, res) => {
  console.log("📡 Stripe webhook called");
  const signature = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (err) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📥 Stripe webhook received: ${event.type}`);

  // ✅ PAYMENT SUCCESSFUL
  if (event.type === "payment_intent.succeeded") {
    try {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const metadata = paymentIntent.metadata || {};
      const transactionId = metadata.transactionId || null;

      console.log("💳 PaymentIntent ID:", paymentIntentId);
      console.log("📝 Metadata:", metadata);

      if (!transactionId) {
        console.warn("⚠️ Missing transactionId in metadata. Skipping update.");
        return res.status(200).json({ received: true });
      }

      const transaction = await markTransactionPaid({
        gateway: "stripe",
        paymentIntentId,
      });

      if (transaction) {
        console.log("📦 Transaction found:", transaction);
        await updateUserAfterPurchase(transaction, paymentIntentId);
        console.log("✅ Stripe: Transaction and user updated in MongoDB");
      } else {
        console.warn("⚠️ Stripe: Transaction not found or already paid");
      }
    } catch (error) {
      console.error("❌ Error handling payment_intent.succeeded:", error);
    }
  }

  // ❌ PAYMENT FAILED
  else if (event.type === "payment_intent.payment_failed") {
    try {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      console.warn("❌ Stripe: Payment failed for PaymentIntent ID:", paymentIntentId);

      const updated = await Transaction.findOneAndUpdate(
        { paymentIntentId },
        { status: "failed" },
        { new: true }
      );

      if (updated) {
        console.log("🟥 Transaction marked as failed:", updated._id);
      } else {
        console.warn("⚠️ Failed transaction not found in DB:", paymentIntentId);
      }
    } catch (error) {
      console.error("❌ Error handling payment_intent.payment_failed:", error);
    }
  }

  // ✅ Always respond 200 so Stripe doesn’t retry
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
