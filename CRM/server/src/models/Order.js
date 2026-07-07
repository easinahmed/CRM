import mongoose from 'mongoose';
import { ORDER_STATUSES, PAYMENT_METHODS } from '../utils/constants.js';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  sku: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  costPrice: Number,
  tax: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['sales', 'purchase', 'return'], default: 'sales' },
  status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  taxTotal: { type: Number, default: 0 },
  discountTotal: { type: Number, default: 0 },
  shippingTotal: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true, default: 0 },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: PAYMENT_METHODS },
  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid', 'refunded'], default: 'pending' },
  notes: String,
  billingAddress: {
    street: String, city: String, state: String, zip: String, country: String,
  },
  shippingAddress: {
    street: String, city: String, state: String, zip: String, country: String,
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ isDeleted: 1 });

export default mongoose.model('Order', orderSchema);
