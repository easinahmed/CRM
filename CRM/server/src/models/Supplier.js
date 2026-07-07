import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  company: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  mobile: { type: String, trim: true },
  website: { type: String, trim: true },
  taxId: { type: String, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  paymentTerms: { type: String, default: 'net_30' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

supplierSchema.index({ email: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ isDeleted: 1 });

export default mongoose.model('Supplier', supplierSchema);
