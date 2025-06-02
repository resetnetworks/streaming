import express from "express";
import { stripeWebhook, razorpayWebhook } from "../controllers/webhookController.js";

const router = express.Router();

router.post("/stripe", stripeWebhook);
router.post("/razorpay", razorpayWebhook);

export default router;
