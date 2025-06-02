import express from "express";
import { stripeWebhook, razorpayWebhook } from "../controllers/webhookController.js";

const router = express.Router();

router.post("/stripe", express.raw({ type: "application/json" }), stripeWebhook);
// Razorpay webhook route
router.post("/razorpay", razorpayWebhook);

export default router;
