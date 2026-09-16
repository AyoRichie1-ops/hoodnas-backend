import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Automotive', 'Inverter', 'Solar'],
      required: true,
    },
    type: { type: String, trim: true },
    specs: {
      ah: { type: String, trim: true },
      volt: { type: String, trim: true },
      terminal: { type: String, trim: true },
      dimensions: { type: String, trim: true },
    },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, trim: true },
    description: { type: String, trim: true },
    warrantyMonths: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text', category: 'text' });

export default mongoose.model('Product', productSchema);
