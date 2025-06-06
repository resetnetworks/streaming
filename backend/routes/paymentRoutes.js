import express from "express";
import {
  createStripePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createArtistSubscriptionRazorpay,
  createArtistSubscriptionStripe
} from "../controllers/paymentController.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/stripe/create-payment", isAuth, createStripePayment);
router.post("/razorpay/create-order", isAuth, createRazorpayOrder);
router.post("/razorpay/verify", isAuth, verifyRazorpayPayment);
router.post("/subscribe/artist/stripe", isAuth, createArtistSubscriptionStripe);
router.post("/subscribe/artist/razorpay", isAuth, createArtistSubscriptionRazorpay);

export default router;
