import { Song } from "../models/Song.js";
import { uploadToS3 } from "../utils/s3Uploader.js";
import { Album } from "../models/Album.js";
import { Artist } from "../models/Artist.js";
import { Transaction } from "../models/Transaction.js"
import { User } from "../models/User.js";
import { hasAccessToSong } from "../utils/accessControl.js";
import mongoose from "mongoose";
import { BadRequestError, UnauthorizedError, NotFoundError } from "../errors/index.js";
import { StatusCodes } from 'http-status-codes';
import { isAdmin } from "../utils/authHelper.js";




// ===================================================================
// @desc    Create a new song (Admin only)
// @route   POST /api/songs
// @access  Admin
// ===================================================================
export const createSong = async (req, res) => {
  // 🔒 Authorization check
  if (!isAdmin(req.user)) {
    throw new UnauthorizedError("Access denied. Admins only.");
  }

  // 📝 Extract song data from request body
  let {
    title,
    artist,
    genre,
    duration,
    price,
    isPremium,
    includeInSubscription,
    releaseDate,
    album,
  } = req.body;

  // ✅ Required field validation
  if (!title || !artist || !duration) {
    throw new BadRequestError("Title, artist, and duration are required fields.");
  }

  // 🧹 Format genre if passed as comma-separated string
  if (typeof genre === "string") {
    genre = genre.split(",").map((g) => g.trim());
  }

  // 📦 Handle uploaded files
  const coverImageFile = req.files?.coverImage?.[0];
  const audioFile = req.files?.audio?.[0];

  // 🎧 Validate presence of audio file
  if (!audioFile) {
    throw new BadRequestError("Audio file is required.");
  }

  // ☁️ Upload audio and cover image to S3
  const audioUrl = await uploadToS3(audioFile, "songs");
  const coverImageUrl = coverImageFile
    ? await uploadToS3(coverImageFile, "covers")
    : "";

  // 🎼 Create new song document
  const newSong = await Song.create({
    title,
    artist,
    album: album || null,
    genre,
    duration,
    price,
    isPremium,
    includeInSubscription: includeInSubscription ?? true,
    releaseDate,
    coverImage: coverImageUrl,
    audioUrl,
  });

  // 📚 If song is linked to an album, update the album's song list
  if (album) {
    await Album.findByIdAndUpdate(album, {
      $push: { songs: newSong._id },
    });
  }

  // ✅ Return created song
  res.status(StatusCodes.CREATED).json({ success: true, song: newSong });
};



// ===================================================================
// @desc    Update an existing song (Admin only)
// @route   PUT /api/songs/:id
// @access  Admin
// ===================================================================
export const updateSong = async (req, res) => {
  // Check admin authorization
  if (!isAdmin(req.user)) {
    throw new UnauthorizedError("Access denied. Admins only.");
  }

  // Find the song by ID
  const song = await Song.findById(req.params.id);
  if (!song) {
    throw new NotFoundError("Song not found");
  }

  // Extract and normalize input data
  let {
    title,
    artist,
    genre,
    duration,
    price,
    isPremium,
    includeInSubscription,
    releaseDate,
    album,
  } = req.body;

  if (typeof genre === "string") {
    genre = genre.split(",").map((g) => g.trim());
  }

  // Upload new cover image if provided
  if (req.files?.coverImage?.[0]) {
    song.coverImage = await uploadToS3(req.files.coverImage[0], "covers");
  }

  // Upload new audio file if provided
  if (req.files?.audio?.[0]) {
    song.audioUrl = await uploadToS3(req.files.audio[0], "songs");
  }

  // Track old album to handle updates
  const oldAlbumId = song.album?.toString();
  const newAlbumId = album || null;

  // Apply updates to the song document
  Object.assign(song, {
    title,
    artist,
    genre,
    duration,
    price,
    isPremium,
    includeInSubscription: includeInSubscription ?? song.includeInSubscription,
    releaseDate,
    album: newAlbumId,
  });

  // Save the updated song
  await song.save();

  // If album has changed, update album-song references
  if (oldAlbumId && oldAlbumId !== newAlbumId) {
    await Album.findByIdAndUpdate(oldAlbumId, {
      $pull: { songs: song._id },
    });
  }

  if (newAlbumId && oldAlbumId !== newAlbumId) {
    await Album.findByIdAndUpdate(newAlbumId, {
      $addToSet: { songs: song._id },
    });
  }

  // Send the updated song in the response
  res.status(StatusCodes.OK).json({ success: true, song });
};



// ===================================================================
// @desc    Delete a song by ID (Admin only)
// @route   DELETE /api/songs/:id
// @access  Admin
// ===================================================================
export const deleteSong = async (req, res) => {
  // Check admin authorization
  if (!isAdmin(req.user)) {
    throw new UnauthorizedError("Access denied. Admins only.");
  }

  // Find the song by ID
  const song = await Song.findById(req.params.id);
  if (!song) {
    throw new NotFoundError("Song not found");
  }

  // If the song belongs to an album, remove its reference from that album
  if (song.album) {
    await Album.findByIdAndUpdate(song.album, {
      $pull: { songs: song._id },
    });
  }

  // Permanently delete the song
  await song.deleteOne();

  // Send success response
  res.status(StatusCodes.OK).json({ success: true, message: "Song deleted successfully" });
};



// ===================================================================
// @desc    Get all songs with filtering, sorting, and pagination
// @route   GET /api/songs
// @access  Authenticated users
// ===================================================================
export const getAllSongs = async (req, res) => {
  const user = req.user;

  // Extract and normalize query parameters
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;
  const type = req.query.type || "all"; // Options: recent, top, similar
  const artistId = req.query.artistId || null;

  let query = {};
  let sortOption = { createdAt: -1 }; // Default: most recent first

  // Adjust query and sorting based on the type
  switch (type) {
    case "recent":
      sortOption = { createdAt: -1 };
      break;

    case "top":
      sortOption = { playCount: -1 }; // Requires playCount field on Song
      break;

    case "similar":
      if (!artistId) {
        throw new BadRequestError("artistId is required for similar songs");
      }
      query.artist = artistId;
      break;

    case "all":
    default:
      break;
  }

  // Get total song count for pagination
  const totalSongs = await Song.countDocuments(query);

  // Query songs with sorting, pagination, and population
  const songs = await Song.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate("artist", "name")
    .populate("album", "title");

  // Apply access control to hide audio URLs if necessary
  const updatedSongs = await Promise.all(
    songs.map(async (song) => {
      const hasAccess = await hasAccessToSong(user, song);
      const songData = song.toObject();
      if (!hasAccess) {
        songData.audioUrl = null;
      }
      return songData;
    })
  );

  // Send response
  res.status(StatusCodes.OK).json({
    success: true,
    type,
    currentPage: page,
    totalPages: Math.ceil(totalSongs / limit),
    totalSongs,
    songs: updatedSongs,
  });
};


// ===================================================================
// @desc    Get a single song by ID or slug
// @route   GET /api/songs/:id
// @access  Authenticated users
// ===================================================================
export const getSongById = async (req, res) => {
  const { id } = req.params;

  // Determine if the provided identifier is a valid MongoDB ObjectId
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

  // Find the song by _id or slug
  const song = await Song.findOne(
    isValidObjectId ? { _id: id } : { slug: id }
  )
    .populate("artist", "name image")
    .populate("album", "title coverImage");

  if (!song) {
    throw new NotFoundError("Song not found");
  }

  // Check access permissions for the current user
  const hasAccess = await hasAccessToSong(req.user, song);

  const songData = song.toObject();
  if (!hasAccess) {
    songData.audioUrl = null;
  }

  // Respond with the song data (with or without audioUrl)
  res.status(StatusCodes.OK).json({ success: true, song: songData });
};



// ===================================================================
// @desc    Get songs matching user’s preferred and purchased genres (paginated)
// @route   GET /api/songs/matching-genres?page=1&limit=20
// @access  Authenticated users
// ===================================================================
export const getSongsMatchingUserGenres = async (req, res) => {
  // 1. Fetch user with purchased songs populated
  const user = await User.findById(req.user._id).populate({
    path: "purchasedSongs",
    select: "genre _id",
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // 2. Combine genres from purchases and preferences
  const genreSet = new Set();

  user.purchasedSongs.forEach((song) => {
    const genres = Array.isArray(song.genre)
      ? song.genre
      : typeof song.genre === "string"
      ? [song.genre]
      : [];
    genres.forEach((g) => g && genreSet.add(g.trim().toLowerCase()));
  });

  if (Array.isArray(user.preferredGenres)) {
    user.preferredGenres.forEach((g) => g && genreSet.add(g.trim().toLowerCase()));
  }

  const genreArray = [...genreSet];

  if (genreArray.length === 0) {
    return res.status(200).json({
      success: true,
      matchingGenres: [],
      songs: [],
      total: 0,
      page: 1,
      pages: 0,
    });
  }

  // 3. Handle pagination
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // 4. Fetch paginated, genre-matched songs
  const [songs, total] = await Promise.all([
    Song.find({ genre: { $in: genreArray } })
      .populate("artist", "name image")
      .populate("album", "title coverImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Song.countDocuments({ genre: { $in: genreArray } }),
  ]);

  // 5. Filter songs by access
  const songsWithAccess = await Promise.all(
    songs.map(async (song) => {
      const songObj = song.toObject();
      const hasAccess = await hasAccessToSong(user, song);
      if (!hasAccess) {
        songObj.audioUrl = null;
      }
      return songObj;
    })
  );

  // 6. Return response with pagination
  res.status(StatusCodes.OK).json({
    success: true,
    matchingGenres: genreArray,
    songs: songsWithAccess,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};


// ===================================================================
// @desc    Get songs by genre with pagination
// @route   GET /api/songs?genre=pop&page=1&limit=20
// @access  Public
// ===================================================================
export const getSongsByGenre = async (req, res) => {
  // 1. Extract query parameters with defaults
  const { genre, page = 1, limit = 20 } = req.query;

  // 2. Build query object (case-insensitive partial match for genre)
  const query = genre
    ? { genre: { $regex: new RegExp(genre, "i") } }
    : {};

  // 3. Parse pagination values safely
  const currentPage = Math.max(1, parseInt(page, 10));
  const pageLimit = Math.min(50, Math.max(1, parseInt(limit, 10))); // Max 50 per page
  const skip = (currentPage - 1) * pageLimit;

  // 4. Execute query and count in parallel
  const startTime = Date.now();
  const [songs, total] = await Promise.all([
    Song.find(query)
      .sort({ releaseDate: -1 })
      .skip(skip)
      .limit(pageLimit),
    Song.countDocuments(query),
  ]);
  const queryTime = Date.now() - startTime;
  console.log(`Query time: ${queryTime}ms`);

  // 5. Respond with paginated results
  res.status(StatusCodes.OK).json({
    success: true,
    genre: genre || null,
    total,
    page: currentPage,
    pages: Math.ceil(total / pageLimit),
    songs,
  });
};


// ===================================================================
// @desc    Get songs by artist ID or slug, with pagination
// @route   GET /api/songs/by-artist/:artistId?page=1&limit=20
// @access  Public
// ===================================================================
export const getSongsByArtist = async (req, res) => {
  const { artistId } = req.params;

  // 1. Parse and sanitize pagination params
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // 2. Resolve artist by either ObjectId or slug
  const artistQuery = mongoose.Types.ObjectId.isValid(artistId)
    ? { _id: artistId }
    : { slug: artistId };

  const artist = await Artist.findOne(artistQuery);
  if (!artist) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Artist not found" });
  }

  // 3. Query all songs by the resolved artist ID
  const songQuery = { artist: artist._id };

  const [songs, total] = await Promise.all([
    Song.find(songQuery)
      .skip(skip)
      .limit(limit)
      .sort({ releaseDate: -1 })
      .populate("artist", "name image")
      .populate("album", "title coverImage"),
    Song.countDocuments(songQuery),
  ]);

  // 4. Return paginated response with artist info
  res.status(StatusCodes.OK).json({
    success: true,
    artist: {
      id: artist._id,
      name: artist.name,
      slug: artist.slug,
    },
    songs,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};



// ===================================================================
// @desc    Get songs by album ID or slug with pagination
// @route   GET /api/songs/by-album/:albumId?page=1&limit=20
// @access  Public
// ===================================================================
export const getSongsByAlbum = async (req, res) => {
  const { albumId } = req.params;

  // 1. Parse pagination params safely
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // 2. Find album by ID or slug
  const albumQuery = mongoose.Types.ObjectId.isValid(albumId)
    ? { _id: albumId }
    : { slug: albumId };

  const album = await Album.findOne(albumQuery);
  if (!album) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Album not found" });
  }

  // 3. Query for songs belonging to the album
  const query = { album: album._id };

  const [songs, total] = await Promise.all([
    Song.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ releaseDate: -1 })
      .populate("artist", "name image")
      .populate("album", "title coverImage"),
    Song.countDocuments(query),
  ]);

  // 4. Send response with pagination metadata
  res.status(StatusCodes.OK).json({
    success: true,
    album: {
      id: album._id,
      title: album.title,
      slug: album.slug,
    },
    songs,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};


// ===================================================================
// @desc    Get all purchased songs for the authenticated user
// @route   GET /api/songs/purchased?page=1&limit=20
// @access  Private
// ===================================================================
export const getPurchasedSongs = async (req, res) => {
  // 1. Parse pagination parameters
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // 2. Fetch user and their purchased songs
  const user = await User.findById(req.user._id)
    .populate({
      path: "purchasedSongs",
      select: "title artist genre duration coverImage audioUrl",
      options: {
        skip,
        limit,
      },
      populate: [
        { path: "artist", select: "name" },
        { path: "album", select: "title" },
      ],
    })
    .select("purchasedSongs");

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
  }

  const totalPurchased = await Song.countDocuments({
    _id: { $in: user.purchasedSongs.map(song => song._id) },
  });

  // 3. Apply access control for each song
  const songs = await Promise.all(
    user.purchasedSongs.map(async (song) => {
      const songObj = song.toObject();
      const hasAccess = await hasAccessToSong(req.user, song);
      if (!hasAccess) {
        songObj.audioUrl = null;
      }
      return songObj;
    })
  );

  // 4. Return paginated purchased songs
  res.status(StatusCodes.OK).json({
    success: true,
    songs,
    total: totalPurchased,
    page,
    pages: Math.ceil(totalPurchased / limit),
  });
};


// ===================================================================
// @desc    Get all premium songs with access control and pagination
// @route   GET /api/songs/premium?page=1&limit=20
// @access  Private (user must be logged in)
// ===================================================================
export const getPremiumSongs = async (req, res) => {
  const user = req.user;

  // 1. Parse pagination parameters with defaults
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // 2. Query total count and paginated premium songs
  const [total, songs] = await Promise.all([
    Song.countDocuments({ isPremium: true }),
    Song.find({ isPremium: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("artist", "name image")
      .populate("album", "title coverImage")
  ]);

  // 3. Apply access control per song
  const filteredSongs = await Promise.all(
    songs.map(async (song) => {
      const songObj = song.toObject();
      const hasAccess = await hasAccessToSong(user, song);
      if (!hasAccess) {
        songObj.audioUrl = null;
      }
      return songObj;
    })
  );

  // 4. Send response
  res.status(StatusCodes.OK).json({
    success: true,
    songs: filteredSongs,
    total,
    page,
    pages: Math.ceil(total / limit)
  });
};



// ===================================================================
// @desc    Get paginated liked songs by song IDs
// @route   POST /api/songs/liked
// @access  Private
// ===================================================================
export const getLikedSongs = async (req, res) => {
  const { ids } = req.body;

  // 1. Validate song ID array
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "No song IDs provided" });
  }

  // 2. Filter valid MongoDB ObjectIds
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "No valid song IDs provided" });
  }

  // 3. Pagination parameters
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  // 4. Fetch paginated songs
  const [total, songs] = await Promise.all([
    Song.countDocuments({ _id: { $in: validIds } }),
    Song.find({ _id: { $in: validIds } })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("artist", "name image")
      .populate("album", "title coverImage"),
  ]);

  // 5. Access control: hide audioUrl if unauthorized
  const filteredSongs = await Promise.all(
    songs.map(async (song) => {
      const songObj = song.toObject();
      const hasAccess = await hasAccessToSong(req.user, song);
      if (!hasAccess) songObj.audioUrl = null;
      return songObj;
    })
  );

  // 6. Send paginated response
  res.status(StatusCodes.OK).json({
    success: true,
    songs: filteredSongs,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};





