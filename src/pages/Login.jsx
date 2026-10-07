import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils/errorHandler'
import { getRoleRoute } from '../utils/roleRoutes'

const DEMO_ACCOUNTS = [
  { label: 'Donor', icon: 'restaurant', email: 'donor@demo.com', password: 'demo1234', role: 'donor', firstName: 'Rohan', lastName: 'Kumar', orgName: "The Grand Bhagwati Banquets", phone: '9000000002', city: 'Ahmedabad', pincode: '380054' },
  { label: 'NGO', icon: 'apartment', email: 'ngo@demo.com', password: 'demo1234', role: 'ngo', firstName: 'Sarthi', lastName: 'Foundation', orgName: 'Sarthi Foundation Ahmedabad', phone: '9000000003', city: 'Ahmedabad', pincode: '380015' },
  { label: 'Volunteer', icon: 'directions_bike', email: 'volunteer@demo.com', password: 'demo1234', role: 'volunteer', firstName: 'Aman', lastName: 'Patel', orgName: '', phone: '9000000004', city: 'Ahmedabad', pincode: '380015' },
  { label: 'Admin', icon: 'admin_panel_settings', email: 'admin@demo.com', password: 'demo1234', role: 'admin', firstName: 'Elena', lastName: 'Vance', orgName: 'SharePlate HQ', phone: '9000000001', city: 'Mumbai', pincode: '400001' },
]

const S = { fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }

function GlassPanel({ children, className = '' }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 16px 40px -8px rgba(0,105,72,0.08), 0 2px 8px -2px rgba(19,27,46,0.04)' }}>
      {children}
    </div>
  )
}

function InputField({ label, icon, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#131b2e] mb-1.5">{label}</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7a72] text-lg">{icon}</span>
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
          className="w-full pl-11 pr-4 py-3 rounded-full text-sm text-[#131b2e] placeholder-[#94a3b8] placeholder:font-normal outline-none transition-all"
          style={{ background: '#ffffff', border: '1px solid rgba(188,202,192,0.6)', focusRing: '2px solid #006948' }}
          onFocus={e => { e.target.style.borderColor = '#006948'; e.target.style.boxShadow = '0 0 0 3px rgba(0,105,72,0.12)' }}
          onBlur={e => { e.target.style.borderColor = 'rgba(188,202,192,0.6)'; e.target.style.boxShadow = 'none' }}
        />
      </div>
    </div>
  )
}

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', city: '', pincode: '', orgName: '', role: 'donor' })
  const [loading, setLoading] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(loginForm.email, loginForm.password)
      toast.success(`Welcome back! 🎉`)
      navigate(getRoleRoute(user.role))
    } catch (err) {
      // Auto-fallback: If a demo account was selected but not in DB yet, auto-register and login!
      const demoAcc = DEMO_ACCOUNTS.find(a => a.email === loginForm.email && a.password === loginForm.password)
      if (demoAcc) {
        try {
          await api.post('/auth/register', {
            firstName: demoAcc.firstName,
            lastName: demoAcc.lastName,
            email: demoAcc.email,
            password: demoAcc.password,
            phone: demoAcc.phone,
            role: demoAcc.role,
            orgName: demoAcc.orgName,
            city: demoAcc.city,
            pincode: demoAcc.pincode,
          })
          const user = await login(demoAcc.email, demoAcc.password)
          toast.success(`Demo ready! Logged in as ${demoAcc.role} 🎉`)
          navigate(getRoleRoute(user.role))
          return
        } catch {}
      }
      toast.error(getErrorMessage(err, 'Login failed. Please check your credentials.'))
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // register() already stores the token and sets user — no need to call login() again.
      const user = await register(regForm)
      toast.success('Account created! 🌱')
      navigate(getRoleRoute(user.role))
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed.'))
    } finally { setLoading(false) }
  }

  // Auto-fill credentials on clicking demo role button
  const handleSelectDemo = (acc) => {
    setLoginForm({ email: acc.email, password: acc.password })
    setSelectedDemo(acc.label)
    toast.success(`✨ Auto-filled ${acc.label} credentials! Now click "Sign In" below 🚀`, { id: 'demo-fill' })
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif", background: '#faf8ff' }}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── LEFT HERO COLUMN ─────────────────────────────── */}
      <section className="hidden lg:flex lg:w-[46%] xl:w-[44%] relative overflow-hidden flex-col justify-between p-12 xl:p-14 text-white"
        style={{ background: 'linear-gradient(135deg, #064e3b, #047857, #014731)' }}>
        {/* Ambient glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(133,248,196,0.2)' }} />
        <div className="absolute -bottom-24 -right-24 w-[450px] h-[450px] rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(111,251,190,0.15)' }} />

        {/* Top content */}
        <div className="relative z-10 space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold text-white hover:bg-white/20 transition-all"
            style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#85f8c4' }} />
            SharePlate • Food Rescue Network
          </Link>

          <div>
            <h1 className="text-5xl font-bold leading-none mb-3 tracking-tight" style={S}>
              Small Actions.<br />
              <span className="italic font-normal" style={{ color: '#85f8c4' }}>Big Impact.</span>
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Join a community that believes in a kinder, healthier and greener future. Every surplus meal rescued brings our city closer to zero waste.
            </p>
          </div>

          {/* Showcase card */}
          <div className="relative rounded-2xl p-4 shadow-2xl mt-4"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.22)' }}>
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMPK60_AdBUy8YEUS_aAA7Gohyd7174klNHc1HK1Z6MQkjCjF0yvpRqImyS77niIaNA3zGpDiGw8ChrXC59nAL-2Fdb0IBtw51T6NeO6AlsG39sMCeMKHqXxkre1SuAncYR8-p7VCZXeYj9lGzxSYM5r5bdbvi0k-0AL9lsX-q36QDqcuTF44CSYqw4JWX6x5UsveCHvXQLwREfkJ1Br7luz9aBiFs6ijasAYOS3tiscRIKbwtlHZuUVveC1k4SFh1nPv33KI5Etc"
                alt="Sprouting seedling" className="w-full h-full object-cover"
                onError={e => { e.target.style.background = 'linear-gradient(135deg,#064e3b,#047857)'; e.target.style.display = 'block' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2), transparent)' }} />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                  <span className="material-symbols-outlined text-sm" style={{ color: '#85f8c4', fontVariationSettings: "'FILL' 1" }}>spa</span>
                  Cultivating Zero Waste
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg" style={{ color: '#85f8c4' }}>bolt</span>
                  <div>
                    <div className="text-base font-bold">48.7 Tons</div>
                    <div className="text-xs opacity-75">Rescued this month</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold" style={{ color: '#85f8c4' }}>12,480+</div>
                  <div className="text-xs opacity-75">Wholesome meals served</div>
                </div>
              </div>
            </div>

            {/* Community proof */}
            <div className="mt-4 pt-3.5 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[['CH','#00855d'],['EK','#b45309'],['MR','#0284c7'],['8k','#006c49']].map(([init,bg],i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: bg }}>{init === '8k' ? '+'+init : init}</div>
                  ))}
                </div>
                <p className="text-xs opacity-80">Partnered with <strong className="text-white">1,400+</strong> artisanal kitchens & shelters</p>
              </div>
              <span className="material-symbols-outlined text-xl" style={{ color: '#85f8c4', fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
        </div>

        {/* Bottom certification strip */}
        <div className="relative z-10 pt-8 mt-6 border-t flex items-center justify-between text-xs opacity-70"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color: '#85f8c4' }}>local_florist</span>
            <span>Certified Safe Organic Redistribution Protocol</span>
          </div>
          <div className="flex items-center gap-1" style={{ color: '#85f8c4' }}>
            <span className="material-symbols-outlined text-sm">shield</span>
            <span className="font-bold text-xs">ISO 22000 Compatible</span>
          </div>
        </div>
      </section>

      {/* ── RIGHT FORMS COLUMN ─────────────────────────── */}
      <section className="flex-1 flex flex-col justify-center px-6 sm:px-12 xl:px-16 py-10 relative" style={{ background: '#faf8ff' }}>
        {/* Watermark */}
        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5">
          <span className="material-symbols-outlined text-[160px] text-[#006948]">psychiatry</span>
        </div>

        <div className="w-full max-w-xl mx-auto space-y-6">
          {/* Top Brand & Navigation Header */}
          <div className="flex items-center justify-between pb-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-[#006948]" style={S}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #006948, #00855d)' }}>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              </div>
              <span className="text-xl tracking-tight font-black">Share<span className="text-[#00855d]">Plate</span></span>
            </Link>
            <Link to="/" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#3d4a42] hover:text-[#006948] transition-all border"
              style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(188,202,192,0.4)' }}>
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Home
            </Link>
          </div>

          {/* Tab toggle */}
          <div className="flex p-1.5 rounded-full max-w-md mx-auto border"
            style={{ background: '#e2e7ff', borderColor: 'rgba(188,202,192,0.3)' }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2.5 rounded-full text-sm font-bold text-center transition-all duration-200"
                style={tab === t
                  ? { background: '#ffffff', color: '#006948', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }
                  : { color: '#3d4a42' }}>
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <GlassPanel className="p-8 sm:p-10">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#131b2e] tracking-tight" style={S}>Welcome Back!</h2>
                <p className="text-sm text-[#3d4a42] mt-1">Enter your credentials to access your rescue dashboard</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <InputField label="Email Address" icon="mail" type="email" value={loginForm.email}
                  onChange={e => setLoginForm({...loginForm, email: e.target.value})} placeholder="name@restaurant.com" required />
                <InputField label="Password" icon="lock" type="password" value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" required />
                <div className="flex items-center justify-between">
                  {selectedDemo && (
                    <span className="text-xs font-bold text-[#006948] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      ✨ {selectedDemo} credentials filled
                    </span>
                  )}
                  <Link to="#" className="text-xs font-semibold hover:underline ml-auto" style={{ color: '#006948' }}>Forgot password?</Link>
                </div>
                <button type="submit" disabled={loading}
                  className={`w-full py-3.5 rounded-full text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 mt-2 ${
                    selectedDemo ? 'ring-4 ring-emerald-300/60 shadow-lg shadow-emerald-700/20' : ''
                  }`}
                  style={{ background: 'linear-gradient(135deg, #006948, #00855d)', boxShadow: '0 8px 24px -4px rgba(0,105,72,0.35)' }}>
                  {loading ? '⏳ Signing In…' : selectedDemo ? `Sign In as ${selectedDemo} →` : 'Sign In to SharePlate'}
                </button>
              </form>

              {/* Demo quick auto-fill selection */}
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-px" style={{ background: 'rgba(188,202,192,0.4)' }} />
                  <span className="text-xs text-[#6d7a72] font-semibold">Demo Accounts (Click to Auto-Fill)</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(188,202,192,0.4)' }} />
                </div>
                <p className="text-[11px] text-[#64748b] text-center mb-3">
                  Click any role below to automatically fill credentials, then click <b>Sign In</b>.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map(acc => (
                    <button key={acc.label} type="button" onClick={() => handleSelectDemo(acc)}
                      className="flex items-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all text-left group"
                      style={selectedDemo === acc.label
                        ? { borderColor: '#006948', background: 'rgba(0,105,72,0.12)', color: '#006948', boxShadow: '0 0 0 2px rgba(0,105,72,0.2)' }
                        : { borderColor: 'rgba(188,202,192,0.5)', background: 'rgba(255,255,255,0.7)', color: '#3d4a42' }}>
                      <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform" style={{ color: '#006948' }}>{acc.icon}</span>
                      <div className="overflow-hidden">
                        <div className="font-bold truncate">{acc.label}</div>
                        <div className="text-[10px] text-[#64748b] truncate">{acc.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-center text-sm text-[#3d4a42] mt-6">
                Don't have an account?{' '}
                <button onClick={() => setTab('register')} className="font-semibold hover:underline" style={{ color: '#006948' }}>Create Account</button>
              </p>
            </GlassPanel>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <GlassPanel className="p-8 sm:p-10">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#131b2e] tracking-tight" style={S}>Join SharePlate</h2>
                <p className="text-sm text-[#3d4a42] mt-1">Create your account and start making a difference today</p>
              </div>

              {/* Role selector */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#131b2e] mb-2">I am joining as…</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{role:'donor',icon:'restaurant',label:'Donor'},{role:'ngo',icon:'apartment',label:'NGO'},{role:'volunteer',icon:'directions_bike',label:'Volunteer'}].map(r => (
                    <button key={r.role} type="button" onClick={() => setRegForm({...regForm, role: r.role})}
                      className="flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-bold transition-all"
                      style={regForm.role === r.role
                        ? { background: 'rgba(0,105,72,0.1)', borderColor: '#006948', color: '#006948' }
                        : { background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(188,202,192,0.5)', color: '#3d4a42' }}>
                      <span className="material-symbols-outlined text-xl">{r.icon}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField label="First Name" icon="person" value={regForm.firstName} onChange={e => setRegForm({...regForm,firstName:e.target.value})} placeholder="Rohan" required />
                  <InputField label="Last Name" icon="person" value={regForm.lastName} onChange={e => setRegForm({...regForm,lastName:e.target.value})} placeholder="Kumar" required />
                </div>
                {(regForm.role === 'donor' || regForm.role === 'ngo') && (
                  <InputField label="Organization Name" icon="store" value={regForm.orgName} onChange={e => setRegForm({...regForm,orgName:e.target.value})} placeholder="Your Restaurant / NGO" />
                )}
                <InputField label="Email Address" icon="mail" type="email" value={regForm.email} onChange={e => setRegForm({...regForm,email:e.target.value})} placeholder="you@example.com" required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField label="Phone" icon="phone" value={regForm.phone} onChange={e => setRegForm({...regForm,phone:e.target.value})} placeholder="+91 98765 43210" required />
                  <InputField label="City" icon="location_city" value={regForm.city} onChange={e => setRegForm({...regForm,city:e.target.value})} placeholder="e.g. Pune, Mumbai" required />
                </div>
                <InputField label="Password" icon="lock" type="password" value={regForm.password} onChange={e => setRegForm({...regForm,password:e.target.value})} placeholder="Min 6 characters" required />
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-full text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 mt-2"
                  style={{ background: 'linear-gradient(135deg, #006948, #00855d)', boxShadow: '0 8px 24px -4px rgba(0,105,72,0.35)' }}>
                  {loading ? '⏳ Creating Account…' : '🌱 Create My Account'}
                </button>
              </form>

              <p className="text-center text-sm text-[#3d4a42] mt-4">
                Already have an account?{' '}
                <button onClick={() => setTab('login')} className="font-semibold hover:underline" style={{ color: '#006948' }}>Sign In</button>
              </p>
            </GlassPanel>
          )}
        </div>
      </section>
    </div>
  )
}
