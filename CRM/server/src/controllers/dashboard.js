import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Customer from '../models/Customer.js';
import Lead from '../models/Lead.js';
import Deal from '../models/Deal.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Employee from '../models/Employee.js';
import Transaction from '../models/Transaction.js';
import ActivityLog from '../models/ActivityLog.js';

export const stats = asyncHandler(async (req, res) => {
  const [
    totalCustomers, totalLeads, totalDeals, totalOrders,
    totalProducts, totalEmployees, totalRevenue, totalExpenses,
    recentLeads, recentActivities, dealsByStage,
  ] = await Promise.all([
    Customer.countDocuments({ isDeleted: false }),
    Lead.countDocuments({ isDeleted: false, status: { $ne: 'converted' } }),
    Deal.countDocuments({ isDeleted: false, stage: { $nin: ['closed_lost'] } }),
    Order.countDocuments({ isDeleted: false }),
    Product.countDocuments({ isDeleted: false, status: 'active' }),
    Employee.countDocuments({ isDeleted: false, status: 'active' }),
    Transaction.aggregate([
      { $match: { type: 'income', isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { type: 'expense', isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Lead.find({ isDeleted: false, status: { $ne: 'converted' } }).sort('-createdAt').limit(5).populate('assignedTo', 'firstName lastName'),
    ActivityLog.find().sort('-createdAt').limit(10).populate('user', 'firstName lastName'),
    Deal.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$stage', count: { $sum: 1 }, value: { $sum: '$value' } } },
    ]),
  ]);

  const dealsValue = await Deal.aggregate([
    { $match: { isDeleted: false, stage: { $nin: ['closed_lost', 'lead'] } } },
    { $group: { _id: null, total: { $sum: '$value' } } },
  ]);

  ApiResponse.success(res, {
    kpis: {
      totalCustomers, totalLeads, totalDeals, totalOrders,
      totalProducts, totalEmployees,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      netProfit: (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0),
      pipelineValue: dealsValue[0]?.total || 0,
    },
    recentLeads,
    recentActivities,
    dealsByStage,
  });
});

export const revenueChart = asyncHandler(async (req, res) => {
  const months = 12;
  const data = await Transaction.aggregate([
    {
      $match: {
        type: 'income',
        isDeleted: false,
        date: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  ApiResponse.success(res, data);
});
