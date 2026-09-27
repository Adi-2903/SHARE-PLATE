import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

// Bar chart component
function BarChart({ data, labels, color = 'emerald' }) {
  const max = Math.max(...data, 1)
  const colors = { emerald: 'from-emerald-800 to-emerald-400', orange: 'from-orange-800 to-orange-400' }
  return (
    <div className="flex items-end gap-2 h-36 pb-1">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[9px] font-outfit text-gray-500">{v}</span>
          <div className="w-full rounded-t-md bg-gradient-to-t" style={{ height: `${(v / max) * 100}%`, background: `linear-gradient(to top, var(--tw-gradient-stops))` }}>
            <div className={`w-full h-full rounded-t-md bg-gradient-to-t ${colors[color]}`} />
          </div>
          <span className="text-[9px] text-gray-600">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null)
  const [donations, setDonations] = useState([])
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [{ data: s }, { data: d }, { data: u }] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/donations'),
        api.get('/admin/users'),
      ])
      setStats(s)
      setDonations(d)
      setUsers(u)
    } catch (err) {
      toast.error('Failed to load admin data: ' + (err.response?.data?.error || err.message))
    }
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this donation from the platform?')) return
    try {
      await api.delete(`/admin/donations/${id}`)
      toast.success('Donation removed.')
      fetchAll()
    } catch { toast.error('Delete failed.') }
  }

  const barData   = [320, 480, 390, 610, 540, 720, stats?.mealsRescued ? Math.min(stats.mealsRescued, 900) : 580]
  const barLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const STATUS_CLS = {
    available:  'text-emerald-400 bg-emerald-950/40 border-emerald-900/30',
    urgent:     'text-red-400 bg-red-950/40 border-red-900/30',
    claimed:    'text-blue-400 bg-blue-950/40 border-blue-900/30',
    in_transit: 'text-orange-400 bg-orange-950/40 border-orange-900/30',
    delivered:  'text-purple-400 bg-purple-950/40 border-purple-900/30',
    expired:    'text-gray-400 bg-gray-900/40 border-gray-700/30',
  }

  const SIDEBAR = [
    { id: 'overview',  icon: '📊', label: 'Overview' },
    { id: 'donations', icon: '🍱', label: 'Donations' },
    { id: 'users',     icon: '👥', label: 'Users' },
  ]

  return (
    <div className="flex min-h-screen pt-[70px]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-emerald-900/30 bg-[#0a1510] sticky top-[70px] h-[calc(100vh-70px)] overflow-y-auto p-4 flex flex-col gap-1">
        <div className="text-[10px] font-outfit font-black text-gray-600 uppercase tracking-widest px-3 py-2">Admin Panel</div>
        {SIDEBAR.map(s => (
          <button key={s.id} onClick={() => setActiveTab(s.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-outfit font-semibold transition-all w-full text-left ${activeTab === s.id ? 'bg-emerald-900/30 text-emerald-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
        <div className="h-px bg-emerald-900/20 my-2" />
        <button onClick={fetchAll} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-outfit font-semibold text-gray-500 hover:text-emerald-400 hover:bg-white/5 transition-all w-full text-left">
          🔄 Refresh Data
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 px-8 py-8 overflow-x-hidden">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="font-outfit font-black text-3xl">
              {activeTab === 'overview' ? '📊 Dashboard Overview' : activeTab === 'donations' ? '🍱 All Donations' : '👥 All Users'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">🕐 {new Date().toLocaleString()}</p>
          </div>
          <button onClick={fetchAll} className="px-4 py-2 border border-emerald-900/30 rounded-xl text-emerald-400 text-sm font-outfit font-semibold hover:bg-emerald-950/30 transition-all">
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-24 text-emerald-400 animate-pulse font-outfit text-lg">Loading admin data…</div>
        ) : (
          <>
            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <>
                {/* Stats grid */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                  {[
                    { icon: '🍽️', label: 'Meals Rescued',     val: stats?.mealsRescued?.toLocaleString() || 0, cls: 'text-emerald-400' },
                    { icon: '⚡', label: 'Urgent Now',         val: stats?.urgent || 0,                         cls: 'text-red-400' },
                    { icon: '🏥', label: 'NGOs Registered',   val: stats?.totalNGOs || 0,                      cls: 'text-blue-400' },
                    { icon: '🚴', label: 'Volunteers',         val: stats?.totalVols || 0,                      cls: 'text-purple-400' },
                    { icon: '📋', label: 'Total Donations',   val: stats?.totalDonations || 0,                 cls: 'text-orange-400' },
                    { icon: '✅', label: 'Delivered',          val: stats?.delivered || 0,                      cls: 'text-emerald-400' },
                    { icon: '🚚', label: 'In Transit',         val: stats?.inTransit || 0,                      cls: 'text-orange-400' },
                    { icon: '👤', label: 'Total Users',        val: stats?.totalUsers || 0,                     cls: 'text-gray-300' },
                  ].map(s => (
                    <div key={s.label} className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-all">
                      <div className="text-2xl w-10">{s.icon}</div>
                      <div>
                        <div className={`font-outfit font-black text-2xl ${s.cls}`}>{s.val}</div>
                        <div className="text-gray-500 text-xs">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="font-outfit font-bold text-sm text-white mb-4">📊 Meals Rescued – Last 7 Days (Demo)</h3>
                    <BarChart data={barData} labels={barLabels} color="emerald" />
                  </div>

                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="font-outfit font-bold text-sm text-white mb-5">🥧 Donation Status Breakdown</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Delivered', pct: stats?.totalDonations ? Math.round((stats.delivered / stats.totalDonations) * 100) : 58, cls: 'bg-emerald-500' },
                        { label: 'Claimed / In Transit', pct: stats?.totalDonations ? Math.round(((stats.claimed + stats.inTransit) / stats.totalDonations) * 100) : 22, cls: 'bg-blue-500' },
                        { label: 'Available', pct: stats?.totalDonations ? Math.round(((stats.totalDonations - stats.delivered - stats.claimed - stats.inTransit - stats.expired) / stats.totalDonations) * 100) : 14, cls: 'bg-orange-500' },
                        { label: 'Expired', pct: stats?.totalDonations ? Math.round((stats.expired / stats.totalDonations) * 100) : 6, cls: 'bg-red-600' },
                      ].map(s => (
                        <div key={s.label}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-gray-400">{s.label}</span>
                            <span className="font-outfit font-bold text-white">{s.pct}%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${s.cls} transition-all duration-700`} style={{ width: `${s.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Donations table preview */}
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="flex justify-between items-center p-5 border-b border-emerald-900/20">
                    <h3 className="font-outfit font-bold text-sm text-white">📋 Recent Activity</h3>
                    <button onClick={() => setActiveTab('donations')} className="text-xs text-emerald-400 hover:underline font-outfit font-semibold">View All →</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-emerald-900/20 text-gray-500 text-xs">
                          <th className="text-left py-3 px-4 font-outfit">Donor</th>
                          <th className="text-left py-3 px-4 font-outfit">Food</th>
                          <th className="text-left py-3 px-4 font-outfit">Qty</th>
                          <th className="text-left py-3 px-4 font-outfit">NGO</th>
                          <th className="text-left py-3 px-4 font-outfit">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donations.slice(0, 5).map(d => (
                          <tr key={d._id} className="border-b border-emerald-900/10 hover:bg-emerald-950/20 transition-colors">
                            <td className="py-3 px-4 font-semibold text-white text-xs">{d.donorName}</td>
                            <td className="py-3 px-4 text-gray-400 text-xs">{d.foodName}</td>
                            <td className="py-3 px-4 text-gray-400 text-xs">{d.quantity}</td>
                            <td className="py-3 px-4 text-gray-500 text-xs">{d.claimedBy?.orgName || '—'}</td>
                            <td className="py-3 px-4">
                              <span className={`text-[10px] font-outfit font-bold px-2 py-0.5 rounded-full border ${STATUS_CLS[d.status]}`}>
                                {d.status?.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── DONATIONS TAB ── */}
            {activeTab === 'donations' && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-emerald-900/20">
                  <h3 className="font-outfit font-bold text-base text-white">All Donations ({donations.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-emerald-900/20 text-gray-500 text-xs">
                        <th className="text-left py-3 px-4 font-outfit">Donor</th>
                        <th className="text-left py-3 px-4 font-outfit">Food</th>
                        <th className="text-left py-3 px-4 font-outfit">Qty</th>
                        <th className="text-left py-3 px-4 font-outfit">City</th>
                        <th className="text-left py-3 px-4 font-outfit">Priority</th>
                        <th className="text-left py-3 px-4 font-outfit">Status</th>
                        <th className="text-left py-3 px-4 font-outfit">NGO</th>
                        <th className="text-left py-3 px-4 font-outfit">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map(d => (
                        <tr key={d._id} className="border-b border-emerald-900/10 hover:bg-emerald-950/20 transition-colors">
                          <td className="py-3 px-4 font-semibold text-white text-xs">{d.donorName}</td>
                          <td className="py-3 px-4 text-gray-400 text-xs max-w-[120px] truncate">{d.foodName}</td>
                          <td className="py-3 px-4 text-gray-400 text-xs">{d.quantity}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs">{d.city}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-outfit font-bold ${d.priority === 'urgent' ? 'text-red-400' : d.priority === 'moderate' ? 'text-orange-400' : 'text-emerald-400'}`}>
                              {d.priority?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-outfit font-bold px-2 py-0.5 rounded-full border ${STATUS_CLS[d.status]}`}>
                              {d.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-xs">{d.claimedBy?.orgName || '—'}</td>
                          <td className="py-3 px-4">
                            <button onClick={() => handleDelete(d._id)}
                              className="text-[10px] px-2.5 py-1 bg-red-950/40 border border-red-900/30 text-red-400 hover:bg-red-900/40 rounded-lg font-outfit font-bold transition-all">
                              🗑 Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {donations.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No donations in system yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* ── USERS TAB ── */}
            {activeTab === 'users' && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-emerald-900/20">
                  <h3 className="font-outfit font-bold text-base text-white">All Users ({users.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-emerald-900/20 text-gray-500 text-xs">
                        <th className="text-left py-3 px-4 font-outfit">Name</th>
                        <th className="text-left py-3 px-4 font-outfit">Email</th>
                        <th className="text-left py-3 px-4 font-outfit">Role</th>
                        <th className="text-left py-3 px-4 font-outfit">Org</th>
                        <th className="text-left py-3 px-4 font-outfit">City</th>
                        <th className="text-left py-3 px-4 font-outfit">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-emerald-900/10 hover:bg-emerald-950/20 transition-colors">
                          <td className="py-3 px-4 font-semibold text-white text-xs">{u.firstName} {u.lastName}</td>
                          <td className="py-3 px-4 text-gray-400 text-xs">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-outfit font-bold px-2 py-0.5 rounded-full border ${
                              u.role === 'admin' ? 'text-red-400 bg-red-950/40 border-red-900/30' :
                              u.role === 'ngo' ? 'text-blue-400 bg-blue-950/40 border-blue-900/30' :
                              u.role === 'volunteer' ? 'text-purple-400 bg-purple-950/40 border-purple-900/30' :
                              'text-emerald-400 bg-emerald-950/40 border-emerald-900/30'
                            }`}>
                              {u.role?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-xs">{u.orgName || '—'}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs">{u.city || '—'}</td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No users registered yet.</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
