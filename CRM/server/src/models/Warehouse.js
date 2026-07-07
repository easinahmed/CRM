import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  address: {
    street: String, city: String, state: String, zip: String, country: String,
  },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  phone: String,
  email: String,
  capacity: Number,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

export default mongoose.model('Warehouse', warehouseSchema);
