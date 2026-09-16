import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

const inputPath = path.resolve(process.cwd(), process.argv[2] || 'data/products.json');

try {
  const input = JSON.parse(await fs.readFile(inputPath, 'utf8'));
  const products = Array.isArray(input) ? input : input.products;

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('The input must be a non-empty JSON array of products.');
  }

  // Validate every record before changing the database, so malformed imports fail safely.
  const validatedProducts = [];
  for (const productData of products) {
    const product = new Product(productData);
    await product.validate();
    const document = product.toObject();
    delete document._id;
    delete document.createdAt;
    delete document.updatedAt;
    validatedProducts.push(document);
  }

  const skus = validatedProducts.map((product) => product.sku);
  if (new Set(skus).size !== skus.length) {
    throw new Error('Each product in the import file must have a unique SKU.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  const result = await Product.bulkWrite(
    validatedProducts.map((product) => ({
      updateOne: {
        filter: { sku: product.sku },
        update: { $set: product },
        upsert: true,
      },
    }))
  );

  console.log(`Product import complete: ${result.upsertedCount} added, ${result.modifiedCount} updated.`);
} catch (error) {
  console.error(`Product import failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
