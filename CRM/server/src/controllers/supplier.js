import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Supplier from '../models/Supplier.js';
import { parsePagination, parseSort } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query);
  const filters = { isDeleted: false };
  if (req.query.status) filters.status = req.query.status;

  const [suppliers, total] = await Promise.all([
    Supplier.find(filters).sort(sort).skip(skip).limit(limit),
    Supplier.countDocuments(filters),
  ]);
  ApiResponse.paginated(res, suppliers, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const getById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ _id: req.params.id, isDeleted: false });
  if (!supplier) return ApiResponse.error(res, 'Supplier not found', 404);
  ApiResponse.success(res, supplier);
});

export const create = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create({ ...req.body, createdBy: req.user._id });
  ApiResponse.created(res, supplier);
});

export const update = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, req.body, { new: true });
  if (!supplier) return ApiResponse.error(res, 'Supplier not found', 404);
  ApiResponse.success(res, supplier, 'Supplier updated');
});

export const remove = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
  if (!supplier) return ApiResponse.error(res, 'Supplier not found', 404);
  ApiResponse.noContent(res);
});
