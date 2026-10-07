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
// ── Demo Users ────────────────────────────────────────
const USERS = [
  {
    firstName: 'Admin', lastName: 'User',
    email: 'admin@demo.com', password: 'demo1234',
    phone: '9000000001', role: 'admin',
    orgName: 'SharePlate HQ', city: 'Mumbai', pincode: '400001',
  },
  {
    firstName: 'Rohan', lastName: 'Kumar',
    email: 'donor@demo.com', password: 'demo1234',
    phone: '9000000002', role: 'donor',
    orgName: 'The Grand Bhagwati Banquets', city: 'Ahmedabad', pincode: '380054',
  },
  {
    firstName: 'Sarthi', lastName: 'Foundation',
    email: 'ngo@demo.com', password: 'demo1234',
    phone: '9000000003', role: 'ngo',
    orgName: 'Sarthi Foundation Ahmedabad', city: 'Ahmedabad', pincode: '380015',
  },
  {
    firstName: 'Aman', lastName: 'Patel',
    email: 'volunteer@demo.com', password: 'demo1234',
    phone: '9000000004', role: 'volunteer',
    city: 'Ahmedabad', pincode: '380015',
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

    // ── Sample Donations (Lean, Fast, Balanced across Cities) ──
    const donationsData = [
      // ════ AHMEDABAD (Local Highlights) ════
      {
        donor: donor._id, donorName: 'The Grand Bhagwati Banquets',
        donorType: 'Banquet Hall', foodName: 'Royal Gujarati Wedding Feast',
        quantity: 120, foodType: 'Vegetarian',
        expiryTime: hrs(1.8),    // urgent (< 4hrs)
        address: 'SG Highway, Near Bodakdev', city: 'Ahmedabad', pincode: '380054',
        phone: '9879012345', notes: 'Sealed buffet containers: Paneer Makhani, Gujarati Dal, Naan, Gulab Jamun',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Das Khaman & Farsan House',
        donorType: 'Café', foodName: 'Fresh Surati Khaman, Dhokla & Sev',
        quantity: 55, foodType: 'Vegan',
        expiryTime: hrs(2.8),    // urgent (< 4hrs)
        address: 'CG Road, Navrangpura', city: 'Ahmedabad', pincode: '380009',
        phone: '9825112233', notes: 'Fresh morning farsan in hygienic paper boxes with chutney pouches',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Iscon Thaal Restaurant',
        donorType: 'Restaurant', foodName: 'Kathiyawadi & Gujarati Thali Boxes',
        quantity: 45, foodType: 'Vegetarian',
        expiryTime: hrs(5.0),    // moderate (4–8hrs)
        address: 'SG Highway, Satellite Crossroad', city: 'Ahmedabad', pincode: '380015',
        phone: '9898223344', notes: 'Complete lunch thali sets (Undhiyu, Rotli, Dal-Bhat)',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Atithi Dining Hall',
        donorType: 'Restaurant', foodName: 'Gujarati Kadhi, Khichdi & Rotla',
        quantity: 40, foodType: 'Vegetarian',
        expiryTime: hrs(6.0),    // moderate (4–8hrs)
        address: 'Judges Bungalow Road, Bodakdev', city: 'Ahmedabad', pincode: '380054',
        phone: '9712556677',
        status: 'claimed',
        claimedBy: ngo._id,
        claimedAt: ago(0.5),
      },
      {
        donor: donor._id, donorName: 'Gwalbhog Banquets',
        donorType: 'Banquet Hall', foodName: 'Royal Khichdi, Dal Baati & Sweets',
        quantity: 50, foodType: 'Vegetarian',
        expiryTime: hrs(18.0),   // safe (> 8hrs)
        address: 'Sindhu Bhavan Road (SBR)', city: 'Ahmedabad', pincode: '380059',
        phone: '9824334455', notes: 'Dry farsan & packed sweets with long shelf life',
        status: 'available',
      },

      // ════ PUNE ════
      {
        donor: donor._id, donorName: 'Spice Garden Restaurant',
        donorType: 'Restaurant', foodName: 'Dal Makhani + Fresh Roti',
        quantity: 40, foodType: 'Vegetarian',
        expiryTime: hrs(2.0),    // urgent (< 4hrs)
        address: '12, Sector 12, Camp', city: 'Pune', pincode: '411001',
        phone: '9876543210', notes: 'Freshly cooked meal boxes',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Royal Kitchens',
        donorType: 'Restaurant', foodName: 'Paneer Butter Masala & Jeera Rice',
        quantity: 35, foodType: 'Vegetarian',
        expiryTime: hrs(3.5),    // urgent (< 4hrs)
        address: 'Viman Nagar, Lane 3', city: 'Pune', pincode: '411014',
        phone: '9844556677',
        status: 'in_transit',
        claimedBy: ngo._id,
        claimedAt: ago(1),
        volunteer: volunteer._id,
        assignedAt: ago(0.5),
      },
      {
        donor: donor._id, donorName: 'North Flavors Diner',
        donorType: 'Restaurant', foodName: 'Rajma Chawal + Fresh Salad',
        quantity: 45, foodType: 'Vegetarian',
        expiryTime: hrs(6.5),    // moderate (4–8hrs)
        address: 'Kothrud, Paud Road', city: 'Pune', pincode: '411038',
        phone: '9766554433',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Skyline Banquet Hall',
        donorType: 'Banquet Hall', foodName: 'Wedding Feast Special Leftovers',
        quantity: 150, foodType: 'Mixed',
        expiryTime: ago(2),      // delivered milestone
        address: 'Baner Road, Hall 2', city: 'Pune', pincode: '411045',
        phone: '9823456789', notes: 'Delivered to Community Shelter 4',
        status: 'delivered',
        claimedBy: ngo._id,
        claimedAt: ago(5),
        volunteer: volunteer._id,
        assignedAt: ago(4),
        deliveredAt: ago(3),
      },

      // ════ MUMBAI ════
      {
        donor: donor._id, donorName: 'Mumbai Dabba Co.',
        donorType: 'Catering Service', foodName: 'Executive Meal Boxes (Veg/Non-Veg)',
        quantity: 35, foodType: 'Mixed',
        expiryTime: hrs(2.2),    // urgent (< 4hrs)
        address: 'Andheri East, Plot 4', city: 'Mumbai', pincode: '400069',
        phone: '9712345678',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Taj Banquet Catering',
        donorType: 'Hotel', foodName: 'Gourmet North Indian & Continental Dinner',
        quantity: 45, foodType: 'Vegetarian',
        expiryTime: hrs(5.5),    // moderate (4–8hrs)
        address: 'Colaba, Near Gateway', city: 'Mumbai', pincode: '400001',
        phone: '9899001122',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'Heritage Grains Merchant',
        donorType: 'Grocery Store', foodName: 'Bulk Basmati Rice & Dal Sacks (3 Days)',
        quantity: 180, foodType: 'Vegan',
        expiryTime: days(3),     // safe (multi-day)
        address: 'APMC Market, Gate 2', city: 'Mumbai', pincode: '400705',
        phone: '9733221100', notes: 'Unopened 10kg grain bags in sealed condition',
        status: 'available',
      },

      // ════ DELHI NCR ════
      {
        donor: donor._id, donorName: 'Cyber Hub Cafeteria',
        donorType: 'Cafeteria', foodName: 'Organic Grain Bowls & Wraps',
        quantity: 40, foodType: 'Vegan',
        expiryTime: hrs(6.0),    // moderate (4–8hrs)
        address: 'DLF Cyber City, Sector 24', city: 'Delhi', pincode: '122002',
        phone: '9811223344',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'FarmFresh Co-op',
        donorType: 'Grocery Store', foodName: 'Fresh Farm Apples & Oranges (1 Day)',
        quantity: 80, foodType: 'Fruits & Produce',
        expiryTime: days(1),     // safe (24 hours)
        address: 'Azad Market, Block C', city: 'Delhi', pincode: '110006',
        phone: '9811998877',
        status: 'available',
      },

      // ════ BENGALURU & PILANI ════
      {
        donor: donor._id, donorName: 'Daily Breads Bakery',
        donorType: 'Bakery', foodName: 'Artisanal Sourdough & Sandwich Buns',
        quantity: 50, foodType: 'Bakery',
        expiryTime: hrs(18.0),   // safe (> 8hrs)
        address: '100ft Road, Indiranagar', city: 'Bangalore', pincode: '560038',
        phone: '9741234567',
        status: 'available',
      },
      {
        donor: donor._id, donorName: 'BITS College Dining Hall',
        donorType: 'Cafeteria', foodName: 'Nutritious Student Mess Dinner Surplus',
        quantity: 70, foodType: 'Vegetarian',
        expiryTime: hrs(12.0),   // safe (> 8hrs)
        address: 'BITS Campus, Pilani', city: 'Pilani', pincode: '333031',
        phone: '9634567890',
        status: 'available',
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
