import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema({
  accountName: { type: String, required: true, trim: true },
  accountNumber: { type: String, required: true, trim: true },
  bankName: { type: String, required: true, trim: true },
  branch: String,
  ifscCode: String,
  swiftCode: String,
  type: { type: String, enum: ['checking', 'savings', 'cash', 'credit'], default: 'checking' },
  currency: { type: String, default: 'USD' },
  balance: { type: Number, default: 0 },
  openingBalance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

export default mongoose.model('BankAccount', bankAccountSchema);
