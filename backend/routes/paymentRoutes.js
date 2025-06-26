import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  createStripePayment,
  createRazorpayOrder,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/stripe/create-payment", isAuth, createStripePayment);
router.post("/razorpay/create-order", isAuth, createRazorpayOrder);

export default router;

