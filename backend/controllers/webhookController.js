import Stripe from "stripe";
import crypto from "crypto";
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";
import { Subscription } from "../models/Subscription.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --------------- STRIPE WEBHOOK ----------------

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log("✅ Stripe PaymentIntent succeeded:", paymentIntent.id);

    const transactionId = paymentIntent.metadata?.transactionId;
    let transaction;

    if (transactionId) {
      transaction = await Transaction.findById(transactionId);
    } else {
      transaction = await Transaction.findOne({
        paymentIntentId: paymentIntent.id,
        gateway: "stripe",
      });
    }

    if (transaction && transaction.status !== "paid") {
      transaction.status = "paid";
      await transaction.save();

      const user = await User.findById(transaction.userId);
      if (user) {
        user.purchaseHistory.push({
          itemType: transaction.itemType,
          itemId: transaction.itemId,
          price: transaction.amount,
          paymentId: paymentIntent.id,
        });

        // 🎵 Purchased Song
        if (transaction.itemType === "song") {
          user.purchasedSongs.push(transaction.itemId);
        }

        // 💿 Purchased Album
        else if (transaction.itemType === "album") {
          user.purchasedAlbums.push(transaction.itemId);
        }

        // 🎫 Artist Subscription
        else if (transaction.itemType === "artist-subscription") {
          const existing = await Subscription.findOne({
            userId: transaction.userId,
            artistId: transaction.artistId,
            status: "active",
            validUntil: { $gte: new Date() },
          });

          if (!existing) {
            await Subscription.create({
              userId: transaction.userId,
              artistId: transaction.artistId,
              status: "active",
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            });
            console.log("📅 Subscription created for user and artist");
          } else {
            console.log("⚠️ Active subscription already exists — skipping creation");
          }
        }

        await user.save();
        console.log("📦 User updated with purchase history");
      }
    } else {
      console.warn("⚠️ Stripe transaction not found or already paid");
    }
  }

  res.json({ received: true });
};


// --------------- RAZORPAY WEBHOOK --------------

export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_SECRET;
  const body = JSON.stringify(req.body);

  const signature = req.headers["x-razorpay-signature"];
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

    const transaction = await Transaction.findOne({
      razorpayOrderId: paymentEntity.order_id,
      gateway: "razorpay",
    });

    if (transaction && transaction.status !== "paid") {
      transaction.status = "paid";
      await transaction.save();

      const user = await User.findById(transaction.userId);
      if (user) {
        user.purchaseHistory.push({
          itemType: transaction.itemType,
          itemId: transaction.itemId,
          price: transaction.amount,
          paymentId: paymentEntity.id,
        });

        // 🎵 Song Purchase
        if (transaction.itemType === "song") {
          user.purchasedSongs.push(transaction.itemId);
        }

        // 💿 Album Purchase
        else if (transaction.itemType === "album") {
          user.purchasedAlbums.push(transaction.itemId);
        }

        // 🎫 Artist Subscription
        else if (transaction.itemType === "artist-subscription") {
          const existing = await Subscription.findOne({
            userId: transaction.userId,
            artistId: transaction.artistId,
            status: "active",
            validUntil: { $gte: new Date() },
          });

          if (!existing) {
            await Subscription.create({
              userId: transaction.userId,
              artistId: transaction.artistId,
              status: "active",
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            });
            console.log("📅 Razorpay: Subscription created");
          } else {
            console.log("⚠️ Razorpay: Active subscription already exists");
          }
        }

        await user.save();
        console.log("📦 Razorpay: User updated with purchase history");
      }
    } else {
      console.warn("⚠️ Razorpay transaction not found or already paid");
    }
  }

  res.json({ status: "ok" });
};
