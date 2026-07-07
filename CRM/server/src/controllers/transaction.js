import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Transaction from '../models/Transaction.js';
import BankAccount from '../models/BankAccount.js';
import { parsePagination, parseSort } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query, '-date');
  const filters = { isDeleted: false };
  if (req.query.type) filters.type = req.query.type;
  if (req.query.category) filters.category = req.query.category;
  if (req.query.startDate && req.query.endDate) {
    filters.date = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filters).sort(sort).skip(skip).limit(limit).populate('customer', 'firstName lastName').populate('bankAccount', 'accountName'),
    Transaction.countDocuments(filters),
  ]);
  ApiResponse.paginated(res, transactions, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const create = asyncHandler(async (req, res) => {
  const transaction = await Transaction.create({ ...req.body, createdBy: req.user._id });
  if (req.body.bankAccount) {
    const account = await BankAccount.findById(req.body.bankAccount);
    if (account) {
      account.balance += req.body.type === 'income' ? req.body.amount : -req.body.amount;
      await account.save();
    }
  }
  ApiResponse.created(res, transaction);
});

export const summary = asyncHandler(async (req, res) => {
  const [income, expense] = await Promise.all([
    Transaction.aggregate([
      { $match: { type: 'income', isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { type: 'expense', isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);
  ApiResponse.success(res, {
    income: income[0]?.total || 0,
    expense: expense[0]?.total || 0,
    net: (income[0]?.total || 0) - (expense[0]?.total || 0),
  });
});
