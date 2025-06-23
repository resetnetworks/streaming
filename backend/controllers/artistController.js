import { Artist } from "../models/Artist.js";
import { Song } from "../models/Song.js";
import { Album } from "../models/Album.js";
import { uploadToS3 } from "../utils/s3Uploader.js";
import mongoose from "mongoose";
import { NotFoundError, BadRequestError, UnauthorizedError } from '../errors/index.js';
import { isAdmin } from "../utils/authHelper.js";
import { StatusCodes } from 'http-status-codes';
// import { UnauthorizedError } from "../errors/unauthorized.js";



// ===================================================================
// @desc    Create a new artist (Admin only)
// @route   POST /api/artists
// @access  Admin
// ===================================================================
export const createArtist = async (req, res) => {
  // Check if user is admin
  if (!isAdmin(req.user)) {
    throw new UnauthorizedError('Access denied. Admins only.');;
  }

  const { name, bio, location, subscriptionPrice } = req.body;

  // Basic validation
  if (!name) {
    throw new BadRequestError('Artist name is required.');
  }

  // Handle optional image upload
  const imageFile = req.files?.coverImage?.[0];
  const imageUrl = imageFile ? await uploadToS3(imageFile, 'artists') : '';

  // Create new artist document
  const newArtist = await Artist.create({
    name,
    bio,
    subscriptionPrice,
    location,
    image: imageUrl,
    createdBy: req.user._id,
  });

  res.status(StatusCodes.CREATED).json({ success: true, artist: newArtist });
};


// ===================================================================
// @desc    Update an existing artist by ID (Admin only)
// @route   PATCH /api/artists/:id
// @access  Admin
// ===================================================================
export const updateArtist = async (req, res) => {
  if (!isAdmin(req.user)) {
    throw new UnauthorizedError('Access denied. Admins only.');
  }

  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid artist ID.');
  }

  const artist = await Artist.findById(id);
  if (!artist) {
    throw new NotFoundError('Artist not found.');
  }

  const { name, bio, location, subscriptionPrice } = req.body;

  // Update only the provided fields
  if (name) artist.name = name;
  if (bio) artist.bio = bio;
  if (location) artist.location = location
  if (subscriptionPrice !== undefined) artist.subscriptionPrice = subscriptionPrice;

  // Optional image replacement
  const imageFile = req.files?.image?.[0];
  if (imageFile) {
    artist.image = await uploadToS3(imageFile, 'artists');
  }

  await artist.save();

  res.status(StatusCodes.OK).json({ success: true, artist });
};


// ===================================================================
// @desc    Delete an artist by ID (Admin only)
// @route   DELETE /api/artists/:id
// @access  Admin
// ===================================================================
export const deleteArtist = async (req, res) => {
  // Authorization check
  if (!isAdmin(req.user)) {
    throw new UnauthorizedError('Access denied. Admins only.');
  }

  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid artist ID.');
  }

  // Attempt to find the artist
  const artist = await Artist.findById(id);
  if (!artist) {
    throw new NotFoundError('Artist not found.');
  }

  // Perform deletion
  await artist.deleteOne();

  res.status(StatusCodes.OK).json({ success: true, message: 'Artist deleted successfully' });
};


// ===================================================================
// @desc    Get all artists with optional pagination
// @route   GET /api/artists
// @access  Public
// ===================================================================

export const getAllArtists = async (req, res) => {
  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
  const skip = (page - 1) * limit;

  const query = {};

  const [artists, total] = await Promise.all([
    Artist.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Artist.countDocuments(query),
  ]);

  // Add songCount and albumCount to each artist
  const enrichedArtists = await Promise.all(
    artists.map(async (artist) => {
      const [songCount, albumCount] = await Promise.all([
        Song.countDocuments({ artist: artist._id }),
        Album.countDocuments({ artist: artist._id }),
      ]);

      return {
        ...artist.toObject(),
        songCount,
        albumCount,
      };
    })
  );

  res.status(StatusCodes.OK).json({
    success: true,
    artists: enrichedArtists,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};


// ===================================================================
// @desc    Get artist by ID or slug
// @route   GET /api/artists/:id
// @access  Public
// ===================================================================
export const getArtistById = async (req, res) => {
  const identifier = req.params.id;

  // Determine query type (ObjectId or slug)
  const query = mongoose.Types.ObjectId.isValid(identifier)
    ? { _id: identifier }
    : { slug: identifier };

  // Find artist
  const artist = await Artist.findOne(query);
  if (!artist) {
    throw new NotFoundError('Artist not found');
  }

  res.status(StatusCodes.OK).json({ success: true, artist });
};