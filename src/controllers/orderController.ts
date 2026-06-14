import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import Order from '../models/Order';
import Cart from '../models/Cart';

export const createOrder = async (req: Request | any, res: Response) => {
  try {
    // 1. Get the user's cart
    const cart = await Cart.findOne({ user: req.user?._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    // 2. Calculate total and build order items
    let totalPrice = 0;
    const orderItems: any[] = [];
    
    for (const item of cart.items) {
      if (!item.product) continue;
      const price = (item.product as any).price;
      totalPrice += price * item.quantity;
      orderItems.push({
        product: (item.product as any)._id,
        quantity: item.quantity,
        priceAtPurchase: price,
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'One or more products in your cart are no longer available. Please refresh your cart.' });
    }

    // 3. Create Razorpay order
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    const options = {
      amount: Math.round(totalPrice * 100),  // amount in smallest currency unit (paise for INR)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };
    
    const razorpayOrder = await instance.orders.create(options);

    // 4. Create the Order in DB
    const order = await Order.create({
      user: req.user?._id,
      items: orderItems,
      totalPrice,
      status: 'Pending Payment',
      paymentStatus: 'Pending',
      razorpayOrderId: razorpayOrder.id,
    });

    // 5. Clear the Cart
    cart.items = [];
    await cart.save();

    // Return the created order populated
    await order.populate('items.product');
    res.status(201).json({ order, razorpayOrderId: razorpayOrder.id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getMyOrders = async (req: Request | any, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user?._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getAllOrders = async (req: Request | any, res: Response) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .populate('items.product')
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateOrderStatus = async (req: Request | any, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
