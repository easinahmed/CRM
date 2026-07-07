import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Leave from '../models/Leave.js';
import { parsePagination, parseSort } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query);
  const filters = {};
  if (req.query.employee) filters.employee = req.query.employee;
  if (req.query.status) filters.status = req.query.status;

  const [leaves, total] = await Promise.all([
    Leave.find(filters).sort(sort).skip(skip).limit(limit).populate('employee', 'firstName lastName employeeId'),
    Leave.countDocuments(filters),
  ]);
  ApiResponse.paginated(res, leaves, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const create = asyncHandler(async (req, res) => {
  const leave = await Leave.create({ ...req.body, appliedBy: req.user._id });
  ApiResponse.created(res, leave);
});

export const approve = asyncHandler(async (req, res) => {
  const leave = await Leave.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', approvedBy: req.user._id, approvedAt: new Date() },
    { new: true }
  );
  if (!leave) throw ApiError.notFound('Leave not found');
  ApiResponse.success(res, leave, 'Leave approved');
});

export const reject = asyncHandler(async (req, res) => {
  const leave = await Leave.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', approvedBy: req.user._id, approvedAt: new Date(), rejectionReason: req.body.reason },
    { new: true }
  );
  if (!leave) throw ApiError.notFound('Leave not found');
  ApiResponse.success(res, leave, 'Leave rejected');
});
