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
    const days  = (n) => new Date(Date.now() + n * 86_400_000)
    const ago   = (n) => new Date(Date.now() - n * 3_600_000)

    // ── Sample Donations ─────────────────────────────
    // Covers: all 6 foodType enums, all 3 priority levels, all 5 status values
    const donationsData = [
      // ── URGENT (< 4 hours) ─────────────────────────
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
        donor: donor._id, donorName: 'Mumbai Dabba Co.',
        donorType: 'Catering Service', foodName: 'Veg + Non-Veg Thali',
        quantity: 35, foodType: 'Mixed',
        expiryTime: hrs(2.5),    // urgent (< 4hrs)
        address: 'Andheri East, Plot 4', city: 'Mumbai', pincode: '400069',
        phone: '9712345678', notes: 'Hot meal boxes ready for immediate pickup',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Corner Snack Center',
        donorType: 'Café', foodName: 'Fresh Samosas & Kachori',
        quantity: 50, foodType: 'Vegetarian',
        expiryTime: hrs(3.0),    // urgent (< 4hrs)
        address: 'FC Road, Shop 14', city: 'Pune', pincode: '411004',
        phone: '9822114455', notes: 'Freshly fried snacks in paper trays',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Taj Catering',
        donorType: 'Hotel', foodName: 'Paneer Dishes + Naan',
        quantity: 45, foodType: 'Vegetarian',
        expiryTime: hrs(2.0),    // urgent (< 4hrs)
        address: 'Colaba, Near Gateway', city: 'Mumbai', pincode: '400001',
        phone: '9899001122', notes: 'High-quality hotel surplus',
        status: 'in_transit',
        claimedBy: ngo._id,
        claimedAt: ago(1),
        volunteer: volunteer._id,
        assignedAt: ago(0.5),
      },
      {
        donor: donor._id, donorName: 'Royal Kitchens',
        donorType: 'Restaurant', foodName: 'Egg Curry & Jeera Rice',
        quantity: 30, foodType: 'Non-Vegetarian',
        expiryTime: hrs(3.5),    // urgent (< 4hrs)
        address: 'Viman Nagar, Lane 3', city: 'Pune', pincode: '411014',
        phone: '9844556677',
        status: 'claimed',
        claimedBy: ngo._id,
        claimedAt: ago(0.2),
      },

      // ── MODERATE (4 – 8 hours) ──────────────────────
      {
        donor: donor._id, donorName: 'Hotel Samrat',
        donorType: 'Hotel', foodName: 'Hyderabadi Chicken Biryani',
        quantity: 50, foodType: 'Non-Vegetarian',
        expiryTime: hrs(5.5),    // moderate (4–8hrs)
        address: 'Civil Lines, Near Station', city: 'Pune', pincode: '411002',
        phone: '9812345678', notes: 'Packed in sealed aluminium containers',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'North Flavors Diner',
        donorType: 'Restaurant', foodName: 'Rajma Chawal + Salad',
        quantity: 45, foodType: 'Vegetarian',
        expiryTime: hrs(6.0),    // moderate (4–8hrs)
        address: 'Kothrud, Paud Road', city: 'Pune', pincode: '411038',
        phone: '9766554433', notes: 'Cleanly packed, rich protein meal',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Green Valley Hostel',
        donorType: 'Hostel / PG', foodName: 'Mixed Veg + Chapati',
        quantity: 60, foodType: 'Vegetarian',
        expiryTime: hrs(6.5),    // moderate (4–8hrs)
        address: 'MG Road, Plot 7', city: 'Pune', pincode: '411003',
        phone: '9856789012', notes: 'Nutritious hostel dinner surplus',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Dakshin Delights',
        donorType: 'Cafeteria', foodName: 'Idli, Vada & Sambar',
        quantity: 40, foodType: 'Vegan',
        expiryTime: hrs(7.0),    // moderate (4–8hrs)
        address: 'Hinjewadi Phase 1', city: 'Pune', pincode: '411057',
        phone: '9833445566', notes: 'Warm tiffin items with coconut chutney',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'BakeHouse Express',
        donorType: 'Bakery', foodName: 'Assorted Croissants & Muffins',
        quantity: 35, foodType: 'Bakery',
        expiryTime: hrs(7.5),    // moderate (4–8hrs)
        address: 'Baner Road, Shop 12', city: 'Pune', pincode: '411045',
        phone: '9722334455',
        status: 'claimed',
        claimedBy: ngo._id,
        claimedAt: ago(0.4),
      },

      // ── SAFE (> 8 hours & Multi-Day Items) ──────────
      {
        donor: donor._id, donorName: 'BITS College Canteen',
        donorType: 'Cafeteria', foodName: 'Wraps & Granola Bars',
        quantity: 80, foodType: 'Vegan',
        expiryTime: hrs(12.0),   // safe (> 8hrs)
        address: 'BITS Campus, Pilani', city: 'Pilani', pincode: '333031',
        phone: '9634567890', notes: 'Individually wrapped snacks',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Daily Breads Bakery',
        donorType: 'Bakery', foodName: 'Assorted Artisanal Breads & Buns',
        quantity: 60, foodType: 'Bakery',
        expiryTime: hrs(18.0),   // safe (> 8hrs)
        address: 'MG Road, Shop 7', city: 'Bangalore', pincode: '560001',
        phone: '9741234567', notes: 'Freshly baked day-old items',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'FarmFresh Co-op',
        donorType: 'Grocery Store', foodName: 'Fresh Farm Apples & Oranges (1 Day)',
        quantity: 100, foodType: 'Fruits & Produce',
        expiryTime: days(1),     // 24 hours / 1 day
        address: 'Azad Market, Block C', city: 'Delhi', pincode: '110006',
        phone: '9811223344', notes: 'Sorted, clean seasonal fruit crates',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Amul Dairy Hub',
        donorType: 'Grocery Store', foodName: 'Packaged Dairy Milk & Cheese Crates (2 Days)',
        quantity: 120, foodType: 'Vegetarian',
        expiryTime: days(2),     // 48 hours / 2 days
        address: 'Model Colony, Block 4', city: 'Pune', pincode: '411016',
        phone: '9822331100', notes: 'Refrigerated sealed dairy crates',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Heritage Grains Merchant',
        donorType: 'Grocery Store', foodName: 'Bulk Basmati Rice & Dal Sacks (3 Days)',
        quantity: 200, foodType: 'Vegan',
        expiryTime: days(3),     // 72 hours / 3 days
        address: 'APMC Market, Gate 2', city: 'Mumbai', pincode: '400705',
        phone: '9733221100', notes: 'Unopened 10kg grain bags',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Reliance Fresh Mart',
        donorType: 'Grocery Store', foodName: 'Canned Beans & Vegetable Soups (4 Days)',
        quantity: 150, foodType: 'Vegan',
        expiryTime: days(4),     // 96 hours / 4 days
        address: 'Aundh, Main Road', city: 'Pune', pincode: '411007',
        phone: '9844112233', notes: 'Sealed commercial cans',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Britannia Wholesale',
        donorType: 'Bakery', foodName: 'Dry Biscuit & Cookie Cartons (5 Days)',
        quantity: 180, foodType: 'Bakery',
        expiryTime: days(5),     // 120 hours / 5 days
        address: 'Hadapsar Industrial Estate', city: 'Pune', pincode: '411028',
        phone: '9855667788', notes: 'Bulk factory sealed snack boxes',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Dabur Organic Depot',
        donorType: 'Grocery Store', foodName: 'Pure Honey & Fruit Jam Jars (7 Days)',
        quantity: 90, foodType: 'Vegetarian',
        expiryTime: days(7),     // 168 hours / 7 days (1 week)
        address: 'Swargate Market', city: 'Pune', pincode: '411042',
        phone: '9866778899', notes: 'Sealed glass jars with long shelf life',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Healthy Greens Co.',
        donorType: 'Restaurant', foodName: 'Organic Salad Bowls (2 Days)',
        quantity: 25, foodType: 'Vegan',
        expiryTime: days(2),
        address: 'Kalyani Nagar, Hub 5', city: 'Pune', pincode: '411006',
        phone: '9877889900',
        status: 'claimed',
        claimedBy: ngo._id,
        claimedAt: ago(0.8),
      },

      // ── DELIVERED (rescued milestone) ──────────────
      {
        donor: donor._id, donorName: 'Skyline Banquet Hall',
        donorType: 'Banquet Hall', foodName: 'Wedding Feast Special Leftovers',
        quantity: 150, foodType: 'Mixed',
        expiryTime: ago(2),      // delivered
        address: 'Baner Road, Hall 2', city: 'Pune', pincode: '411045',
        phone: '9823456789', notes: 'Delivered to Shelter Home 4',
        status: 'delivered',
        claimedBy: ngo._id,
        claimedAt: ago(5),
        volunteer: volunteer._id,
        assignedAt: ago(4),
        deliveredAt: ago(3),
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
