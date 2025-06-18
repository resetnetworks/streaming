import express from "express";
import { getRandomArtistWithSongs } from "../controllers/discoverController.js";

const router = express.Router();

router.get("/random-artist", getRandomArtistWithSongs);

export default router;
