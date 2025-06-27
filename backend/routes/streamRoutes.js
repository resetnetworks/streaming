// routes/streamRoutes.js
import express from "express";
import { streamSong, streamAlbum } from "../controllers/streamController.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.get("/song/:id", isAuth, streamSong);
router.get("/album/:id", isAuth, streamAlbum);

export default router;
