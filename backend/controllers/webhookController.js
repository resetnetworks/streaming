// /webhooks/webhookController.js
import Stripe from "stripe";
import { Transaction } from "../models/Transaction.js";
import { Subscription } from "../models/Subscription.js";
import {
  markTransactionPaid,
  updateUserAfterPurchase,
} from "../services/paymentService.js";
import { WebhookEventLog } from "../models/WebhookEventLog.js";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

  const eventType = event.type;
  const data = event.data.object;

  // 🧠 Check if this event has already been processed
const existingLog = await WebhookEventLog.findOne({ eventId: event.id });
if (existingLog) {
  console.warn(`⚠️ Duplicate event ${event.id} ignored`);
  return res.status(200).json({ received: true, duplicate: true });
}

// ✅ First time we're seeing this event → save it
await WebhookEventLog.create({
  eventId: event.id,
  type: event.type,
});


  console.log(`📥 Stripe event received: ${eventType}`);

  try {
    switch (eventType) {
      // ✅ One-time payments: songs or albums
      case "payment_intent.succeeded": {
        const metadata = data.metadata || {};
        const transactionId = metadata.transactionId;

        // 🛑 Skip if this is a subscription invoice
        if (data.invoice) {
          console.log("ℹ️ Skipping payment_intent for subscription invoice:", data.id);
          break;
        }

        if (!transactionId) {
          console.warn("⚠️ Missing transactionId in metadata. Skipping.");
          break;
        }

        const transaction = await markTransactionPaid({
          gateway: "stripe",
          paymentIntentId: data.id,
        });

        if (transaction) {
          await updateUserAfterPurchase(transaction, data.id);
          console.log("✅ One-time payment processed:", data.id);
        } else {
          console.warn("⚠️ Transaction not found or already processed:", transactionId);
        }
        break;
      }

      // ✅ Subscription payment succeeded
      case "invoice.payment_succeeded": {
        const subscriptionId = data.subscription;
        const transaction = await markTransactionPaid({
          gateway: "stripe",
          stripeSubscriptionId: subscriptionId,
        });

        if (transaction) {
          await updateUserAfterPurchase(transaction, subscriptionId);
          console.log("✅ Subscription payment succeeded:", subscriptionId);
        } else {
          console.warn("⚠️ No matching transaction for subscription invoice:", subscriptionId);
        }
        break;
      }

      // ❌ Subscription payment failed
      case "invoice.payment_failed": {
        const subscriptionId = data.subscription;
        await Subscription.findOneAndUpdate(
          { externalSubscriptionId: subscriptionId },
          { status: "failed" }
        );
        console.warn("❌ Subscription payment failed:", subscriptionId);
        break;
      }

      // 🚫 Subscription cancelled (manually or due to end of billing)
      case "customer.subscription.deleted": {
        const subscriptionId = data.id;
        await Subscription.findOneAndUpdate(
          { externalSubscriptionId: subscriptionId },
          { status: "cancelled" }
        );
        console.warn("❌ Subscription cancelled by user or Stripe:", subscriptionId);
        break;
      }

      // ❌ One-time payment failed
      case "payment_intent.payment_failed": {
        const paymentIntentId = data.id;

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
        break;
      }

      default:
        console.log("ℹ️ Unhandled Stripe event:", eventType);
    }
  } catch (err) {
    console.error("❌ Error processing Stripe webhook:", err.message);
  }

  // ✅ Always respond 200 so Stripe doesn’t retry
  res.status(200).json({ received: true });
};



// ---------------------------
// ✅ RAZORPAY WEBHOOK HANDLER
// ---------------------------
// export const razorpayWebhook = async (req, res) => {
//   const secret = process.env.RAZORPAY_SECRET;
//   const signature = req.headers["x-razorpay-signature"];
//   const body = JSON.stringify(req.body);

//   const expectedSignature = crypto
//     .createHmac("sha256", secret)
//     .update(body)
//     .digest("hex");

//   if (signature !== expectedSignature) {
//     console.error("❌ Invalid Razorpay signature");
//     return res.status(400).json({ message: "Invalid signature" });
//   }

//   const event = req.body.event;

//   if (event === "payment.captured") {
//     const paymentEntity = req.body.payload.payment.entity;
//     const razorpayOrderId = paymentEntity.order_id;
//     const paymentId = paymentEntity.id;

//     const transaction = await markTransactionPaid({
//       gateway: "razorpay",
//       razorpayOrderId,
//     });

//     if (transaction) {
//       await updateUserAfterPurchase(transaction, paymentId);
//       console.log("✅ Razorpay: Transaction and user updated");
//     } else {
//       console.warn("⚠️ Razorpay: Transaction already paid or not found");
//     }
//   }

//   res.status(200).json({ status: "ok" });
// };
