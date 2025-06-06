import Stripe from 'stripe';
import Razorpay from "razorpay";
import crypto from "crypto";
import { Transaction } from '../models/Transaction.js';
import { User } from "../models/User.js";
import { Artist } from "../models/Artist.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripePayment = async (req, res) => {
  try {
    const { itemType, itemId, amount, artistId, currency = "INR" } = req.body;

    if (!["song", "album", "artist-subscription"].includes(itemType)) {
      return res.status(400).json({ message: "Invalid item type" });
    }

    // 1. Create transaction first (status: pending)
    const transaction = await Transaction.create({
      userId: req.user._id,
      itemType,
      itemId,
      amount,
      currency,
      artistId,
      status: "pending",
      gateway: "stripe",
    });

    // 2. Create PaymentIntent with metadata.transactionId
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in paise
      currency,
      metadata: {
        transactionId: transaction._id.toString(), // ✅ KEY FIX HERE
        userId: req.user._id.toString(),
        itemType,
        itemId,
      },
    });

    // 3. Save paymentIntentId in transaction
    transaction.paymentIntentId = paymentIntent.id;
    await transaction.save();

    // 4. Respond with clientSecret
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Stripe Payment Error:", err);
    res.status(500).json({ message: "Stripe payment creation failed" });
  }
};



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const { itemType, itemId, amount,artistId, currency = "INR" } = req.body;

    if (!["song", "album", "artist-subscription"].includes(itemType)) {
      return res.status(400).json({ message: "Invalid item type" });
    }

    const options = {
      amount: amount * 100,
      currency,
      receipt: `txn_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Transaction.create({
      userId: req.user._id,
      itemType,
      itemId,
      amount,
      currency,
      artistId,
      status: "pending",
      gateway: "razorpay",
      razorpayOrderId: order.id,
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Razorpay Order Error:", err);
    res.status(500).json({ message: "Razorpay order creation failed" });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // ✅ Find and mark the transaction as paid
    const transaction = await Transaction.findOne({
      razorpayOrderId: razorpay_order_id,
      gateway: "razorpay",
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status === "paid") {
      return res.status(200).json({ success: true, message: "Payment already verified" });
    }

    transaction.status = "paid";
    await transaction.save();

    // ✅ Update User's purchaseHistory
    const user = await User.findById(transaction.userId);
    if (user) {
      user.purchaseHistory.push({
        itemType: transaction.itemType,
        itemId: transaction.itemId,
        price: transaction.amount,
        paymentId: razorpay_payment_id,
      });

      // Optional: push into purchasedSongs or Albums
      if (transaction.itemType === "song") {
        user.purchasedSongs.push(transaction.itemId);
      } else if (transaction.itemType === "album") {
        user.purchasedAlbums.push(transaction.itemId);
      }

      await user.save();
      console.log("📦 Razorpay: User purchase history updated");
    }

    res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (err) {
    console.error("Razorpay Payment Verification Error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};


// Create Stripe PaymentIntent for artist subscription
export const createArtistSubscriptionStripe = async (req, res) => {
  try {
    const { artistId, amount, currency = "INR" } = req.body;

    // Validate artist
    const artist = await Artist.findById(artistId);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      itemType: "artist-subscription",
      itemId: artistId,
      artistId,
      amount,
      currency,
      status: "pending",
      gateway: "stripe",
    });

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      metadata: {
        transactionId: transaction._id.toString(),
        userId: req.user._id.toString(),
        itemType: "artist-subscription",
        itemId: artistId,
      },
    });

    transaction.paymentIntentId = paymentIntent.id;
    await transaction.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Stripe Subscription Error:", err);
    res.status(500).json({ message: "Stripe subscription payment failed" });
  }
};

// Create Razorpay Order for artist subscription
export const createArtistSubscriptionRazorpay = async (req, res) => {
  try {
    const { artistId, amount, currency = "INR" } = req.body;

    // Validate artist
    const artist = await Artist.findById(artistId);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    const options = {
      amount: amount * 100,
      currency,
      receipt: `sub_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Transaction.create({
      userId: req.user._id,
      itemType: "artist-subscription",
      itemId: artistId,
      artistId,
      amount,
      currency,
      status: "pending",
      gateway: "razorpay",
      razorpayOrderId: order.id,
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Razorpay Subscription Error:", err);
    res.status(500).json({ message: "Razorpay subscription payment failed" });
  }
};

// After payment verification (Razorpay or Stripe webhook), update user's subscription
export const activateArtistSubscription = async (userId, artistId) => {
  const user = await User.findById(userId);
  if (!user) return;
  const now = new Date();
  const oneMonthLater = new Date(now);
  oneMonthLater.setMonth(now.getMonth() + 1);

  if (!user.subscribedArtists) user.subscribedArtists = [];
  let found = false;
  user.subscribedArtists = user.subscribedArtists.map(sub => {
    if (sub.artistId.toString() === artistId.toString()) {
      found = true;
      return { artistId, expiresAt: oneMonthLater };
    }
    return sub;
  });
  if (!found) {
    user.subscribedArtists.push({ artistId, expiresAt: oneMonthLater });
  }
  await user.save();
};