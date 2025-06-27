import { Song } from "../models/Song.js";
import { Subscription } from "../models/Subscription.js";
import { User } from "../models/User.js";
import { Album } from "../models/Album.js";


export const canStreamSong = async (userId, songId) => {
  // 1. Fetch song
  const song = await Song.findById(songId);
  if (!song) return false;

  // 2. Free access
  if (song.accessType === "free") {
    return true;
  }

  // 3. Subscription access — check if user has active subscription to the song's artist
  if (song.accessType === "subscription") {
    const subscription = await Subscription.findOne({
      userId,
      artistId: song.artistId,
      status: "active",
      validUntil: { $gt: new Date() }, // still valid
    });

    if (subscription) return true;
  }

  // 4. Purchase-only access — check if user purchased this song
  if (song.accessType === "purchase-only") {
    const user = await User.findById(userId);
    if (!user) return false;

    if (user.purchasedSongs.includes(song._id)) {
      return true;
    }
  }

  // 5. Deny access otherwise
  return false;
};


// helpers/accessControl.js



export const canStreamAlbum = async (userId, albumId) => {
  const album = await Album.findById(albumId).populate("artist");
  if (!album) return false;

  // Free access
  if (album.accessType === "free") return true;

  const user = await User.findById(userId);
  if (!user) return false;

  if (album.accessType === "subscription") {
    const sub = await Subscription.findOne({
      userId,
      artistId: album.artist._id,
      status: "active",
      validUntil: { $gte: new Date() },
    });

    return !!sub;
  }

  if (album.accessType === "purchase-only") {
    return user.purchasedAlbums.includes(album._id);
  }

  return false;
};

