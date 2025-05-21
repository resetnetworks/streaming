import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing. Please login.",
      });
    }

    let decodedData;
    try {
      decodedData = jwt.verify(token, process.env.jwt_secret);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token. Please login again.",
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
    console.error("Auth middleware error:", error);
    res.status(500).json({
      message: "Internal server error during authentication.",
    });
  }
};
