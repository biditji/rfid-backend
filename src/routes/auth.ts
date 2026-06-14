import { Router } from 'express';
import { protect } from '../middleware/auth';
import { registerUser, loginUser, getMe } from '../controllers/authController';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate a user
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Get user data
router.get('/me', protect, getMe);

export default router;
