import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";
import { Subscription } from "../models/Subscription.js";

// ✅ Mark transaction as paid
export const markTransactionPaid = async ({
  gateway,
  paymentId,
  paymentIntentId,
  razorpayOrderId,
  stripeSubscriptionId,
  subscriptionId,
}) => {
  let query = {};
  console.log("markTransactionPaid called with:", {
    gateway,
    paymentId,
    paymentIntentId,
    razorpayOrderId,
    stripeSubscriptionId,
    subscriptionId,
  });

  if (gateway === "stripe") {
    if (stripeSubscriptionId) {
      query = { stripeSubscriptionId };
    } else {
      query = { paymentIntentId };
    }
  } else if (gateway === "razorpay") {
    if (subscriptionId) {
      query = { "metadata.razorpaySubscriptionId": subscriptionId };
    } else if (razorpayOrderId) {
      query = { razorpayOrderId };
    } else if (paymentId) {
      query = { paymentId }; // fallback (e.g. direct one-time payments)
    }
  }
console.log("query",query);

  const transaction = await Transaction.findOne(query);
  if (!transaction || transaction.status === "paid") {
    console.warn("⚠️ Transaction not found or already marked as paid");
    // console.log(transaction);
    
    return null;
  }

  transaction.status = "paid";
  await transaction.save();
  return transaction;
};


// ✅ Update user after payment
export const updateUserAfterPurchase = async (transaction, paymentId) => {
  const user = await User.findById(transaction.userId);
  if (!user) {
    console.warn("❌ User not found for transaction:", transaction._id);
    return;
  }

  const alreadyInHistory = user.purchaseHistory.some(
    (p) =>
      p.itemType === transaction.itemType &&
      p.itemId.toString() === transaction.itemId.toString()
  );

  if (!alreadyInHistory) {
    user.purchaseHistory.push({
      itemType: transaction.itemType,
      itemId: transaction.itemId,
      price: transaction.amount,
      paymentId,
    });
  }

  switch (transaction.itemType) {
    case "song":
      user.purchasedSongs = user.purchasedSongs || [];
      if (!user.purchasedSongs.includes(transaction.itemId)) {
        user.purchasedSongs.push(transaction.itemId);
      }
      break;

    case "album":
      user.purchasedAlbums = user.purchasedAlbums || [];
      if (!user.purchasedAlbums.includes(transaction.itemId)) {
        user.purchasedAlbums.push(transaction.itemId);
      }
      break;

    case "artist-subscription": {
      let validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // default: +30 days
      const fallbackExternalId =
        transaction.stripeSubscriptionId ||
        transaction.paymentIntentId ||
        transaction.razorpayOrderId ||
        "unknown";

      // 🧠 Try getting real billing period from Stripe
      if (transaction.stripeSubscriptionId) {
        try {
          const stripe = new (await import("stripe")).default(process.env.STRIPE_SECRET_KEY);
          const stripeSub = await stripe.subscriptions.retrieve(transaction.stripeSubscriptionId);
          if (stripeSub?.current_period_end) {
            validUntil = new Date(stripeSub.current_period_end * 1000);
          }
        } catch (err) {
          console.warn("⚠️ Failed to fetch Stripe period:", err.message);
        }
      }

      // ✅ Upsert subscription (avoid duplicate key error)
      await Subscription.findOneAndUpdate(
        { userId: transaction.userId, artistId: transaction.artistId },
        {
          status: "active",
          validUntil,
          gateway: transaction.gateway,
          externalSubscriptionId: fallbackExternalId,
          transactionId: transaction._id,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log("✅ Subscription created or updated for artist:", transaction.artistId);
      break;
    }

    default:
      console.warn("⚠️ Unknown itemType:", transaction.itemType);
  }

  await user.save();
  console.log("✅ User updated:", user._id);
  return true;
};
