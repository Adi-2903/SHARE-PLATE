import express from 'express';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/ngos — List all verified NGOs (public)
router.get('/', async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo' }).select('-password');
    res.json(ngos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ngos/my-claims — NGO's own claimed donations
router.get('/my-claims', protect, authorize('ngo'), async (req, res) => {
  try {
    const claims = await Donation.find({ claimedBy: req.user.id })
      .populate('donor', 'orgName phone')
      .populate('volunteer', 'firstName lastName phone')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
