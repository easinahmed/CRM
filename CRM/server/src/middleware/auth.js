import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from './asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User not found or deactivated');
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.isOperational) throw error;
    throw ApiError.unauthorized('Invalid or expired token');
  }
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
    }
  } catch {
    // no auth needed
  }
  next();
});
