import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
  barcode: { type: String, trim: true },
  description: { type: String },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    set: (value) => value === '' || value === null ? null : value
  },
  brand: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Brand',
    set: (value) => value === '' || value === null ? null : value
  },
  unit: { type: String, default: 'piece' },
  price: { type: Number, required: true, default: 0 },
  costPrice: { type: Number, default: 0 },
  wholesalePrice: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  images: [{ type: String }],
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },
  maxStock: { type: Number, default: 0 },
  warehouse: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Warehouse',
    set: (value) => value === '' || value === null ? null : value
  },
  supplier: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier',
    set: (value) => value === '' || value === null ? null : value
  },
  status: { type: String, enum: ['active', 'inactive', 'discontinued'], default: 'active' },
  isService: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ name: 'text', sku: 'text', description: 'text' });
productSchema.index({ isDeleted: 1 });

export default mongoose.model('Product', productSchema);
