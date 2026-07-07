import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';
import Employee from '../models/Employee.js';

export const sales = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const match = { isDeleted: false, type: 'sales' };
  if (startDate && endDate) {
    match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  const orders = await Order.find(match)
    .populate('customer', 'firstName lastName email')
    .sort('-createdAt').lean();

  const summary = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((s, o) => s + (o.grandTotal || 0), 0),
    totalPaid: orders.reduce((s, o) => s + (o.paidAmount || 0), 0),
    averageOrderValue: orders.length ? orders.reduce((s, o) => s + (o.grandTotal || 0), 0) / orders.length : 0,
  };

  ApiResponse.success(res, { summary, orders });
});

export const customers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({ isDeleted: false })
    .populate('assignedTo', 'firstName lastName')
    .sort('-createdAt').lean();

  const summary = {
    total: customers.length,
    active: customers.filter((c) => c.status === 'active').length,
    totalSpent: customers.reduce((s, c) => s + (c.totalSpent || 0), 0),
  };

  ApiResponse.success(res, { summary, customers });
});

export const inventory = asyncHandler(async (req, res) => {
  const products = await Product.find({ isDeleted: false })
    .populate('category', 'name')
    .populate('brand', 'name')
    .sort('name').lean();

  const summary = {
    total: products.length,
    active: products.filter((p) => p.status === 'active').length,
    lowStock: products.filter((p) => p.stock <= p.minStock).length,
    totalValue: products.reduce((s, p) => s + (p.stock * p.costPrice || 0), 0),
  };

  ApiResponse.success(res, { summary, products });
});

export const profitLoss = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const dateMatch = {};
  if (startDate && endDate) {
    dateMatch.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const [income, expenses, salesTotal, purchaseTotal] = await Promise.all([
    Transaction.aggregate([
      { $match: { type: 'income', isDeleted: false, ...dateMatch } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { type: 'expense', isDeleted: false, ...dateMatch } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { isDeleted: false, type: 'sales', ...dateMatch } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Order.aggregate([
      { $match: { isDeleted: false, type: 'purchase', ...dateMatch } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
  ]);

  ApiResponse.success(res, {
    income: income[0]?.total || 0,
    expenses: expenses[0]?.total || 0,
    netProfit: (income[0]?.total || 0) - (expenses[0]?.total || 0),
    salesRevenue: salesTotal[0]?.total || 0,
    purchaseCost: purchaseTotal[0]?.total || 0,
    incomeCount: income[0]?.count || 0,
    expenseCount: expenses[0]?.count || 0,
  });
});

export const employees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ isDeleted: false })
    .populate('department', 'name')
    .sort('-createdAt').lean();

  const summary = {
    total: employees.length,
    active: employees.filter((e) => e.status === 'active').length,
    totalPayroll: employees.reduce((s, e) => s + (e.salary || 0), 0),
  };

  ApiResponse.success(res, { summary, employees });
});
