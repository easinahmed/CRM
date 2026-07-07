import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';
import { ROLE_PERMISSIONS, ROLES } from '../utils/constants.js';
import { parsePagination, parseSort } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query);
  const filters = {};
  if (req.query.role) filters.role = req.query.role;

  const [users, total] = await Promise.all([
    User.find(filters).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filters),
  ]);

  ApiResponse.paginated(res, users, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive, permissions, ...rest } = req.body;
  const update = { ...rest };
  if (role) {
    update.role = role;
    update.permissions = ROLE_PERMISSIONS[role] || [];
  }
  if (isActive !== undefined) update.isActive = isActive;
  if (permissions) update.permissions = permissions;

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.success(res, user, 'User updated');
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['firstName', 'lastName', 'phone', 'avatar'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f]) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  ApiResponse.success(res, user, 'Profile updated');
});
