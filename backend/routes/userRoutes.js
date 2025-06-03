import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import passport from "../middleware/passport.js";
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



const router = express.Router();

// User Login Routes 
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", isAuth, myProfile);
router.post("/logout", isAuth, logoutUser);
router.put("/likedsong/:id", isAuth, likeSong);
router.put("/update-genres", isAuth, updatePreferredGenres);

// forgot password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// login with google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleAuthCallback
);

// Facebook OAuth login route
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// Facebook OAuth callback URL (Facebook redirects here after login)
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/login" }),
  facebookAuthCallback
);


// Apple OAuth callback URL (Apple redirects here after login)
router.get("/apple", passport.authenticate("apple"));

router.post(
  "/apple/callback",
  passport.authenticate("apple", { session: false, failureRedirect: "/login" }),
  appleCallback
);


export default router;
