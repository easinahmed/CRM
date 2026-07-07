import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Employee from '../models/Employee.js';
import { parsePagination, parseSort, buildSearchQuery } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query);
  const filters = { isDeleted: false };
  if (req.query.department) filters.department = req.query.department;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.search) {
    Object.assign(filters, buildSearchQuery(req.query.search, ['firstName', 'lastName', 'email', 'employeeId']));
  }

  const [employees, total] = await Promise.all([
    Employee.find(filters).sort(sort).skip(skip).limit(limit),
    Employee.countDocuments(filters),
  ]);

  ApiResponse.paginated(res, employees, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const getById = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false })
    .populate('user', 'email role isActive');
  if (!employee) throw ApiError.notFound('Employee not found');
  ApiResponse.success(res, employee);
});

export const create = asyncHandler(async (req, res) => {
  const count = await Employee.countDocuments();
  const employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
  const employee = await Employee.create({ ...req.body, employeeId, createdBy: req.user._id });
  ApiResponse.created(res, employee);
});

export const update = asyncHandler(async (req, res) => {
  const employee = await Employee.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  );
  if (!employee) throw ApiError.notFound('Employee not found');
  ApiResponse.success(res, employee, 'Employee updated');
});

export const remove = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
  if (!employee) throw ApiError.notFound('Employee not found');
  ApiResponse.noContent(res);
});
