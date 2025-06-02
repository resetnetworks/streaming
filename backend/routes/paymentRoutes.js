import express from "express";
import {
  createStripePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/paymentController.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/stripe/create-payment", isAuth, createStripePayment);
router.post("/razorpay/create-order", isAuth, createRazorpayOrder);
router.post("/razorpay/verify", isAuth, verifyRazorpayPayment);

export default router;
