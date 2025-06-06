
import { Artist } from "../models/Artist.js";
import { uploadToS3 } from "../utils/s3Uploader.js";


const isAdmin = (user) => user?.role === "admin";
// Artist Controller 
export const createArtist = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const { name, bio,subscriptionPrice } = req.body;
    const imageFile = req.files?.coverImage?.[0];
    const imageUrl = imageFile ? await uploadToS3(imageFile, "artists") : "";

    const newArtist = await Artist.create({
      name,
      bio,
      subscriptionPrice,
      image: imageUrl,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, artist: newArtist });
  } catch (error) {
    console.error("Create Artist Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateArtist = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    const { name, bio,subscriptionPrice } = req.body;

    if (name) artist.name = name;
    if (bio) artist.bio = bio;
    if (subscriptionPrice) artist.subscriptionPrice = subscriptionPrice;

    const imageFile = req.files?.image?.[0];
    if (imageFile) {
      artist.image = await uploadToS3(imageFile, "artists");
    }

    await artist.save();

    res.status(200).json({ success: true, artist });
  } catch (error) {
    console.error("Update Artist Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteArtist = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    await artist.deleteOne();

    res.status(200).json({ success: true, message: "Artist deleted successfully" });
  } catch (error) {
    console.error("Delete Artist Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, artists });
  } catch (error) {
    console.error("Get All Artists Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    res.status(200).json({ success: true, artist });
  } catch (error) {
    console.error("Get Artist By ID Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};