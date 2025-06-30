import express from "express";
import { authenticateUser } from "../middleware/authenticate.js";
import {
  createStripePayment,
  createRazorpayOrder,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create Stripe PaymentIntent
router.post("/stripe/create-payment", authenticateUser, createStripePayment);

// Create Razorpay Order
router.post("/razorpay/create-order", authenticateUser, createRazorpayOrder);

export default router;
