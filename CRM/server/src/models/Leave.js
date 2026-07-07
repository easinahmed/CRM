import mongoose from 'mongoose';
import { LEAVE_STATUS } from '../utils/constants.js';

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType: { type: String, enum: ['sick', 'casual', 'annual', 'maternity', 'paternity', 'unpaid', 'other'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: LEAVE_STATUS, default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectionReason: String,
  appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

leaveSchema.index({ employee: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model('Leave', leaveSchema);
