import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('Login is unavailable: JWT_SECRET is not configured.');
      return res.status(500).json({ message: 'Login is temporarily unavailable.' });
    }

    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body?.password;

    if (!email || typeof password !== 'string') {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    const validPassword = user && (await bcrypt.compare(password, user.passwordHash));
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access is required.' });
    }

    const publicUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(publicUser, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.json({ token, user: publicUser });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ message: 'Unable to log in.' });
  }
});

export default router;
