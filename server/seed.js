/**
 * SharePlate - Database Seed Script
 * Run: node seed.js  (from /server directory)
 *
 * Creates:
 *  - 4 demo users (admin, donor, ngo, volunteer)
 *  - 10 sample donations covering ALL status types, ALL food types, ALL priority levels
 *  - 2 claimed donations (by the NGO), 1 in_transit (by volunteer), 1 delivered
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'
import Donation from './models/Donation.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env')
  process.exit(1)
}

// ── Demo Users ────────────────────────────────────────
const USERS = [
  {
    firstName: 'Admin', lastName: 'User',
    email: 'admin@demo.com', password: 'demo1234',
    phone: '9000000001', role: 'admin',
    orgName: 'SharePlate HQ', city: 'Mumbai', pincode: '400001',
  },
  {
    firstName: 'Spice', lastName: 'Garden',
    email: 'donor@demo.com', password: 'demo1234',
    phone: '9000000002', role: 'donor',
    orgName: 'Spice Garden Restaurant', city: 'Pune', pincode: '411001',
  },
  {
    firstName: 'Sunrise', lastName: 'NGO',
    email: 'ngo@demo.com', password: 'demo1234',
    phone: '9000000003', role: 'ngo',
    orgName: 'Sunrise Foundation', city: 'Pune', pincode: '411002',
  },
  {
    firstName: 'Rahul', lastName: 'Kumar',
    email: 'volunteer@demo.com', password: 'demo1234',
    phone: '9000000004', role: 'volunteer',
    city: 'Pune', pincode: '411003',
  },
]

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB Atlas')

    // ── Clear existing data ──────────────────────────
    await User.deleteMany({})
    await Donation.deleteMany({})
    console.log('🗑️  Cleared existing data')

    // ── Create Users ─────────────────────────────────
    // Using insertMany won't trigger pre-save hooks for password hashing
    // So we use User.create() which runs all middleware
    const createdUsers = await Promise.all(USERS.map(u => new User(u).save()))
    console.log(`👤 Created ${createdUsers.length} demo users`)

    const admin     = createdUsers.find(u => u.role === 'admin')
    const donor     = createdUsers.find(u => u.role === 'donor')
    const ngo       = createdUsers.find(u => u.role === 'ngo')
    const volunteer = createdUsers.find(u => u.role === 'volunteer')

    // ── Time helpers ─────────────────────────────────
    const hrs   = (n) => new Date(Date.now() + n * 3_600_000)
    const ago   = (n) => new Date(Date.now() - n * 3_600_000)

    // ── Sample Donations ─────────────────────────────
    // Covers: all 6 foodType enums, all 3 priority levels, all 5 status values
    const donationsData = [
      // ── AVAILABLE (status: available) ─────────────
      {
        donor: donor._id, donorName: 'Spice Garden Restaurant',
        donorType: 'Restaurant', foodName: 'Dal Makhani + Roti',
        quantity: 40, foodType: 'Vegetarian',
        expiryTime: hrs(1.5),    // urgent (< 4hrs)
        address: '12, Sector 12, Camp', city: 'Pune', pincode: '411001',
        phone: '9876543210', notes: 'Freshly cooked, handle with care',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Hotel Samrat',
        donorType: 'Hotel', foodName: 'Chicken Biryani',
        quantity: 50, foodType: 'Non-Vegetarian',
        expiryTime: hrs(5),      // moderate (4–8hrs)
        address: 'Civil Lines, Near Station', city: 'Pune', pincode: '411002',
        phone: '9812345678', notes: 'Packed in sealed containers',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'BITS College Canteen',
        donorType: 'Cafeteria', foodName: 'Wraps & Granola Bars',
        quantity: 80, foodType: 'Vegan',
        expiryTime: hrs(10),     // safe (> 8hrs)
        address: 'BITS Campus, Pilani', city: 'Pilani', pincode: '333031',
        phone: '9634567890',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Daily Breads Bakery',
        donorType: 'Bakery', foodName: 'Assorted Breads & Pastries',
        quantity: 60, foodType: 'Bakery',
        expiryTime: hrs(12),     // safe
        address: 'MG Road, Shop 7', city: 'Bangalore', pincode: '560001',
        phone: '9741234567', notes: 'Day-old, still fresh',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'FarmFresh Co-op',
        donorType: 'Grocery Store', foodName: 'Mixed Fruits & Vegetables',
        quantity: 100, foodType: 'Fruits & Produce',
        expiryTime: hrs(24),     // safe
        address: 'Azad Market, Block C', city: 'Delhi', pincode: '110006',
        phone: '9811223344', notes: 'Seasonal produce, clean & sorted',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Mumbai Dabba Co.',
        donorType: 'Catering Service', foodName: 'Veg + Non-Veg Thali',
        quantity: 35, foodType: 'Mixed',
        expiryTime: hrs(3),      // urgent
        address: 'Andheri East, Plot 4', city: 'Mumbai', pincode: '400069',
        phone: '9712345678',
        status: 'available',
      },

      // ── CLAIMED (status: claimed, claimedBy: ngo) ─
      {
        donor: donor._id, donorName: 'Green Valley Hostel',
        donorType: 'Hostel / PG', foodName: 'Mixed Veg + Chapati',
        quantity: 25, foodType: 'Vegetarian',
        expiryTime: hrs(4),      // moderate
        address: 'MG Road, Plot 7', city: 'Pune', pincode: '411003',
        phone: '9856789012',
        status: 'claimed',
        claimedBy: ngo._id,
        claimedAt: ago(0.5),     // claimed 30 mins ago
      },

      // ── IN TRANSIT (volunteer picked up) ──────────
      {
        donor: donor._id, donorName: 'Taj Catering',
        donorType: 'Hotel', foodName: 'Paneer Dishes + Naan',
        quantity: 45, foodType: 'Vegetarian',
        expiryTime: hrs(2),      // urgent
        address: 'Colaba, Near Gateway', city: 'Mumbai', pincode: '400001',
        phone: '9899001122', notes: 'High-quality hotel surplus',
        status: 'in_transit',
        claimedBy: ngo._id,
        claimedAt: ago(1),
        volunteer: volunteer._id,
        assignedAt: ago(0.5),
      },

      // ── DELIVERED (completed rescue) ──────────────
      {
        donor: donor._id, donorName: 'Skyline Banquet Hall',
        donorType: 'Banquet Hall', foodName: 'Wedding Feast Leftovers',
        quantity: 150, foodType: 'Mixed',
        expiryTime: ago(2),      // already expired (but delivered)
        address: 'Baner Road, Hall 2', city: 'Pune', pincode: '411045',
        phone: '9823456789', notes: 'Multiple dishes, 150 portions',
        status: 'delivered',
        claimedBy: ngo._id,
        claimedAt: ago(5),
        volunteer: volunteer._id,
        assignedAt: ago(4),
        deliveredAt: ago(3),
      },

      // ── EXPIRED (missed pickup) ───────────────────
      {
        donor: donor._id, donorName: 'Corner Café',
        donorType: 'Café', foodName: 'Day-old Sandwiches',
        quantity: 20, foodType: 'Non-Vegetarian',
        expiryTime: ago(1),      // already expired
        address: 'FC Road, Shop 3', city: 'Pune', pincode: '411004',
        phone: '9765432109',
        status: 'expired',
      },
    ]

    // Insert donations — use insertMany for speed, but bypass pre-save priority hook
    // So manually compute priority for each
    const donationsWithPriority = donationsData.map(d => {
      const diffHrs = (new Date(d.expiryTime) - new Date()) / 3_600_000
      const priority = diffHrs < 4 ? 'urgent' : diffHrs < 8 ? 'moderate' : 'safe'
      return { ...d, priority }
    })

    const createdDonations = await Donation.insertMany(donationsWithPriority, { ordered: false })
    console.log(`🍱 Created ${createdDonations.length} sample donations`)

    // ── Summary ──────────────────────────────────────
    const byStatus = {}
    donationsWithPriority.forEach(d => { byStatus[d.status] = (byStatus[d.status] || 0) + 1 })
    const byType = {}
    donationsWithPriority.forEach(d => { byType[d.foodType] = (byType[d.foodType] || 0) + 1 })

    console.log('\n📊 Donation breakdown:')
    Object.entries(byStatus).forEach(([k, v]) => console.log(`   ${k}: ${v}`))
    console.log('\n🍽️  Food types covered:')
    Object.entries(byType).forEach(([k, v]) => console.log(`   ${k}: ${v}`))

    console.log('\n🎉 Seed complete! Demo accounts:')
    console.log('  🛡️  Admin:     admin@demo.com     / demo1234')
    console.log('  🏪  Donor:     donor@demo.com     / demo1234')
    console.log('  🏥  NGO:       ngo@demo.com       / demo1234')
    console.log('  🚴  Volunteer: volunteer@demo.com / demo1234')
    console.log('\n🚀 All 4 roles pre-loaded with realistic data!')

  } catch (err) {
    console.error('❌ Seed error:', err.message)
    if (err.writeErrors) {
      err.writeErrors.forEach(e => console.error('  ↳', e.err.errmsg))
    }
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

seed()
