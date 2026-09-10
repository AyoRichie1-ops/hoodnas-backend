import express from 'express';
import Order from '../models/Order.js';
import { sendInvoiceEmail } from '../utils/sendInvoice.js';

const router = express.Router();

router.post('/checkout', async (req, res) => {
  try {
    const { customer, items } = req.body;

    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = new Order({ orderId, customer, items, totalAmount });
    await newOrder.save();

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
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;