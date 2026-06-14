import { Router } from 'express';
import { protect, admin } from '../middleware/auth';
import { 
  createOrder, 
  getMyOrders, 
  getAllOrders, 
  updateOrderStatus 
} from '../controllers/orderController';

const router = Router();

// @route   POST /api/orders
// @desc    Create new order and clear cart
router.post('/', protect, createOrder);

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
router.get('/myorders', protect, getMyOrders);

// @route   GET /api/orders
// @desc    Get all orders (ADMIN ONLY)
router.get('/', protect, admin, getAllOrders);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (ADMIN ONLY)
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
