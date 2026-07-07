import mongoose from 'mongoose';

const companySettingsSchema = new mongoose.Schema({
  companyName: { type: String, required: true, default: 'My Company' },
  logo: String,
  favicon: String,
  email: String,
  phone: String,
  website: String,
  address: {
    street: String, city: String, state: String, zip: String, country: String,
  },
  taxId: String,
  registrationNumber: String,
  currency: { type: String, default: 'USD' },
  currencySymbol: { type: String, default: '$' },
  timezone: { type: String, default: 'UTC' },
  dateFormat: { type: String, default: 'MM/DD/YYYY' },
  fiscalYearStart: { type: String, default: '01-01' },
  taxRate: { type: Number, default: 0 },
  taxName: { type: String, default: 'VAT' },
  invoicePrefix: { type: String, default: 'INV-' },
  orderPrefix: { type: String, default: 'ORD-' },
  purchasePrefix: { type: String, default: 'PO-' },
  defaultLanguage: { type: String, default: 'en' },
  theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
  primaryColor: { type: String, default: '#6366f1' },
  logoUrl: String,
}, { timestamps: true });

export default mongoose.model('CompanySettings', companySettingsSchema);
