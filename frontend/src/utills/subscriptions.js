// src/utils/subscriptions.js
export const hasArtistSubscriptionInPurchaseHistory = (user, artist) => {
  if (!user || !artist) return false;

  // Artist ka ID nikal lo
  const artistId = artist?._id || artist?.id || artist?.slug;
  if (!artistId) return false;

  // Ab user.subscribedArtists ek simple string array hai
  if (!Array.isArray(user.subscribedArtists)) return false;

  // String normalize karke includes check karo
  return user.subscribedArtists.some(id => String(id) === String(artistId));
};
