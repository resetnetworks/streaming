import { User } from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import TryCatch from "../utils/TryCatch.js";
import bcrypt from "bcrypt";
import { sendMail } from "../utils/sendResetPassMail.js";
import crypto from "crypto";


export const registerUser = TryCatch(async (req, res) => {
  const { name, email, password, dob } = req.body;

  let user = await User.findOne({ email });

  if (user)
    return res.status(400).json({
      message: "User Already Exist",
    });

  const hashPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    dob,
    password: hashPassword,
  });

  generateToken(user._id, res);

  // Exclude password from returned user data
  const userSafe = user.toObject();
  delete userSafe.password;

  res.status(201).json({
    user: userSafe,
    message: "User Registered",
  });
});

export const loginUser = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user)
    return res.status(400).json({
      message: "No User Exist",
    });

  const compPassword = await bcrypt.compare(password, user.password);

  if (!compPassword)
    return res.status(400).json({
      message: "Wrong Password",
    });

  generateToken(user._id, res);

  const userSafe = user.toObject();
  delete userSafe.password;

  res.status(200).json({
    user: userSafe,
    message: "User Logged In",
  });
});

export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

export const logoutUser = TryCatch(async (req, res) => {
  res.cookie("token", "", { maxAge: 0, httpOnly: true, sameSite: "strict" });

  res.json({
    message: "Logged Out Successfully",
  });
});

export const saveToPlaylist = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const songId = req.params.id;

  if (user.playlist.includes(songId)) {
    user.playlist = user.playlist.filter(id => id !== songId);

    await user.save();

    return res.json({
      message: "Removed from playlist",
    });
  }

  user.playlist.push(songId);

  await user.save();

  return res.json({
    message: "Added to playlist",
  });
});

// New: Like/Unlike song controller matching likedsong array
export const likeSong = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const songId = req.params.id;

  if (user.likedsong.includes(songId)) {
    user.likedsong = user.likedsong.filter(id => id !== songId);

    await user.save();

    return res.json({
      message: "Song removed from liked songs",
    });
  }

  user.likedsong.push(songId);

  await user.save();

  return res.json({
    message: "Song added to liked songs",
  });
});


export const updatePreferredGenres = TryCatch(async (req, res) => {
  const { genres } = req.body; // Expecting an array of genres

  if (!Array.isArray(genres)) {
    return res.status(400).json({ message: "Genres must be an array" });
  }

  const user = await User.findById(req.user._id);

  user.preferredGenres = genres.map(genre => genre.trim().toLowerCase());

  await user.save();

  res.status(200).json({
    message: "Preferred genres updated",
    preferredGenres: user.preferredGenres,
  });
});

// Forgot Password
export const forgotPassword = TryCatch(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  const resetToken = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `Reset your password by clicking the link: ${resetURL}`;

  await sendMail(user.email, "Reset Your Password", message);

  res.status(200).json({ message: "Reset link sent to your email" });
});

export const resetPassword = TryCatch(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Token is invalid or has expired" });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({ message: "Password reset successful" });
});

// google callback handler
export const googleAuthCallback = (req, res) => {
  try {
    generateToken(req.user._id, res);
    res.redirect(process.env.CLIENT_URL || "/");
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).send("Authentication failed.");
  }
};

// Facebook callback handler
export const facebookAuthCallback = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Facebook authentication failed" });
  }

  generateToken(req.user._id, res);

  res.status(200).json({
    success: true,
    message: "Facebook login successful",
    user: req.user,
  });
};

// Apple callback handler
export const appleCallback = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Apple authentication failed" });
  }

  generateToken(req.user._id, res);

  res.status(200).json({
    success: true,
    message: "Apple login successful",
    user: req.user,
  });
};
