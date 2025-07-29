import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import logger from "../utils/logger.js";

export const authenticateUser = async (req, res, next) => {
  try {
    // ✅ Check Authorization header first, fallback to cookies
    let token =
      req.header("Authorization")?.replace("Bearer ", "") || req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing. Please login.",
      });
    }

    let decodedData;
    try {
      decodedData = jwt.verify(token, process.env.jwt_secret);
    } catch (err) {
      logger.warn("JWT verification failed:", err.message);
      return res.status(401).json({
        message: "Invalid or expired token. Please login again.",
      });
    }

    if (!decodedData || !decodedData.id) {
      return res.status(401).json({
        message: "Invalid token payload. Please login again.",
      });
    }

    const user = await User.findById(decodedData.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please login.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error("Authentication middleware error:", error);
    res.status(500).json({
      message: "Internal server error during authentication.",
    });
  }
};
