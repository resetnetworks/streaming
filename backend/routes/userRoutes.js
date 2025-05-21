import express from "express";
import {
  registerUser,
  loginUser,
  myProfile,
  logoutUser,
  saveToPlaylist,
  likeSong,
  updatePreferredGenres,
  forgotPassword,
  resetPassword,
} from "../controllers/userControllers.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", isAuth, myProfile);
router.post("/logout", isAuth, logoutUser);

router.put("/playlist/:id", isAuth, saveToPlaylist);
router.put("/likedsong/:id", isAuth, likeSong);
router.put("/genres", isAuth, updatePreferredGenres);

// forgot password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
