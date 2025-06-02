import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  createAlbum,
  getAlbums,
  deleteAlbum,
} from "../controllers/songController.js";
import {albumUpload} from "../middleware/uploadMiddleware.js";

const router = express.Router();


router.post("/",isAuth, albumUpload, createAlbum);
router.put("/",isAuth, albumUpload, getAlbums);
router.delete("/:id",isAuth, deleteAlbum);
router.get("/",isAuth, getAlbums);

export default router;
