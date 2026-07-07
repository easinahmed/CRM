import mongoose from 'mongoose';
import { LEAD_STATUSES } from '../utils/constants.js';

const leadSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  designation: { type: String, trim: true },
  source: { type: String, enum: ['website', 'referral', 'social_media', 'call', 'email', 'event', 'other'], default: 'website' },
  status: { type: String, enum: LEAD_STATUSES, default: 'new' },
  score: { type: Number, default: 0, min: 0, max: 100 },
  budget: { type: Number, default: 0 },
  notes: [{ text: String, addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, addedAt: { type: Date, default: Date.now } }],
  convertedToCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  convertedAt: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ isDeleted: 1 });

leadSchema.virtual('fullName').get(function () {
  return `${this.firstName}${this.lastName ? ' ' + this.lastName : ''}`;
});

leadSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Lead', leadSchema);
