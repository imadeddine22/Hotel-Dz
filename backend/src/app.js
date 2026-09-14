import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { notFound, errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import hotelRoutes from './routes/hotel.routes.js';
import houseRoutes from './routes/house.routes.js';
import roomRoutes from './routes/room.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import adminRoutes from './routes/admin.routes.js';
import messageRoutes from './routes/message.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import ownerRoutes from './routes/owner.routes.js';
import sellerRoutes from './routes/seller.routes.js';
import saleRoutes from './routes/sale.routes.js';
import wilayaRoutes from './routes/wilaya.routes.js';
import pricingRoutes from './routes/pricing.routes.js';

const app = express();

// --- Security & core middleware ---
// Disable CSP so local /uploads images are not blocked by browser
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'https://hotel-dz-three.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
      ];
      if (!origin || allowed.includes(origin)) cb(null, true);
      else cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Rate limiting (applied to the API)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// The Chargily webhook needs the raw body to verify its signature, so it is
// mounted BEFORE the JSON parser with express.raw().
app.use('/api/v1/payments/webhook', express.raw({ type: '*/*' }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded images as static files (with CORS headers so Next.js can load them)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '..', 'public', 'uploads')));

// --- Health check ---
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'DzHotels API is running', timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/houses', houseRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/owner', ownerRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/wilayas', wilayaRoutes);
app.use('/api/v1/pricing', pricingRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

export default app;
