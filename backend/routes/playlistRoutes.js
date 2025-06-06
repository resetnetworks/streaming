import express from "express";
import { 
  getPlaylists,
  createPlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getPlaylistById,
  updatePlaylist 
} from "../controllers/playlistController.js";
import { isAuth } from "../middleware/isAuth.js";
import {
  createPlaylistValidator,
  updatePlaylistValidator,
  playlistIdValidator,
  addSongToPlaylistValidator,
  removeSongFromPlaylistValidator
} from "../validators/playlistValidators.js";
import validate from "../middleware/validate.js";

const router = express.Router();


router.get("/", isAuth, getPlaylists);

router.post("/", isAuth, createPlaylistValidator, validate, createPlaylist);

router.delete("/:playlistId", isAuth, playlistIdValidator, validate, deletePlaylist);

router.put("/:playlistId", isAuth, updatePlaylistValidator, validate, updatePlaylist); 

router.get("/:playlistId", isAuth, getPlaylistById)

router.post("/:playlistId/song", isAuth, addSongToPlaylistValidator, validate, addSongToPlaylist);

router.delete("/:playlistId/song/:songId", isAuth, removeSongFromPlaylistValidator, validate, removeSongFromPlaylist);

export default router;
