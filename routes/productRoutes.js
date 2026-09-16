import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Prices and availability originate from this database collection, not the client.
router.get('/', async (req, res) => {
  try {
    const products = await Product.find(
      { isActive: true },
      'name sku brand category type specs price stock image description warrantyMonths isActive'
    )
      .sort({ name: 1 })
      .lean();
    res.json(products);
  } catch (error) {
    console.error('Unable to load products:', error);
    res.status(500).json({ success: false, message: 'Unable to load products.' });
  }
});

export default router;
