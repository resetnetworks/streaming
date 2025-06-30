import { validationResult } from "express-validator";
import logger from "../utils/logger.js";

export default function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));

    logger.warn("Validation failed:", extractedErrors);

    return res.status(400).json({
      message: "Validation failed. Please check your input.",
      errors: extractedErrors,
    });
  }

  next();
}
