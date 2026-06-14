import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Get total revenue (sum of all order totals)
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    // 2. Get active customers (count of users with role 'customer')
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // 3. Get low stock items (products with stock < 10)
    const lowStockItems = await Product.countDocuments({ stock: { $lt: 10 } });

    // 4. Get recent orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalRevenue,
      totalSales: orders.length,
      totalCustomers,
      lowStockItems,
      recentOrders,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    // Fetch all users, exclude passwords
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
      
    // Calculate total spent for each user
    const usersWithSpent = await Promise.all(
      users.map(async (user) => {
        const userOrders = await Order.find({ user: user._id });
        const totalSpent = userOrders.reduce((acc, order) => acc + order.totalPrice, 0);
        return {
          ...user.toObject(),
          totalSpent,
          ordersCount: userOrders.length,
        };
      })
    );

    res.json(usersWithSpent);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (role !== 'admin' && role !== 'customer') {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
