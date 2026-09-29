import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const S = { fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }

function SideNav({ user }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const links = [
    { icon: 'home', label: 'Home', to: '/' },
    { icon: 'volunteer_activism', label: 'Donate', to: '/donate', active: true },
    { icon: 'lunch_dining', label: 'Board', to: '/donations' },
  ]
  if (user?.role === 'admin') {
    links.push({ icon: 'admin_panel_settings', label: 'Admin', to: '/admin' })
  }
  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      {/* ── DESKTOP SIDEBAR (hidden on mobile) ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col justify-between py-6 px-4 z-40"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(188,202,192,0.3)', boxShadow: '1px 0 8px rgba(0,105,72,0.04)' }}>
        <div className="space-y-5">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 px-2 pt-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(0,133,93,0.85)' }}>
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div>
              <span className="block font-extrabold text-base tracking-tight" style={{ ...S, color: '#006948' }}>SharePlate</span>
              <span className="block text-[11px] uppercase tracking-wider text-[#6d7a72]">Food Rescue OS</span>
            </div>
          </Link>

          {/* User profile card */}
          <div className="p-3 rounded-xl border flex items-center gap-3"
            style={{ background: 'rgba(242,243,255,0.8)', borderColor: 'rgba(188,202,192,0.5)' }}>
            <div className="relative w-11 h-11 rounded-full overflow-hidden border shrink-0"
              style={{ borderColor: 'rgba(0,105,72,0.2)' }}>
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(0,133,93,0.12)' }}>
                <span className="material-symbols-outlined text-2xl" style={{ color: '#006948' }}>restaurant</span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ background: '#006948' }} />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-bold text-[#131b2e] truncate">{user?.orgName || `${user?.firstName || 'Donor'}'s Kitchen`}</h4>
                <span className="material-symbols-outlined text-base" style={{ color: '#006948', fontVariationSettings: "'FILL' 1", fontSize: '16px' }}>verified</span>
              </div>
              <span className="text-xs text-[#3d4a42]">Donor Partner</span>
            </div>
          </div>

          {/* Quick action */}
          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-white text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #006948, #00855d)', boxShadow: '0 8px 20px -4px rgba(0,105,72,0.3)' }}>
            <span className="material-symbols-outlined text-xl">add_circle</span>
            Donate Food
          </button>

          {/* Nav */}
          <nav className="space-y-1 pt-1">
            {links.map((l, i) => (
              <Link key={i} to={l.to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                style={l.active
                  ? { background: 'rgba(108,248,187,0.35)', color: '#00714d' }
                  : { color: '#3d4a42' }}
                onMouseEnter={e => { if (!l.active) e.currentTarget.style.background = 'rgba(234,237,255,0.6)' }}
                onMouseLeave={e => { if (!l.active) e.currentTarget.style.background = 'transparent' }}>
                <span className="material-symbols-outlined text-xl" style={l.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-[#3d4a42] transition-all hover:bg-red-50 hover:text-red-600 text-left">
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
          <span className="text-xs font-semibold text-[#3d4a42] hidden sm:block truncate max-w-[120px]">
            {user?.orgName || user?.firstName}
          </span>
          <button onClick={handleLogout}
            className="p-2 rounded-full text-[#6d7a72] hover:bg-red-50 hover:text-red-500 transition-all">
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-around border-t"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderColor: 'rgba(188,202,192,0.3)' }}>
        {links.map((l, i) => (
          <Link key={i} to={l.to}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[56px]"
            style={l.active ? { color: '#006948' } : { color: '#6d7a72' }}>
            <span className="material-symbols-outlined text-2xl" style={l.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{l.icon}</span>
            <span className="text-[10px] font-semibold">{l.label}</span>
          </Link>
        ))}
        <button onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[56px] text-[#6d7a72] hover:text-red-500">
          <span className="material-symbols-outlined text-2xl">logout</span>
          <span className="text-[10px] font-semibold">Logout</span>
        </button>
      </nav>
    </>
  )
}

function UrgencyBadge({ expiryTime }) {
  if (!expiryTime) return null
  const hrs = (new Date(expiryTime) - new Date()) / 3_600_000
  if (hrs < 0) return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Expired</span>
  if (hrs < 4) return (
    <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: 'rgba(255,218,214,0.4)', borderColor: 'rgba(186,26,26,0.25)', boxShadow: '0 0 20px -2px rgba(186,26,26,0.12)' }}>
      <span className="material-symbols-outlined text-xl text-red-600">crisis_alert</span>
      <div>
        <div className="text-sm font-bold text-red-700">⚡ URGENT — Expires in {Math.floor(hrs)}h {Math.round((hrs % 1) * 60)}m</div>
        <div className="text-xs text-red-600 mt-0.5">Immediate NGO alert will be triggered on submission</div>
      </div>
    </div>
  )
  if (hrs < 8) return (
    <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: 'rgba(255,221,184,0.4)', borderColor: 'rgba(130,81,0,0.2)' }}>
      <span className="material-symbols-outlined text-xl text-amber-600">schedule</span>
      <div>
        <div className="text-sm font-bold text-amber-700">🟡 MODERATE — {Math.floor(hrs)}h {Math.round((hrs % 1) * 60)}m remaining</div>
        <div className="text-xs text-amber-600 mt-0.5">NGOs nearby will be notified promptly</div>
      </div>
    </div>
  )
  return (
    <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: 'rgba(108,248,187,0.2)', borderColor: 'rgba(0,108,73,0.2)' }}>
      <span className="material-symbols-outlined text-xl text-emerald-600">check_circle</span>
      <div>
        <div className="text-sm font-bold text-emerald-700">🟢 SAFE — {Math.floor(hrs)}h {Math.round((hrs % 1) * 60)}m remaining</div>
        <div className="text-xs text-emerald-600 mt-0.5">Listed on the food board — NGOs can claim at any time</div>
      </div>
    </div>
  )
}

const STATUS_STYLE = {
  available: { bg: 'rgba(108,248,187,0.2)', border: 'rgba(0,113,77,0.2)', color: '#00714d', label: 'Available' },
  claimed: { bg: 'rgba(234,237,255,0.6)', border: 'rgba(0,105,72,0.2)', color: '#006948', label: 'Claimed' },
  in_transit: { bg: 'rgba(255,221,184,0.3)', border: 'rgba(130,81,0,0.2)', color: '#825100', label: '🚴 In Transit' },
  delivered: { bg: 'rgba(218,226,253,0.5)', border: 'rgba(0,105,72,0.15)', color: '#3d4a42', label: '📦 Delivered' },
  expired: { bg: 'rgba(188,202,192,0.2)', border: 'rgba(188,202,192,0.4)', color: '#6d7a72', label: 'Expired' },
}

export default function DonatePage() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [form, setForm] = useState({
    foodName: '', quantity: '', foodType: 'Vegetarian', expiryTime: '',
    address: '', city: user?.city || '', phone: user?.phone || '', notes: ''
  })

  useEffect(() => {
    api.get('/donations/my').then(({ data }) => setHistory(data)).catch(() => {})
    if (user) {
      setForm(f => ({
        ...f,
        city: f.city || user.city || '',
        phone: f.phone || user.phone || '',
      }))
    }
  }, [user])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!form.foodName.trim()) { toast.error('Please enter a food item name.'); return false }
      if (!form.quantity || Number(form.quantity) < 1) { toast.error('Quantity must be at least 1 serving.'); return false }
    }
    if (currentStep === 2) {
      if (!form.address.trim()) { toast.error('Please enter a pickup address.'); return false }
      if (!form.city.trim()) { toast.error('Please enter a city.'); return false }
      if (!form.phone.trim()) { toast.error('Please enter a contact phone.'); return false }
      if (!form.expiryTime) { toast.error('Please set the food expiry time.'); return false }
    }
    return true
  }

  const goToStep = (from, to) => {
    if (to > from && !validateStep(from)) return
    setStep(to)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(1) || !validateStep(2)) return
    setLoading(true)
    try {
      const payload = { ...form, quantity: Number(form.quantity) }
      await api.post('/donations', payload)
      toast.success('🎉 Donation listed! NGOs are being notified.')
      const { data } = await api.get('/donations/my')
      setHistory(data)
      setStep(1)
      // Preserve user profile values (city, phone) so the next donation is pre-filled
      setForm({
        foodName: '', quantity: '', foodType: 'Vegetarian', expiryTime: '',
        address: '', notes: '',
        city: user?.city || '',
        phone: user?.phone || '',
      })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit.')
    } finally { setLoading(false) }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm text-[#131b2e] outline-none transition-all"
  const inputStyle = { background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(188,202,192,0.5)' }

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #faf8ff, #f5fbf7)', fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <SideNav user={user} />

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 p-4 sm:p-6 lg:p-8">
        {/* Page header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#006948' }}>Donor Portal</span>
          <h1 className="text-3xl font-extrabold text-[#131b2e] mt-1 tracking-tight" style={S}>Donate Surplus Food</h1>
          <p className="text-sm text-[#3d4a42] mt-1">Fill out the details below and help rescue food before it goes to waste.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* ── MAIN FORM COLUMN ── */}
          <div className="xl:col-span-2">
            {/* Stepper */}
            <div className="flex items-center gap-0 mb-8">
              {[
                { num: 1, label: 'Food Details' },
                { num: 2, label: 'Location & Expiry' },
                { num: 3, label: 'Review & Submit' },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                      style={step >= s.num
                        ? { background: '#006948', color: '#fff', boxShadow: '0 4px 12px rgba(0,105,72,0.3)' }
                        : { background: '#eaedff', color: '#6d7a72' }}>
                      {step > s.num ? <span className="material-symbols-outlined text-base">check</span> : s.num}
                    </div>
                    <span className="text-xs mt-1 font-semibold" style={{ color: step >= s.num ? '#006948' : '#6d7a72' }}>{s.label}</span>
                  </div>
                  {i < 2 && <div className="flex-1 h-0.5 mx-2 -mt-5 transition-all" style={{ background: step > s.num ? '#006948' : '#eaedff' }} />}
                </div>
              ))}
            </div>

            {/* Glass form card */}
            <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px -4px rgba(0,105,72,0.06)' }}>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* STEP 1 */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#131b2e] mb-1.5">Food Item Name *</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7a72] text-lg">restaurant</span>
                        <input value={form.foodName} onChange={set('foodName')} placeholder="e.g. Rajdhani Thali, Artisan Sandwiches" required
                          className={`${inputCls} pl-11`} style={inputStyle}
                          onFocus={e => e.target.style.borderColor = '#006948'} onBlur={e => e.target.style.borderColor = 'rgba(188,202,192,0.5)'} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#131b2e] mb-1.5">Quantity (servings) *</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7a72] text-lg">countertops</span>
                          <input type="number" min="1" value={form.quantity} onChange={set('quantity')} placeholder="50" required
                            className={`${inputCls} pl-11`} style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#006948'} onBlur={e => e.target.style.borderColor = 'rgba(188,202,192,0.5)'} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#131b2e] mb-1.5">Food Type</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7a72] text-lg">eco</span>
                          <select value={form.foodType} onChange={set('foodType')}
                            className={`${inputCls} pl-11 cursor-pointer`} style={inputStyle}>
                            <option value="Vegetarian">🌿 Vegetarian</option>
                            <option value="Non-Vegetarian">🍗 Non-Vegetarian</option>
                            <option value="Vegan">🥦 Vegan</option>
                            <option value="Bakery">🍞 Bakery & Snacks</option>
                            <option value="Fruits & Produce">🍎 Fruits & Produce</option>
                              <option value="Mixed">🍱 Mixed</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#131b2e] mb-1.5">Additional Notes</label>
                      <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="e.g. Freshly cooked, packed in hygienic containers…"
                        className={`${inputCls} resize-none`} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#006948'} onBlur={e => e.target.style.borderColor = 'rgba(188,202,192,0.5)'} />
                    </div>

                    <button type="button" onClick={() => goToStep(1, 2)}
                      className="w-full py-3.5 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      style={{ background: 'linear-gradient(135deg, #006948, #00855d)' }}>
                      Continue to Location & Expiry
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#131b2e] mb-1.5">Pickup Address *</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7a72] text-lg">location_on</span>
                        <input value={form.address} onChange={set('address')} placeholder="Street address for volunteer pickup" required
                          className={`${inputCls} pl-11`} style={inputStyle}
                          onFocus={e => e.target.style.borderColor = '#006948'} onBlur={e => e.target.style.borderColor = 'rgba(188,202,192,0.5)'} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#131b2e] mb-1.5">City *</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7a72] text-lg">location_city</span>
                          <input value={form.city} onChange={set('city')} placeholder="Mumbai, Pune…" required
                            className={`${inputCls} pl-11`} style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#006948'} onBlur={e => e.target.style.borderColor = 'rgba(188,202,192,0.5)'} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#131b2e] mb-1.5">Contact Phone *</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7a72] text-lg">call</span>
                          <input value={form.phone} onChange={set('phone')} placeholder="9876543210" required
                            className={`${inputCls} pl-11`} style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#006948'} onBlur={e => e.target.style.borderColor = 'rgba(188,202,192,0.5)'} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#131b2e] mb-1.5">Food Expiry Date & Time *</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7a72] text-lg">schedule</span>
                        <input type="datetime-local" value={form.expiryTime} onChange={set('expiryTime')} required
                          className={`${inputCls} pl-11`} style={inputStyle}
                          onFocus={e => e.target.style.borderColor = '#006948'} onBlur={e => e.target.style.borderColor = 'rgba(188,202,192,0.5)'} />
                      </div>
                    </div>

                    {/* Dynamic urgency badge */}
                    {form.expiryTime && <UrgencyBadge expiryTime={form.expiryTime} />}

                    <div className="flex gap-3">
                      <button type="button" onClick={() => goToStep(2, 1)}
                        className="flex-1 py-3.5 rounded-full text-sm font-bold text-[#3d4a42] border transition-all hover:bg-gray-50"
                        style={{ borderColor: 'rgba(188,202,192,0.5)' }}>
                        ← Back
                      </button>
                      <button type="button" onClick={() => goToStep(2, 3)}
                        className="flex-[2] py-3.5 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                        style={{ background: 'linear-gradient(135deg, #006948, #00855d)' }}>
                        Review Donation
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(242,243,255,0.6)', border: '1px solid rgba(188,202,192,0.3)' }}>
                      <h3 className="text-base font-bold text-[#131b2e]" style={S}>📋 Donation Summary</h3>
                      {[
                        { icon: 'restaurant', label: 'Food', value: form.foodName },
                        { icon: 'countertops', label: 'Quantity', value: `${form.quantity} servings` },
                        { icon: 'eco', label: 'Type', value: form.foodType },
                        { icon: 'location_on', label: 'Pickup', value: `${form.address}, ${form.city}` },
                        { icon: 'call', label: 'Contact', value: form.phone },
                        { icon: 'schedule', label: 'Expires', value: form.expiryTime ? new Date(form.expiryTime).toLocaleString() : '—' },
                      ].map(row => (
                        <div key={row.label} className="flex items-start gap-3 text-sm">
                          <span className="material-symbols-outlined text-base text-[#6d7a72] mt-0.5">{row.icon}</span>
                          <span className="text-[#6d7a72] w-20 shrink-0">{row.label}</span>
                          <span className="font-semibold text-[#131b2e]">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    {form.expiryTime && <UrgencyBadge expiryTime={form.expiryTime} />}

                    <div className="flex gap-3">
                      <button type="button" onClick={() => goToStep(3, 2)}
                        className="flex-1 py-3.5 rounded-full text-sm font-bold text-[#3d4a42] border transition-all hover:bg-gray-50"
                        style={{ borderColor: 'rgba(188,202,192,0.5)' }}>
                        ← Edit
                      </button>
                      <button type="submit" disabled={loading}
                        className="flex-[2] py-3.5 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #006948, #00855d)', boxShadow: '0 8px 24px -4px rgba(0,105,72,0.35)' }}>
                        {loading ? '⏳ Submitting…' : <>
                          <span className="material-symbols-outlined text-base">volunteer_activism</span>
                          Submit Donation
                        </>}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="space-y-5">
            {/* Urgency legend */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)' }}>
              <h3 className="text-sm font-bold text-[#131b2e] mb-4" style={S}>⚡ Urgency Priority System</h3>
              <div className="space-y-3">
                {[
                  { dot: 'bg-red-500', label: 'URGENT (< 4 hrs)', sub: 'Immediate NGO alert + dispatch', cls: 'text-red-600' },
                  { dot: 'bg-amber-500', label: 'MODERATE (4–8 hrs)', sub: 'Standard NGO notification', cls: 'text-amber-600' },
                  { dot: 'bg-emerald-500', label: 'SAFE (> 8 hrs)', sub: 'Listed — NGOs claim at leisure', cls: 'text-emerald-600' },
                ].map(u => (
                  <div key={u.label} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full ${u.dot} mt-0.5 shrink-0`} />
                    <div>
                      <div className={`font-bold text-xs ${u.cls}`}>{u.label}</div>
                      <div className="text-[11px] text-[#6d7a72] mt-0.5">{u.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact summary */}
            <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #006948, #00855d)', boxShadow: '0 8px 24px -4px rgba(0,105,72,0.3)' }}>
              <div className="text-xs font-bold text-white/80 mb-1">🌱 Your Total Impact</div>
              <div className="text-3xl font-extrabold text-white" style={S}>
                {history.reduce((a, d) => a + (Number(d.quantity) || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-white/80 mt-0.5">Meals Rescued</div>
              <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/70">
                {history.length} donation{history.length !== 1 ? 's' : ''} submitted
              </div>
            </div>

            {/* Recent history */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#131b2e]" style={S}>📋 Recent Donations</h3>
                <span className="text-xs text-[#6d7a72]">{history.length} total</span>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-3xl text-[#bccac0]">lunch_dining</span>
                  <p className="text-xs text-[#6d7a72] mt-2">No donations yet.<br />Submit your first one! 🍱</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {history.slice(0, 8).map(d => {
                    const ss = STATUS_STYLE[d.status] || STATUS_STYLE.available
                    return (
                      <div key={d._id} className="rounded-xl p-3" style={{ background: 'rgba(242,243,255,0.5)', border: '1px solid rgba(188,202,192,0.3)' }}>
                        <div className="font-bold text-xs text-[#131b2e]" style={S}>{d.foodName}</div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[11px] text-[#6d7a72]">{d.quantity} servings</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color }}>
                            {ss.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
