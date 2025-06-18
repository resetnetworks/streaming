import {Artist} from "../models/Artist.js";
import {Song} from "../models/Song.js";
import {Album} from "../models/Album.js";
import { StatusCodes } from "http-status-codes";

/**
 * Unified search across artists, songs, and albums.
 * Supports pagination and input validation.
 * Example: GET /api/search?q=love&page=1&limit=10
 */
export const unifiedSearch = async (req, res) => {
  // Input validation and sanitization
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q) {
    throw new BadRequestError("Query parameter 'q' is required.");
  }

  // Pagination parameters
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Escape regex special characters in search query
  const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapeRegex(q), "i");

  // Execute all queries in parallel for performance
  const [artists, artistsTotal, songs, songsTotal, albums, albumsTotal] = await Promise.all([
    Artist.find({ name: regex }).skip(skip).limit(limit).lean(),
    Artist.countDocuments({ name: regex }),

    Song.find({ title: regex }).skip(skip).limit(limit).lean(),
    Song.countDocuments({ title: regex }),

    Album.find({ title: regex }).skip(skip).limit(limit).lean(),
    Album.countDocuments({ title: regex }),
  ]);

  // Send structured paginated response
  res.status(StatusCodes.OK).json({
    artists: {
      results: artists,
      total: artistsTotal,
      page,
      pages: Math.ceil(artistsTotal / limit),
    },
    songs: {
      results: songs,
      total: songsTotal,
      page,
      pages: Math.ceil(songsTotal / limit),
    },
    albums: {
      results: albums,
      total: albumsTotal,
      page,
      pages: Math.ceil(albumsTotal / limit),
    },
  });
}; 