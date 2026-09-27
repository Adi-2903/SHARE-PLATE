import express from 'express';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorize('admin'));

// GET /api/admin/stats — Full platform statistics
router.get('/stats', async (_req, res) => {
  try {
    const [
      totalUsers, totalDonors, totalNGOs, totalVols,
      totalDonations, delivered, urgent, inTransit, expired,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'volunteer' }),
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'delivered' }),
      Donation.countDocuments({ priority: 'urgent', status: 'available' }),
      Donation.countDocuments({ status: 'in_transit' }),
      Donation.countDocuments({ status: 'expired' }),
    ]);
    const mealsRescued = await Donation.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    res.json({
      totalUsers, totalDonors, totalNGOs, totalVols,
      totalDonations, delivered, urgent, inTransit, expired,
      mealsRescued: mealsRescued[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users — All users
router.get('/users', async (_req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/donations — All donations with full population
router.get('/donations', async (_req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'firstName lastName orgName')
      .populate('claimedBy', 'firstName lastName orgName')
      .populate('volunteer', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/donations/:id
router.delete('/donations/:id', async (req, res) => {
  try {
    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donation removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot delete another admin' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
