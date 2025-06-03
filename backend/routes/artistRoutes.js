import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  createArtist,
  updateArtist,
  deleteArtist,
  getAllArtists,
  getArtistById,
} from "../controllers/songController.js";
import {singleImageUpload} from "../middleware/uploadMiddleware.js";

const router = express.Router();


router.post("/",isAuth, singleImageUpload, createArtist);
router.put("/:id",isAuth, singleImageUpload, updateArtist);
router.get("/",isAuth, getAllArtists);
router.get("/:id",isAuth, getArtistById);
router.delete("/:id",isAuth, deleteArtist);

export default router;
