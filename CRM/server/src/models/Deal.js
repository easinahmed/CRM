import mongoose from 'mongoose';
import { DEAL_STAGES } from '../utils/constants.js';

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  value: { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'USD' },
  stage: { type: String, enum: DEAL_STAGES, default: 'lead' },
  probability: { type: Number, default: 10, min: 0, max: 100 },
  expectedCloseDate: Date,
  actualCloseDate: Date,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  notes: String,
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number,
  }],
  tags: [{ type: String }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

dealSchema.index({ stage: 1 });
dealSchema.index({ assignedTo: 1 });
dealSchema.index({ customer: 1 });
dealSchema.index({ isDeleted: 1 });

export default mongoose.model('Deal', dealSchema);
