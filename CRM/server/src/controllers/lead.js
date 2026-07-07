import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Lead from '../models/Lead.js';
import { parsePagination, parseSort, parseFilters, buildSearchQuery } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query);
  const filters = parseFilters(req.query, ['status', 'source', 'assignedTo']);
  filters.isDeleted = false;

  if (req.query.search) {
    Object.assign(filters, buildSearchQuery(req.query.search, ['firstName', 'lastName', 'email', 'company', 'phone']));
  }

  const [leads, total] = await Promise.all([
    Lead.find(filters).sort(sort).skip(skip).limit(limit).populate('assignedTo', 'firstName lastName email'),
    Lead.countDocuments(filters),
  ]);

  ApiResponse.paginated(res, leads, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const getById = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false })
    .populate('assignedTo', 'firstName lastName email')
    .populate('convertedToCustomer');
  if (!lead) throw ApiError.notFound('Lead not found');
  ApiResponse.success(res, lead);
});

export const create = asyncHandler(async (req, res) => {
  const lead = await Lead.create({ ...req.body, createdBy: req.user._id });
  ApiResponse.created(res, lead);
});

export const update = asyncHandler(async (req, res) => {
  const lead = await Lead.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  );
  if (!lead) throw ApiError.notFound('Lead not found');
  ApiResponse.success(res, lead, 'Lead updated');
});

export const remove = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
  if (!lead) throw ApiError.notFound('Lead not found');
  ApiResponse.noContent(res);
});

export const convert = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false });
  if (!lead) throw ApiError.notFound('Lead not found');
  if (lead.status === 'converted') throw ApiError.badRequest('Lead already converted');

  const { default: Customer } = await import('../models/Customer.js');
  const customer = await Customer.create({
    firstName: lead.firstName,
    lastName: lead.lastName || '',
    email: lead.email,
    phone: lead.phone,
    company: lead.company || '',
    source: lead.source,
    createdBy: req.user._id,
    assignedTo: lead.assignedTo,
  });

  lead.status = 'converted';
  lead.convertedToCustomer = customer._id;
  lead.convertedAt = new Date();
  await lead.save();

  ApiResponse.success(res, { lead, customer }, 'Lead converted to customer');
});

export const bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  await Lead.updateMany({ _id: { $in: ids } }, { isDeleted: true, deletedAt: new Date() });
  ApiResponse.noContent(res, `${ids.length} leads deleted`);
});
