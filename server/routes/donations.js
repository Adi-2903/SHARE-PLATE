import express from 'express';
import {
  getDonations,
  getDonationById,
  createDonation,
  claimDonation,
  assignVolunteer,
  markDelivered,
  getStats,
} from '../controllers/donationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/stats', getStats);
router.get('/',      getDonations);
router.get('/:id',   getDonationById);

// Donor: create donation
router.post('/', protect, authorize('donor', 'admin'), createDonation);

// NGO: claim donation
router.patch('/:id/claim', protect, authorize('ngo', 'admin'), claimDonation);

// Admin / NGO: assign volunteer
router.patch('/:id/assign', protect, authorize('ngo', 'admin'), assignVolunteer);

// Volunteer / Admin: mark delivered
router.patch('/:id/deliver', protect, authorize('volunteer', 'admin'), markDelivered);

export default router;
