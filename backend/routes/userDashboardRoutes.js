import express from "express";
import {
  getUserPurchases,
  getUserSubscriptions,
  cancelArtistSubscription,
} from "../controllers/userDashboardController.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

// ✅ User Dashboard Routes
router.get("/purchases", isAuth, getUserPurchases);
router.get("/subscriptions", isAuth, getUserSubscriptions);
router.delete("/subscriptions/:artistId", isAuth, cancelArtistSubscription);

export default router;
