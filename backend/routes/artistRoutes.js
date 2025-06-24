import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  createArtist,
  updateArtist,
  deleteArtist,
  getAllArtists,
  getArtistById,
  getAllArtistsWithoutPagination,
} from "../controllers/artistController.js";
import {singleImageUpload} from "../middleware/uploadMiddleware.js";
import {
  createArtistValidator,
  updateArtistValidator,
  artistIdValidator
} from "../validators/artistValidators.js";
import validate from "../middleware/validate.js";

const router = express.Router();


router.post("/",isAuth, singleImageUpload, createArtistValidator, validate, createArtist);
router.put("/:id",isAuth, singleImageUpload, updateArtistValidator, validate,updateArtist);
router.get("/",isAuth, getAllArtists);
router.get("/all",isAuth, getAllArtistsWithoutPagination);
router.get("/:id",isAuth, getArtistById);
router.delete("/:id",isAuth, artistIdValidator, validate, deleteArtist);

export default router;
