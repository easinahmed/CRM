import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Purchase from '../models/Purchase.js';
import { parsePagination, parseSort } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query);
  const filters = { isDeleted: false };
  if (req.query.status) filters.status = req.query.status;
  if (req.query.supplier) filters.supplier = req.query.supplier;

  const [purchases, total] = await Promise.all([
    Purchase.find(filters).sort(sort).skip(skip).limit(limit).populate('supplier', 'name company'),
    Purchase.countDocuments(filters),
  ]);
  ApiResponse.paginated(res, purchases, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const getById = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findOne({ _id: req.params.id, isDeleted: false }).populate('supplier').populate('items.product');
  if (!purchase) throw ApiError.notFound('Purchase not found');
  ApiResponse.success(res, purchase);
});

export const create = asyncHandler(async (req, res) => {
  const count = await Purchase.countDocuments();
  const purchaseNumber = `PO-${String(count + 1).padStart(6, '0')}`;
  const purchase = await Purchase.create({ ...req.body, purchaseNumber, createdBy: req.user._id });
  ApiResponse.created(res, purchase);
});

export const update = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  );
  if (!purchase) throw ApiError.notFound('Purchase not found');
  ApiResponse.success(res, purchase, 'Purchase updated');
});
