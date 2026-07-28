import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './db/connect';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  // Allow cross-origin resource sharing for images/fonts loaded by frontend
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Rate limiting ─────────────────────────────────────────────────────────────

// General API limiter — 200 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: () => !isProd, // Only enforce in production
});

// Auth limiter — stricter: 20 requests per 15 minutes (login/signup protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' },
  skip: () => !isProd,
});

// ── Routes ────────────────────────────────────────────────────────────────────
import venueRoutes from './routes/venueRoutes';
import userRoutes from './routes/userRoutes';
import playerRoutes from './routes/playerRoutes';
import requestRoutes from './routes/requestRoutes';
import communityRoutes from './routes/communityRoutes';
import adminRoutes from './routes/adminRoutes';
import messageRoutes from './routes/messageRoutes';

app.use('/api', apiLimiter);           // Apply general limit to all /api routes
app.use('/api/users/sync', authLimiter); // Stricter limit on user sync (called on login)

app.use('/api/venues', venueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.get('/health', (_req, res) => res.send('PlaySync API is running'));

// ── Start server ──────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} [${isProd ? 'production' : 'development'}]`);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
