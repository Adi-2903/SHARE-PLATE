/**
 * SharePlate - Database Seed Script
 * Run: node seed.js  (from /server directory)
 * Creates demo users for all 4 roles + sample donations
 */
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './models/User.js'
import Donation from './models/Donation.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shareplate'

const USERS = [
  { firstName: 'Admin',   lastName: 'User',    email: 'admin@demo.com',     password: 'demo1234', phone: '9000000001', role: 'admin',     orgName: 'SharePlate HQ', city: 'Mumbai', pincode: '400001' },
  { firstName: 'Spice',   lastName: 'Garden',  email: 'donor@demo.com',     password: 'demo1234', phone: '9000000002', role: 'donor',     orgName: 'Spice Garden Restaurant', city: 'Pune', pincode: '411001' },
  { firstName: 'Sunrise', lastName: 'NGO',     email: 'ngo@demo.com',       password: 'demo1234', phone: '9000000003', role: 'ngo',       orgName: 'Sunrise Foundation', city: 'Pune', pincode: '411002' },
  { firstName: 'Rahul',   lastName: 'Kumar',   email: 'volunteer@demo.com', password: 'demo1234', phone: '9000000004', role: 'volunteer', city: 'Pune', pincode: '411003' },
]

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Donation.deleteMany({})
    console.log('🗑️  Cleared existing data')

    // Create users (password auto-hashed by User model pre-save hook)
    const createdUsers = await User.create(USERS)
    console.log(`👤 Created ${createdUsers.length} demo users`)

    const donor = createdUsers.find(u => u.role === 'donor')

    // Sample donations
    const now = new Date()
    const DONATIONS = [
      { donor: donor._id, donorName: 'Spice Garden Restaurant', donorType: 'Restaurant', foodName: 'Dal Makhani + Roti', quantity: 40, foodType: 'Vegetarian', expiryTime: new Date(now.getTime() + 1.5 * 3_600_000), address: '12, Sector 12, Camp', city: 'Pune', pincode: '411001', phone: '9876543210', notes: 'Freshly cooked, handle with care' },
      { donor: donor._id, donorName: 'Hotel Samrat',            donorType: 'Hotel',      foodName: 'Biryani (Veg)',       quantity: 50, foodType: 'Vegetarian', expiryTime: new Date(now.getTime() + 2.5 * 3_600_000), address: 'Civil Lines, Near Station', city: 'Pune', pincode: '411002', phone: '9812345678' },
      { donor: donor._id, donorName: 'Green Valley Hostel',     donorType: 'Hostel / PG',foodName: 'Mixed Veg + Chapati', quantity: 25, foodType: 'Vegetarian', expiryTime: new Date(now.getTime() + 5   * 3_600_000), address: 'MG Road, Plot 7', city: 'Pune', pincode: '411003', phone: '9856789012' },
      { donor: donor._id, donorName: 'Mumbai Dabba Co.',        donorType: 'Catering Service', foodName: 'Lunch Boxes (Veg)', quantity: 60, foodType: 'Vegetarian', expiryTime: new Date(now.getTime() + 6 * 3_600_000), address: 'Andheri East, Plot 4', city: 'Mumbai', pincode: '400069', phone: '9712345678' },
      { donor: donor._id, donorName: 'BITS College Canteen',    donorType: 'Cafeteria',  foodName: 'Wraps & Snacks',       quantity: 80, foodType: 'Vegan',       expiryTime: new Date(now.getTime() + 9   * 3_600_000), address: 'BITS Campus, Pilani', city: 'Pilani', pincode: '333031', phone: '9634567890' },
    ]

    const createdDonations = await Donation.create(DONATIONS)
    console.log(`🍱 Created ${createdDonations.length} sample donations`)

    console.log('\n🎉 Seed complete! Demo accounts:')
    console.log('  🛡️  Admin:     admin@demo.com     / demo1234')
    console.log('  🏪  Donor:     donor@demo.com     / demo1234')
    console.log('  🏥  NGO:       ngo@demo.com       / demo1234')
    console.log('  🚴  Volunteer: volunteer@demo.com / demo1234')
    console.log('\n🚀 Run "npm run dev" in /server and root to start!')
  } catch (err) {
    console.error('❌ Seed error:', err.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

seed()
