import { setSelectedSong, play } from "../features/playback/playerSlice";
import { hasArtistSubscriptionInPurchaseHistory } from "./subscriptions"; // import karo

export const handlePlaySong = (song, currentUser, dispatch) => {
  // First check if song is already purchased - no modal needed
  if (currentUser?.purchasedSongs?.includes(song._id)) {
    dispatch(setSelectedSong(song));
    dispatch(play());
    return { requiresSubscription: false };
  }

  // Admin check - admins can play any song without subscription
  if (currentUser?.role === "admin") {
    dispatch(setSelectedSong(song));
    dispatch(play());
    return { requiresSubscription: false };
  }

  // ✅ NEW: Use updated helper with subscribedArtists array
  if (song.accessType === "subscription") {
    const alreadySubscribed = hasArtistSubscriptionInPurchaseHistory(currentUser, song.artist);
    
    if (!alreadySubscribed) {
      return { 
        requiresSubscription: true, 
        artist: song.artist,
        song: song
      };
    }
  }

  // If all checks pass, play the song
  dispatch(setSelectedSong(song));
  dispatch(play());
  return { requiresSubscription: false };
};
