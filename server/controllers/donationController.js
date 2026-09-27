import Donation from '../models/Donation.js';

// GET /api/donations — All donations (sorted by priority + createdAt)
export const getDonations = async (req, res) => {
  try {
    const { status, city } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (city)   filter.city = new RegExp(city, 'i');

    const priorityOrder = { urgent: 0, moderate: 1, safe: 2 };
    const donations = await Donation.find(filter)
      .populate('donor', 'firstName lastName orgName')
      .populate('claimedBy', 'firstName lastName orgName')
      .populate('volunteer', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Sort by priority (urgent first)
    donations.sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/donations/:id
export const getDonationById = async (req, res) => {
  try {
    const d = await Donation.findById(req.params.id)
      .populate('donor', 'firstName lastName orgName phone')
      .populate('claimedBy', 'firstName lastName orgName')
      .populate('volunteer', 'firstName lastName phone');
    if (!d) return res.status(404).json({ error: 'Donation not found' });
    res.json(d);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/donations — Create new donation (donor only)
export const createDonation = async (req, res) => {
  try {
    const { donorName, donorType, foodName, quantity, foodType, expiryTime, address, city, pincode, phone, notes } = req.body;
    const donation = await Donation.create({
      donor: req.user.id,
      donorName, donorType, foodName, quantity, foodType,
      expiryTime: new Date(expiryTime),
      address, city, pincode, phone, notes,
    });
    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/donations/:id/claim — NGO claims a donation
export const claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Not found' });
    if (donation.status !== 'available')
      return res.status(400).json({ error: 'Donation already claimed or unavailable' });

    donation.status    = 'claimed';
    donation.claimedBy = req.user.id;
    donation.claimedAt = new Date();
    await donation.save();
    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/donations/:id/assign — Assign volunteer
export const assignVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Not found' });

    donation.volunteer  = volunteerId;
    donation.status     = 'in_transit';
    donation.assignedAt = new Date();
    await donation.save();
    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/donations/:id/deliver — Mark as delivered
export const markDelivered = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Not found' });

    donation.status      = 'delivered';
    donation.deliveredAt = new Date();
    await donation.save();
    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/donations/stats — Platform-wide stats for admin/homepage
export const getStats = async (req, res) => {
  try {
    const [total, delivered, urgent, claimed] = await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'delivered' }),
      Donation.countDocuments({ priority: 'urgent', status: 'available' }),
      Donation.countDocuments({ status: 'claimed' }),
    ]);
    const mealsRescued = await Donation.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    res.json({
      total,
      delivered,
      urgent,
      claimed,
      mealsRescued: mealsRescued[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
