import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const S = { fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }

function SideNav({ user, active }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const links = [
    { id: 'home', icon: 'home', label: 'Home', to: '/' },
    { id: 'dashboard', icon: 'dashboard', label: 'NGO Hub', to: '/ngo' },
    { id: 'board', icon: 'lunch_dining', label: 'Board', to: '/donations' },
  ]
  if (user?.role === 'admin') {
    links.push({ id: 'admin', icon: 'admin_panel_settings', label: 'Admin', to: '/admin' })
  }
  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col justify-between py-6 px-4 z-40"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(188,202,192,0.3)' }}>
        <div>
          <Link to="/" className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: '#006948' }}>
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div>
              <span className="block font-extrabold text-base tracking-tight" style={{ ...S, color: '#006948' }}>SharePlate</span>
              <span className="block text-[11px] text-[#6d7a72]">Food Rescue OS • NGO Portal</span>
            </div>
          </Link>

          {/* NGO Profile Card */}
          <div className="p-3 rounded-xl border flex items-center gap-3 mb-4"
            style={{ background: 'rgba(242,243,255,0.8)', borderColor: 'rgba(188,202,192,0.4)' }}>
            <div className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: '#eaedff', border: '1px solid rgba(188,202,192,0.5)' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: '#006948' }}>apartment</span>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#006948' }}>
                <span className="material-symbols-outlined text-white" style={{ fontSize: '10px' }}>verified</span>
              </span>
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-[#131b2e] truncate">{user?.orgName || user?.firstName}</div>
              <span className="text-xs text-[#3d4a42]">Coordinator (NGO)</span>
            </div>
          </div>

          {/* Quick Claim */}
          <Link to="/donations" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-white text-sm font-bold mb-4 transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #006948, #00855d)' }}>
            <span className="material-symbols-outlined text-base">add_circle</span>
            Quick Claim
          </Link>

          <nav className="space-y-1">
            {links.map(l => (
              <Link key={l.id} to={l.to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                style={active === l.id ? { background: 'rgba(108,248,187,0.35)', color: '#00714d' } : { color: '#3d4a42' }}
                onMouseEnter={e => { if (active !== l.id) e.currentTarget.style.background = 'rgba(234,237,255,0.6)' }}
                onMouseLeave={e => { if (active !== l.id) e.currentTarget.style.background = 'transparent' }}>
                <span className="material-symbols-outlined text-xl">{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-[#3d4a42] hover:bg-red-50 hover:text-red-600 transition-all text-left">
          <span className="material-symbols-outlined text-xl">logout</span>
          Sign Out
        </button>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderColor: 'rgba(188,202,192,0.3)' }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: '#006948' }}>
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <span className="font-extrabold text-base tracking-tight" style={{ ...S, color: '#006948' }}>SharePlate</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#3d4a42] hidden sm:block truncate max-w-[120px]">{user?.orgName || user?.firstName}</span>
          <button onClick={handleLogout} className="p-2 rounded-full text-[#6d7a72] hover:bg-red-50 hover:text-red-500 transition-all">
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-around border-t"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderColor: 'rgba(188,202,192,0.3)' }}>
        {links.map(l => (
          <Link key={l.id} to={l.to}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[56px]"
            style={active === l.id ? { color: '#006948' } : { color: '#6d7a72' }}>
            <span className="material-symbols-outlined text-2xl" style={active === l.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{l.icon}</span>
            <span className="text-[10px] font-semibold">{l.label}</span>
          </Link>
        ))}
        <Link to="/donations"
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[56px]" style={{ color: '#006948' }}>
          <span className="material-symbols-outlined text-2xl">add_circle</span>
          <span className="text-[10px] font-semibold">Claim</span>
        </Link>
      </nav>
    </>
  )
}

const URGENCY_STYLE = {
  urgent: { label: 'URGENT', badgeCls: 'bg-red-100 text-red-700', timerCls: 'text-red-600', border: '#fca5a5' },
  moderate: { label: 'MODERATE', badgeCls: 'bg-amber-100 text-amber-700', timerCls: 'text-amber-600', border: '#fcd34d' },
  safe: { label: 'SAFE', badgeCls: 'bg-emerald-100 text-emerald-700', timerCls: 'text-emerald-600', border: '#6ee7b7' },
}

function getLevel(d) {
  const hrs = (new Date(d.expiryTime) - new Date()) / 3_600_000
  if (d.priority === 'urgent' || hrs < 4) return 'urgent'
  if (hrs < 8) return 'moderate'
  return 'safe'
}

export default function NGODashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('available')
  const [donations, setDonations] = useState([])
  const [stats, setStats] = useState({ totalClaimed: 0, mealsServed: 0, urgentRescued: 0, co2Saved: 0 })
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    setLoading(true)
    api.get('/donations').then(({ data }) => {
      setDonations(data)
      // Stats: count only donations claimed BY this NGO
      const myClaims = data.filter(d => {
        const claimedId = d.claimedBy?._id || d.claimedBy
        return claimedId && String(claimedId) === String(user?._id)
      })
      setStats({
        totalClaimed: myClaims.length,
        mealsServed: myClaims.reduce((a, d) => a + (Number(d.quantity) || 0), 0),
        urgentRescued: myClaims.filter(d => d.priority === 'urgent').length,
        co2Saved: Math.floor(myClaims.reduce((a, d) => a + (Number(d.quantity) || 0), 0) * 0.5),
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleClaim = async (id) => {
    try {
      await api.patch(`/donations/${id}/claim`)
      toast.success('🤝 Donation claimed! Volunteer being assigned.')
      fetchData()
    } catch (err) { toast.error(err.response?.data?.error || 'Claim failed') }
  }

  const available = donations.filter(d => d.status === 'available')
  // "My Claims" = donations this NGO specifically claimed
  const claimed = donations.filter(d => {
    const claimedId = d.claimedBy?._id || d.claimedBy
    return claimedId && String(claimedId) === String(user?._id)
  })

  const STAT_CARDS = [
    { icon: 'fact_check', label: 'Total Claimed', value: stats.totalClaimed, color: '#006948', bg: 'rgba(0,105,72,0.08)' },
    { icon: 'soup_kitchen', label: 'Meals Served', value: `${stats.mealsServed.toLocaleString()}+`, color: '#006948', bg: 'rgba(0,105,72,0.08)' },
    { icon: 'crisis_alert', label: 'Urgent Rescues', value: stats.urgentRescued, color: '#ba1a1a', bg: 'rgba(255,218,214,0.4)' },
    { icon: 'compost', label: 'CO₂ Saved (kg)', value: stats.co2Saved, color: '#825100', bg: 'rgba(255,221,184,0.4)' },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #faf8ff, #f5fbf7)', fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Ambient glows */}
      <div className="fixed top-0 left-64 right-0 h-80 pointer-events-none -z-10" style={{ background: 'linear-gradient(to bottom, rgba(133,248,196,0.15), transparent)' }} />
      <div className="fixed -bottom-32 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none -z-10" style={{ background: 'rgba(111,251,190,0.12)' }} />

      <SideNav user={user} active="dashboard" />

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: '#006948' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#006948' }}>NGO Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#131b2e] tracking-tight" style={S}>NGO Command Centre</h1>
            <p className="text-sm text-[#3d4a42] mt-1">Welcome, <strong>{user?.orgName || user?.firstName}</strong>! Here's today's rescue snapshot.</p>
          </div>
          <Link to="/donations"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-bold transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #006948, #00855d)', boxShadow: '0 8px 24px -4px rgba(0,105,72,0.3)' }}>
            <span className="material-symbols-outlined text-base">lunch_dining</span>
            Browse Food Board
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {STAT_CARDS.map((s, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 20px -4px rgba(0,105,72,0.05)' }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-4" style={{ background: s.bg }}>
                <span className="material-symbols-outlined text-2xl" style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div className="text-3xl font-extrabold tracking-tight" style={{ ...S, color: s.color }}>{s.value}</div>
              <div className="text-sm text-[#3d4a42] mt-1 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Donations section */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px -4px rgba(0,105,72,0.06)' }}>
          {/* Tabs */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex gap-2">
              {[
                { key: 'available', label: `Available (${available.length})` },
                { key: 'claimed', label: `My Claims (${claimed.length})` },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="px-5 py-2 rounded-full text-sm font-bold transition-all"
                  style={tab === t.key
                    ? { background: '#006948', color: '#fff' }
                    : { background: 'rgba(234,237,255,0.6)', color: '#3d4a42' }}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-[#6d7a72] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: '#ba1a1a' }} />
              Live feed
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl animate-spin" style={{ color: '#006948' }}>refresh</span>
              <p className="text-sm text-[#3d4a42] mt-3">Loading donations…</p>
            </div>
          ) : (tab === 'available' ? available : claimed).length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-[#bccac0]">lunch_dining</span>
              <p className="text-[#3d4a42] mt-3 text-sm">No {tab === 'available' ? 'available donations' : 'claims'} found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {(tab === 'available' ? available : claimed).map(d => {
                const level = getLevel(d)
                const u = URGENCY_STYLE[level] || URGENCY_STYLE.safe
                const hrs = (new Date(d.expiryTime) - new Date()) / 3_600_000
                return (
                  <div key={d._id} className="rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    style={{ background: 'rgba(255,255,255,0.82)', borderColor: u.border, boxShadow: level === 'urgent' ? '0 10px 24px -4px rgba(239,68,68,0.1)' : '0 8px 24px -4px rgba(0,105,72,0.05)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${u.badgeCls}`}>
                        {level === 'urgent' && <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-red-600" />}
                        {u.label}
                      </span>
                      <span className={`text-xs font-bold flex items-center gap-1 ${u.timerCls}`}>
                        <span className="material-symbols-outlined text-sm">timer</span>
                        {hrs > 0 ? `⏱ ${Math.floor(hrs)}h ${Math.round((hrs % 1) * 60)}m` : 'Expired'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#131b2e] mb-1" style={S}>{d.foodName}</h3>
                    <p className="text-sm font-semibold mb-3" style={{ color: '#006948' }}>{d.quantity} servings</p>
                    <div className="space-y-1.5 text-xs text-[#3d4a42] pb-3 border-b" style={{ borderColor: 'rgba(188,202,192,0.3)' }}>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#6d7a72]">storefront</span>{d.donorName}</div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#6d7a72]">pin_drop</span>{d.city}</div>
                    </div>
                    <div className="mt-3">
                      {tab === 'available' ? (
                        <button onClick={() => handleClaim(d._id)}
                          className="w-full py-2.5 rounded-full text-xs font-bold text-white transition-all hover:scale-[1.02]"
                          style={{ background: level === 'urgent' ? '#dc2626' : 'linear-gradient(135deg, #006948, #00855d)' }}>
                          Claim Donation →
                        </button>
                      ) : (
                        <div className="text-center text-xs font-semibold py-2 rounded-full"
                          style={{ background: 'rgba(108,248,187,0.2)', color: '#00714d', border: '1px solid rgba(0,113,77,0.2)' }}>
                          ✅ Claimed · {d.status === 'delivered' ? 'Delivered' : d.status === 'in_transit' ? '🚴 In Transit' : 'Awaiting volunteer'}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
