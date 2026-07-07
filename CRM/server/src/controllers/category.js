import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Category from '../models/Category.js';

export const list = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isDeleted: false }).populate('parent', 'name').sort('sortOrder');
  ApiResponse.success(res, categories);
});

export const getById = asyncHandler(async (req, res) => {
  const cat = await Category.findOne({ _id: req.params.id, isDeleted: false });
  if (!cat) return ApiResponse.error(res, 'Category not found', 404);
  ApiResponse.success(res, cat);
});

export const create = asyncHandler(async (req, res) => {
  const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const cat = await Category.create({ ...req.body, slug, createdBy: req.user._id });
  ApiResponse.created(res, cat);
});

export const update = asyncHandler(async (req, res) => {
  const cat = await Category.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, req.body, { new: true });
  if (!cat) return ApiResponse.error(res, 'Category not found', 404);
  ApiResponse.success(res, cat, 'Category updated');
});

export const remove = asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
  if (!cat) return ApiResponse.error(res, 'Category not found', 404);
  ApiResponse.noContent(res);
});
