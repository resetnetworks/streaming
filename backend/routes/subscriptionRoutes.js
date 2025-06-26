import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { initiateArtistSubscription } from "../controllers/subscriptionController.js";

const router = express.Router();

router.post("/artist/:artistId", isAuth, initiateArtistSubscription);

export default router;
