import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const S = { fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }

const URGENCY = {
  urgent: { label: 'URGENT', timerCls: 'text-red-600', badgeCls: 'bg-red-100 text-red-700', border: 'border-red-300/50' },
  moderate: { label: 'MODERATE', timerCls: 'text-amber-600', badgeCls: 'bg-amber-100 text-amber-700', border: 'border-amber-300/50' },
  safe: { label: 'SAFE', timerCls: 'text-emerald-600', badgeCls: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-300/50' },
  available: { label: 'AVAILABLE', timerCls: 'text-emerald-600', badgeCls: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-300/50' },
}

function Countdown({ expiryTime }) {
  const [text, setText] = useState('')
  const [level, setLevel] = useState('safe')
  useEffect(() => {
    const update = () => {
      const diff = new Date(expiryTime) - new Date()
      if (diff <= 0) { setText('Expired'); setLevel('urgent'); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      setText(`${h}h ${m}m left`)
      setLevel(diff < 4 * 3_600_000 ? (diff < 2 * 3_600_000 ? 'urgent' : 'moderate') : 'safe')
    }
    update()
    const t = setInterval(update, 60_000)
    return () => clearInterval(t)
  }, [expiryTime])
  const u = URGENCY[level]
  return (
    <div className="flex items-center gap-1">
      <span className="material-symbols-outlined text-sm" style={{ color: level === 'urgent' ? '#dc2626' : level === 'moderate' ? '#d97706' : '#059669' }}>timer</span>
      <span className={`text-xs font-bold ${u.timerCls}`}>⏱ {text}</span>
    </div>
  )
}

function SideNav({ active, user }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const navLinks = [
    { id: 'home', icon: 'home', label: 'Home', to: '/' },
    { id: 'board', icon: 'lunch_dining', label: 'Board', to: '/donations' },
    { id: 'donate', icon: 'volunteer_activism', label: 'Donate', to: '/donate' },
  ]
  if (user?.role === 'ngo') {
    navLinks.push({ id: 'ngo', icon: 'apartment', label: 'NGO', to: '/ngo' })
  }
  if (user?.role === 'volunteer') {
    navLinks.push({ id: 'volunteer', icon: 'directions_bike', label: 'Pickup', to: '/volunteer' })
  }
  if (user?.role === 'admin') {
    navLinks.push({ id: 'admin', icon: 'admin_panel_settings', label: 'Admin', to: '/admin' })
  }
  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col justify-between py-6 px-4 z-40"
        style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(188,202,192,0.3)', boxShadow: '1px 0 8px rgba(0,105,72,0.04)' }}>
        <div>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 px-3 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #006948, #00855d)' }}>
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div>
              <span className="block font-bold text-base tracking-tight" style={{ ...S, color: '#006948' }}>SharePlate</span>
              <span className="block text-xs text-[#6d7a72]">Food Rescue OS • Live Radar</span>
            </div>
          </Link>

          {/* User card */}
          {user && (
            <div className="p-3 rounded-xl border flex items-center gap-3 mb-5"
              style={{ background: 'rgba(242,243,255,0.8)', borderColor: 'rgba(188,202,192,0.4)' }}>
              <div className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: '#eaedff', border: '1px solid rgba(188,202,192,0.5)' }}>
                <span className="material-symbols-outlined text-2xl" style={{ color: '#006948' }}>
                  {user.role === 'donor' ? 'restaurant' : user.role === 'ngo' ? 'apartment' : user.role === 'volunteer' ? 'directions_bike' : 'admin_panel_settings'}
                </span>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: '#006948' }}>
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '10px' }}>verified</span>
                </span>
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-[#131b2e] truncate">{user?.orgName || `${user?.firstName} ${user?.lastName}`}</div>
                <span className="text-xs text-[#3d4a42] capitalize">{user?.role}</span>
              </div>
            </div>
          )}

          {/* Nav links */}
          <nav className="space-y-1">
            {navLinks.map(l => (
              <Link key={l.id} to={l.to}
                className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all"
                style={active === l.id
                  ? { background: 'rgba(108,248,187,0.4)', color: '#00714d' }
                  : { color: '#3d4a42' }}>
                <span className="material-symbols-outlined text-xl">{l.icon}</span>
                <span>{l.label}</span>
                {l.id === 'board' && <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: '#006948' }}>Live</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        {user ? (
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-[#3d4a42] transition-all hover:bg-red-50 hover:text-red-600 text-left">
            <span className="material-symbols-outlined text-xl">logout</span>
            Sign Out
          </button>
        ) : (
          <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-[#006948] transition-all hover:bg-emerald-50">
            <span className="material-symbols-outlined text-xl">login</span>
            Sign In
          </Link>
        )}
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderColor: 'rgba(188,202,192,0.3)' }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #006948, #00855d)' }}>
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <span className="font-bold text-base tracking-tight" style={{ ...S, color: '#006948' }}>SharePlate</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(255,218,214,0.6)', color: '#ba1a1a' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: '#ba1a1a' }} />
            LIVE
          </span>
          {user ? (
            <button onClick={handleLogout} className="p-2 rounded-full text-[#6d7a72] hover:bg-red-50 hover:text-red-500 transition-all">
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          ) : (
            <Link to="/login" className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: '#006948' }}>Sign In</Link>
          )}
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-around border-t"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderColor: 'rgba(188,202,192,0.3)' }}>
        {navLinks.slice(0, 4).map(l => (
          <Link key={l.id} to={l.to}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all min-w-[52px]"
            style={active === l.id ? { color: '#006948' } : { color: '#6d7a72' }}>
            <span className="material-symbols-outlined text-2xl" style={active === l.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{l.icon}</span>
            <span className="text-[10px] font-semibold">{l.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}

export default function DonationsBoard() {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchDonations = () => {
    setLoading(true)
    api.get('/donations').then(({ data }) => setDonations(data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }
  useEffect(() => { fetchDonations() }, [])

  const handleClaim = async (id) => {
    try {
      await api.patch(`/donations/${id}/claim`)
      toast.success('Food claimed! Volunteer assignment in progress. 🤝')
      fetchDonations()
    } catch (err) { toast.error(err.response?.data?.error || 'Claim failed') }
  }

  const getLevel = (d) => {
    const hrs = (new Date(d.expiryTime) - new Date()) / 3_600_000
    if (hrs < 0) return 'urgent'
    if (d.priority === 'urgent' || hrs < 4) return 'urgent'
    if (hrs < 8) return 'moderate'
    return 'safe'
  }

  const filtered = donations.filter(d => {
    const level = getLevel(d)
    const matchFilter = filter === 'all' || (filter === 'urgent' && level === 'urgent') || (filter === 'moderate' && level === 'moderate') || (filter === 'safe' && level === 'safe') || d.status === filter
    const matchSearch = !search || d.foodName?.toLowerCase().includes(search.toLowerCase()) || d.donorName?.toLowerCase().includes(search.toLowerCase()) || d.city?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    all: donations.length,
    urgent: donations.filter(d => getLevel(d) === 'urgent').length,
    moderate: donations.filter(d => getLevel(d) === 'moderate').length,
    safe: donations.filter(d => getLevel(d) === 'safe').length,
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #faf8ff, #f5fbf7, rgba(234,237,255,0.4))', fontFamily: "'Inter', sans-serif" }}>

      <SideNav active="board" user={user} />

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-2"
              style={{ background: 'rgba(255,218,214,0.6)', borderColor: 'rgba(186,26,26,0.2)' }}>
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: '#ba1a1a' }} />
              <span className="text-xs font-bold" style={{ color: '#ba1a1a' }}>🔴 LIVE RESCUE RADAR</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#131b2e] tracking-tight" style={S}>
              Surplus Food Ready for Pickup
            </h1>
            <p className="text-[#3d4a42] mt-1 text-sm">Real-time surplus batches posted by certified commercial kitchens.</p>
          </div>

          {/* Search */}
          <div className="flex gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7a72] text-lg">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search food, donor, city…"
                className="pl-10 pr-4 py-2.5 rounded-full text-sm text-[#131b2e] outline-none w-full sm:w-60"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(188,202,192,0.5)' }}
                onFocus={e => { e.target.style.borderColor = '#006948'; e.target.style.boxShadow = '0 0 0 3px rgba(0,105,72,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(188,202,192,0.5)'; e.target.style.boxShadow = 'none' }} />
            </div>
            {user?.role === 'donor' && (
              <Link to="/donate" className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #006948, #00855d)' }}>
                <span className="material-symbols-outlined text-base">add_circle</span>
                Donate Food
              </Link>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All Dispatches', count: counts.all },
            { key: 'urgent', label: '🔴 Urgent', count: counts.urgent },
            { key: 'moderate', label: '🟡 Moderate', count: counts.moderate },
            { key: 'safe', label: '🟢 Safe', count: counts.safe },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={filter === f.key
                ? { background: '#006948', color: '#fff' }
                : { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(188,202,192,0.4)', color: '#3d4a42' }}>
              {f.label} {f.count > 0 && <span className="ml-1 opacity-70">({f.count})</span>}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl animate-spin" style={{ color: '#006948' }}>refresh</span>
              <p className="text-sm text-[#3d4a42] mt-3">Loading live rescues…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-5xl text-[#bccac0]">lunch_dining</span>
            <p className="text-[#3d4a42] mt-3">No donations found. {user?.role === 'donor' && <Link to="/donate" className="font-semibold hover:underline" style={{ color: '#006948' }}>Be the first to donate!</Link>}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {filtered.map(d => {
              const level = getLevel(d)
              const u = URGENCY[level] || URGENCY.safe
              const hrs = (new Date(d.expiryTime) - new Date()) / 3_600_000
              return (
                <div key={d._id}
                  className={`rounded-2xl p-5 flex flex-col justify-between border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${u.border}`}
                  style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)', boxShadow: level === 'urgent' ? '0 10px 30px -6px rgba(239,68,68,0.12)' : '0 12px 30px -6px rgba(0,105,72,0.06)' }}>
                  {level === 'urgent' && <div className="absolute -right-12 -top-12 w-28 h-28 rounded-full blur-xl pointer-events-none" style={{ background: 'rgba(255,218,214,0.4)' }} />}

                  <div>
                    {/* Urgency badge + timer */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${u.badgeCls}`}>
                        {level === 'urgent' && <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-red-600" />}
                        {u.label}
                      </span>
                      {d.expiryTime && <Countdown expiryTime={d.expiryTime} />}
                    </div>

                    <h3 className="text-lg font-bold text-[#131b2e] mb-1" style={S}>{d.foodName}</h3>
                    <p className="text-sm font-semibold mb-4" style={{ color: '#006948' }}>{d.quantity} servings ready</p>

                    {/* Meta */}
                    <div className="space-y-2 py-3 border-y text-sm text-[#3d4a42]" style={{ borderColor: 'rgba(188,202,192,0.3)' }}>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-[#6d7a72]">storefront</span>
                        <span className="truncate font-medium text-[#131b2e]">{d.donorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-[#6d7a72]">pin_drop</span>
                        <span>{d.city} {d.foodType && `• ${d.foodType}`}</span>
                      </div>
                      {d.phone && (
                        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#006948' }}>
                          <span className="material-symbols-outlined text-base">call</span>
                          <span>{d.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-5">
                    {d.status === 'available' && user?.role === 'ngo' ? (
                      <button onClick={() => handleClaim(d._id)}
                        className="w-full py-3 px-4 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={level === 'urgent'
                          ? { background: '#dc2626' }
                          : { background: 'linear-gradient(135deg, #006948, #00855d)' }}>
                        Claim Donation
                        <span className="material-symbols-outlined text-base">volunteer_activism</span>
                      </button>
                    ) : d.status === 'claimed' ? (
                      <div className="w-full py-2.5 px-4 rounded-full text-xs font-semibold text-center" style={{ background: 'rgba(108,248,187,0.2)', border: '1px solid rgba(0,113,77,0.2)', color: '#00714d' }}>
                        ✅ Claimed — Volunteer en route
                      </div>
                    ) : d.status === 'in_transit' ? (
                      <div className="w-full py-2.5 px-4 rounded-full text-xs font-semibold text-center" style={{ background: 'rgba(255,221,184,0.3)', border: '1px solid rgba(130,81,0,0.2)', color: '#825100' }}>
                        🚴 Volunteer delivering
                      </div>
                    ) : d.status === 'delivered' ? (
                      <div className="w-full py-2.5 px-4 rounded-full text-xs font-semibold text-center" style={{ background: 'rgba(234,237,255,0.6)', border: '1px solid rgba(188,202,192,0.4)', color: '#3d4a42' }}>
                        📦 Delivered successfully
                      </div>
                    ) : user ? (
                      <div className="w-full py-2.5 px-4 rounded-full text-xs font-semibold text-center"
                        style={{ background: 'rgba(234,237,255,0.6)', border: '1px solid rgba(188,202,192,0.4)', color: '#6d7a72' }}>
                        {user.role === 'donor' ? '🎁 You\'re a donor — NGOs will claim your food' : '🚴 NGOs claim, volunteers deliver'}
                      </div>
                    ) : (
                      <Link to="/login"
                        className="block w-full py-3 px-4 rounded-full text-sm font-bold text-center transition-all hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, #006948, #00855d)', color: '#fff' }}>
                        Login as NGO to Claim →
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
