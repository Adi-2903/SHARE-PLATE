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
// Allow localhost in dev + Vercel domain in production
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── MongoDB Connection (Cached for Serverless) ─────
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI is missing from environment variables');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
};

// Connect DB on middleware invocation
app.use(async (_req, _res, next) => {
  await connectDB();
  next();
});

// ── Routes (Mounted for both /api/xxx and /xxx for Vercel Serverless compatibility) ─
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/donations', donationRoutes);
app.use('/donations', donationRoutes);

app.use('/api/ngos', ngoRoutes);
app.use('/ngos', ngoRoutes);

app.use('/api/volunteers', volunteerRoutes);
app.use('/volunteers', volunteerRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

// ── Health Check ────────────────────────────────────
app.get(['/', '/api'], (_req, res) =>
  res.json({
    message: '🍽️ SharePlate API running on Vercel',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'production',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
);

// ── Global Error Handler ─────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('💥 Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start Server locally ─────────────────────────────
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 SharePlate server running on http://localhost:${PORT}`)
  );
}

export default app;

