import { Router } from 'express';
import { protect, admin } from '../middleware/auth';
import { 
  getProducts, 
  getProductBySlug, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  bulkDeleteProducts 
} from '../controllers/productController';

const router = Router();

// @route   GET /api/products
// @desc    Get all products (with optional filtering)
router.get('/', getProducts);

// @route   GET /api/products/slug/:slug
// @desc    Get single product by slug
router.get('/slug/:slug', getProductBySlug);

// @route   GET /api/products/:id
// @desc    Get single product by ID
router.get('/:id', getProductById);

// @route   POST /api/products
// @desc    Create a new product (Admin Only)
router.post('/', protect, admin, createProduct);

// @route   PUT /api/products/:id
// @desc    Update a product (Admin Only)
router.put('/:id', protect, admin, updateProduct);

// @route   DELETE /api/products
// @desc    Bulk delete products (Admin Only)
router.delete('/', protect, admin, bulkDeleteProducts);

// @route   DELETE /api/products/:id
// @desc    Delete a product (Admin Only)
router.delete('/:id', protect, admin, deleteProduct);

export default router;
