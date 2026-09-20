import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendInvoiceEmail } from '../utils/sendInvoice.js';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const router = express.Router();

// --- Google Sheets Helper Function ---
async function appendOrderToGoogleSheet(orderData) {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      'Order ID': orderData.orderId,
      'Customer Name': orderData.customerName,
      'Phone Number': orderData.customerPhone,
      'Battery Ordered': orderData.itemTitle,
      'Quantity': orderData.quantity,
      'Total Amount': orderData.totalAmount,
      'Delivery Address': orderData.deliveryAddress,
      'Status': 'Pending',
      'Date': new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }),
    });

    console.log('Success: Order sent to Google Sheet!');
  } catch (error) {
    console.error('Failed to write to Google Sheet:', error);
  }
}
// -------------------------------------

router.post('/checkout', async (req, res) => {
  let session;
  try {
    const { customer, items } = req.body;

    if (!isValidCustomer(customer) || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'A valid customer and at least one item are required.' });
    }

    const normalizedItems = items.map((item) => ({
      productId: item?.productId,
      quantity: item?.quantity,
    }));

    if (
      normalizedItems.some(
        ({ productId, quantity }) =>
          !mongoose.Types.ObjectId.isValid(productId) ||
          !Number.isSafeInteger(quantity) ||
          quantity < 1
      )
    ) {
      return res.status(400).json({ success: false, message: 'Each item needs a valid productId and a positive integer quantity.' });
    }

    const productIds = normalizedItems.map((item) => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      return res.status(400).json({ success: false, message: 'Each product may only appear once in items.' });
    }

    const products = await Product.find({ _id: { $in: productIds } }).lean();
    if (products.length !== normalizedItems.length) {
      return res.status(400).json({ success: false, message: 'One or more products do not exist.' });
    }

    const productsById = new Map(products.map((product) => [product._id.toString(), product]));
    const orderItems = normalizedItems.map(({ productId, quantity }) => {
      const product = productsById.get(productId);
      if (quantity > product.stock) {
        const error = new Error(`Insufficient stock for ${product.name}.`);
        error.statusCode = 409;
        throw error;
      }

      const subtotal = product.price * quantity;
      return { productId: product._id, name: product.name, price: product.price, quantity, subtotal };
    });
    
    const totalAmount = orderItems.reduce((total, item) => total + item.subtotal, 0);
    const orderId = `ORD-${new mongoose.Types.ObjectId().toString().slice(-10).toUpperCase()}`;

    session = await mongoose.startSession();
    let newOrder;
    await session.withTransaction(async () => {
      for (const item of orderItems) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true, session }
        );
        if (!updatedProduct) {
          const error = new Error(`Insufficient stock for ${item.name}.`);
          error.statusCode = 409;
          throw error;
        }
      }

      newOrder = new Order({ orderId, customer, items: orderItems, totalAmount });
      await newOrder.save({ session });
    });

    // --- Fire the Google Sheets Update ---
    // Note: We don't use 'await' here so it runs in the background without slowing down the customer checkout
    appendOrderToGoogleSheet({
      orderId: newOrder.orderId,
      customerName: newOrder.customer.fullName,
      customerPhone: newOrder.customer.phone,
      itemTitle: newOrder.items.map(i => i.name).join(', '), 
      quantity: newOrder.items.reduce((sum, item) => sum + item.quantity, 0), 
      totalAmount: newOrder.totalAmount,
      deliveryAddress: newOrder.customer.address,
    });
    // ------------------------------------

    // Await email delivery and log any issues directly
    try {
      await sendInvoiceEmail(newOrder);
      console.log('Invoice email sent successfully!');
    } catch (emailError) {
      console.error('Nodemailer Error Details:', emailError.message);
    }

    res.status(201).json({
      success: true,
      orderId: newOrder.orderId,
      totalAmount: newOrder.totalAmount,
      bankAccounts: [
        { bank: 'GTBank', accountName: 'Company Business Ltd', accountNumber: '0123456789' },
      ],
      whatsappNumber: process.env.COMPANY_WHATSAPP
    });

  } catch (error) {
    console.error('Checkout failed:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Unable to create the order.'
    });
  } finally {
    if (session) session.endSession();
  }
});

function isValidCustomer(customer) {
  return (
    customer &&
    ['fullName', 'email', 'phone', 'address'].every(
      (field) => typeof customer[field] === 'string' && customer[field].trim().length > 0
    )
  );
}

export default router;