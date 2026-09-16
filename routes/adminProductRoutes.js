import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 }).lean();
    res.json({ products });
  } catch (error) {
    console.error('Unable to load admin products:', error);
    res.status(500).json({ message: 'Unable to load products.' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    sendProductError(res, error);
  }
});

router.patch('/products/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid product ID.' });
  }

  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json(product);
  } catch (error) {
    return sendProductError(res, error);
  }
});

function sendProductError(res, error) {
  console.error('Admin product operation failed:', error);
  if (error?.code === 11000) {
    return res.status(409).json({ message: 'A product with this SKU already exists.' });
  }
  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: 'Unable to save product.' });
}

export default router;
