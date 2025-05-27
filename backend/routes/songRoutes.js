import express from "express";
import {
  createSong,
  updateSong,
  deleteSong,
  getAllSongs,
  getSongById,
} from "../controllers/songController.js";
import {songUpload} from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Use songUpload middleware before createSong and updateSong to handle files
router.post("/", songUpload, createSong);
router.put("/:id", songUpload, updateSong);

router.delete("/:id", deleteSong);
router.get("/", getAllSongs);
router.get("/:id", getSongById);

export default router;
