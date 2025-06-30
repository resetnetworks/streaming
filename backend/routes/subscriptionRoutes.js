import express from "express";
import { authenticateUser } from "../middleware/authenticate.js";
import { initiateArtistSubscription } from "../controllers/subscriptionController.js";
import { artistIdValidator } from "../validators/artistValidators.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// Initiate subscription for an artist
router.post(
  "/artist/:artistId",
  authenticateUser,
  artistIdValidator,
  validate,
  initiateArtistSubscription
);

export default router;
