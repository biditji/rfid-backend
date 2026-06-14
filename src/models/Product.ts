import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Omit<Document, 'model'> {
  // General
  name: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  productTags?: string;
  
  // Data
  model: string;
  sku: string;
  upc?: string;
  ean?: string;
  jan?: string;
  isbn?: string;
  mpn?: string;
  price: number;
  taxClass?: string;
  stock: number; // quantity
  minimumQuantity: number;
  subtractStock: boolean;
  outOfStockStatus?: string;
  dateAvailable?: Date;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  lengthClass?: string;
  weight?: number;
  weightClass?: string;
  status: boolean;
  sortOrder: number;

  // Links
  category: mongoose.Types.ObjectId;

  // Image
  images: string[];

  // SEO
  slug: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    // General
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    metaKeywords: { type: String, trim: true },
    productTags: { type: String, trim: true },

    // Data
    model: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    upc: { type: String, trim: true },
    ean: { type: String, trim: true },
    jan: { type: String, trim: true },
    isbn: { type: String, trim: true },
    mpn: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    taxClass: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    minimumQuantity: { type: Number, default: 1, min: 1 },
    subtractStock: { type: Boolean, default: true },
    outOfStockStatus: { type: String, default: 'Out Of Stock' },
    dateAvailable: { type: Date, default: Date.now },
    dimensions: {
      length: { type: String, default: '' },
      width: { type: String, default: '' },
      height: { type: String, default: '' },
    },
    lengthClass: { type: String, default: 'Centimeter' },
    weight: { type: Number, default: 0, min: 0 },
    weightClass: { type: String, default: 'Kilogram' },
    status: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },

    // Links
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

    // Image
    images: [{ type: String }],

    // SEO
    slug: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
