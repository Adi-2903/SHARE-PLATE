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
    { id: 'home', icon: 'home', label: 'Home Page', to: '/' },
    { id: 'dashboard', icon: 'electric_moped', label: 'Volunteer Hub', to: '/volunteer' },
    { id: 'board', icon: 'lunch_dining', label: 'Food Board', to: '/donations' },
  ]
  if (user?.role === 'admin') {
    links.push({ id: 'admin', icon: 'admin_panel_settings', label: 'Admin Console', to: '/admin' })
  }
  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col justify-between py-6 px-4 z-40"
      style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(188,202,192,0.3)' }}>
      <div>
        <Link to="/" className="flex items-center gap-3 px-3 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,105,72,0.1)' }}>
            <span className="material-symbols-outlined text-2xl" style={{ color: '#006948' }}>eco</span>
          </div>
          <div>
            <span className="block font-bold text-base tracking-tight" style={{ ...S, color: '#006948' }}>SharePlate</span>
            <span className="block text-[11px] text-[#6d7a72]">Eco-Rescue Hub</span>
          </div>
        </Link>

        {/* Volunteer mini badge */}
        <div className="rounded-xl border p-3 mb-5 flex items-center gap-3"
          style={{ background: 'rgba(242,243,255,0.7)', borderColor: 'rgba(188,202,192,0.3)' }}>
          <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0" style={{ background: '#eaedff', border: '2px solid rgba(0,105,72,0.2)' }}>
            <span className="material-symbols-outlined text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: '#006948' }}>directions_bike</span>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ background: '#006948' }} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#131b2e]">{user?.firstName} {user?.lastName}</h4>
            <span className="text-xs font-semibold" style={{ color: '#006948' }}>Volunteer • Level 1</span>
          </div>
        </div>

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
      <button onClick={() => { logout(); navigate('/') }} className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-[#3d4a42] hover:bg-red-50 hover:text-red-600 transition-all text-left">
        <span className="material-symbols-outlined text-xl">logout</span>
        Sign Out
      </button>
    </aside>
  )
}

const BADGES = [
  { icon: 'emoji_events', label: 'First Rescue', desc: 'Completed your first delivery', earned: true, color: '#825100', bg: 'rgba(255,221,184,0.4)' },
  { icon: 'local_fire_department', label: '5-Day Streak', desc: 'Active 5 days in a row', earned: true, color: '#dc2626', bg: 'rgba(255,218,214,0.4)' },
  { icon: 'electric_moped', label: 'Speed Runner', desc: 'Sub-30min delivery', earned: false, color: '#006948', bg: 'rgba(234,237,255,0.5)' },
  { icon: 'spa', label: 'Zero Waste Hero', desc: '100+ meals rescued', earned: false, color: '#006948', bg: 'rgba(234,237,255,0.5)' },
]

export default function VolunteerDashboard() {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [myDeliveries, setMyDeliveries] = useState([])
  const [stats, setStats] = useState({ totalDeliveries: 0, mealsDelivered: 0, kmRidden: 0, co2Saved: 0 })
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    setLoading(true)
    api.get('/donations').then(({ data }) => {
      setDonations(data)
      // Active: claimed/in_transit donations assigned to THIS volunteer
      const myActive = data.filter(d => {
        const volId = d.volunteer?._id || d.volunteer
        return (d.status === 'claimed' || d.status === 'in_transit') && volId && String(volId) === String(user?._id)
      })
      // Delivered: completed by this volunteer
      const myDelivered = data.filter(d => {
        const volId = d.volunteer?._id || d.volunteer
        return d.status === 'delivered' && volId && String(volId) === String(user?._id)
      })
      setMyDeliveries(myActive)
      const total = myDelivered.length
      const meals = myDelivered.reduce((a, d) => a + (Number(d.quantity) || 0), 0)
      setStats({ totalDeliveries: total, mealsDelivered: meals, kmRidden: Math.floor(total * 3.4), co2Saved: Math.floor(meals * 0.5) })
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handlePickup = async (id) => {
    try {
      await api.patch(`/donations/${id}/transit`)
      toast.success('📍 Pickup confirmed! Navigate to the donor location.')
      fetchData()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const handleDeliver = async (id) => {
    try {
      await api.patch(`/donations/${id}/deliver`)
      toast.success('✅ Delivery marked as complete! Amazing work 🌱')
      fetchData()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const available = donations.filter(d => d.status === 'available').slice(0, 4)

  const STAT_CARDS = [
    { icon: 'electric_moped', label: 'Deliveries Done', value: stats.totalDeliveries, color: '#006948', bg: 'rgba(0,105,72,0.08)' },
    { icon: 'soup_kitchen', label: 'Meals Delivered', value: `${stats.mealsDelivered}+`, color: '#006948', bg: 'rgba(0,105,72,0.08)' },
    { icon: 'route', label: 'Km Ridden', value: `${stats.kmRidden} km`, color: '#825100', bg: 'rgba(255,221,184,0.4)' },
    { icon: 'compost', label: 'CO₂ Saved (kg)', value: stats.co2Saved, color: '#006948', bg: 'rgba(108,248,187,0.3)' },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: '#faf8ff', fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Ambient glows */}
      <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -z-10" style={{ background: 'rgba(78,222,163,0.15)' }} />
      <div className="fixed bottom-[-10%] right-[5%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none -z-10" style={{ background: 'rgba(133,248,196,0.15)' }} />

      <SideNav user={user} active="dashboard" />

      <main className="flex-1 ml-64 p-8 overflow-x-hidden">
        {/* Greeting bar */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-sm text-[#3d4a42]">Good to see you,</p>
            <h1 className="text-3xl font-extrabold text-[#131b2e] tracking-tight" style={S}>{user?.firstName} {user?.lastName} 👋</h1>
            <p className="text-sm text-[#3d4a42] mt-1">You're making a real difference. Here's your volunteer snapshot.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold"
            style={{ background: 'rgba(108,248,187,0.2)', borderColor: 'rgba(0,108,73,0.2)', color: '#00714d' }}>
            <span className="w-2 h-2 rounded-full animate-ping" style={{ background: '#006948' }} />
            Available for pickup
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {STAT_CARDS.map((s, i) => (
            <div key={i} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 20px -4px rgba(0,105,72,0.05)' }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center mb-4" style={{ background: s.bg }}>
                <span className="material-symbols-outlined text-2xl" style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div className="text-3xl font-extrabold text-[#131b2e] tracking-tight" style={S}>{s.value}</div>
              <div className="text-sm text-[#3d4a42] font-semibold mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Active deliveries */}
          <div className="xl:col-span-2 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px -4px rgba(0,105,72,0.06)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#131b2e]" style={S}>🚴 Active Deliveries</h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(108,248,187,0.3)', color: '#00714d' }}>
                {myDeliveries.length} active
              </span>
            </div>

            {myDeliveries.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-[#bccac0]">electric_moped</span>
                <p className="text-sm text-[#3d4a42] mt-3">No active deliveries right now.</p>
                <Link to="/donations" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: '#006948' }}>
                  Browse the food board →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myDeliveries.map(d => {
                  const hrs = (new Date(d.expiryTime) - new Date()) / 3_600_000
                  const isTransit = d.status === 'in_transit'
                  return (
                    <div key={d._id} className="rounded-2xl p-5 border transition-all hover:-translate-y-0.5"
                      style={{ background: isTransit ? 'rgba(255,221,184,0.2)' : 'rgba(108,248,187,0.1)', borderColor: isTransit ? 'rgba(130,81,0,0.2)' : 'rgba(0,108,73,0.2)', boxShadow: '0 4px 16px -4px rgba(0,105,72,0.08)' }}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-bold text-[#131b2e]" style={S}>{d.foodName}</h3>
                          <p className="text-sm text-[#3d4a42]">{d.quantity} servings • {d.donorName}</p>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full"
                          style={isTransit
                            ? { background: 'rgba(255,221,184,0.5)', color: '#825100' }
                            : { background: 'rgba(108,248,187,0.4)', color: '#00714d' }}>
                          {isTransit ? '🚴 In Transit' : '✅ Claimed'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#3d4a42] mb-4">
                        <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-[#6d7a72]">pin_drop</span>{d.city}</div>
                        <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-[#6d7a72]">timer</span>
                          {hrs > 0 ? `${Math.floor(hrs)}h ${Math.round((hrs % 1) * 60)}m left` : 'Urgent!'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isTransit && (
                          <button onClick={() => handlePickup(d._id)}
                            className="flex-1 py-2.5 rounded-full text-xs font-bold text-white transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #006948, #00855d)' }}>
                            📍 Confirm Pickup
                          </button>
                        )}
                        {isTransit && (
                          <button onClick={() => handleDeliver(d._id)}
                            className="flex-1 py-2.5 rounded-full text-xs font-bold text-white transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #006948, #00855d)' }}>
                            ✅ Mark as Delivered
                          </button>
                        )}
                        {d.phone && (
                          <a href={`tel:${d.phone}`} className="px-4 py-2.5 rounded-full text-xs font-bold border transition-all hover:bg-gray-50"
                            style={{ borderColor: 'rgba(188,202,192,0.5)', color: '#3d4a42' }}>
                            <span className="material-symbols-outlined text-sm">call</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Available to pick up */}
            {available.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#131b2e]" style={S}>📦 Available Nearby</h3>
                  <Link to="/donations" className="text-xs font-semibold hover:underline" style={{ color: '#006948' }}>View all →</Link>
                </div>
                <div className="space-y-3">
                  {available.map(d => (
                    <div key={d._id} className="flex items-center justify-between p-3 rounded-xl border"
                      style={{ background: 'rgba(242,243,255,0.6)', borderColor: 'rgba(188,202,192,0.3)' }}>
                      <div>
                        <div className="text-sm font-bold text-[#131b2e]">{d.foodName}</div>
                        <div className="text-xs text-[#3d4a42]">{d.quantity} servings • {d.city}</div>
                      </div>
                      <Link to="/donations" className="text-xs font-bold px-4 py-1.5 rounded-full text-white"
                        style={{ background: '#006948' }}>
                        Pickup
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — badges + leaderboard */}
          <div className="space-y-5">
            {/* Eco Badges */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)' }}>
              <h3 className="text-base font-bold text-[#131b2e] mb-4" style={S}>🏅 Eco Badges</h3>
              <div className="grid grid-cols-2 gap-3">
                {BADGES.map((b, i) => (
                  <div key={i} className={`rounded-xl p-3 text-center transition-all ${b.earned ? '' : 'opacity-40 grayscale'}`}
                    style={{ background: b.earned ? b.bg : 'rgba(234,237,255,0.4)', border: `1px solid ${b.earned ? 'rgba(188,202,192,0.4)' : 'rgba(188,202,192,0.2)'}` }}>
                    <span className="material-symbols-outlined text-2xl mb-1" style={{ color: b.color, fontVariationSettings: b.earned ? "'FILL' 1" : "'FILL' 0" }}>{b.icon}</span>
                    <div className="text-[11px] font-bold text-[#131b2e]">{b.label}</div>
                    <div className="text-[10px] text-[#6d7a72] mt-0.5">{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational card */}
            <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #006948, #00855d)', boxShadow: '0 8px 24px -4px rgba(0,105,72,0.3)' }}>
              <span className="material-symbols-outlined text-3xl mb-2 block" style={{ color: '#85f8c4', fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
              <div className="text-2xl font-extrabold" style={S}>{stats.mealsDelivered || 0}</div>
              <div className="text-sm text-white/80 mt-0.5">Meals Delivered Total</div>
              <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/75">
                🌍 {stats.co2Saved || 0} kg CO₂ saved by your rides
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
