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
  if (!user) return;

  user.purchaseHistory.push({
    itemType: transaction.itemType,
    itemId: transaction.itemId,
    price: transaction.amount,
    paymentId,
  });

  if (transaction.itemType === "song") {
    user.purchasedSongs.push(transaction.itemId);
  } else if (transaction.itemType === "album") {
    user.purchasedAlbums.push(transaction.itemId);
  } else if (transaction.itemType === "artist-subscription") {
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
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
  }

  await user.save();
  return true;
};
