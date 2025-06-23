import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  createAlbum,
  getAllAlbums,
  deleteAlbum,
  getAlbumById,
  updateAlbum,
  getAlbumsByArtist
} from "../controllers/albumController.js";
import { singleImageUpload } from "../middleware/uploadMiddleware.js";
import {
  createAlbumValidator,
  updateAlbumValidator,
  albumIdValidator,
} from "../validators/albumValidators.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// Create a new album
router.post(
  "/",
  isAuth,
  singleImageUpload,
  createAlbumValidator,
  validate,
  createAlbum
);

// Update an existing album
router.put(
  "/:id",
  isAuth,
  singleImageUpload,
  updateAlbumValidator,
  validate,
  updateAlbum
);

// Delete an album
router.delete(
  "/:id",
  isAuth,
  albumIdValidator,
  validate,
  deleteAlbum
);

// Get all albums
router.get("/", isAuth, getAllAlbums);

// Get album by ID
router.get(
  "/:id",
  isAuth,
  albumIdValidator,
  validate,
  getAlbumById
);

router.get("/artist/:artistId", isAuth, getAlbumsByArtist);

export default router;
