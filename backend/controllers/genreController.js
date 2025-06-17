import Genre from "../models/Genre.js";
import mongoose from "mongoose";

// Create a new genre
export const createGenre = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ message: "Valid genre name is required." });
    }
    const genre = new Genre({ name, description, image });
    await genre.save();
    res.status(201).json(genre);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Genre name or slug already exists." });
    }
    res.status(400).json({ message: error.message });
  }
};

// Get all genres (with optional pagination)
export const getGenres = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [genres, total] = await Promise.all([
      Genre.find().skip(skip).limit(limit).sort({ name: 1 }),
      Genre.countDocuments()
    ]);

    res.json({
      results: genres,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single genre by ID or slug
export const getGenre = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const genre =
      await Genre.findOne(
        mongoose.Types.ObjectId.isValid(idOrSlug)
          ? { _id: idOrSlug }
          : { slug: idOrSlug }
      );
    if (!genre) return res.status(404).json({ message: "Genre not found" });
    res.json(genre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a genre by ID or slug
export const updateGenre = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const update = {};
    if (req.body.name) update.name = req.body.name;
    if (req.body.description) update.description = req.body.description;
    if (req.body.image) update.image = req.body.image;

    // If name is updated, slug will auto-update via pre-validate hook
    const genre = await Genre.findOneAndUpdate(
      mongoose.Types.ObjectId.isValid(idOrSlug)
        ? { _id: idOrSlug }
        : { slug: idOrSlug },
      update,
      { new: true, runValidators: true }
    );
    if (!genre) return res.status(404).json({ message: "Genre not found" });
    res.json(genre);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Genre name or slug already exists." });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete a genre by ID or slug
export const deleteGenre = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const genre = await Genre.findOneAndDelete(
      mongoose.Types.ObjectId.isValid(idOrSlug)
        ? { _id: idOrSlug }
        : { slug: idOrSlug }
    );
    if (!genre) return res.status(404).json({ message: "Genre not found" });
    res.json({ message: "Genre deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};