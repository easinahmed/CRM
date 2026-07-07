import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Deal from '../models/Deal.js';
import { parsePagination, parseSort, parseFilters, buildSearchQuery } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query);
  const filters = parseFilters(req.query, ['stage', 'assignedTo', 'customer']);
  filters.isDeleted = false;

  if (req.query.search) {
    Object.assign(filters, buildSearchQuery(req.query.search, ['title']));
  }

  const [deals, total] = await Promise.all([
    Deal.find(filters).sort(sort).skip(skip).limit(limit)
      .populate('customer', 'firstName lastName company')
      .populate('assignedTo', 'firstName lastName'),
    Deal.countDocuments(filters),
  ]);

  ApiResponse.paginated(res, deals, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const pipeline = asyncHandler(async (req, res) => {
  const deals = await Deal.find({ isDeleted: false })
    .populate('customer', 'firstName lastName company')
    .populate('assignedTo', 'firstName lastName');
  const grouped = deals.reduce((acc, deal) => {
    if (!acc[deal.stage]) acc[deal.stage] = [];
    acc[deal.stage].push(deal);
    return acc;
  }, {});
  ApiResponse.success(res, grouped);
});

export const getById = asyncHandler(async (req, res) => {
  const deal = await Deal.findOne({ _id: req.params.id, isDeleted: false })
    .populate('customer')
    .populate('assignedTo', 'firstName lastName')
    .populate('products.product');
  if (!deal) throw ApiError.notFound('Deal not found');
  ApiResponse.success(res, deal);
});

export const create = asyncHandler(async (req, res) => {
  const deal = await Deal.create({ ...req.body, createdBy: req.user._id });
  ApiResponse.created(res, deal);
});

export const update = asyncHandler(async (req, res) => {
  const deal = await Deal.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  );
  if (!deal) throw ApiError.notFound('Deal not found');
  ApiResponse.success(res, deal, 'Deal updated');
});

export const updateStage = asyncHandler(async (req, res) => {
  const { stage } = req.body;
  const deal = await Deal.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { stage, ...(stage === 'closed_won' || stage === 'closed_lost' ? { actualCloseDate: new Date() } : {}) },
    { new: true }
  );
  if (!deal) throw ApiError.notFound('Deal not found');
  ApiResponse.success(res, deal, 'Deal stage updated');
});

export const remove = asyncHandler(async (req, res) => {
  const deal = await Deal.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
  if (!deal) throw ApiError.notFound('Deal not found');
  ApiResponse.noContent(res);
});
