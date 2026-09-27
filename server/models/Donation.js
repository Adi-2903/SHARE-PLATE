import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    donorName:   { type: String, required: true },
    donorType:   { type: String, required: true }, // Restaurant | Hotel | Hostel | Cafeteria
    foodName:    { type: String, required: true },
    quantity:    { type: Number, required: true, min: 1 },
    foodType:    { type: String, enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Bakery', 'Fruits & Produce', 'Mixed'], default: 'Vegetarian' },
    expiryTime:  { type: Date, required: true },
    address:     { type: String, required: true },
    city:        { type: String, required: true },
    pincode:     { type: String },
    phone:       { type: String, required: true },
    notes:       { type: String },

    // Priority computed from expiryTime
    priority: {
      type: String,
      enum: ['urgent', 'moderate', 'safe'],
      default: 'safe',
    },

    // Lifecycle status
    status: {
      type: String,
      enum: ['available', 'claimed', 'in_transit', 'delivered', 'expired'],
      default: 'available',
    },

    // NGO that claimed
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    claimedAt:  { type: Date, default: null },

    // Volunteer assigned for pickup
    volunteer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedAt: { type: Date, default: null },
    deliveredAt:{ type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-compute priority before save
donationSchema.pre('save', function (next) {
  const now = new Date();
  const diffHrs = (this.expiryTime - now) / 3_600_000;
  if (diffHrs < 4)       this.priority = 'urgent';
  else if (diffHrs < 8)  this.priority = 'moderate';
  else                   this.priority = 'safe';
  next();
});

export default mongoose.model('Donation', donationSchema);
