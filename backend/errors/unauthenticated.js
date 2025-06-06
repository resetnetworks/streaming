import CustomAPIError from "./custom-api.js";

class UnauthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.name = "UnauthenticatedError";
    this.statusCode = 401;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default UnauthenticatedError;