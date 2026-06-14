import { Router } from 'express';
import productRoutes from './products';
import categoryRoutes from './categories';
import authRoutes from './auth';
import uploadRoutes from './upload';
import cartRoutes from './cart';
import orderRoutes from './order';
import adminRoutes from './admin';
import paymentRoutes from './payment';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RFID E-Commerce Backend is running' });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/upload', uploadRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/payment', paymentRoutes);

export default router;
