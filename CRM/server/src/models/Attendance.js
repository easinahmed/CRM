import mongoose from 'mongoose';
import { ATTENDANCE_STATUS } from '../utils/constants.js';

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  checkIn: Date,
  checkOut: Date,
  status: { type: String, enum: ATTENDANCE_STATUS, default: 'present' },
  workingHours: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  notes: String,
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
