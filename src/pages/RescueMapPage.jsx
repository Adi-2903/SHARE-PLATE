import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import RescueMap from '../components/RescueMap'

const S = { fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }

function SideNav({ active, user }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const navLinks = [
    { id: 'home', icon: 'home', label: 'Home', to: '/' },
    { id: 'board', icon: 'lunch_dining', label: 'Board', to: '/donations' },
    { id: 'map', icon: 'map', label: 'Rescue Map', to: '/map' },
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
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(188,202,192,0.3)', boxShadow: '1px 0 8px rgba(0,105,72,0.04)' }}>
        <div>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 px-3 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #006948, #00855d)' }}>
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div>
              <span className="block font-bold text-base tracking-tight" style={{ ...S, color: '#006948' }}>SharePlate</span>
              <span className="block text-xs text-[#6d7a72]">Food Rescue OS • Live Map</span>
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
                {l.id === 'map' && <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: '#006948' }}>MAP</span>}
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
            MAP
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

export default function RescueMapPage() {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/donations')
      .then(({ data }) => setDonations(data))
      .catch(() => toast.error('Failed to load map data'))
      .finally(() => setLoading(false))
  }, [])

  const getLevel = (d) => {
    const hrs = (new Date(d.expiryTime) - new Date()) / 3_600_000
    if (hrs < 0) return 'urgent'
    if (d.priority === 'urgent' || hrs < 4) return 'urgent'
    if (hrs < 8) return 'moderate'
    return 'safe'
  }

  const activeDonations = donations.filter(d => !['delivered', 'expired'].includes(d.status))

  const filtered = activeDonations.filter(d => {
    if (filter === 'all') return true
    return getLevel(d) === filter
  })

  const counts = {
    all: activeDonations.length,
    urgent: activeDonations.filter(d => getLevel(d) === 'urgent').length,
    moderate: activeDonations.filter(d => getLevel(d) === 'moderate').length,
    safe: activeDonations.filter(d => getLevel(d) === 'safe').length,
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#faf8ff', fontFamily: "'Inter', sans-serif" }}>
      <SideNav active="map" user={user} />

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-2"
              style={{ background: 'rgba(255,218,214,0.6)', borderColor: 'rgba(186,26,26,0.2)' }}>
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: '#ba1a1a' }} />
              <span className="text-xs font-bold" style={{ color: '#ba1a1a' }}>🔴 LIVE MAP</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#131b2e] tracking-tight" style={S}>
              Live Food Rescue Map
            </h1>
            <p className="text-[#3d4a42] mt-1 text-sm">Active surplus food pickup locations across the city — click any pin to see details.</p>
          </div>

          <Link to="/donations" className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #006948, #00855d)' }}>
            <span className="material-symbols-outlined text-base">grid_view</span>
            View Board List
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">location_on</span>
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-[#131b2e]">{counts.all}</span>
              <span className="text-xs text-[#64748b] font-medium">Active Pins</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">alarm</span>
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-red-600">{counts.urgent}</span>
              <span className="text-xs text-[#64748b] font-medium">Urgent (&lt;4h)</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">schedule</span>
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-amber-600">{counts.moderate}</span>
              <span className="text-xs text-[#64748b] font-medium">Moderate (4-8h)</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">eco</span>
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-[#006948]">{counts.safe}</span>
              <span className="text-xs text-[#64748b] font-medium">Safe (&gt;8h)</span>
            </div>
          </div>
        </div>

        {/* Map Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#131b2e] px-2">Filter by priority:</span>
            {[
              { key: 'all', label: 'All Pins', count: counts.all },
              { key: 'urgent', label: '🔴 Urgent Only', count: counts.urgent },
              { key: 'moderate', label: '🟡 Moderate Only', count: counts.moderate },
              { key: 'safe', label: '🟢 Safe Only', count: counts.safe },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === f.key ? 'bg-[#006948] text-white shadow-sm' : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'}`}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          <div className="text-xs text-[#64748b] font-medium px-2">
            Showing {filtered.length} active location{filtered.length !== 1 ? 's' : ''} on map
          </div>
        </div>

        {/* Full Interactive Map Container */}
        {loading ? (
          <div className="w-full h-[620px] rounded-2xl bg-white border flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl animate-spin text-[#006948]">refresh</span>
              <p className="text-sm text-[#64748b] mt-3 font-semibold">Loading map…</p>
            </div>
          </div>
        ) : (
          <RescueMap donations={filtered} user={user} height="620px" />
        )}
      </main>
    </div>
  )
}
