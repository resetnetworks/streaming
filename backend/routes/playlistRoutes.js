import express from "express";
import {
  getPlaylists,
  createPlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getPlaylistById,
  updatePlaylist,
} from "../controllers/playlistController.js";
import { authenticateUser } from "../middleware/authenticate.js";
import {
  createPlaylistValidator,
  updatePlaylistValidator,
  playlistIdValidator,
  addSongToPlaylistValidator,
  removeSongFromPlaylistValidator,
} from "../validators/playlistValidators.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// Get all playlists for user
router.get("/", authenticateUser, getPlaylists);

// Create new playlist
router.post("/", authenticateUser, createPlaylistValidator, validate, createPlaylist);

// Get a single playlist by ID
router.get("/:playlistId", authenticateUser, playlistIdValidator, validate, getPlaylistById);

// Update a playlist
router.put(
  "/:playlistId",
  authenticateUser,
  updatePlaylistValidator,
  validate,
  updatePlaylist
);

// Delete a playlist
router.delete(
  "/:playlistId",
  authenticateUser,
  playlistIdValidator,
  validate,
  deletePlaylist
);

// Add a song to a playlist
router.post(
  "/:playlistId/song",
  authenticateUser,
  addSongToPlaylistValidator,
  validate,
  addSongToPlaylist
);

// Remove a song from a playlist
router.delete(
  "/:playlistId/song/:songId",
  authenticateUser,
  removeSongFromPlaylistValidator,
  validate,
  removeSongFromPlaylist
);

export default router;
