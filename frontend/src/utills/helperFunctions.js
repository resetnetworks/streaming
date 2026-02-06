
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" + secs : secs}`;
};


export const getAvatarColor = (name) => {
  if (!name) return "bg-gradient-to-br from-gray-700 to-gray-900";

  const gradients = [
    "bg-gradient-to-br from-red-700 to-red-900",
    "bg-gradient-to-br from-green-700 to-green-900",
    "bg-gradient-to-br from-blue-700 to-blue-900",
    "bg-gradient-to-br from-yellow-700 to-yellow-900",
    "bg-gradient-to-br from-pink-700 to-pink-900",
    "bg-gradient-to-br from-purple-700 to-purple-900",
    "bg-gradient-to-br from-indigo-700 to-indigo-900",
    "bg-gradient-to-br from-teal-700 to-teal-900",
  ];

  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
};


export const getRestriction = (song) => {
  if (!song) return null;

  // 1. Song itself must be purchased
  if (song.accessType === "purchase-only") return { type: "song", id: song.id, price: song.price };

  // 2. Album is premium
  const album = allAlbums.find(a => a.id === song.albumId);
  if (album && album.price > 0) return { type: "album", id: album.id, price: album.price };

  // 3. Artist subscription
  const artist = allArtists.find(ar => ar.id === song.artistId);
  if (artist && artist.subscriptionPrice > 0) return { type: "artist", id: artist.id, price: artist.subscriptionPrice };

  return null; // free or already purchased
};