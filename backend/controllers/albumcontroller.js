import { Album } from "../models/Album.js";
import { Song } from "../models/Song.js";
import { BadRequestError, UnauthorizedError,NotFoundError} from "../errors/index.js";
import mongoose from "mongoose";
import { StatusCodes } from 'http-status-codes';
import { isAdmin } from "../utils/authHelper.js";
import { uploadToS3 } from "../utils/s3Uploader.js";
import { Artist  } from "../models/Artist.js";


// Album Controllers

// Create a new album (Admin only)
// - Handles optional file upload to S3 for cover image
// - Accepts basic album info and genre as comma-separated string
export const createAlbum = async (req, res) => {
  console.log(isAdmin(req.user));
  if (!isAdmin(req.user)) {
    throw new UnauthorizedError('Access denied. Admins only.');
  }

  const { title, description, artist, releaseDate, price, isPremium, genre } = req.body;

  if (!title || !artist || !releaseDate) {
    throw new BadRequestError('Title, artist, and release date are required.');
  }

  const coverImageFile = req.files?.coverImage?.[0];
  const coverImageUrl = coverImageFile
    ? await uploadToS3(coverImageFile, 'covers')
    : '';

  let processedGenre = genre;
  if (typeof processedGenre === 'string') {
    processedGenre = processedGenre.split(',').map((g) => g.trim());
  }

  const newAlbum = await Album.create({
    title,
    description,
    artist,
    releaseDate,
    price,
    isPremium,
    coverImage: coverImageUrl,
    genre: processedGenre,
  });

  res.status(StatusCodes.CREATED).json({ success: true, album: newAlbum });
};

// Get a paginated list of all albums
// - Supports `page` and `limit` query parameters
// - Populates songs with selected fields
export const getAllAlbums = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [albums, total] = await Promise.all([
    Album.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('songs', 'title duration coverImage')
      .populate('artist', 'name slug'),
    Album.countDocuments()
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    albums,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
};

// Delete an album by ID (Admin only)
// - Also unlinks album reference from associated songs
export const deleteAlbum = async (req, res) => {
  if (!isAdmin(req.user)) {
    throw new UnauthorizedError('Access denied. Admins only.');
  }

  const album = await Album.findById(req.params.id);
  if (!album) {
    throw new NotFoundError('Album not found');
  }

  // Optional: Remove album reference from songs
  await Song.updateMany(
    { _id: { $in: album.songs } },
    { $unset: { album: '' } }
  );

  await album.deleteOne();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Album deleted successfully',
  });
};


// Get a single album by ID or slug
// - Dynamically detects whether the param is an ObjectId or slug
// - Populates associated songs with selected fields
export const getAlbumById = async (req, res) => {
  const { id } = req.params;

  const isObjectId = mongoose.Types.ObjectId.isValid(id);

  const album = isObjectId
    ? await Album.findById(id).populate('songs', 'title duration coverImage audioUrl')
    : await Album.findOne({ slug: id }).populate('songs', 'title duration coverImage audioUrl');

  if (!album) {
    throw new NotFoundError('Album not found');
  }

  res.status(StatusCodes.OK).json({ success: true, album });
};


// Update an existing album (Admin only)
// - Handles optional file upload for new cover image
// - Allows partial updates for album fields
export const updateAlbum = async (req, res) => {
  if (!isAdmin(req.user)) {
    throw new UnauthorizedError('Access denied. Admins only.');
  }

  const album = await Album.findById(req.params.id);
  if (!album) {
    throw new NotFoundError('Album not found');
  }

  const { title, description, artist, releaseDate, price, isPremium } = req.body;

  if (title) album.title = title;
  if (description) album.description = description;
  if (artist) album.artist = artist;
  if (releaseDate) album.releaseDate = releaseDate;
  if (price) album.price = price;
  if (typeof isPremium === 'boolean' || isPremium === 'true' || isPremium === 'false') {
    album.isPremium = isPremium === 'true' || isPremium === true;
  }

  const coverImageFile = req.files?.coverImage?.[0];
  if (coverImageFile) {
    album.coverImage = await uploadToS3(coverImageFile, 'covers');
  }

  await album.save();

  res.status(StatusCodes.OK).json({ success: true, album });
};


// Get all albums for a specific artist
// Get albums for an artist by ID or slug with pagination
export const getAlbumsByArtist = async (req, res) => {
  const identifier = req.params.artistId;

  // Validate and resolve artist (by ID or slug)
  let artist;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    artist = await Artist.findById(identifier);
  } else {
    artist = await Artist.findOne({ slug: identifier });
  }

  if (!artist) {
    throw new NotFoundError('Artist not found');
  }

  // Pagination params
  const page = parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) : 1;
  const limit = parseInt(req.query.limit, 10) > 0 ? parseInt(req.query.limit, 10) : 10;
  const skip = (page - 1) * limit;

  // Fetch albums + total count in parallel
  const [albums, total] = await Promise.all([
    Album.find({ artist: artist._id })
      .select('_id slug title coverImage releaseDate')
      .sort({ releaseDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Album.countDocuments({ artist: artist._id })
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    artist: {
      id: artist._id,
      name: artist.name,
      slug: artist.slug,
      image: artist.image,
      subscriptionPrice: artist.subscriptionPrice,
    },
    albums,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
};