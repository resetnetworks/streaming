// routes/adminPlaylistRoutes.js
import express from "express";
import {
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getAllPlaylists,
} from "../controllers/adminPlaylistController.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

// Public or authenticated route (depends on your needs)
router.get("/", getAllPlaylists);

// Protected routes — require authentication
router.post("/", isAuth, createPlaylist);

router.route("/:playlistId")
  .patch(isAuth, updatePlaylist)
  .delete(isAuth, deletePlaylist);

router.post("/:playlistId/songs", isAuth, addSongToPlaylist);
router.delete("/:playlistId/songs/:songId", isAuth, removeSongFromPlaylist);

export default router;
