import { setSelectedSong, play } from "../features/playback/playerSlice";

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

  // Then check subscription requirement
  if (song.accessType === "subscription") {
    const hasArtistSubscription = currentUser?.purchaseHistory?.some(
      purchase => 
        purchase.itemType === "artist-subscription" && 
        purchase.itemId === song.artist?._id
    );

    if (!hasArtistSubscription) {
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
