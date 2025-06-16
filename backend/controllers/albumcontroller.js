import { Album } from "../models/Album.js";
import { Song } from "../models/Song.js";
import { BadRequestError, UnauthorizedError } from "../errors/index.js";
import mongoose from "mongoose";



const isAdmin = (user) => user?.role === "admin";

// Album Controllers
export const createAlbum = async (req, res) => {
  console.log('hello')
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const { title, description, artist, releaseDate, price, isPremium } = req.body;

    const coverImageFile = req.files?.coverImage?.[0];
    const coverImageUrl = coverImageFile ? await uploadToS3(coverImageFile, "covers") : "";

    const newAlbum = await Album.create({
      title,
      description,
      artist,
      releaseDate,
      price,
      isPremium,
      coverImage: coverImageUrl,
    });
    
     if (typeof genre === "string") {
      genre = genre.split(",").map((g) => g.trim());
    }

    res.status(201).json({ success: true, album: newAlbum });
  } catch (error) {
    console.error("Create Album Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAlbums = async (req, res) => {
  try {
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const [albums, total] = await Promise.all([
      Album.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("songs", "title duration coverImage"),
      Album.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      albums,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get Albums Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAlbum = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: "Album not found" });

    // Optional: Remove album reference from its songs
    await Song.updateMany(
      { _id: { $in: album.songs } },
      { $unset: { album: "" } }
    );

    await album.deleteOne();

    res.status(200).json({ success: true, message: "Album deleted successfully" });
  } catch (error) {
    console.error("Delete Album Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// getAlbumByID

export const getAlbumById = async (req, res) => {
  try {
    console.log("");
    
    const { id } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    const album = isObjectId
      ? await Album.findById(id).populate("songs", "title duration coverImage audioUrl")
      : await Album.findOne({ slug: id }).populate("songs", "title duration coverImage audioUrl");

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    res.status(200).json({ success: true, album });
  } catch (error) {
    console.error("Get Album Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// updateAlbum
export const updateAlbum = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: "Album not found" });

    const { title, description, artist, releaseDate, price, isPremium } = req.body;

    if (title) album.title = title;
    if (description) album.description = description;
    if (artist) album.artist = artist;
    if (releaseDate) album.releaseDate = releaseDate;
    if (price) album.price = price;
    if (isPremium !== undefined) album.isPremium = isPremium;

    const coverImageFile = req.files?.coverImage?.[0];
    if (coverImageFile) {
      album.coverImage = await uploadToS3(coverImageFile, "covers");
    }

    await album.save();

    res.status(200).json({ success: true, album });
  } catch (error) {
    console.error("Update Album Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /albums/artist/:artistId
export const getAlbumsByArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    console.log("Fetching albums for artist:", artistId);
    if (!mongoose.Types.ObjectId.isValid(artistId)) {
      return res.status(400).json({ success: false, message: "Invalid artist ID" });
    }
    const albums = await Album.find({ artist: artistId });
    console.log(albums)
    res.json({ success: true, albums });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};