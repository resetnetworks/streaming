import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  createAlbum,
  getAlbums,
  deleteAlbum,
} from "../controllers/songController.js";
import {singleImageUpload} from "../middleware/uploadMiddleware.js";

const router = express.Router();


router.post("/",isAuth, singleImageUpload, createAlbum);
router.put("/",isAuth, singleImageUpload, getAlbums);
router.delete("/:id",isAuth, deleteAlbum);
router.get("/",isAuth, getAlbums);

export default router;
