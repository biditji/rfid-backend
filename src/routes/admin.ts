import { Router } from 'express';
import { protect, admin } from '../middleware/auth';
import { 
  getDashboardStats, 
  getUsers, 
  updateUserRole 
} from '../controllers/adminController';

const router = Router();

// Apply middleware to all routes in this file
router.use(protect, admin);

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// @route   GET /api/admin/users
// @desc    Get all users (customers)
router.get('/users', getUsers);

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
router.put('/users/:id/role', updateUserRole);

export default router;
