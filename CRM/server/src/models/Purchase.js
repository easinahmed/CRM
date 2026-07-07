import mongoose from 'mongoose';
import { ORDER_STATUSES, PAYMENT_METHODS } from '../utils/constants.js';

const purchaseItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  sku: String,
  quantity: { type: Number, required: true, min: 1 },
  costPrice: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const purchaseSchema = new mongoose.Schema({
  purchaseNumber: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  orderDate: { type: Date, default: Date.now },
  expectedDate: Date,
  status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
  items: [purchaseItemSchema],
  subtotal: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  discountTotal: { type: Number, default: 0 },
  shippingTotal: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: PAYMENT_METHODS },
  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  notes: String,
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

purchaseSchema.index({ purchaseNumber: 1 });
purchaseSchema.index({ supplier: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ isDeleted: 1 });

export default mongoose.model('Purchase', purchaseSchema);
