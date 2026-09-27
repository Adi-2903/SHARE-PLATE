import express from 'express';
import {
  getDonations,
  getDonationById,
  createDonation,
  claimDonation,
  assignVolunteer,
  markTransit,
  markDelivered,
  updateStatus,
  deleteDonation,
  getMyDonations,
  getStats,
} from '../controllers/donationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Public ──────────────────────────────────────────────────
router.get('/stats', getStats);
router.get('/', getDonations);

// ── Donor: my own donations ──────────────────────────────────
// IMPORTANT: /my MUST be registered BEFORE /:id to avoid Mongoose CastError
router.get('/my', protect, authorize('donor', 'admin'), getMyDonations);

router.get('/:id', getDonationById);

// ── Donor: create donation ───────────────────────────────────
router.post('/', protect, authorize('donor', 'admin'), createDonation);

// ── NGO: claim donation ──────────────────────────────────────
router.patch('/:id/claim', protect, authorize('ngo', 'admin'), claimDonation);

// ── NGO / Admin: assign volunteer ───────────────────────────
router.patch('/:id/assign', protect, authorize('ngo', 'admin'), assignVolunteer);

// ── Volunteer / Admin: confirm pickup (in_transit) ──────────
router.patch('/:id/transit', protect, authorize('volunteer', 'admin'), markTransit);

// ── Volunteer / Admin: mark delivered ───────────────────────
router.patch('/:id/deliver', protect, authorize('volunteer', 'admin'), markDelivered);

// ── Admin: update any status field ──────────────────────────
router.patch('/:id/status', protect, authorize('admin'), updateStatus);

// ── Admin: delete donation ───────────────────────────────────
router.delete('/:id', protect, authorize('admin'), deleteDonation);

export default router;
