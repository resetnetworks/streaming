import { setSelectedSong, play } from "../features/playback/playerSlice";
import { hasArtistSubscriptionInPurchaseHistory } from "./subscriptions";

const isDevelopment = import.meta.env.MODE === "development";

export const handlePlaySong = (song, currentUser, dispatch) => {
  // 🔓 DEV MODE: bypass everything
  if (isDevelopment) {
    dispatch(setSelectedSong(song));
    dispatch(play());
    return { requiresSubscription: false };
  }

  // ✅ Purchased song → allow
  if (currentUser?.purchasedSongs?.includes(song.id)) {
    dispatch(setSelectedSong(song));
    dispatch(play());
    return { requiresSubscription: false };
  }

  // ✅ Admin → allow
  if (currentUser?.role === "admin") {
    dispatch(setSelectedSong(song));
    dispatch(play());
    return { requiresSubscription: false };
  }

  // 🔒 Subscription check (PRODUCTION ONLY)
  if (song.accessType === "subscription") {
    const alreadySubscribed =
      hasArtistSubscriptionInPurchaseHistory(currentUser, song.artist);

    if (!alreadySubscribed) {
      return {
        requiresSubscription: true,
        artist: song.artist,
        song
      };
    }
  }

  // ▶️ Play song
  dispatch(setSelectedSong(song));
  dispatch(play());
  return { requiresSubscription: false };
};
