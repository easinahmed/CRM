import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  description: String,
  metadata: { type: mongoose.Schema.Types.Mixed },
  ip: String,
  userAgent: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

activityLogSchema.index({ user: 1 });
activityLogSchema.index({ resource: 1, resourceId: 1 });
activityLogSchema.index({ createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
