import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";

export const hasPaidAccess = async (userId, itemType, itemId) => {
  if (!userId) return false;

  const paid = await Transaction.exists({
    userId,
    itemType,
    itemId,
    status: "paid",
  });

  return !!paid;
};

export const hasAccessToSong = async (user, song) => {
  if (!song.isPremium) return true; // free song

  if (!user) return false;

  if (user.role === "admin") return true;

  // Check song payment
  if (await hasPaidAccess(user._id, "song", song._id)) return true;

  // Check album payment if song belongs to an album
  if (song.album) {
    if (await hasPaidAccess(user._id, "album", song.album._id)) return true;
  }

  // Check artist subscription (if included in subscription)
  if (song.includeInSubscription) {
    const dbUser = await User.findById(user._id);
    if (dbUser?.artistSubscriptions?.includes(song.artist._id.toString())) return true;
  }

  return false;
};