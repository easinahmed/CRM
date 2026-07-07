import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  website: { type: String, trim: true },
  source: { type: String, enum: ['referral', 'website', 'social_media', 'ad', 'walk_in', 'other'], default: 'other' },
  status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
  notes: { type: String },
  tags: [{ type: String }],
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  socialMedia: {
    linkedin: String,
    facebook: String,
    twitter: String,
  },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastPurchase: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ isDeleted: 1 });
customerSchema.index({ firstName: 'text', lastName: 'text', email: 'text', company: 'text' });

customerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

export default mongoose.model('Customer', customerSchema);
