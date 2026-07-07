import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Customer from '../models/Customer.js';
import { parsePagination, parseSort, parseFilters, buildSearchQuery } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query);
  const filters = parseFilters(req.query, ['status', 'source']);
  filters.isDeleted = false;

  if (req.query.search) {
    const searchQuery = buildSearchQuery(req.query.search, ['firstName', 'lastName', 'email', 'company', 'phone']);
    Object.assign(filters, searchQuery);
  }

  const [customers, total] = await Promise.all([
    Customer.find(filters).sort(sort).skip(skip).limit(limit).populate('assignedTo', 'firstName lastName email'),
    Customer.countDocuments(filters),
  ]);

  ApiResponse.paginated(res, customers, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const getById = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, isDeleted: false })
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName');
  if (!customer) throw ApiError.notFound('Customer not found');
  ApiResponse.success(res, customer);
});

export const create = asyncHandler(async (req, res) => {
  const customer = await Customer.create({ ...req.body, createdBy: req.user._id });
  ApiResponse.created(res, customer);
});

export const update = asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  );
  if (!customer) throw ApiError.notFound('Customer not found');
  ApiResponse.success(res, customer, 'Customer updated');
});

export const remove = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() }, { new: true });
  if (!customer) throw ApiError.notFound('Customer not found');
  ApiResponse.noContent(res);
});

export const restore = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, { isDeleted: false, deletedAt: null }, { new: true });
  if (!customer) throw ApiError.notFound('Customer not found');
  ApiResponse.success(res, customer, 'Customer restored');
});

export const destroy = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) throw ApiError.notFound('Customer not found');
  ApiResponse.noContent(res, 'Customer permanently deleted');
});

export const bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  await Customer.updateMany({ _id: { $in: ids } }, { isDeleted: true, deletedAt: new Date() });
  ApiResponse.noContent(res, `${ids.length} customers deleted`);
});
