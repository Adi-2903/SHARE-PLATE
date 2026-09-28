import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const S = { fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }

function SideNav({ active, user }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const links = [
    { id: 'home', icon: 'home', label: 'Home Page', to: '/' },
    { id: 'overview', icon: 'dashboard', label: 'Overview', to: '/admin' },
    { id: 'board', icon: 'lunch_dining', label: 'Food Board', to: '/donations' },
    { id: 'donate', icon: 'volunteer_activism', label: 'Donate Page', to: '/donate' },
    { id: 'ngo', icon: 'apartment', label: 'NGO Portal', to: '/ngo' },
    { id: 'volunteer', icon: 'electric_moped', label: 'Volunteer Hub', to: '/volunteer' },
  ]
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col justify-between p-6 z-40"
      style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(188,202,192,0.3)', boxShadow: '1px 0 8px rgba(0,105,72,0.04)' }}>
      <div className="flex flex-col gap-5">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md" style={{ background: '#006948' }}>
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <div>
            <span className="block font-extrabold text-base tracking-tight" style={{ ...S, color: '#006948' }}>SharePlate</span>
            <span className="block text-[11px] text-[#6d7a72]">Admin Console</span>
          </div>
        </Link>

        {/* Admin chip */}
        <div className="rounded-2xl p-3 border flex items-center gap-3" style={{ background: 'rgba(242,243,255,0.8)', borderColor: 'rgba(188,202,192,0.4)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: '#eaedff', border: '2px solid rgba(104,219,169,0.4)' }}>
            <span className="material-symbols-outlined text-2xl" style={{ color: '#006948' }}>admin_panel_settings</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-[#131b2e] truncate">{user?.firstName || 'Admin'} {user?.lastName}</p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#85f8c4', color: '#002114' }}>Superadmin</span>
            </div>
            <p className="text-xs text-[#6d7a72] truncate">System Admin Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1.5 mt-1">
          {links.map(l => (
            <Link key={l.id} to={l.to}
              className="flex items-center justify-between px-4 py-3 rounded-full text-sm font-semibold transition-all"
              style={active === l.id
                ? { background: 'rgba(108,248,187,0.4)', color: '#00714d' }
                : { color: '#3d4a42' }}
              onMouseEnter={e => { if (active !== l.id) e.currentTarget.style.background = 'rgba(242,243,255,0.6)' }}
              onMouseLeave={e => { if (active !== l.id) e.currentTarget.style.background = 'transparent' }}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl" style={active === l.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{l.icon}</span>
                <span>{l.label}</span>
              </div>
              {active === l.id && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#006948' }} />}
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

const STATUS_STYLE = {
  available: { label: 'Available', bg: 'rgba(108,248,187,0.2)', color: '#00714d', border: 'rgba(0,113,77,0.2)' },
  claimed: { label: 'Claimed', bg: 'rgba(234,237,255,0.5)', color: '#006948', border: 'rgba(0,105,72,0.2)' },
  in_transit: { label: 'In Transit', bg: 'rgba(255,221,184,0.3)', color: '#825100', border: 'rgba(130,81,0,0.2)' },
  delivered: { label: 'Delivered', bg: 'rgba(218,226,253,0.4)', color: '#3d4a42', border: 'rgba(188,202,192,0.4)' },
  expired: { label: 'Expired', bg: 'rgba(255,218,214,0.3)', color: '#ba1a1a', border: 'rgba(186,26,26,0.2)' },
}

function StatCard({ icon, label, value, sub, color = '#006948', bg = 'rgba(0,105,72,0.08)', trend }) {
  return (
    <div className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 20px -4px rgba(0,105,72,0.05)' }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: bg }}>
        <span className="material-symbols-outlined text-2xl" style={{ color }}>{icon}</span>
      </div>
      <div className="text-3xl font-extrabold tracking-tight" style={{ ...S, color }}>{value}</div>
      <div className="text-sm font-semibold text-[#131b2e] mt-1">{label}</div>
      {sub && <div className="text-xs text-[#6d7a72] mt-0.5">{sub}</div>}
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold" style={{ color: '#006948' }}>
          <span className="material-symbols-outlined text-sm">trending_up</span>
          {trend}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ total: 0, delivered: 0, active: 0, expired: 0, meals: 0, donors: 0, ngos: 0, volunteers: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('donations')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [dRes, uRes] = await Promise.all([api.get('/donations'), api.get('/admin/users')])
      const d = dRes.data, u = uRes.data
      setDonations(d)
      setUsers(u)
      setStats({
        total: d.length,
        delivered: d.filter(x => x.status === 'delivered').length,
        active: d.filter(x => ['available','claimed','in_transit'].includes(x.status)).length,
        expired: d.filter(x => x.status === 'expired').length,
        meals: d.reduce((a, x) => a + (Number(x.quantity) || 0), 0),
        donors: u.filter(x => x.role === 'donor').length,
        ngos: u.filter(x => x.role === 'ngo').length,
        volunteers: u.filter(x => x.role === 'volunteer').length,
      })
    } catch { toast.error('Failed to load admin data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this donation?')) return
    try {
      await api.delete(`/donations/${id}`)
      toast.success('Donation removed.')
      fetchAll()
    } catch { toast.error('Delete failed') }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/donations/${id}/status`, { status })
      toast.success(`Status updated to ${status}`)
      fetchAll()
    } catch { toast.error('Update failed') }
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user account?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('User deleted.')
      fetchAll()
    } catch { toast.error('Failed') }
  }

  const filteredDonations = donations.filter(d => {
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    const matchSearch = !search || d.foodName?.toLowerCase().includes(search.toLowerCase()) || d.donorName?.toLowerCase().includes(search.toLowerCase()) || d.city?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const filteredUsers = users.filter(u => !search || `${u.firstName} ${u.lastName} ${u.email} ${u.orgName}`.toLowerCase().includes(search.toLowerCase()))

  const DONATION_STATS = [
    { icon: 'volunteer_activism', label: 'Total Donations', value: stats.total, sub: 'All time', trend: '+12% this week' },
    { icon: 'verified', label: 'Delivered', value: stats.delivered, sub: 'Successfully rescued', color: '#006948', bg: 'rgba(108,248,187,0.25)', trend: '' },
    { icon: 'pending_actions', label: 'Active Now', value: stats.active, sub: 'In progress', color: '#825100', bg: 'rgba(255,221,184,0.4)' },
    { icon: 'soup_kitchen', label: 'Meals Rescued', value: `${stats.meals.toLocaleString()}+`, sub: 'Total servings', trend: '🌍 Impact' },
  ]

  const USER_STATS = [
    { icon: 'restaurant', label: 'Donors', value: stats.donors, color: '#006948', bg: 'rgba(0,105,72,0.08)' },
    { icon: 'apartment', label: 'NGOs', value: stats.ngos, color: '#006948', bg: 'rgba(0,105,72,0.08)' },
    { icon: 'electric_moped', label: 'Volunteers', value: stats.volunteers, color: '#825100', bg: 'rgba(255,221,184,0.4)' },
    { icon: 'people', label: 'Total Users', value: users.length, color: '#006948', bg: 'rgba(108,248,187,0.25)' },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: '#faf8ff', fontFamily: "'Inter', sans-serif" }}>

      <SideNav active="overview" user={user} />

      <main className="flex-1 ml-0 lg:ml-64 pt-4 lg:pt-8 pb-20 lg:pb-0 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#006948' }}>Admin Console</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#85f8c4', color: '#002114' }}>Superadmin</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#131b2e] tracking-tight" style={S}>Operations Overview</h1>
            <p className="text-sm text-[#3d4a42] mt-1">Real-time control panel for all food rescue operations.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-[#6d7a72] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: '#006948' }} />
              Live · Updated just now
            </div>
            <button onClick={fetchAll} className="flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-all hover:bg-gray-50"
              style={{ borderColor: 'rgba(188,202,192,0.5)', color: '#3d4a42' }}>
              <span className="material-symbols-outlined text-base">refresh</span>
              Refresh
            </button>
          </div>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {(activeTab === 'users' ? USER_STATS : DONATION_STATS).map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {[
            { key: 'donations', icon: 'volunteer_activism', label: 'Donations' },
            { key: 'users', icon: 'group', label: 'Users' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
              style={activeTab === t.key
                ? { background: '#006948', color: '#fff' }
                : { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(188,202,192,0.4)', color: '#3d4a42' }}>
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}

          {/* Search + filter */}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7a72] text-base">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="pl-9 pr-4 py-2 rounded-full text-sm outline-none w-52"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(188,202,192,0.4)', color: '#131b2e' }}
                onFocus={e => { e.target.style.borderColor = '#006948' }} onBlur={e => { e.target.style.borderColor = 'rgba(188,202,192,0.4)' }} />
            </div>
            {activeTab === 'donations' && (
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-full text-sm font-semibold outline-none cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(188,202,192,0.4)', color: '#3d4a42' }}>
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="claimed">Claimed</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="expired">Expired</option>
              </select>
            )}
          </div>
        </div>

        {/* ── DONATIONS TABLE ── */}
        {activeTab === 'donations' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px -4px rgba(0,105,72,0.06)' }}>
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <span className="material-symbols-outlined text-5xl animate-spin" style={{ color: '#006948' }}>refresh</span>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-5xl text-[#bccac0]">lunch_dining</span>
                <p className="text-sm text-[#3d4a42] mt-3">No donations match your filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'rgba(234,237,255,0.5)', borderBottom: '1px solid rgba(188,202,192,0.3)' }}>
                      {['Food Item', 'Donor', 'City', 'Qty', 'Expiry', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#6d7a72]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map((d, i) => {
                      const ss = STATUS_STYLE[d.status] || STATUS_STYLE.available
                      return (
                        <tr key={d._id}
                          style={{ borderBottom: '1px solid rgba(188,202,192,0.2)', background: i % 2 === 0 ? 'transparent' : 'rgba(242,243,255,0.3)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,248,187,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(242,243,255,0.3)'}>
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-[#131b2e]" style={S}>{d.foodName}</div>
                            <div className="text-xs text-[#6d7a72]">{d.foodType}</div>
                          </td>
                          <td className="px-5 py-3.5 text-[#3d4a42]">{d.donorName}</td>
                          <td className="px-5 py-3.5 text-[#3d4a42]">{d.city}</td>
                          <td className="px-5 py-3.5 font-semibold text-[#131b2e]">{d.quantity}</td>
                          <td className="px-5 py-3.5 text-xs text-[#6d7a72]">
                            {d.expiryTime ? new Date(d.expiryTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-3 py-1 rounded-full text-xs font-bold"
                              style={{ background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color }}>
                              {ss.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <select value={d.status}
                                onChange={e => handleStatusUpdate(d._id, e.target.value)}
                                className="text-xs px-3 py-1.5 rounded-full outline-none cursor-pointer"
                                style={{ background: 'rgba(234,237,255,0.7)', border: '1px solid rgba(188,202,192,0.4)', color: '#3d4a42' }}>
                                {Object.keys(STATUS_STYLE).map(s => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
                              </select>
                              <button onClick={() => handleDelete(d._id)}
                                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                title="Delete">
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t text-xs text-[#6d7a72] flex justify-between items-center" style={{ borderColor: 'rgba(188,202,192,0.3)' }}>
                  <span>Showing {filteredDonations.length} of {donations.length} total donations</span>
                  <span>SharePlate Admin Console</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── USERS TABLE ── */}
        {activeTab === 'users' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px -4px rgba(0,105,72,0.06)' }}>
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <span className="material-symbols-outlined text-5xl animate-spin" style={{ color: '#006948' }}>refresh</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'rgba(234,237,255,0.5)', borderBottom: '1px solid rgba(188,202,192,0.3)' }}>
                      {['User', 'Email', 'Phone', 'City', 'Role', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#6d7a72]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, i) => {
                      const roleStyle = {
                        admin: { bg: '#85f8c4', color: '#002114' },
                        donor: { bg: 'rgba(0,105,72,0.12)', color: '#006948' },
                        ngo: { bg: 'rgba(234,237,255,0.8)', color: '#3d4a42' },
                        volunteer: { bg: 'rgba(255,221,184,0.5)', color: '#825100' },
                      }[u.role] || { bg: '#eaedff', color: '#3d4a42' }
                      return (
                        <tr key={u._id}
                          style={{ borderBottom: '1px solid rgba(188,202,192,0.2)', background: i % 2 === 0 ? 'transparent' : 'rgba(242,243,255,0.3)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,248,187,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(242,243,255,0.3)'}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ background: 'linear-gradient(135deg, #006948, #00855d)' }}>
                                {u.firstName?.[0]}{u.lastName?.[0]}
                              </div>
                              <div>
                                <div className="font-bold text-[#131b2e]" style={S}>{u.firstName} {u.lastName}</div>
                                {u.orgName && <div className="text-xs text-[#6d7a72]">{u.orgName}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-[#3d4a42]">{u.email}</td>
                          <td className="px-5 py-3.5 text-[#3d4a42]">{u.phone || '—'}</td>
                          <td className="px-5 py-3.5 text-[#3d4a42]">{u.city || '—'}</td>
                          <td className="px-5 py-3.5">
                            <span className="px-3 py-1 rounded-full text-xs font-bold capitalize"
                              style={{ background: roleStyle.bg, color: roleStyle.color }}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-[#6d7a72]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            {u.role !== 'admin' && (
                              <button onClick={() => handleDeleteUser(u._id)}
                                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                title="Delete user">
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t text-xs text-[#6d7a72] flex justify-between items-center" style={{ borderColor: 'rgba(188,202,192,0.3)' }}>
                  <span>{filteredUsers.length} users</span>
                  <span>SharePlate Admin Console</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
