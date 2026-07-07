import mongoose from 'mongoose';
import { PAYMENT_METHODS } from '../utils/constants.js';

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  rate: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  amount: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  type: { type: String, enum: ['sales', 'purchase', 'expense'], default: 'sales' },
  status: { type: String, enum: ['draft', 'sent', 'overdue', 'paid', 'cancelled', 'refunded'], default: 'draft' },
  items: [invoiceItemSchema],
  subtotal: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  discountTotal: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: PAYMENT_METHODS },
  dueDate: Date,
  issueDate: { type: Date, default: Date.now },
  notes: String,
  terms: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ customer: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ isDeleted: 1 });

export default mongoose.model('Invoice', invoiceSchema);
