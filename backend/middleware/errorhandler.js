import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger.js';

const errorHandlerMiddleware = (err, req, res, next) => {
  // Log the full error stack or message using Winston
  logger.error(err.stack || err.message);

  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: 'Something went wrong, please try again later',
  };

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(err.keyValue).join(', ')}`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handle Mongoose Cast Error (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    customError.msg = `No item found with id: ${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  // Use custom error message if explicitly set
  if (err.statusCode && err.message) {
    customError.statusCode = err.statusCode;
    customError.msg = err.message;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

export default errorHandlerMiddleware;
