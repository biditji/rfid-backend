import { Request, Response } from 'express';
import Product from '../models/Product';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { name, model, status } = req.query;
    const filter: any = {};

    if (name) filter.name = { $regex: name as string, $options: 'i' };
    if (model) filter.model = { $regex: model as string, $options: 'i' };
    if (status !== undefined && status !== '') filter.status = status === 'true' || status === '1';

    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort({ sortOrder: 1, name: 1 });
      
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { 
      name, description, metaTitle, metaDescription, metaKeywords, productTags,
      model, sku, upc, ean, jan, isbn, mpn, price, taxClass, stock, minimumQuantity, subtractStock, outOfStockStatus, dateAvailable, dimensions, lengthClass, weight, weightClass, status, sortOrder,
      category, images, slug 
    } = req.body;

    if (!name || !description || !model || !sku || !category || price === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields (Name, Description, Model, SKU, Category, Price)' });
    }

    // Check for duplicate SKU
    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return res.status(400).json({ message: 'A product with this SKU already exists' });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check for duplicate slug
    const existingSlug = await Product.findOne({ slug: generatedSlug });
    if (existingSlug) {
      return res.status(400).json({ message: 'A product with this URL slug already exists' });
    }

    const newProduct = new Product({
      name, description, metaTitle, metaDescription, metaKeywords, productTags,
      model, sku, upc, ean, jan, isbn, mpn, price, taxClass, stock, minimumQuantity, subtractStock, outOfStockStatus, dateAvailable, dimensions, lengthClass, weight, weightClass, status, sortOrder,
      category, images: images || [], slug: generatedSlug
    });

    const savedProduct = await newProduct.save();
    const populated = await savedProduct.populate('category', 'name');
    
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { 
      name, description, metaTitle, metaDescription, metaKeywords, productTags,
      model, sku, upc, ean, jan, isbn, mpn, price, taxClass, stock, minimumQuantity, subtractStock, outOfStockStatus, dateAvailable, dimensions, lengthClass, weight, weightClass, status, sortOrder,
      category, images, slug 
    } = req.body;

    // Check for duplicate SKU
    if (sku && sku !== product.sku) {
      const existingSku = await Product.findOne({ sku, _id: { $ne: req.params.id } });
      if (existingSku) {
        return res.status(400).json({ message: 'A product with this SKU already exists' });
      }
    }

    // Check for duplicate slug
    if (slug && slug !== product.slug) {
      const existingSlug = await Product.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingSlug) {
        return res.status(400).json({ message: 'A product with this URL slug already exists' });
      }
    }

    product.name = name || product.name;
    product.description = description !== undefined ? description : product.description;
    product.metaTitle = metaTitle !== undefined ? metaTitle : product.metaTitle;
    product.metaDescription = metaDescription !== undefined ? metaDescription : product.metaDescription;
    product.metaKeywords = metaKeywords !== undefined ? metaKeywords : product.metaKeywords;
    product.productTags = productTags !== undefined ? productTags : product.productTags;
    
    product.model = model || product.model;
    product.sku = sku || product.sku;
    product.upc = upc !== undefined ? upc : product.upc;
    product.ean = ean !== undefined ? ean : product.ean;
    product.jan = jan !== undefined ? jan : product.jan;
    product.isbn = isbn !== undefined ? isbn : product.isbn;
    product.mpn = mpn !== undefined ? mpn : product.mpn;
    product.price = price !== undefined ? price : product.price;
    product.taxClass = taxClass !== undefined ? taxClass : product.taxClass;
    product.stock = stock !== undefined ? stock : product.stock;
    product.minimumQuantity = minimumQuantity !== undefined ? minimumQuantity : product.minimumQuantity;
    product.subtractStock = subtractStock !== undefined ? subtractStock : product.subtractStock;
    product.outOfStockStatus = outOfStockStatus !== undefined ? outOfStockStatus : product.outOfStockStatus;
    product.dateAvailable = dateAvailable !== undefined ? dateAvailable : product.dateAvailable;
    
    if (dimensions) {
      product.dimensions = {
        length: dimensions.length !== undefined ? dimensions.length : product.dimensions?.length || '',
        width: dimensions.width !== undefined ? dimensions.width : product.dimensions?.width || '',
        height: dimensions.height !== undefined ? dimensions.height : product.dimensions?.height || ''
      };
    }
    
    product.lengthClass = lengthClass !== undefined ? lengthClass : product.lengthClass;
    product.weight = weight !== undefined ? weight : product.weight;
    product.weightClass = weightClass !== undefined ? weightClass : product.weightClass;
    product.status = status !== undefined ? status : product.status;
    product.sortOrder = sortOrder !== undefined ? sortOrder : product.sortOrder;

    product.category = category || product.category;
    product.images = images !== undefined ? images : product.images;
    product.slug = slug || product.slug;

    const updatedProduct = await product.save();
    const populated = await updatedProduct.populate('category', 'name');
    
    res.json(populated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const bulkDeleteProducts = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No product IDs provided' });
    }

    await Product.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} product(s) deleted successfully` });
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
