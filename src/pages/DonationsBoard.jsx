import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_COLOR = {
  urgent:    'text-red-400 bg-red-950/40 border-red-900/40',
  available: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40',
  claimed:   'text-blue-400 bg-blue-950/40 border-blue-900/40',
  in_transit:'text-orange-400 bg-orange-950/40 border-orange-900/40',
  delivered: 'text-purple-400 bg-purple-950/40 border-purple-900/40',
}
const STATUS_LABEL = { urgent: '🔴 URGENT', available: '🟢 Available', claimed: '✅ Claimed', in_transit: '🚚 In Transit', delivered: '📦 Delivered' }

function Countdown({ expiryTime }) {
  const [text, setText] = useState('')
  useEffect(() => {
    const update = () => {
      const diff = new Date(expiryTime) - new Date()
      if (diff <= 0) { setText('Expired'); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      setText(`${h}h ${m}m`)
    }
    update()
    const t = setInterval(update, 60_000)
    return () => clearInterval(t)
  }, [expiryTime])
  const hrs = (new Date(expiryTime) - new Date()) / 3_600_000
  const cls = hrs < 2 ? 'text-red-400' : hrs < 4 ? 'text-orange-400' : 'text-emerald-400'
  return <span className={`font-outfit font-bold text-xs ${cls}`}>⏱ {text}</span>
}

export default function DonationsBoard() {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchDonations = () => {
    setLoading(true)
    api.get('/donations').then(({ data }) => setDonations(data)).catch(() => toast.error('Failed to load donations')).finally(() => setLoading(false))
  }

  useEffect(() => { fetchDonations() }, [])

  const handleClaim = async (id) => {
    try {
      await api.patch(`/donations/${id}/claim`)
      toast.success('Food claimed! Volunteer assignment in progress. 🤝')
      fetchDonations()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not claim donation.')
    }
  }

  const filtered = donations.filter(d => {
    const matchStatus = filter === 'all' || d.status === filter || d.priority === filter
    const matchSearch = !search || d.foodName?.toLowerCase().includes(search.toLowerCase()) || d.donorName?.toLowerCase().includes(search.toLowerCase()) || d.city?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = {
    all: donations.length,
    urgent: donations.filter(d => d.priority === 'urgent' && d.status === 'available').length,
    available: donations.filter(d => d.status === 'available').length,
    claimed: donations.filter(d => d.status === 'claimed').length,
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-sm font-outfit font-semibold mb-4">🍱 Rescue Board</span>
          <h1 className="font-outfit font-black text-4xl md:text-5xl mb-3">Food <span className="gradient-text">Rescue Board</span></h1>
          <p className="text-gray-400">Browse all active food donations. NGOs can claim and arrange pickup.</p>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div className="flex flex-wrap gap-2">
            {['all','urgent','available','claimed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-outfit font-semibold transition-all border ${
                  filter === f ? 'bg-emerald-600 text-white border-emerald-600' : 'text-gray-400 border-emerald-900/30 hover:text-emerald-400 hover:border-emerald-800/50'
                }`}>
                {f === 'urgent' ? '🔴' : f === 'available' ? '🟢' : f === 'claimed' ? '✅' : '📋'} {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1.5 text-xs opacity-70">({counts[f] || 0})</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search donations…"
              className="bg-white/5 border border-emerald-900/30 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-all w-60" />
            {user?.role === 'donor' && <Link to="/donate" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-outfit font-bold rounded-xl transition-all whitespace-nowrap">+ New Donation</Link>}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-emerald-400 animate-pulse font-outfit">Loading donations…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-gray-400">No donations found. {user?.role === 'donor' && <Link to="/donate" className="text-emerald-400 hover:underline">Be the first to donate!</Link>}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(d => (
              <div key={d._id} className={`glass-card rounded-2xl p-5 hover:border-emerald-700/50 transition-all hover:-translate-y-1 ${d.priority === 'urgent' && d.status === 'available' ? 'urgent-row' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-outfit font-bold text-white text-sm">{d.donorName}</div>
                    <div className="text-gray-500 text-xs mt-0.5">🏪 {d.donorType} • {d.city}</div>
                  </div>
                  <span className={`text-[10px] font-outfit font-bold px-2.5 py-1 rounded-full border ${STATUS_COLOR[d.status]}`}>
                    {STATUS_LABEL[d.status]}
                  </span>
                </div>

                <div className="bg-emerald-950/30 rounded-xl p-3 mb-4">
                  <div className="font-semibold text-white text-sm mb-1">{d.foodName}</div>
                  <div className="text-gray-500 text-xs">{d.quantity} servings • {d.foodType}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="bg-white/5 rounded-lg p-2.5">
                    <div className="text-gray-500 mb-1">Expires</div>
                    <Countdown expiryTime={d.expiryTime} />
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5">
                    <div className="text-gray-500 mb-1">Contact</div>
                    <span className="text-emerald-400 font-bold text-xs">📞 {d.phone}</span>
                  </div>
                </div>

                {d.status === 'available' && user?.role === 'ngo' && (
                  <button onClick={() => handleClaim(d._id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-outfit font-bold text-sm rounded-xl transition-all">
                    🤝 Claim This Donation
                  </button>
                )}
                {d.status === 'claimed' && (
                  <div className="text-xs text-blue-400 bg-blue-950/30 border border-blue-900/30 rounded-lg p-2.5 text-center">
                    ✅ Claimed by {d.claimedBy?.orgName || d.claimedBy?.firstName || 'NGO'}
                  </div>
                )}
                {d.status === 'in_transit' && (
                  <div className="text-xs text-orange-400 bg-orange-950/30 border border-orange-900/30 rounded-lg p-2.5 text-center">
                    🚴 Volunteer en route — {d.volunteer?.firstName || 'Assigned'}
                  </div>
                )}
                {d.status === 'available' && (!user || user?.role !== 'ngo') && (
                  <Link to="/register" className="block w-full py-2.5 text-center text-emerald-400 border border-emerald-900/40 font-outfit font-bold text-sm rounded-xl hover:bg-emerald-950/30 transition-all">
                    Login as NGO to Claim →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
