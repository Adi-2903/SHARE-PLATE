import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import donationRoutes from './routes/donations.js';
import ngoRoutes from './routes/ngos.js';
import volunteerRoutes from './routes/volunteers.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// ── CORS ────────────────────────────────────────────
// Allow localhost in dev + your Vercel domain in production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // set this to your Vercel URL later
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── MongoDB Connection ──────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,  // Fail fast if Atlas unreachable
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Exit so hosting platform can restart
  }
};

connectDB();

// ── Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check ────────────────────────────────────
app.get('/', (_req, res) =>
  res.json({
    message: '🍽️ SharePlate API running',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
);

// ── Global Error Handler ─────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('💥 Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── 404 ─────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 SharePlate server running on http://localhost:${PORT}`)
);

