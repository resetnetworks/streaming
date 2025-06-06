import { Album } from "../models/Album.js";
import { Song } from "../models/Song.js";



const isAdmin = (user) => user?.role === "admin";

// Album Controllers
export const createAlbum = async (req, res) => {
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
    const albums = await Album.find()
      .sort({ createdAt: -1 })
      .populate("songs", "title duration coverImage"); // include basic song info

    res.status(200).json({ success: true, albums });
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
    const album = await Album.findById(req.params.id)
      .populate("songs", "title duration coverImage audioUrl");

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    res.status(200).json({ success: true, album });
  } catch (error) {
    console.error("Get Album by ID Error:", error);
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