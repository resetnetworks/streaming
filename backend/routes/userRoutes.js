import express from "express";
import passport from "../middleware/passport.js";
import { authenticateUser } from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";

import {
  registerUser,
  loginUser,
  myProfile,
  logoutUser,
  likeSong,
  updatePreferredGenres,
  forgotPassword,
  resetPassword,
  googleAuthCallback,
  facebookAuthCallback,
  appleCallback,
} from "../controllers/userControllers.js";

import {
  registerValidation,
  loginValidation,
  updateGenresValidation,
  likeSongValidation,
  resetPasswordValidation,
} from "../validators/userValidators.js";

const router = express.Router();

// 🧾 Auth & Profile
router.post("/register", registerValidation, validate, registerUser);
router.post("/login", loginValidation, validate, loginUser);
router.get("/me", authenticateUser, myProfile);
router.post("/logout", authenticateUser, logoutUser);

// 💖 Like Song
router.put(
  "/likedsong/:id",
  authenticateUser,
  likeSongValidation,
  validate,
  likeSong
);

// 🎵 Update Preferred Genres
router.put(
  "/update-genres",
  authenticateUser,
  updateGenresValidation,
  validate,
  updatePreferredGenres
);

// 🔐 Forgot / Reset Password
router.post("/forgot-password", forgotPassword);
router.post(
  "/reset-password/:token",
  resetPasswordValidation,
  validate,
  resetPassword
);

// 🌐 Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleAuthCallback
);

// 🌐 Facebook OAuth
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/login" }),
  facebookAuthCallback
);

// 🍎 Apple OAuth
router.get("/apple", passport.authenticate("apple"));
router.post(
  "/apple/callback",
  passport.authenticate("apple", { session: false, failureRedirect: "/login" }),
  appleCallback
);

export default router;
