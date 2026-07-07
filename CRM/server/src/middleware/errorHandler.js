import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

const errorHandler = (err, req, res, _next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal server error';
    error = new ApiError(statusCode, message);
  }

  if (error.name === 'CastError') {
    error = ApiError.badRequest('Invalid resource ID');
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    error = ApiError.conflict(`Duplicate value for ${field}. This ${field} already exists.`);
  }

  if (error.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired');
  }

  const response = {
    success: false,
    message: error.message || 'Internal server error',
    ...(error.errors?.length && { errors: error.errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(error.statusCode || 500).json(response);
};

export default errorHandler;
