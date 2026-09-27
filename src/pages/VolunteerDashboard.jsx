import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function VolunteerDashboard() {
  const { user }    = useAuth()
  const [pickups, setPickups]     = useState([])
  const [available, setAvailable] = useState([])
  const [loading, setLoading]     = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [{ data: mine }, { data: avail }] = await Promise.all([
        api.get('/volunteers/my-pickups'),
        api.get('/donations?status=claimed'),
      ])
      setPickups(mine)
      setAvailable(avail.filter(d => !d.volunteer))
    } catch { toast.error('Failed to load pickup data') }
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const handleDeliver = async (id) => {
    try {
      await api.patch(`/donations/${id}/deliver`)
      toast.success('✅ Marked as delivered! Great job!')
      fetchAll()
    } catch (err) { toast.error(err.response?.data?.error || 'Could not mark delivered') }
  }

  const done   = pickups.filter(d => d.status === 'delivered').length
  const active = pickups.filter(d => d.status === 'in_transit')
  const totalMeals = pickups.reduce((a, d) => a + (d.quantity || 0), 0)

  const stats = [
    { icon: '🚴', label: 'Total Pickups',   val: pickups.length,  cls: 'text-emerald-400' },
    { icon: '✅', label: 'Completed',        val: done,            cls: 'text-purple-400' },
    { icon: '🍽️', label: 'Meals Delivered',  val: totalMeals,      cls: 'text-orange-400' },
    { icon: '⚡', label: 'Active Now',       val: active.length,   cls: 'text-blue-400' },
  ]

  const BADGES = [
    { icon: '🌟', label: 'Hero',     unlocked: done >= 10,  threshold: 10 },
    { icon: '⚡', label: 'Speedy',   unlocked: done >= 20,  threshold: 20 },
    { icon: '💯', label: 'Reliable', unlocked: done >= 30,  threshold: 30 },
    { icon: '🏆', label: 'Legend',   unlocked: done >= 50,  threshold: 50 },
    { icon: '🔥', label: 'Streak',   unlocked: done >= 5,   threshold: 5  },
    { icon: '🌱', label: 'Green',    unlocked: done >= 1,   threshold: 1  },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-outfit font-bold text-emerald-400 tracking-widest uppercase">🚴 Volunteer Portal</span>
          <h1 className="font-outfit font-black text-3xl md:text-4xl mt-2">
            Hey, <span className="gradient-text">{user?.firstName} {user?.lastName}! 👋</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            You've completed <strong className="text-emerald-400">{done}</strong> pickup{done !== 1 ? 's' : ''}. Every delivery counts! 💚
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/5 flex-shrink-0">{s.icon}</div>
              <div>
                <div className={`font-outfit font-black text-2xl ${s.cls}`}>{s.val}</div>
                <div className="text-gray-500 text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-emerald-400 animate-pulse font-outfit text-lg">Loading your pickups…</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Active + Available Pickups */}
            <div className="lg:col-span-2 space-y-6">

              {/* Active Assignments */}
              {active.length > 0 && (
                <div>
                  <h2 className="font-outfit font-bold text-lg text-white mb-4">🔔 Active Assignments</h2>
                  <div className="space-y-4">
                    {active.map(d => (
                      <div key={d._id}
                        className="bg-emerald-950/30 border border-emerald-700/50 rounded-2xl p-6 glow-emerald">
                        <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
                          <div>
                            <div className="font-outfit font-black text-lg text-white">{d.foodName} × {d.quantity}</div>
                            <div className="text-gray-400 text-sm mt-1">From: <strong className="text-emerald-300">{d.donor?.orgName || d.donorName}</strong></div>
                          </div>
                          <span className="text-xs font-outfit font-bold px-3 py-1 rounded-full bg-orange-950/40 border border-orange-900/40 text-orange-400">🚴 In Transit</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                          <div className="bg-white/5 rounded-xl p-3">
                            <div className="text-gray-500 text-xs mb-1">📍 Pickup From</div>
                            <div className="font-semibold text-white text-xs">{d.address || d.city}</div>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3">
                            <div className="text-gray-500 text-xs mb-1">🏥 Deliver To</div>
                            <div className="font-semibold text-emerald-300 text-xs">{d.claimedBy?.orgName || 'NGO Partner'}</div>
                          </div>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          <button onClick={() => handleDeliver(d._id)}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-outfit font-bold text-sm rounded-xl transition-all">
                            ✅ Mark as Delivered
                          </button>
                          <button className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white font-outfit font-semibold text-sm rounded-xl transition-all">
                            📞 Call Donor
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Pickups */}
              <div>
                <h2 className="font-outfit font-bold text-lg text-white mb-4">📋 Available Pickups Near You</h2>
                {available.length === 0 ? (
                  <div className="glass-card rounded-2xl p-8 text-center text-gray-500">
                    <div className="text-4xl mb-3">🎉</div>
                    <p>No pending pickups right now. Check back soon!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {available.map(d => {
                      const hrs = Math.max(0, (new Date(d.expiryTime) - new Date()) / 3_600_000)
                      const h = Math.floor(hrs), m = Math.round((hrs % 1) * 60)
                      const timerCls = hrs < 2 ? 'text-red-400' : hrs < 4 ? 'text-orange-400' : 'text-emerald-400'
                      return (
                        <div key={d._id} className="glass-card rounded-xl p-5 flex items-start gap-4 hover:border-emerald-700/40 transition-all">
                          <div className="flex-1 min-w-0">
                            <div className="font-outfit font-bold text-sm text-white mb-1">{d.foodName} × {d.quantity}</div>
                            <div className="text-gray-500 text-xs">📍 {d.city} • {d.donorType}</div>
                            <div className="flex gap-3 mt-2 text-xs">
                              <span className={`font-outfit font-bold ${timerCls}`}>⏱ {h}h {m}m left</span>
                              <span className="text-blue-400">🏥 {d.claimedBy?.orgName || 'NGO'}</span>
                              <span className="text-gray-500">📞 {d.phone}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => toast.success('Pickup accepted! Please contact the donor. 🚴')}
                            className="flex-shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-outfit font-bold rounded-xl transition-all">
                            Accept
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Completed History */}
              {done > 0 && (
                <div>
                  <h2 className="font-outfit font-bold text-lg text-white mb-4">✅ Completed Pickups</h2>
                  <div className="space-y-2">
                    {pickups.filter(d => d.status === 'delivered').slice(0, 5).map(d => (
                      <div key={d._id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="font-outfit font-semibold text-sm text-white">{d.foodName} × {d.quantity}</div>
                          <div className="text-gray-500 text-xs mt-0.5">Delivered to {d.claimedBy?.orgName || 'NGO'}</div>
                        </div>
                        <span className="text-xs font-outfit font-bold text-purple-400 bg-purple-950/40 px-2.5 py-1 rounded-full">📦 Done</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: Badges + Leaderboard */}
            <div className="space-y-5">
              {/* Badges */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-outfit font-bold text-sm text-white mb-4">🏅 Your Badges</h3>
                <div className="grid grid-cols-3 gap-3">
                  {BADGES.map(b => (
                    <div key={b.label}
                      className={`flex flex-col items-center py-3 px-2 rounded-xl border text-center transition-all ${
                        b.unlocked
                          ? 'border-emerald-700/50 bg-emerald-950/30'
                          : 'border-gray-800/50 bg-white/3 opacity-40 grayscale'
                      }`}>
                      <div className="text-2xl mb-1">{b.icon}</div>
                      <div className={`font-outfit font-bold text-[10px] ${b.unlocked ? 'text-emerald-400' : 'text-gray-600'}`}>{b.label}</div>
                      {!b.unlocked && <div className="text-[9px] text-gray-600">{b.threshold} pickups</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress to next badge */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-outfit font-bold text-sm text-white mb-4">📈 Progress</h3>
                {BADGES.filter(b => !b.unlocked).slice(0, 1).map(b => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-400">Next: {b.icon} {b.label}</span>
                      <span className="text-emerald-400 font-outfit font-bold">{done}/{b.threshold}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-700 to-emerald-400 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (done / b.threshold) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2">{b.threshold - done} more pickups to unlock</p>
                  </div>
                ))}
                {BADGES.every(b => b.unlocked) && (
                  <p className="text-emerald-400 font-outfit font-bold text-sm">🎉 All badges unlocked! You're a Legend!</p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-outfit font-bold text-sm text-white mb-4">🌱 Your Impact</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Meals Delivered</span>
                    <span className="font-outfit font-black text-emerald-400">{totalMeals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">CO₂ Saved</span>
                    <span className="font-outfit font-black text-orange-400">~{(totalMeals * 0.5).toFixed(0)} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Pickups Done</span>
                    <span className="font-outfit font-black text-purple-400">{done}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
