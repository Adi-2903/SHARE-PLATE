import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function NGODashboard() {
  const { user }   = useAuth()
  const [donations, setDonations]   = useState([])
  const [myClaims,  setMyClaims]    = useState([])
  const [filter, setFilter]         = useState('all')
  const [loading, setLoading]       = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [{ data: avail }, { data: claims }] = await Promise.all([
        api.get('/donations?status=available'),
        api.get('/ngos/my-claims'),
      ])
      setDonations(avail)
      setMyClaims(claims)
    } catch { toast.error('Failed to load data') }
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const handleClaim = async (id) => {
    try {
      await api.patch(`/donations/${id}/claim`)
      toast.success('🤝 Claimed! Volunteer assignment in progress.')
      fetchAll()
    } catch (err) { toast.error(err.response?.data?.error || 'Claim failed') }
  }

  const urgent = donations.filter(d => d.priority === 'urgent')
  const stats = [
    { icon: '🍱', label: 'Meals Claimed', val: myClaims.reduce((a, d) => a + (d.quantity || 0), 0), cls: 'green' },
    { icon: '⚡', label: 'Urgent Near You', val: urgent.length, cls: 'orange' },
    { icon: '🚴', label: 'In Transit', val: myClaims.filter(d => d.status === 'in_transit').length, cls: 'blue' },
    { icon: '✅', label: 'Delivered', val: myClaims.filter(d => d.status === 'delivered').length, cls: 'purple' },
  ]
  const iconBg = { green: 'bg-emerald-900/40', orange: 'bg-orange-900/40', blue: 'bg-blue-900/40', purple: 'bg-purple-900/40' }

  const filtered = filter === 'urgent' ? urgent : donations

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-outfit font-bold text-emerald-400 tracking-widest uppercase">🏥 NGO Portal</span>
          <h1 className="font-outfit font-black text-3xl md:text-4xl mt-2">
            {user?.orgName || 'NGO'} <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Welcome, {user?.firstName}. Claim available food donations near you.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${iconBg[s.cls]} flex-shrink-0`}>{s.icon}</div>
              <div>
                <div className="font-outfit font-black text-2xl text-white">{s.val}</div>
                <div className="text-gray-500 text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Urgent Alert */}
        {urgent.length > 0 && (
          <div className="bg-red-950/30 border border-red-900/40 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <span className="text-2xl flex-shrink-0">🔴</span>
            <div className="flex-1">
              <div className="font-outfit font-bold text-red-400">{urgent.length} URGENT donation{urgent.length > 1 ? 's' : ''} expiring within 4 hours!</div>
              <div className="text-xs text-gray-400 mt-0.5">Claim immediately to prevent food waste.</div>
            </div>
            <button onClick={() => setFilter('urgent')} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-outfit font-bold rounded-xl transition-all flex-shrink-0">
              View Urgent →
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Donations */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-outfit font-bold text-lg text-white">📋 Available Donations</h2>
              <div className="flex gap-2">
                {['all','urgent'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-outfit font-bold transition-all border ${filter === f ? 'bg-emerald-600 text-white border-emerald-600' : 'text-gray-400 border-emerald-900/30 hover:text-emerald-400'}`}>
                    {f === 'urgent' ? '🔴 Urgent Only' : 'All Available'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-emerald-400 animate-pulse font-outfit">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No {filter === 'urgent' ? 'urgent ' : ''}donations right now. Check back soon! 🍃</div>
            ) : (
              <div className="space-y-3">
                {filtered.map(d => {
                  const hrs = (new Date(d.expiryTime) - new Date()) / 3_600_000
                  const h = Math.max(0, Math.floor(hrs)), m = Math.max(0, Math.round((hrs % 1) * 60))
                  const timerCls = hrs < 2 ? 'text-red-400' : hrs < 4 ? 'text-orange-400' : 'text-emerald-400'
                  return (
                    <div key={d._id} className={`glass-card rounded-xl p-5 flex items-start gap-4 hover:border-emerald-700/40 transition-all ${d.priority === 'urgent' ? 'urgent-row' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-outfit font-bold text-sm text-white truncate">{d.donorName}</span>
                          {d.priority === 'urgent' && <span className="text-[10px] font-outfit font-black text-red-400 bg-red-950/40 border border-red-900/30 px-2 py-0.5 rounded-full">URGENT</span>}
                        </div>
                        <div className="text-emerald-300 text-sm">{d.foodName} — <span className="text-gray-400">{d.quantity} servings</span></div>
                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                          <span>📍 {d.city}</span>
                          <span className={`font-outfit font-bold ${timerCls}`}>⏱ {h}h {m}m left</span>
                          <span>📞 {d.phone}</span>
                        </div>
                      </div>
                      <button onClick={() => handleClaim(d._id)}
                        className="flex-shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-outfit font-bold rounded-xl transition-all">
                        Claim
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* My Claims Sidebar */}
          <div>
            <h2 className="font-outfit font-bold text-lg text-white mb-4">✅ My Recent Claims</h2>
            {myClaims.length === 0 ? (
              <div className="glass-card rounded-xl p-6 text-center text-gray-500 text-sm">No claims yet. Claim your first donation! 🤝</div>
            ) : (
              <div className="space-y-3">
                {myClaims.slice(0, 6).map(d => (
                  <div key={d._id} className="glass-card rounded-xl p-4">
                    <div className="font-outfit font-bold text-sm text-white mb-1">{d.foodName} × {d.quantity}</div>
                    <div className="text-xs text-gray-500 mb-2">From: {d.donor?.orgName || d.donorName}</div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-outfit font-bold px-2 py-0.5 rounded-full ${d.status === 'delivered' ? 'text-purple-400 bg-purple-950/40' : d.status === 'in_transit' ? 'text-orange-400 bg-orange-950/40' : 'text-blue-400 bg-blue-950/40'}`}>
                        {d.status === 'in_transit' ? '🚴 In Transit' : d.status === 'delivered' ? '📦 Delivered' : '✅ Claimed'}
                      </span>
                      {d.volunteer && <span className="text-xs text-gray-500">👤 {d.volunteer.firstName}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
