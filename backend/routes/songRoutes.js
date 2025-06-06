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
import {
  createSongValidator,
  updateSongValidator,
  songIdValidator
} from "../validators/songValidators.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// Use songUpload middleware before createSong and updateSong to handle files
router.post("/",isAuth, songUpload, createSongValidator, validate, createSong);
router.put("/:id",isAuth, songUpload, updateSongValidator, validate, updateSong);

router.delete("/:id",isAuth, songIdValidator, validate, deleteSong);
router.get("/",isAuth, getAllSongs);
router.get("/matching-genre",isAuth, getSongsMatchingUserGenres);
router.get("/:id",isAuth, songIdValidator, validate, getSongById);

export default router;
