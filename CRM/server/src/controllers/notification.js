import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Notification from '../models/Notification.js';

export const list = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
  const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
  ApiResponse.success(res, { notifications, unread });
});

export const markRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
  ApiResponse.success(res, null, 'Marked as read');
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  ApiResponse.success(res, null, 'All notifications marked as read');
});
