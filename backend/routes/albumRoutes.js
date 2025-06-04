import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  createAlbum,
  getAlbums,
  deleteAlbum,
  getAlbumById,
  updateAlbum
} from "../controllers/songController.js";
import {singleImageUpload} from "../middleware/uploadMiddleware.js";

const router = express.Router();


router.post("/",isAuth, singleImageUpload, createAlbum);
router.put("/:id",isAuth, singleImageUpload, updateAlbum);
router.delete("/:id",isAuth, deleteAlbum);

/**
 * @swagger
 * /albums:
 *   get:
 *     summary: Returns all albums
 *     tags: [Album]
 *     responses:
 *       200:
 *         description: A list of albums
 */

router.get("/",isAuth, getAlbums);
router.get("/:id", isAuth, getAlbumById);

export default router;
