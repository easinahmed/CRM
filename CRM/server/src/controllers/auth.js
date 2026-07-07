import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as authService from '../services/auth.js';
import env from '../config/env.js';

const setTokenCookies = (res, tokens) => {
  const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  };
  res.cookie('accessToken', tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
};

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  ApiResponse.created(res, user, 'Registration successful. Please verify your email.');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.loginUser(email, password);
  setTokenCookies(res, tokens);
  ApiResponse.success(res, { user, tokens }, 'Login successful');
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.cookies;
  if (!token) {
    return ApiResponse.error(res, 'Refresh token not found', 401);
  }
  const { user, tokens } = await authService.refreshUserToken(token);
  setTokenCookies(res, tokens);
  ApiResponse.success(res, { user, tokens }, 'Token refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth' });
  ApiResponse.success(res, null, 'Logged out successfully');
});

export const me = asyncHandler(async (req, res) => {
  ApiResponse.success(res, req.user);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changeUserPassword(req.user._id, currentPassword, newPassword);
  ApiResponse.success(res, null, 'Password changed successfully');
});
