import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Invoice from '../models/Invoice.js';
import { parsePagination, parseSort } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query);
  const filters = { isDeleted: false };
  if (req.query.status) filters.status = req.query.status;
  if (req.query.customer) filters.customer = req.query.customer;

  const [invoices, total] = await Promise.all([
    Invoice.find(filters).sort(sort).skip(skip).limit(limit).populate('customer', 'firstName lastName company'),
    Invoice.countDocuments(filters),
  ]);
  ApiResponse.paginated(res, invoices, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const getById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, isDeleted: false }).populate('customer');
  if (!invoice) throw ApiError.notFound('Invoice not found');
  ApiResponse.success(res, invoice);
});

export const create = asyncHandler(async (req, res) => {
  const count = await Invoice.countDocuments();
  const invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
  const invoice = await Invoice.create({ ...req.body, invoiceNumber, createdBy: req.user._id });
  ApiResponse.created(res, invoice);
});

export const update = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  );
  if (!invoice) throw ApiError.notFound('Invoice not found');
  ApiResponse.success(res, invoice, 'Invoice updated');
});
