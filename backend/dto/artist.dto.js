import { Song } from "../models/Song.js";
import { Album } from "../models/Album.js";

export const shapeArtistResponse = async(artist) => {
  const [songCount, albumCount] = await Promise.all([
    Song.countDocuments({ artist: artist._id }),
    Album.countDocuments({ artist: artist._id }),
  ]);

  return {
    _id: artist._id,
    name: artist.name,
    slug: artist.slug,
    image: artist.image,
    location: artist.location,
    bio: artist.bio,
    subscriptionPrice: artist.subscriptionPrice,
    songCount,
    albumCount,
  };
};
