import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiError from '../utils/ApiError.js';
import { ROLE_PERMISSIONS, ROLES } from '../utils/constants.js';

export const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

export const registerUser = async (userData) => {
  const existing = await User.findOne({ email: userData.email });
  if (existing) {
    throw ApiError.conflict('Email already registered');
  }

  const permissions = ROLE_PERMISSIONS[ROLES.EMPLOYEE] || [];
  const user = await User.create({ ...userData, permissions });
  return user;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account is deactivated. Contact administrator.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = generateTokens(user._id, user.role);
  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save();

  await ActivityLog.create({
    action: 'login',
    resource: 'user',
    resourceId: user._id,
    description: `${user.email} logged in`,
    user: user._id,
  });

  return { user, tokens };
};

export const refreshUserToken = async (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const tokens = generateTokens(user._id, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, tokens };
  } catch (error) {
    if (error.isOperational) throw error;
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
};

export const logoutUser = async (userId) => {
  const user = await User.findById(userId).select('+refreshToken');
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword;
  user.refreshToken = null;
  await user.save();

  return true;
};

export const generatePasswordResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return null;

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  return resetToken;
};
