import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const inputCls = 'w-full bg-white/5 border border-emerald-900/40 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-all text-sm'

export default function DonatePage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm] = useState({
    donorName: user?.orgName || `${user?.firstName} ${user?.lastName}` || '',
    donorType: 'Restaurant',
    foodName: '', quantity: '', foodType: 'Vegetarian',
    expiryTime: '', address: '', city: user?.city || '', pincode: user?.pincode || '',
    phone: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [expiryInfo, setExpiryInfo] = useState(null)
  const [history, setHistory] = useState([])

  // Load donor's history
  useEffect(() => {
    api.get('/donations').then(({ data }) => {
      setHistory(data.filter(d => d.donor?._id === user?._id || d.donor === user?._id).slice(0, 3))
    }).catch(() => {})
  }, [user])

  const set = k => e => {
    const v = e.target.value
    setForm(f => ({ ...f, [k]: v }))
    if (k === 'expiryTime' && v) {
      const hrs = (new Date(v) - new Date()) / 3_600_000
      if (hrs < 0) setExpiryInfo({ label: '⚠️ Already Expired!', cls: 'text-red-400' })
      else if (hrs < 4) setExpiryInfo({ label: `🔴 URGENT — ${Math.floor(hrs)}h ${Math.round((hrs % 1) * 60)}m left`, cls: 'text-red-400' })
      else if (hrs < 8) setExpiryInfo({ label: `🟡 Moderate — ${Math.floor(hrs)}h ${Math.round((hrs % 1) * 60)}m left`, cls: 'text-orange-400' })
      else setExpiryInfo({ label: `🟢 Safe — ${Math.floor(hrs)}h left`, cls: 'text-emerald-400' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/donations', form)
      toast.success('🍱 Donation listed! Nearby NGOs are being notified.')
      navigate('/donations')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit donation.')
    } finally { setLoading(false) }
  }

  const statusColor = { delivered: 'text-purple-400', available: 'text-emerald-400', claimed: 'text-blue-400', in_transit: 'text-orange-400' }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-sm font-outfit font-semibold mb-4">🍱 Donor Portal</span>
          <h1 className="font-outfit font-black text-4xl md:text-5xl">List a <span className="gradient-text">Food Donation</span></h1>
          <p className="text-gray-400 mt-3">Fill in details below. Nearby NGOs will be notified automatically based on urgency.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 glass-card rounded-2xl p-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Donor / Business Name *</label>
                <input value={form.donorName} onChange={set('donorName')} placeholder="Spice Garden Restaurant" required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Donor Type *</label>
                <select value={form.donorType} onChange={set('donorType')} className={inputCls}>
                  {['Restaurant','Hotel','Hostel / PG','Cafeteria','Catering Service','Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Food Item(s) *</label>
              <input value={form.foodName} onChange={set('foodName')} placeholder="e.g. Dal Makhani, Rice, Chapati" required className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Quantity (servings/kg) *</label>
                <input type="number" value={form.quantity} onChange={set('quantity')} placeholder="40" min="1" required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Food Type</label>
                <select value={form.foodType} onChange={set('foodType')} className={inputCls}>
                  {['Vegetarian','Non-Vegetarian','Vegan','Mixed'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Expiry Date &amp; Time *</label>
              <input type="datetime-local" value={form.expiryTime} onChange={set('expiryTime')} required className={inputCls} />
              {expiryInfo && <p className={`mt-1.5 text-xs font-outfit font-bold ${expiryInfo.cls}`}>{expiryInfo.label}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Pickup Address *</label>
              <input value={form.address} onChange={set('address')} placeholder="Full address with landmark" required className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1.5">City *</label>
                <input value={form.city} onChange={set('city')} placeholder="Pune" required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Contact Phone *</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" required className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Special Instructions (optional)</label>
              <textarea value={form.notes} onChange={set('notes')} rows="3" placeholder="e.g. Needs refrigeration, contains nuts…" className={inputCls + ' resize-none'} />
            </div>

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border border-emerald-900/40 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-all font-outfit font-semibold text-sm">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-outfit font-bold rounded-xl transition-all">
                {loading ? '⏳ Submitting…' : '🍱 Submit Donation'}
              </button>
            </div>
          </form>

          {/* SIDEBAR */}
          <div className="space-y-5">
            {/* Urgency guide */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-outfit font-bold text-sm mb-4 text-white">⚡ Urgency System</h3>
              <div className="space-y-3">
                {[
                  { dot: 'bg-red-400', label: 'URGENT (&lt; 4 hrs)', sub: 'Top priority, immediate NGO alert', cls: 'text-red-400' },
                  { dot: 'bg-orange-400', label: 'MODERATE (4–8 hrs)', sub: 'Standard notification to NGOs', cls: 'text-orange-400' },
                  { dot: 'bg-emerald-400', label: 'SAFE (&gt; 8 hrs)', sub: 'Listed, claimed at leisure', cls: 'text-emerald-400' },
                ].map(u => (
                  <div key={u.label} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full ${u.dot} mt-0.5 flex-shrink-0`} />
                    <div>
                      <div className={`font-outfit font-bold text-xs ${u.cls}`} dangerouslySetInnerHTML={{ __html: u.label }} />
                      <div className="text-gray-500 text-[11px] mt-0.5">{u.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent donations */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-outfit font-bold text-sm mb-4 text-white">📋 Recent Donations</h3>
              {history.length === 0 ? (
                <p className="text-gray-500 text-xs">No donations yet. Submit your first one! 🍱</p>
              ) : (
                <div className="space-y-3">
                  {history.map(d => (
                    <div key={d._id} className="bg-emerald-950/30 border border-emerald-900/30 rounded-lg p-3">
                      <div className="font-outfit font-bold text-xs text-white">{d.foodName} × {d.quantity}</div>
                      <div className={`text-[10px] mt-1 ${statusColor[d.status]}`}>
                        {d.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
