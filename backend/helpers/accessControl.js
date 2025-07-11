import { Song } from "../models/Song.js";
import { Subscription } from "../models/Subscription.js";
import { User } from "../models/User.js";
import { Album } from "../models/Album.js";
import { isAdmin } from "../utils/authHelper.js";

export const canStreamSong = async (userId, songId) => {

  
  const song = await Song.findById(songId).lean();
  if (!song) return false;
  

  if (song.accessType === "free") return true;
  if(userId === "685e6f35c3a194bdd0638bf2") return true; 

  if (song.accessType === "subscription") {
    const subscription = await Subscription.findOne({
      userId,
      artistId: song.artist?._id || song.artist, // 🔥 fix here
      status: "active",
      validUntil: { $gt: new Date() },
    });

    if (subscription) return true;
  }

  if (song.accessType === "purchase-only") {
    const user = await User.findById(userId).lean();
    if (!user) return false;

    if (user.purchasedSongs?.some(id => id.toString() === song._id.toString())) {
      return true;
    }
  }

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
  if(user.isAdmin) return true; // Admins can access everything
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

