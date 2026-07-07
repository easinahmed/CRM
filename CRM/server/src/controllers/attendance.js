import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Attendance from '../models/Attendance.js';
import { parsePagination, parseSort } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query, '-date');
  const filters = {};
  if (req.query.employee) filters.employee = req.query.employee;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.startDate && req.query.endDate) {
    filters.date = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
  }

  const [records, total] = await Promise.all([
    Attendance.find(filters).sort(sort).skip(skip).limit(limit).populate('employee', 'firstName lastName employeeId'),
    Attendance.countDocuments(filters),
  ]);

  ApiResponse.paginated(res, records, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const checkIn = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existing = await Attendance.findOne({ employee: req.body.employee, date: today });
  if (existing) throw ApiError.badRequest('Already checked in today');

  const record = await Attendance.create({
    employee: req.body.employee,
    date: today,
    checkIn: new Date(),
    status: 'present',
    markedBy: req.user._id,
  });
  ApiResponse.created(res, record);
});

export const checkOut = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const record = await Attendance.findOne({ employee: req.params.employeeId, date: today });
  if (!record) throw ApiError.notFound('No check-in record found');
  if (record.checkOut) throw ApiError.badRequest('Already checked out');

  record.checkOut = new Date();
  const hours = (record.checkOut - record.checkIn) / (1000 * 60 * 60);
  record.workingHours = Math.round(hours * 100) / 100;
  await record.save();

  ApiResponse.success(res, record, 'Check-out recorded');
});
