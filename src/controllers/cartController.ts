import { Request, Response } from 'express';
import Cart from '../models/Cart';

export const getCart = async (req: Request | any, res: Response) => {
  try {
    let cart = await Cart.findOne({ user: req.user?._id }).populate('items.product');
    
    // If no cart exists, create an empty one
    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [] });
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const addToCart = async (req: Request | any, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    
    if (quantity !== undefined && quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }
    
    let cart = await Cart.findOne({ user: req.user?._id });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [] });
    }

    // Check if product already exists in cart
    const itemIndex = cart.items.findIndex((item: any) => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Product exists, update quantity
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      // Product does not exist, add to cart
      cart.items.push({ product: productId, quantity: quantity || 1 });
    }

    await cart.save();
    
    // Populate before returning
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const removeFromCart = async (req: Request | any, res: Response) => {
  try {
    const { productId } = req.body;
    
    let cart = await Cart.findOne({ user: req.user?._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item: any) => item.product.toString() !== productId);
    
    await cart.save();
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateCartQuantity = async (req: Request | any, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    
    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }
    
    let cart = await Cart.findOne({ user: req.user?._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item: any) => item.product.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      
      // Remove if quantity set to 0 or less
      if (cart.items[itemIndex].quantity <= 0) {
         cart.items.splice(itemIndex, 1);
      }
    }

    await cart.save();
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
