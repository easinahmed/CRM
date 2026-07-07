import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Brand from '../models/Brand.js';

export const list = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isDeleted: false });
  ApiResponse.success(res, brands);
});

export const getById = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ _id: req.params.id, isDeleted: false });
  if (!brand) return ApiResponse.error(res, 'Brand not found', 404);
  ApiResponse.success(res, brand);
});

export const create = asyncHandler(async (req, res) => {
  const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const brand = await Brand.create({ ...req.body, slug, createdBy: req.user._id });
  ApiResponse.created(res, brand);
});

export const update = asyncHandler(async (req, res) => {
  const brand = await Brand.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, req.body, { new: true });
  if (!brand) return ApiResponse.error(res, 'Brand not found', 404);
  ApiResponse.success(res, brand, 'Brand updated');
});

export const remove = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
  if (!brand) return ApiResponse.error(res, 'Brand not found', 404);
  ApiResponse.noContent(res);
});
