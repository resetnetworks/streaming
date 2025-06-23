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
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q) throw new BadRequestError("Query parameter 'q' is required.");

  const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapeRegex(q), "i");

  // You can adjust these limits
  const artistLimit = 3;
  const songLimit = 5;
  const albumLimit = 3;

  const [artists, songs, albums] = await Promise.all([
    Artist.find({ name: regex }).limit(artistLimit).lean(),
    Song.find({ title: regex }).limit(songLimit).lean(),
    Album.find({ title: regex }).limit(albumLimit).lean(),
  ]);

  res.status(StatusCodes.OK).json({
    query: q,
    results: {
      artists,
      songs,
      albums,
    },
  });
};


// @desc Search songs by title with pagination
// @route GET /api/search/songs?q=term&page=1&limit=10
// @access Public
export const searchSongs = async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q) throw new BadRequestError("Query 'q' is required.");

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");

  const [songs, total] = await Promise.all([
    Song.find({ title: regex }).skip(skip).limit(limit).lean(),
    Song.countDocuments({ title: regex }),
  ]);

  res.status(StatusCodes.OK).json({
    results: songs,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};


// @desc Search artists by name with pagination
// @route GET /api/search/artists?q=term&page=1&limit=10
// @access Public
export const searchArtists = async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q) throw new BadRequestError("Query parameter 'q' is required.");

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;
  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const [artists, total] = await Promise.all([
    Artist.find({ name: regex }).skip(skip).limit(limit).lean(),
    Artist.countDocuments({ name: regex }),
  ]);

  res.status(StatusCodes.OK).json({
    results: artists,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};



// @desc Search albums by title with pagination
// @route GET /api/search/albums?q=term&page=1&limit=10
// @access Public
export const searchAlbums = async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q) throw new BadRequestError("Query parameter 'q' is required.");

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;
  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const [albums, total] = await Promise.all([
    Album.find({ title: regex }).skip(skip).limit(limit).lean(),
    Album.countDocuments({ title: regex }),
  ]);

  res.status(StatusCodes.OK).json({
    results: albums,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};
