// services/paymentService.js
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";
import { Subscription } from "../models/Subscription.js";

// ✅ Mark transaction as paid
export const markTransactionPaid = async ({ gateway, paymentId, paymentIntentId, razorpayOrderId }) => {
  let query = gateway === "stripe"
    ? { paymentIntentId, gateway }
    : { razorpayOrderId, gateway };

  const transaction = await Transaction.findOne(query);
  if (!transaction || transaction.status === "paid") return null;

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

  // 💰 Add to user's purchase history
  user.purchaseHistory.push({
    itemType: transaction.itemType,
    itemId: transaction.itemId,
    price: transaction.amount,
    paymentId,
  });

  // 🛒 Handle specific item types
  switch (transaction.itemType) {
    case "song":
      user.purchasedSongs = user.purchasedSongs || [];
      user.purchasedSongs.push(transaction.itemId);
      break;

    case "album":
      user.purchasedAlbums = user.purchasedAlbums || [];
      user.purchasedAlbums.push(transaction.itemId);
      break;

    case "artist-subscription": {
      const activeSub = await Subscription.findOne({
        userId: transaction.userId,
        artistId: transaction.artistId,
        status: "active",
        validUntil: { $gte: new Date() },
      });

      if (activeSub) {
        console.log("🟡 Existing active subscription found. Skipping.");
      } else {
        await Subscription.create({
          userId: transaction.userId,
          artistId: transaction.artistId,
          status: "active",
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          gateway: transaction.gateway,
          externalSubscriptionId:
            transaction.paymentIntentId || transaction.razorpayOrderId || "unknown",
        });
        console.log("✅ New subscription created for artist:", transaction.artistId);
      }
      break;
    }

    default:
      console.warn("⚠️ Unknown itemType:", transaction.itemType);
  }

  await user.save();
  console.log("✅ User updated:", user._id);
  return true;
};

