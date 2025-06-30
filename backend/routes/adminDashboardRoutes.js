import express from "express";
import {
  getAllTransactionsByArtist,
  getPurchasedSongsByArtist,
  getPurchasedAlbumsByArtist,
  getSubscriberCount,
  getArtistRevenueSummary,
} from "../controllers/adminDashboardController.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

// All routes use isAuth to protect access
router.get("/transactions", isAuth, getAllTransactionsByArtist);
router.get("/purchased-songs/:artistId", isAuth, getPurchasedSongsByArtist);
router.get("/purchased-albums/:artistId", isAuth, getPurchasedAlbumsByArtist);
router.get("/subscriber-count/:artistId", isAuth, getSubscriberCount);
router.get("/revenue-summary/:artistId", isAuth, getArtistRevenueSummary);

export default router;