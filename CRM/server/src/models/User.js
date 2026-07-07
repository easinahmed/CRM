import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 50 },
  lastName: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  phone: { type: String, trim: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.EMPLOYEE },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  refreshToken: { type: String, select: false },
  lastLogin: Date,
  passwordChangedAt: Date,
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model('User', userSchema);
