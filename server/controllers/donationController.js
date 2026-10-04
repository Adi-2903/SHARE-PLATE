import Donation from '../models/Donation.js';
import User from '../models/User.js';

// ── GET /api/donations — All donations sorted by priority ────
export const getDonations = async (req, res) => {
  try {
    const { status, city } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (city)   filter.city = new RegExp(city, 'i');

    const donations = await Donation.find(filter)
      .populate('donor', 'firstName lastName orgName phone')
      .populate('claimedBy', 'firstName lastName orgName')
      .populate('volunteer', 'firstName lastName phone')
      .sort({ createdAt: -1 });

    const priorityOrder = { urgent: 0, moderate: 1, safe: 2 };
    donations.sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/donations/my — Donor's own donations ────────────
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .populate('claimedBy', 'firstName lastName orgName')
      .populate('volunteer', 'firstName lastName phone')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/donations/:id ────────────────────────────────────
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

// ── POST /api/donations — Create new donation (donor only) ───
export const createDonation = async (req, res) => {
  try {
    const {
      donorName, donorType, foodName, quantity, foodType,
      expiryTime, address, city, pincode, phone, notes,
    } = req.body;

    // Build donorName from user profile if not provided
    const resolvedDonorName = donorName
      || req.user.orgName
      || `${req.user.firstName} ${req.user.lastName}`;

    const donation = await Donation.create({
      donor:     req.user.id,
      donorName: resolvedDonorName,
      donorType: donorType || 'Restaurant',
      foodName,
      quantity:  Number(quantity),
      foodType:  foodType || 'Vegetarian',
      expiryTime: new Date(expiryTime),
      address,
      city,
      pincode,
      phone,
      notes,
    });

    res.status(201).json(donation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── PATCH /api/donations/:id/claim — NGO claims donation ─────
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

// ── PATCH /api/donations/:id/assign — Assign volunteer ───────
export const assignVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const volunteer = await User.findById(volunteerId);
    if (!volunteer || volunteer.role !== 'volunteer')
      return res.status(400).json({ error: 'Please assign a valid volunteer' });

    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Not found' });
    if (donation.status !== 'claimed')
      return res.status(400).json({ error: 'Can only assign volunteers to claimed donations' });
    if (req.user.role === 'ngo' && String(donation.claimedBy) !== String(req.user.id))
      return res.status(403).json({ error: 'Only the claiming NGO can assign this rescue' });

    donation.volunteer  = volunteerId;
    donation.assignedAt = new Date();
    await donation.save();
    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PATCH /api/donations/:id/transit — Volunteer confirms pickup ─
export const markTransit = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Not found' });
    if (!['claimed'].includes(donation.status))
      return res.status(400).json({ error: 'Can only confirm pickup on claimed donations' });
    if (donation.volunteer && String(donation.volunteer) !== String(req.user.id) && req.user.role !== 'admin')
      return res.status(403).json({ error: 'This pickup is assigned to another volunteer' });

    donation.status     = 'in_transit';
    donation.assignedAt = new Date();
    // Assign volunteer if not already set
    if (!donation.volunteer) donation.volunteer = req.user.id;
    await donation.save();
    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PATCH /api/donations/:id/deliver — Mark as delivered ─────
export const markDelivered = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Not found' });
    if (!['claimed', 'in_transit'].includes(donation.status))
      return res.status(400).json({ error: 'Donation must be claimed or in_transit to mark as delivered' });
    if (req.user.role === 'ngo' && String(donation.claimedBy) !== String(req.user.id))
      return res.status(403).json({ error: 'Only the claiming NGO can confirm this delivery' });
    if (req.user.role === 'volunteer' && String(donation.volunteer) !== String(req.user.id))
      return res.status(403).json({ error: 'Only the assigned volunteer can complete this delivery' });

    donation.status      = 'delivered';
    donation.deliveredAt = new Date();
    await donation.save();
    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PATCH /api/donations/:id/status — Admin override any status ─
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'claimed', 'in_transit', 'delivered', 'expired'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!donation) return res.status(404).json({ error: 'Not found' });
    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE /api/donations/:id — Admin delete ──────────────────
export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Donation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/donations/stats — Platform-wide stats ───────────
export const getStats = async (req, res) => {
  try {
    const [total, delivered, urgent, claimed] = await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'delivered' }),
      Donation.countDocuments({ priority: 'urgent', status: 'available' }),
      Donation.countDocuments({ status: 'claimed' }),
    ]);
    const mealsAgg = await Donation.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    const activeNgosAgg = await Donation.distinct('claimedBy', { claimedBy: { $ne: null } });
    res.json({
      total,
      delivered,
      urgent,
      claimed,
      mealsRescued: mealsAgg[0]?.total || 0,
      activeNgos: activeNgosAgg.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
