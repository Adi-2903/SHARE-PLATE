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

// ── Middleware ──────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── MongoDB Connection ──────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected: shareplate'))
  .catch((err) => console.error('❌ MongoDB error:', err.message));

// ── Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check ────────────────────────────────────
app.get('/', (_req, res) =>
  res.json({ message: '🍽️ SharePlate API running', version: '1.0.0' })
);

// ── 404 handler ─────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 SharePlate server running on http://localhost:${PORT}`)
);
