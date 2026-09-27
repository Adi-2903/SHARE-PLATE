import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

// Counter animation hook
function useCounter(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const animate = (ts) => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.floor(eased * target))
      if (p < 1) requestAnimationFrame(animate)
      else setVal(target)
    }
    requestAnimationFrame(animate)
  }, [target, duration, start])
  return val
}

const FLOW_STEPS = [
  { icon: '🍱', num: '01', title: 'Food Donated',      desc: 'Donor lists near-expiry food with expiry time & location.' },
  { icon: '⏱️', num: '02', title: 'Expiry Check',      desc: 'System flags food expiring < 4h as URGENT priority.' },
  { icon: '📍', num: '03', title: 'NGO Ranking',       desc: 'Nearby NGOs ranked by proximity, capacity & urgency.' },
  { icon: '🤝', num: '04', title: 'NGO Claims',        desc: 'NGO confirms acceptance, triggering volunteer phase.' },
  { icon: '🚴', num: '05', title: 'Volunteer Pickup',  desc: 'Nearest volunteer assigned for live pickup & delivery.' },
  { icon: '📊', num: '06', title: 'Admin Tracks',      desc: 'Real-time dashboard shows rescued meals & CO₂ saved.' },
]

const ROLES = [
  { icon: '🏪', role: 'Donor',     desc: 'Restaurants, hostels & cafeterias donate surplus food in seconds.', features: ['Quick donation form', 'Expiry countdown tracking', 'Donation history', 'Impact certificate'], to: '/donate', featured: false },
  { icon: '🏥', role: 'NGO',       desc: 'Verified NGOs receive priority alerts and claim food batches.', features: ['Priority notifications', 'One-click claiming', 'Volunteer coordination', 'Beneficiary reports'], to: '/ngo', featured: true },
  { icon: '🚴', role: 'Volunteer', desc: 'Community volunteers pickup food and deliver to NGOs.', features: ['Nearby pickup alerts', 'Route information', 'Completion badges', 'City leaderboard'], to: '/volunteer', featured: false },
  { icon: '🛡️', role: 'Admin',     desc: 'Administrators monitor all activity, verify users & track impact.', features: ['Full analytics', 'User management', 'Donation lifecycle', 'Report generation'], to: '/admin', featured: false },
]

const LIVE_FEED = [
  { donor: 'Spice Garden Restaurant', food: '🍛 Dal Makhani + Roti', qty: '40 servings', location: 'Sector 12', status: 'urgent',    time: '2m ago' },
  { donor: 'Green Valley Hostel',     food: '🥗 Mixed Veg Meals',    qty: '25 servings', location: 'MG Road',   status: 'available', time: '5m ago' },
  { donor: 'Hotel Samrat',            food: '🍚 Biryani (Veg)',       qty: '50 servings', location: 'Civil Lines',status: 'urgent',    time: '8m ago' },
  { donor: 'Mumbai Dabba Co.',        food: '🍱 Lunch Boxes',         qty: '60 boxes',    location: 'Andheri',   status: 'claimed',   time: '12m ago' },
  { donor: 'BITS College Canteen',    food: '🥙 Wraps & Snacks',      qty: '80 units',    location: 'Pilani',    status: 'available', time: '18m ago' },
  { donor: 'Sunrise Cafeteria',       food: '🥪 Sandwiches',          qty: '30 units',    location: 'Camp Area', status: 'claimed',   time: '25m ago' },
]

export default function Home() {
  const [statsStarted, setStatsStarted] = useState(false)
  const statsRef = useRef(null)
  const [apiStats, setApiStats] = useState(null)

  // Try to fetch real stats
  useEffect(() => {
    api.get('/donations/stats').then(({ data }) => setApiStats(data)).catch(() => {})
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsStarted(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const meals     = useCounter(apiStats?.mealsRescued || 12480, 1800, statsStarted)
  const ngos      = useCounter(apiStats ? 347 : 347, 1800, statsStarted)
  const vols      = useCounter(89, 1800, statsStarted)
  const co2       = useCounter(6200, 1800, statsStarted)

  const statusColor = { urgent: 'text-red-400 bg-red-950/40 border-red-900/40', available: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40', claimed: 'text-blue-400 bg-blue-950/40 border-blue-900/40' }
  const statusLabel = { urgent: '🔴 URGENT', available: '🟢 Available', claimed: '✅ Claimed' }

  return (
    <div className="overflow-x-hidden">

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-16">
        {/* Background orbs */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[100px] animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-orange-500/15 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-sm font-semibold mb-8 font-outfit">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-blink inline-block" />
          🌱 Fighting Food Waste Together
        </div>

        <h1 className="font-outfit font-black text-5xl md:text-7xl leading-tight mb-6">
          Rescue Food.<br />
          <span className="gradient-text">Feed Communities.</span><br />
          Save the Planet.
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          SharePlate connects restaurants, hostels &amp; cafeterias with nearby NGOs and volunteers
          to rescue near-expiry food before it's wasted — powered by smart priority matching.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Link to="/donate"
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-outfit font-bold text-lg rounded-2xl transition-all animate-pulse-glow hover:scale-105">
            🍱 Donate Food Now
          </Link>
          <Link to="/donations"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-outfit font-bold text-lg rounded-2xl border border-white/15 hover:border-white/30 transition-all hover:scale-105">
            🤝 Claim as NGO
          </Link>
        </div>

        {/* Live Stats */}
        <div ref={statsRef}
          className="flex flex-wrap justify-center gap-0 glass-card rounded-2xl px-4 py-5 max-w-2xl w-full">
          {[
            { val: meals.toLocaleString(),  label: 'Meals Rescued' },
            { val: ngos,                     label: 'NGOs Onboarded' },
            { val: vols,                     label: 'Active Volunteers' },
            { val: `${co2.toLocaleString()}kg`, label: 'CO₂ Saved' },
          ].map((s, i, arr) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center px-6 py-2 min-w-[100px]">
                <span className="font-outfit font-black text-2xl text-emerald-400">{s.val}</span>
                <span className="text-gray-500 text-xs mt-1">{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className="w-px h-10 bg-emerald-900/50" />}
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-sm font-outfit font-semibold mb-4">🔄 The Process</span>
            <h2 className="font-outfit font-black text-4xl md:text-5xl mb-4">How <span className="gradient-text">SharePlate</span> Works</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">A fully automated rescue pipeline — from donation to delivery</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {FLOW_STEPS.map((step, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 text-center hover:border-emerald-700/50 transition-all hover:-translate-y-1 group relative">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{step.icon}</div>
                <div className="absolute top-3 right-3 text-[10px] font-outfit font-black text-emerald-600">{step.num}</div>
                <h3 className="font-outfit font-bold text-sm text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROLES ─── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-sm font-outfit font-semibold mb-4">👥 Who Uses SharePlate</span>
            <h2 className="font-outfit font-black text-4xl md:text-5xl">Built for <span className="gradient-text">Every Role</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map((r) => (
              <div key={r.role} className={`glass-card rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden hover:-translate-y-2 transition-all hover:border-emerald-700/50 ${r.featured ? 'border-emerald-600/50 shadow-lg shadow-emerald-900/30' : ''}`}>
                {r.featured && <div className="absolute top-4 right-4 text-[10px] font-outfit font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">Most Active</div>}
                <div className="text-4xl">{r.icon}</div>
                <h3 className="font-outfit font-bold text-xl text-white">{r.role}</h3>
                <p className="text-gray-400 text-sm flex-1">{r.desc}</p>
                <ul className="space-y-2">
                  {r.features.map(f => <li key={f} className="text-emerald-400 text-sm">✓ {f}</li>)}
                </ul>
                <Link to={r.to} className="mt-2 text-center py-2.5 rounded-xl border border-emerald-800/50 text-emerald-400 text-sm font-outfit font-bold hover:bg-emerald-900/30 transition-all">
                  {r.featured ? 'NGO Portal →' : `${r.role} Portal →`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE FEED ─── */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 text-sm font-outfit font-semibold mb-4 animate-pulse">🔴 LIVE</span>
            <h2 className="font-outfit font-black text-4xl md:text-5xl mb-4">Live <span className="gradient-text">Rescue Feed</span></h2>
            <p className="text-gray-500">Real-time food donations happening right now</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {LIVE_FEED.map((item, i) => (
              <div key={i} className={`glass-card rounded-xl p-5 hover:border-emerald-700/40 transition-all slide-in ${item.status === 'urgent' ? 'urgent-row' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-outfit font-bold text-sm text-white">{item.donor}</span>
                  <span className={`text-[10px] font-outfit font-bold px-2 py-0.5 rounded-full border ${statusColor[item.status]}`}>{statusLabel[item.status]}</span>
                </div>
                <div className="text-emerald-300 text-sm mb-3">{item.food}</div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>📍 {item.location} • {item.qty}</span>
                  <span>⏰ {item.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/donations" className="inline-block px-8 py-3 border border-emerald-800/50 text-emerald-400 font-outfit font-bold rounded-xl hover:bg-emerald-900/20 transition-all">
              View All Donations →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center glass-card rounded-3xl p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-orange-900/10 pointer-events-none" />
          <h2 className="font-outfit font-black text-4xl md:text-5xl mb-4 relative">Ready to Make a Difference?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto relative">Join thousands of restaurants, NGOs, and volunteers fighting food waste with SharePlate.</p>
          <div className="flex flex-wrap gap-4 justify-center relative">
            <Link to="/register" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-outfit font-bold text-lg rounded-2xl transition-all hover:scale-105">
              Get Started Free
            </Link>
            <Link to="/donations" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-outfit font-bold text-lg rounded-2xl border border-white/15 transition-all">
              Browse Donations
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-900/30 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-outfit font-black text-xl">Share<span className="text-emerald-400">Plate</span></div>
          <p className="text-gray-500 text-sm">© 2026 SharePlate — Made with 💚 to fight food waste | Full Stack Innovative Project</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/donations" className="hover:text-emerald-400">Donations</Link>
            <Link to="/register"  className="hover:text-emerald-400">Register</Link>
            <Link to="/login"     className="hover:text-emerald-400">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
