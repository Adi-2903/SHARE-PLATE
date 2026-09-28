import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

/* ── Count-up animation hook ──────────────────────────── */
function useCounter(target, duration = 2000, start = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    let t0 = null
    const tick = (ts) => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(tick)
      else setVal(target)
    }
    requestAnimationFrame(tick)
  }, [target, duration, start])
  return val
}

/* ── Data ──────────────────────────────────────────────── */
const STEPS = [
  {
    num: '01', icon: 'restaurant_menu', title: '1. Food Created',
    desc: 'Commercial kitchens, banquet halls, and university hostels log surplus freshly cooked batches in under 30 seconds.',
    badge: 'Batch & Weight Logging', badgeIcon: 'check_circle', color: 'primary',
  },
  {
    num: '02', icon: 'verified', title: '2. Check Expiry',
    desc: 'Smart expiry window, hygiene thresholds, and culinary temperature preservation are digitally certified.',
    badge: 'HACCP Standard Compliance', badgeIcon: 'thermostat', color: 'primary',
  },
  {
    num: '03', icon: 'radar', title: '3. Nearby NGOs',
    desc: 'Proprietary geo-matching pings certified community shelters, youth homes, and kitchens within a 5km radius.',
    badge: 'Hyper-local Radius Alerts', badgeIcon: 'near_me', color: 'primary',
  },
  {
    num: '04', icon: 'alarm', title: '4. Urgent Priority',
    desc: 'Critical food batches under 90 minutes get dynamic escalation badges and countdown trackers to prevent loss.',
    badge: 'Escalated Rescue Queue', badgeIcon: 'timer', color: 'amber',
  },
  {
    num: '05', icon: 'handshake', title: '5. NGO Claims',
    desc: 'Shelter accepts the batch with a secure single-click verification code and automatically logs receipt intake.',
    badge: 'Encrypted Token Handshake', badgeIcon: 'pin', color: 'primary',
  },
  {
    num: '06', icon: 'electric_moped', title: '6. Volunteer Delivers',
    desc: 'Fast, eco-friendly green transport connects the donor pickup dock straight to the warm community dining table.',
    badge: '100% Zero-Emission Delivery', badgeIcon: 'route', color: 'primary',
  },
]

const LIVE_CARDS = [
  {
    urgency: 'urgent', urgencyLabel: 'URGENT', timer: '38m left',
    title: 'Rajdhani Thali', qty: '200 meals ready',
    donor: 'Grand Sapphire Banquet', location: 'Sector 4 • 1.2 km away',
    note: 'Needs immediate pickup', noteIcon: 'crisis_alert',
    borderCls: 'border-red-300/60', timerCls: 'text-red-600',
    badgeCls: 'bg-red-100 text-red-700', btnCls: 'bg-red-600 hover:bg-red-700 text-white',
    glowCls: 'bg-red-200/30',
  },
  {
    urgency: 'moderate', urgencyLabel: 'MODERATE', timer: '2h 15m left',
    title: 'Artisan Sandwiches', qty: '50 meals ready',
    donor: 'GreenTable Cafe & Deli', location: 'Market Walk • 3.4 km away',
    note: 'Pre-packaged portions', noteIcon: 'inventory_2',
    borderCls: 'border-amber-300/50', timerCls: 'text-amber-600',
    badgeCls: 'bg-amber-100 text-amber-700', btnCls: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    glowCls: 'bg-amber-200/20',
  },
  {
    urgency: 'safe', urgencyLabel: 'SAFE', timer: '4h 10m left',
    title: 'Cooked Rice & Dal', qty: '120 meals ready',
    donor: 'Univ. South Campus Mess', location: 'Hall 3 • 0.8 km away',
    note: 'Warm insulated containers', noteIcon: 'soup_kitchen',
    borderCls: 'border-emerald-300/40', timerCls: 'text-emerald-600',
    badgeCls: 'bg-emerald-100 text-emerald-700', btnCls: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    glowCls: 'bg-emerald-200/20',
  },
  {
    urgency: 'safe', urgencyLabel: 'SAFE', timer: '5h 45m left',
    title: 'Fruits & Bakery', qty: '80 meals ready',
    donor: 'Organic Harvest Market', location: 'Green Plaza • 2.1 km away',
    note: 'Apples, bread loaves & buns', noteIcon: 'nutrition',
    borderCls: 'border-emerald-300/40', timerCls: 'text-emerald-600',
    badgeCls: 'bg-emerald-100 text-emerald-700', btnCls: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    glowCls: 'bg-emerald-200/20',
  },
]

const PARTNERS = [
  { icon: 'nature_people', name: 'FoodShare Alliance' },
  { icon: 'diversity_1', name: 'City Shelter Coalition' },
  { icon: 'hotel', name: 'Grand Heritage Hospitality' },
  { icon: 'school', name: 'Metro Campus Kitchens' },
]

/* ── Component ─────────────────────────────────────────── */
export default function Home() {
  const [statsStarted, setStatsStarted] = useState(false)
  const statsRef = useRef(null)
  const [apiStats, setApiStats] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All Dispatches')

  const [realDonations, setRealDonations] = useState([])

  useEffect(() => {
    api.get('/donations/stats').then(({ data }) => setApiStats(data)).catch(() => {})
    api.get('/donations').then(({ data }) => {
      if (Array.isArray(data) && data.length > 0) {
        setRealDonations(data.filter(d => d.status === 'available'))
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsStarted(true) }, { threshold: 0.2 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const meals = useCounter(apiStats?.mealsRescued || 12480, 2000, statsStarted)
  const ngos  = useCounter(apiStats?.activeNgos || 324, 2000, statsStarted)
  const co2   = useCounter(487, 2000, statsStarted)

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] overflow-x-hidden antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Google Material Symbols */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── AMBIENT GLOWS ── */}
      <div className="fixed top-0 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none -z-10" style={{ background: 'rgba(111,251,190,0.2)' }} />
      <div className="fixed top-1/3 right-0 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none -z-10" style={{ background: 'rgba(133,248,196,0.25)' }} />

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 max-w-7xl mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left column */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold backdrop-blur-md"
              style={{ background: 'rgba(234,237,255,0.7)', borderColor: 'rgba(188,202,192,0.4)', color: '#006948' }}>
              <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ background: '#006948' }} />
              🌱 Over 50,000kg Food Diverted from Landfills
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Rescue Food. <br />
              <span style={{ background: 'linear-gradient(135deg, #006948, #00855d, #006c4a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Feed Communities.
              </span> <br />
              Save the Planet.
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-[#3d4a42] max-w-xl leading-relaxed">
              SharePlate connects restaurants, hostels, and food providers with NGOs through a smart, real-time platform to rescue near-expiry food and reduce food waste.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <Link to="/donate"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-white text-sm font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #006948, #00855d)', boxShadow: '0 8px 24px -4px rgba(0,105,72,0.35)' }}>
                Donate Food Now
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
              </Link>
              <Link to="/donations"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(18px)', border: '1px solid rgba(0,105,72,0.3)', color: '#006948' }}>
                <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                Claim as NGO
              </Link>
            </div>

            {/* Social proof */}
            <div className="pt-2 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {['HK', 'GF', 'CS'].map((init, i) => (
                  <div key={i} className="inline-flex h-10 w-10 rounded-full ring-2 ring-white items-center justify-center text-xs font-bold"
                    style={{ background: i === 0 ? '#dae2fd' : i === 1 ? '#6cf8bb' : '#eaedff', color: '#006948' }}>
                    {init}
                  </div>
                ))}
                <div className="inline-flex h-10 w-10 rounded-full ring-2 ring-white items-center justify-center text-xs font-semibold text-white"
                  style={{ background: '#006948' }}>
                  +450
                </div>
              </div>
              <p className="text-sm text-[#3d4a42]">
                Trusted by <strong className="text-[#131b2e]">450+ catering partners</strong> &amp; community shelters
              </p>
            </div>
          </div>

          {/* Right column — food image card */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-none">
              {/* Glass image frame */}
              <div className="relative rounded-2xl overflow-hidden p-3 border shadow-2xl"
                style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(18px)', borderColor: 'rgba(255,255,255,0.95)' }}>
                <div className="relative w-full h-[240px] sm:h-[340px] lg:h-[420px] rounded-xl overflow-hidden">
                  {/* Food image */}
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA2VDzBRlrhP-1daSxRAi7YOIKvKYvC-17N4HEdXB576YNW1Rg83JwfCSDS2KEKcMTMTkgUcOw9pTHZLHhZ2RN1956k6JhL0FnuuMfZWvqmvN4DDkVncW5YVHTq3TKU6RT9pq-zTUwQoRhiTerK9Zj_nyR8D52tXbdoTgeBhdSxQxz9aMEz3Hpis-2Q6MXeIOfD_fO6P7nzdOvb4vJB5gOfjQE-9B1MJ03br87tvRTUe-nsS34LAdjldoroLtuzm0k8my3gfDLA6o"
                    alt="Fresh healthy grain salad bowl saved by SharePlate"
                    className="w-full h-full object-cover rounded-xl"
                    onError={e => { e.target.style.background = 'linear-gradient(135deg,#dcfce7,#bbf7d0)'; e.target.style.display = 'flex' }}
                  />
                  <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(to top, rgba(40,48,68,0.55), transparent)' }} />
                </div>

                {/* Floating top badge */}
                <div className="absolute top-7 left-7 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
                  style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)' }}>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#00855d' }} />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#006948' }} />
                  </span>
                  <span className="text-xs font-bold text-[#131b2e]">⚡ Real-time Dispatch: <strong>18 mins avg</strong></span>
                </div>

                {/* Floating bottom card */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl shadow-xl"
                  style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(108,248,187,0.4)', color: '#006c49' }}>
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#131b2e] leading-tight">Fresh Grain Bowls & Meals</h4>
                      <p className="text-xs text-[#3d4a42] mt-0.5">Rescued from West End Kitchen • 45 portions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Soft glow ring */}
              <div className="absolute -inset-4 rounded-2xl -z-10 blur-xl"
                style={{ background: 'linear-gradient(135deg, rgba(104,219,169,0.2), transparent)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ IMPACT STATS BAR ═════════════════════════════ */}
      <section ref={statsRef} className="max-w-7xl mx-auto px-6 lg:px-20 -mt-2 mb-20" id="impact">
        <div className="rounded-2xl p-6 lg:p-8 border shadow-lg"
          style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(18px)', borderColor: 'rgba(188,202,192,0.3)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {[
              { icon: 'skillet', value: `${meals.toLocaleString()}+`, label: 'Meals Rescued', sub: 'Redistributed to local care kitchens', color: '#006948' },
              { icon: 'volunteer_activism', value: ngos.toLocaleString(), label: 'Active NGOs & Shelters', sub: 'Verified on-demand partners', color: '#006c49' },
              { icon: 'compost', value: `${(co2 / 10).toFixed(1)} tons`, label: 'Carbon Saved (CO₂e)', sub: 'Measurable climate prevention', color: '#825100' },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-5 pt-4 md:pt-0 md:px-6 ${i > 0 ? 'border-t md:border-t-0 md:border-l' : ''}`}
                style={{ borderColor: 'rgba(188,202,192,0.3)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: i === 2 ? 'rgba(255,221,184,0.4)' : 'rgba(0,105,72,0.1)', color: s.color }}>
                  <span className="material-symbols-outlined text-3xl">{s.icon}</span>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: s.color }}>
                    {s.value}
                  </div>
                  <div className="text-base font-semibold text-[#131b2e] mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.label}</div>
                  <div className="text-xs text-[#3d4a42] mt-0.5">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Live ticker */}
          <div className="mt-6 pt-4 border-t flex flex-wrap items-center justify-between text-sm text-[#3d4a42] gap-2"
            style={{ borderColor: 'rgba(188,202,192,0.2)' }}>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full animate-ping" style={{ background: '#006948' }} />
              <span>Live feed updated 2 mins ago across 14 cities</span>
            </div>
            <Link to="/donations" className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: '#006948' }}>
              <span>View live donations board</span>
              <span className="material-symbols-outlined text-sm">north_east</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ 6-STEP HOW IT WORKS ══════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-20 py-16" id="how-it-works">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
            style={{ background: 'rgba(111,251,190,0.5)', color: '#006c49' }}>
            HOW IT WORKS
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#131b2e]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Seamless Food Rescue in 6 Simple Steps
          </h2>
          <p className="text-[#3d4a42] mt-3 text-base">
            Our automated dispatch loop guarantees food safety, instant notification, and trace-monitored zero-waste logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={i}
              className="rounded-2xl p-6 relative overflow-hidden border group cursor-default transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(18px)',
                borderColor: 'rgba(255,255,255,0.95)',
                boxShadow: '0 4px 20px -4px rgba(0,105,72,0.06)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 18px 36px -6px rgba(0,105,72,0.12)'; e.currentTarget.style.borderColor = 'rgba(104,219,169,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px -4px rgba(0,105,72,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.95)' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                  style={{ background: s.color === 'amber' ? '#825100' : '#006948' }}>
                  {s.num}
                </span>
                <span className="material-symbols-outlined text-2xl" style={{ color: s.color === 'amber' ? '#825100' : '#006948' }}>
                  {s.icon}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#131b2e] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.title}</h3>
              <p className="text-sm text-[#3d4a42] leading-relaxed">{s.desc}</p>
              <div className="mt-4 pt-3 border-t flex items-center gap-2 text-xs font-bold"
                style={{ borderColor: 'rgba(188,202,192,0.2)', color: s.color === 'amber' ? '#825100' : '#006948' }}>
                <span className="material-symbols-outlined text-sm">{s.badgeIcon}</span>
                <span>{s.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ LIVE FEED ════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-20 py-16" id="live-feed">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-2"
              style={{ background: 'rgba(255,218,214,0.6)', borderColor: 'rgba(186,26,26,0.2)' }}>
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: '#ba1a1a' }} />
              <span className="text-xs font-bold" style={{ color: '#ba1a1a' }}>🔴 LIVE RESCUE RADAR</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#131b2e]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Surplus Food Ready for Immediate Pickup
            </h2>
            <p className="text-[#3d4a42] mt-1 text-base">
              Real-time surplus batches posted by our certified commercial kitchens.
            </p>
          </div>
          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-[#3d4a42] mr-1 hidden sm:inline">Filter by:</span>
            {['All Dispatches', 'Urgent <1h', 'Within 3km'].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={activeFilter === f
                  ? { background: '#006948', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(18px)', border: '1px solid rgba(188,202,192,0.4)', color: '#3d4a42' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 4-col card grid */}
        {(() => {
          const cardsToDisplay = realDonations.length > 0 ? realDonations.slice(0, 4).map(d => {
            const diff = new Date(d.expiryTime) - new Date()
            const hrs = diff / 3_600_000
            const mins = Math.max(0, Math.floor((diff % 3_600_000) / 60_000))
            const isUrgent = d.priority === 'urgent' || hrs < 4
            const isMod = hrs >= 4 && hrs < 8

            return {
              id: d._id,
              urgency: isUrgent ? 'urgent' : isMod ? 'moderate' : 'safe',
              urgencyLabel: isUrgent ? 'URGENT' : isMod ? 'MODERATE' : 'SAFE',
              timer: hrs > 0 ? `${Math.floor(hrs)}h ${mins}m left` : 'Expired',
              title: d.foodName,
              qty: `${d.quantity} servings ready`,
              donor: d.donorName || 'Commercial Kitchen',
              location: `${d.city || 'Local'} • ${d.foodType || 'Vegetarian'}`,
              note: d.notes || 'HACCP Temperature Certified',
              noteIcon: isUrgent ? 'crisis_alert' : 'inventory_2',
              borderCls: isUrgent ? 'border-red-300/60' : isMod ? 'border-amber-300/50' : 'border-emerald-300/40',
              timerCls: isUrgent ? 'text-red-600' : isMod ? 'text-amber-600' : 'text-emerald-600',
              badgeCls: isUrgent ? 'bg-red-100 text-red-700' : isMod ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700',
              btnCls: isUrgent ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-700 hover:bg-emerald-800 text-white',
              glowCls: isUrgent ? 'bg-red-200/30' : isMod ? 'bg-amber-200/20' : 'bg-emerald-200/20',
            }
          }) : LIVE_CARDS

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cardsToDisplay.map((card, i) => (
                <div key={card.id || i}
                  className={`rounded-2xl p-5 flex flex-col justify-between border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${card.borderCls}`}
                  style={{
                    background: 'rgba(255,255,255,0.78)',
                    backdropFilter: 'blur(18px)',
                    boxShadow: '0 4px 20px -4px rgba(0,105,72,0.06)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 18px 36px -6px rgba(0,105,72,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px -4px rgba(0,105,72,0.06)'; }}>
                  {/* Ambient glow circle */}
                  <div className={`absolute -right-12 -top-12 w-28 h-28 rounded-full blur-xl pointer-events-none ${card.glowCls}`} />

                  <div>
                    {/* Badge + timer */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${card.badgeCls}`}>
                        {card.urgency === 'urgent' && (
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#ba1a1a' }} />
                        )}
                        {card.urgencyLabel}
                      </span>
                      <span className={`text-xs font-bold flex items-center gap-1 ${card.timerCls}`}>
                        <span className="material-symbols-outlined text-sm">timer</span>
                        ⏱ {card.timer}
                      </span>
                    </div>

                    {/* Title & qty */}
                    <h3 className="text-lg font-bold text-[#131b2e] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{card.title}</h3>
                    <p className="text-sm font-semibold mb-4" style={{ color: '#006948' }}>{card.qty}</p>

                    {/* Metadata */}
                    <div className="space-y-2 py-3 border-y text-sm text-[#3d4a42]"
                      style={{ borderColor: 'rgba(188,202,192,0.3)' }}>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-[#6d7a72]">storefront</span>
                        <span className="truncate font-medium text-[#131b2e]">{card.donor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-[#6d7a72]">pin_drop</span>
                        <span>{card.location}</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs font-semibold ${card.timerCls}`}>
                        <span className="material-symbols-outlined text-base">{card.noteIcon}</span>
                        <span className="truncate">{card.note}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-5">
                    <Link to="/donations"
                      className={`w-full py-3 px-4 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${card.btnCls}`}>
                      <span>Claim Donation</span>
                      <span className="material-symbols-outlined text-base">volunteer_activism</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </section>

      {/* ══ PARTNER TRUST STRIP ══════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-20 py-16" id="about">
        <div className="rounded-2xl p-8 lg:p-12 border text-center relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(18px)', borderColor: 'rgba(188,202,192,0.3)' }}>
          <span className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: '#006948' }}>
            Our Collaborative Network
          </span>
          <h3 className="text-2xl lg:text-3xl font-bold text-[#131b2e] max-w-2xl mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            "Turning excess into nourishment every single day."
          </h3>
          <p className="text-[#3d4a42] max-w-xl mx-auto mt-3 text-base">
            Partnered with world-class hospitality chains, regional universities, and civic kitchens to guarantee zero wholesome food enters landfills.
          </p>

          {/* Partner logos */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 lg:gap-10 opacity-75">
            {PARTNERS.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-[#131b2e] font-semibold text-base">
                <span className="material-symbols-outlined" style={{ color: '#006948' }}>{p.icon}</span>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EMAIL CTA SECTION ════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-20 pb-20" id="contact">
        <div className="rounded-2xl p-8 lg:p-14 text-white shadow-xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #006948, #00855d, #006c4a)' }}>
          {/* Background circle */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'rgba(108,248,187,0.2)' }} />

          <div className="max-w-2xl relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-4"
              style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <span className="material-symbols-outlined text-sm">notifications_active</span>
              <span>Stay in the loop</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Get Instant Alerts for Nearby Food Rescues
            </h2>
            <p className="mt-2 mb-8 text-base" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Are you a local community kitchen or registered volunteer shelter? Receive real-time push alerts whenever meals become available in your immediate zip code.
            </p>

            <form className="flex flex-col sm:flex-row gap-3 max-w-lg" onSubmit={e => e.preventDefault()}>
              <div className="relative flex-grow">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6d7a72]">mail</span>
                <input
                  type="email"
                  placeholder="Enter your shelter/organization email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-full text-[#131b2e] text-sm border-0 outline-none focus:ring-2"
                  style={{ background: '#faf8ff', focusRingColor: '#6ffbbe' }}
                />
              </div>
              <button type="submit"
                className="px-8 py-3.5 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
                style={{ background: '#6cf8bb', color: '#002113' }}>
                Notify My NGO
              </button>
            </form>

            <div className="mt-3 text-xs flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <span className="material-symbols-outlined text-sm">lock</span>
              <span>Instant SMS/Email alerts • Zero spam • Instant unsubscription anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════ */}
      <footer className="w-full border-t" style={{ background: '#eaedff', borderColor: 'rgba(188,202,192,0.3)' }}>
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-20 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b" style={{ borderColor: 'rgba(188,202,192,0.3)' }}>
            {/* Brand */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2 text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#006948' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: '#006948' }}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                </div>
                <span>SharePlate</span>
              </div>
              <p className="text-sm text-[#3d4a42] max-w-sm leading-relaxed">
                Cultivating abundance, eliminating waste. A unified infrastructure connecting surplus nutrition with humanitarian communities.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {['public', 'chat', 'share'].map(icon => (
                  <a key={icon} href="#" className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:text-[#006948]"
                    style={{ background: '#faf8ff', borderColor: 'rgba(188,202,192,0.4)', color: '#006948' }}>
                    <span className="material-symbols-outlined text-lg">{icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation columns */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="text-sm font-bold text-[#006948] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Initiative</h4>
                <ul className="space-y-2.5 text-sm text-[#3d4a42]">
                  {['Manifesto', 'Impact Report', 'NGO Network', 'Food Safety Standards'].map(l => (
                    <li key={l}><a href="#" className="hover:text-[#006948] transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#006948] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Partnerships</h4>
                <ul className="space-y-2.5 text-sm text-[#3d4a42]">
                  {['Partner Portal', 'Commercial Kitchens', 'Shelter Verification', 'Logistics Fleet'].map(l => (
                    <li key={l}><a href="#" className="hover:text-[#006948] transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <h4 className="text-sm font-bold text-[#006948] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Governance</h4>
                <ul className="space-y-2.5 text-sm text-[#3d4a42]">
                  {['Privacy Policy', 'Terms of Service', 'Carbon Methodology', 'Security Audit'].map(l => (
                    <li key={l}><a href="#" className="hover:text-[#006948] transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#3d4a42]">
            <p>© 2026 SharePlate Technologies Inc. All rights reserved. Cultivating abundance, eliminating waste.</p>
            <div className="flex items-center gap-4 text-xs">
              {['Privacy Policy', 'Terms', 'Accessibility'].map(l => (
                <a key={l} href="#" className="hover:text-[#006948] transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
