import express from 'express';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/volunteers — List all volunteers
router.get('/', async (req, res) => {
  try {
    const vols = await User.find({ role: 'volunteer' }).select('-password');
    res.json(vols);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/volunteers/my-pickups — Volunteer's own assignments
router.get('/my-pickups', protect, authorize('volunteer'), async (req, res) => {
  try {
    const pickups = await Donation.find({ volunteer: req.user.id })
      .populate('claimedBy', 'orgName phone city')
      .populate('donor', 'orgName address phone')
      .sort({ createdAt: -1 });
    res.json(pickups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
