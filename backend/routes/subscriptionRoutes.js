import express from "express";
import { authenticateUser } from "../middleware/authenticate.js";
import { initiateArtistSubscription } from "../controllers/subscriptionController.js";
import { artistIdValidator } from "../validators/artistValidators.js";
import validate from "../middleware/validate.js";
import { createSetupIntent } from "../controllers/subscriptionController.js";

const router = express.Router();

// Initiate subscription for an artist
router.post(
  "/artist/:artistId",
  authenticateUser,
  initiateArtistSubscription
);
router.post("/setup-intent", authenticateUser, createSetupIntent);

export default router;
