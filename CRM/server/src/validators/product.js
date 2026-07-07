import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Supplier from '../models/Supplier.js';
import Warehouse from '../models/Warehouse.js';

// Helper to convert string to ObjectId or lookup by slug/name
const resolveReferenceField = async (value, model, fieldName) => {
  if (!value) return null;
  
  // If already a valid ObjectId, verify it exists
  if (mongoose.Types.ObjectId.isValid(value)) {
    const doc = await model.findById(value);
    if (!doc) {
      throw new Error(`${fieldName} with ID "${value}" not found`);
    }
    return new mongoose.Types.ObjectId(value);
  }
  
  // Try to find by slug (for categories) or name
  const doc = await model.findOne({ 
    $or: [
      { slug: value.toLowerCase() }, 
      { name: { $regex: value, $options: 'i' } }
    ] 
  });
  if (!doc) {
    throw new Error(`${fieldName} "${value}" not found. Please use a valid ID, slug, or name.`);
  }
  return doc._id;
};

export const validateCreateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .custom(async (value) => {
      if (!value) return true;
      await resolveReferenceField(value, Category, 'Category');
    }),
  body('brand')
    .optional()
    .custom(async (value) => {
      if (!value) return true;
      await resolveReferenceField(value, Brand, 'Brand');
    }),
  body('supplier')
    .optional()
    .custom(async (value) => {
      if (!value) return true;
      await resolveReferenceField(value, Supplier, 'Supplier');
    }),
  body('warehouse')
    .optional()
    .custom(async (value) => {
      if (!value) return true;
      await resolveReferenceField(value, Warehouse, 'Warehouse');
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest(errors.array().map(e => e.msg).join(', '));
    }
    next();
  },
];

export const validateUpdateProduct = [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('sku').optional().trim().notEmpty().withMessage('SKU cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .custom(async (value) => {
      if (!value) return true;
      await resolveReferenceField(value, Category, 'Category');
    }),
  body('brand')
    .optional()
    .custom(async (value) => {
      if (!value) return true;
      await resolveReferenceField(value, Brand, 'Brand');
    }),
  body('supplier')
    .optional()
    .custom(async (value) => {
      if (!value) return true;
      await resolveReferenceField(value, Supplier, 'Supplier');
    }),
  body('warehouse')
    .optional()
    .custom(async (value) => {
      if (!value) return true;
      await resolveReferenceField(value, Warehouse, 'Warehouse');
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest(errors.array().map(e => e.msg).join(', '));
    }
    next();
  },
];

// Middleware to convert reference fields to ObjectIds
export const convertReferenceFields = async (req, res, next) => {
  try {
    // Convert empty strings to undefined/null for optional fields
    if (req.body.category === '' || req.body.category === null) {
      req.body.category = undefined;
    }
    if (req.body.brand === '' || req.body.brand === null) {
      req.body.brand = undefined;
    }
    if (req.body.supplier === '' || req.body.supplier === null) {
      req.body.supplier = undefined;
    }
    if (req.body.warehouse === '' || req.body.warehouse === null) {
      req.body.warehouse = undefined;
    }

    // Resolve reference fields only if they have values
    if (req.body.category) {
      req.body.category = await resolveReferenceField(req.body.category, Category, 'Category');
    }
    if (req.body.brand) {
      req.body.brand = await resolveReferenceField(req.body.brand, Brand, 'Brand');
    }
    if (req.body.supplier) {
      req.body.supplier = await resolveReferenceField(req.body.supplier, Supplier, 'Supplier');
    }
    if (req.body.warehouse) {
      req.body.warehouse = await resolveReferenceField(req.body.warehouse, Warehouse, 'Warehouse');
    }
    next();
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
};
