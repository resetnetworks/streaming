// src/utils/subscriptions.js
export const hasArtistSubscriptionInPurchaseHistory = (user, artist) => {
  if (!user || !artist) return false;
  const artistId = artist?._id || artist?.id || artist?.slug;
  if (!artistId) return false;

  // purchaseHistory: [{ itemType: "artist-subscription", itemId: "..." }, ...]
  return Array.isArray(user.purchaseHistory) && user.purchaseHistory.some(ph => {
    if (ph?.itemType !== "artist-subscription") return false;
    const phId = ph?.itemId;
    // Accept direct equality; if you store object ids different than strings, normalize here
    return phId === artistId;
  });
};
