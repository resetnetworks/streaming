export const shapeSongResponse = (song, hasAccess, signedUrl = null) => {
  return {
    id: song._id,
    title: song.title,
    duration: song.duration,
    genre: song.genre,
    releaseDate: song.releaseDate,
    coverImage: song.coverImage,
    accessType: song.accessType,
    price: song.price,
    hlsReady: song.hlsReady,
    artist: song.artist,
    album: song.album || null,
    slug: song.slug,
    audioUrl: hasAccess ? signedUrl : null, // ✅ Only signed URL if access is allowed
  };
};
