import { Router } from 'express';
import { protect } from '../middleware/auth';
import { verifyPayment } from '../controllers/paymentController';

const router = Router();

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment signature
router.post('/verify', protect, verifyPayment);

export default router;
