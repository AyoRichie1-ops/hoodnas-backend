import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173', // Vite default local development
  'http://localhost:5174', // Vite alternative local port
  'http://localhost:3000', // React local development
  process.env.FRONTEND_URL  // Custom domain or primary Vercel URL
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow Postman/curl (no origin), explicitly allowed origins, or ANY .vercel.app deployment
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      /\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Explicitly answer preflight OPTIONS requests before hitting routes
app.options('*', cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hoodnas Backend Server is Live!');
});

app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));