import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Product from '../models/Product.js';
import { parsePagination, parseSort, buildSearchQuery } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query);
  const filters = { isDeleted: false };
  if (req.query.category) filters.category = req.query.category;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.search) {
    Object.assign(filters, buildSearchQuery(req.query.search, ['name', 'sku', 'description']));
  }

  const [products, total] = await Promise.all([
    Product.find(filters).sort(sort).skip(skip).limit(limit)
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('warehouse', 'name'),
    Product.countDocuments(filters),
  ]);

  ApiResponse.paginated(res, products, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const getById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false })
    .populate('category brand supplier warehouse');
  if (!product) throw ApiError.notFound('Product not found');
  ApiResponse.success(res, product);
});

export const create = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, createdBy: req.user._id });
  ApiResponse.created(res, product);
});

export const update = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) throw ApiError.notFound('Product not found');
  ApiResponse.success(res, product, 'Product updated');
});

export const remove = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
  if (!product) throw ApiError.notFound('Product not found');
  ApiResponse.noContent(res);
});

export const lowStock = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isDeleted: false,
    status: 'active',
    $expr: { $lte: ['$stock', '$minStock'] },
  }).populate('category', 'name');
  ApiResponse.success(res, products);
});
