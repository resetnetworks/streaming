import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  createSong,
  updateSong,
  deleteSong,
  getAllSongs,
  getSongById,
  getSongsMatchingUserGenres,
} from "../controllers/songController.js";
import {songUpload} from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Use songUpload middleware before createSong and updateSong to handle files
router.post("/",isAuth, songUpload, createSong);
router.put("/:id",isAuth, songUpload, updateSong);

router.delete("/:id",isAuth, deleteSong);
router.get("/",isAuth, getAllSongs);
router.get("/matching-genre",isAuth, getSongsMatchingUserGenres);
router.get("/:id",isAuth, getSongById);

export default router;
