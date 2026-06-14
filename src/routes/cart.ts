import { Router } from 'express';
import { protect } from '../middleware/auth';
import { 
  getCart, 
  addToCart, 
  removeFromCart, 
  updateCartQuantity 
} from '../controllers/cartController';

const router = Router();

// @route   GET /api/cart
// @desc    Get user's cart
router.get('/', protect, getCart);

// @route   POST /api/cart/add
// @desc    Add item to cart or update quantity
router.post('/add', protect, addToCart);

// @route   POST /api/cart/remove
// @desc    Remove item from cart completely
router.post('/remove', protect, removeFromCart);

// @route   POST /api/cart/update
// @desc    Set specific quantity for an item
router.post('/update', protect, updateCartQuantity);

export default router;
