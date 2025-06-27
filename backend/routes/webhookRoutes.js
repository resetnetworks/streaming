import express from "express";
import { stripeWebhook, razorpayWebhook } from "../webhooks/webhookController.js";

// Use express.raw() ONLY for Stripe webhook
const router = express.Router();

router.post("/stripe", express.raw({ type: "application/json" }), stripeWebhook);
router.post("/razorpay", express.json(), razorpayWebhook); // Razorpay doesn't need raw body

export default router;
