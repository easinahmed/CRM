import mongoose from 'mongoose';
import { PAYMENT_METHODS } from '../utils/constants.js';

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
  category: { type: String, enum: ['sales', 'purchase', 'salary', 'utility', 'rent', 'tax', 'maintenance', 'marketing', 'travel', 'office', 'other'], default: 'other' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: { type: String, enum: PAYMENT_METHODS },
  reference: { type: String, trim: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },
  attachments: [{ type: String }],
  isReconciled: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

transactionSchema.index({ type: 1 });
transactionSchema.index({ date: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ isDeleted: 1 });

export default mongoose.model('Transaction', transactionSchema);
