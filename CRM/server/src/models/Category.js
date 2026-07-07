import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  image: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  sortOrder: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });

export default mongoose.model('Category', categorySchema);
