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

const router = express.Router();


router.get("/", isAuth, getPlaylists);

router.post("/", isAuth, createPlaylist);

router.delete("/:playlistId", isAuth, deletePlaylist);

router.put("/:playlistId", isAuth, updatePlaylist); 

router.get("/:playlistId", isAuth, getPlaylistById)

router.post("/:playlistId/song", isAuth, addSongToPlaylist);

router.delete("/:playlistId/song/:songId", isAuth, removeSongFromPlaylist);

export default router;
