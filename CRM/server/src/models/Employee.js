import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employeeId: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  emergencyContact: { name: String, phone: String, relation: String },
  department: { type: String, trim: true },
  designation: { type: String, trim: true },
  employmentType: { type: String, enum: ['full_time', 'part_time', 'contract', 'intern'], default: 'full_time' },
  joiningDate: Date,
  exitDate: Date,
  salary: { type: Number, default: 0 },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
  },
  address: {
    street: String, city: String, state: String, zip: String, country: String,
  },
  documents: [{ name: String, url: String }],
  status: { type: String, enum: ['active', 'inactive', 'terminated', 'resigned'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ isDeleted: 1 });

employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Employee', employeeSchema);
