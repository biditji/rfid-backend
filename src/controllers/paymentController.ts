import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || '';

    // Create signature to verify
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is successful, find order and update it
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

      if (order) {
        order.paymentStatus = 'Paid';
        order.status = 'Processing'; // Move from Pending Payment to Processing
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        await order.save();

        res.json({ message: "Payment verified successfully", orderId: order._id });
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
