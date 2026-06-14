import { Router } from 'express';
import { protect, admin } from '../middleware/auth';
import { 
  getCategories, 
  getCategoryById, 
  getSubcategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  bulkDeleteCategories 
} from '../controllers/categoryController';

const router = Router();

// @route   GET /api/categories
// @desc    Get all categories (with optional filtering)
router.get('/', getCategories);

// @route   GET /api/categories/:id
// @desc    Get a single category by ID (includes its subcategories)
router.get('/:id', getCategoryById);

// @route   GET /api/categories/:id/subcategories
// @desc    Get all subcategories of a parent category
router.get('/:id/subcategories', getSubcategories);

// @route   POST /api/categories
// @desc    Create a category or subcategory (Admin Only)
router.post('/', protect, admin, createCategory);

// @route   PUT /api/categories/:id
// @desc    Update a category (Admin Only)
router.put('/:id', protect, admin, updateCategory);

// @route   DELETE /api/categories
// @desc    Bulk delete categories (Admin Only)
router.delete('/', protect, admin, bulkDeleteCategories);

// @route   DELETE /api/categories/:id
// @desc    Delete a category (Admin Only)
router.delete('/:id', protect, admin, deleteCategory);

export default router;
