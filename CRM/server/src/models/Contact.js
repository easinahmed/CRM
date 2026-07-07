import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  mobile: { type: String, trim: true },
  designation: { type: String, trim: true },
  department: { type: String, trim: true },
  isPrimary: { type: Boolean, default: false },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

contactSchema.index({ customer: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ isDeleted: 1 });

contactSchema.virtual('fullName').get(function () {
  return `${this.firstName}${this.lastName ? ' ' + this.lastName : ''}`;
});

contactSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Contact', contactSchema);
