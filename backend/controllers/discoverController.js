import { Artist } from "../models/Artist.js";
import { Song } from "../models/Song.js";
import { Album } from "../models/Album.js";
import { StatusCodes } from "http-status-codes";

export const getRandomArtistWithSongs = async (req, res) => {
  const totalArtists = await Artist.countDocuments();
  if (totalArtists === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "No artists found"
    });
  }

  // Random artist
  const randomIndex = Math.floor(Math.random() * totalArtists);
  const artist = await Artist.findOne().skip(randomIndex).lean();

  if (!artist) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Random artist not found"
    });
  }

  // Pagination query params
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Get all song IDs from albums
  const albums = await Album.find({ artist: artist._id }).select("songs").lean();
  const allSongIds = albums.flatMap(album => album.songs);

  const totalSongs = allSongIds.length;

  // Paginated song IDs
  const paginatedIds = allSongIds.slice(skip, skip + limit);

  const songs = await Song.find({ _id: { $in: paginatedIds } })
    .select("_id title coverImage duration")
    .sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({
    success: true,
    artist: {
      _id: artist._id,
      name: artist.name,
      slug: artist.slug
    },
    songs,
    pagination: {
      total: totalSongs,
      page,
      limit,
      totalPages: Math.ceil(totalSongs / limit)
    }
  });
};
