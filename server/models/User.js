import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true },
    password:  { type: String, required: true, minlength: 6 },
    phone:     { type: String, required: true },
    role: {
      type: String,
      enum: ['donor', 'ngo', 'volunteer', 'admin'],
      required: true,
    },
    orgName:   { type: String },
    city:      { type: String },
    pincode:   { type: String },
    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);
