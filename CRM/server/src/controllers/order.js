import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Order from '../models/Order.js';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query);
  const filters = parseFilters(req.query, ['status', 'customer', 'paymentStatus', 'type']);
  filters.isDeleted = false;

  const [orders, total] = await Promise.all([
    Order.find(filters).sort(sort).skip(skip).limit(limit)
      .populate('customer', 'firstName lastName company')
      .populate('createdBy', 'firstName lastName'),
    Order.countDocuments(filters),
  ]);

  ApiResponse.paginated(res, orders, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const getById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, isDeleted: false })
    .populate('customer')
    .populate('items.product')
    .populate('createdBy', 'firstName lastName');
  if (!order) throw ApiError.notFound('Order not found');
  ApiResponse.success(res, order);
});

export const create = asyncHandler(async (req, res) => {
  const count = await Order.countDocuments();
  const orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
  const order = await Order.create({ ...req.body, orderNumber, createdBy: req.user._id });
  ApiResponse.created(res, order);
});

export const update = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  );
  if (!order) throw ApiError.notFound('Order not found');
  ApiResponse.success(res, order, 'Order updated');
});

export const remove = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
  if (!order) throw ApiError.notFound('Order not found');
  ApiResponse.noContent(res);
});
