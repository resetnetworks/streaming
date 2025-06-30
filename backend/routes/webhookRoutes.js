import express from "express";
import { stripeWebhook, razorpayWebhook } from "../webhooks/webhookController.js";

const router = express.Router();

// ⚠️ Stripe requires raw body for signature verification
router.post("/stripe", express.raw({ type: "application/json" }), stripeWebhook);

// ✅ Razorpay works with parsed JSON
router.post("/razorpay", express.json(), razorpayWebhook);

export default router;
