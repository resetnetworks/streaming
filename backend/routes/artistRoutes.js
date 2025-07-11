import express from "express";
import { authenticateUser } from "../middleware/authenticate.js";
import { isAdmin } from "../middleware/isAdmin.js";

import {
  createArtist,
  updateArtist,
  deleteArtist,
  getAllArtists,
  getArtistById,
  getAllArtistsWithoutPagination,
} from "../controllers/artistController.js";
import { singleImageUpload } from "../middleware/uploadMiddleware.js";
import {
  createArtistValidator,
  updateArtistValidator,
  artistIdValidator,
} from "../validators/artistValidators.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// Create artist (admin only)
router.post(
  "/",
  authenticateUser,
  isAdmin,
  singleImageUpload,
  createArtistValidator,
  validate,
  createArtist
);

// Update artist (admin only)
router.put(
  "/:id",
  authenticateUser,
  isAdmin,
  singleImageUpload,
  updateArtistValidator,
  validate,
  updateArtist
);

// Delete artist (admin only)
router.delete(
  "/:id",
  authenticateUser,
  isAdmin,
  artistIdValidator,
  validate,
  deleteArtist
);

// Get all artists (paginated)
router.get("/", authenticateUser, getAllArtists);

// Get all artists (no pagination)
router.get("/all", authenticateUser, getAllArtistsWithoutPagination);

// Get artist by ID
router.get("/:id", authenticateUser, getArtistById);

export default router;
