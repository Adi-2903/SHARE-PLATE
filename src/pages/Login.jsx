import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Utensils, LogIn } from 'lucide-react'

// Demo account full profiles for auto-registration
const DEMO_ACCOUNTS = [
  {
    label: '🏪 Donor',
    email: 'donor@demo.com',
    password: 'demo1234',
    role: 'donor',
    firstName: 'Spice',
    lastName: 'Garden',
    orgName: 'Spice Garden Restaurant',
    phone: '9000000002',
    city: 'Pune',
    pincode: '411001',
  },
  {
    label: '🏥 NGO',
    email: 'ngo@demo.com',
    password: 'demo1234',
    role: 'ngo',
    firstName: 'Sunrise',
    lastName: 'Foundation',
    orgName: 'Sunrise Foundation',
    phone: '9000000003',
    city: 'Pune',
    pincode: '411002',
  },
  {
    label: '🚴 Volunteer',
    email: 'volunteer@demo.com',
    password: 'demo1234',
    role: 'volunteer',
    firstName: 'Rahul',
    lastName: 'Kumar',
    orgName: '',
    phone: '9000000004',
    city: 'Pune',
    pincode: '411003',
  },
  {
    label: '🛡️ Admin',
    email: 'admin@demo.com',
    password: 'demo1234',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    orgName: 'SharePlate HQ',
    phone: '9000000001',
    city: 'Mumbai',
    pincode: '400001',
  },
]

const ROLE_ROUTES = { donor: '/donate', ngo: '/ngo', volunteer: '/volunteer', admin: '/admin' }

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(null) // tracks which demo btn is loading

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name?.split(' ')[0]}! 🎉`)
      navigate(ROLE_ROUTES[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-register if not present, then login
  const demoLogin = async (account) => {
    setDemoLoading(account.label)
    const toastId = toast.loading(`⏳ Setting up ${account.label} demo…`)
    try {
      // Step 1: Try to login directly
      const user = await login(account.email, account.password)
      toast.success(`✅ Logged in as ${account.role}!`, { id: toastId })
      navigate(ROLE_ROUTES[user.role] || '/')
    } catch (loginErr) {
      // Step 2: If 401 (invalid credentials) or 404 → auto-register first
      const status = loginErr.response?.status
      if (status === 401 || status === 404 || !status) {
        try {
          toast.loading(`🌱 Creating demo account for ${account.label}…`, { id: toastId })
          // Register the demo account
          await api.post('/auth/register', {
            firstName: account.firstName,
            lastName: account.lastName,
            email: account.email,
            password: account.password,
            phone: account.phone,
            role: account.role,
            orgName: account.orgName,
            city: account.city,
            pincode: account.pincode,
          })
          // Now login with fresh credentials
          const user = await login(account.email, account.password)
          toast.success(`✅ Demo account created! Logged in as ${account.role} 🎉`, { id: toastId })
          navigate(ROLE_ROUTES[user.role] || '/')
        } catch (regErr) {
          // Account might already exist with wrong password — just show error
          toast.error(
            regErr.response?.data?.error || 'Could not create demo account. Is the backend running?',
            { id: toastId }
          )
        }
      } else {
        toast.error(loginErr.response?.data?.error || 'Demo login failed.', { id: toastId })
      }
    } finally {
      setDemoLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10 relative">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-emerald-600/15 blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-orange-600/10 blur-[80px]" />
      </div>

      <div className="glass-card rounded-3xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Utensils className="text-emerald-400 mx-auto mb-3" size={40} />
          <h1 className="font-outfit font-black text-3xl mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Login to your SharePlate account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-emerald-300 mb-2">Email Address</label>
            <input
              type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com" required
              className="w-full bg-white/5 border border-emerald-900/40 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-emerald-950/30 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-300 mb-2">Password</label>
            <input
              type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" required
              className="w-full bg-white/5 border border-emerald-900/40 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-emerald-950/30 transition-all text-sm"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-outfit font-bold rounded-xl transition-all flex items-center justify-center gap-2">
            {loading ? '⏳ Logging in…' : <><LogIn size={18} /> Login to SharePlate</>}
          </button>
        </form>

        {/* ── DEMO ACCOUNTS ── */}
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
            <div className="flex-1 h-px bg-emerald-900/30" />
            <span>One-Click Demo Login</span>
            <div className="flex-1 h-px bg-emerald-900/30" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(d => (
              <button
                key={d.label}
                onClick={() => demoLogin(d)}
                disabled={!!demoLoading}
                className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border text-left transition-all text-xs font-outfit font-semibold
                  ${demoLoading === d.label
                    ? 'border-emerald-600 bg-emerald-950/50 text-emerald-400'
                    : 'border-emerald-900/30 bg-white/5 text-gray-300 hover:text-emerald-400 hover:border-emerald-700/50 hover:bg-emerald-950/30'
                  } disabled:cursor-wait`}
              >
                <span className="text-base">{d.label.split(' ')[0]}</span>
                <span>
                  {demoLoading === d.label ? 'Loading…' : d.label.split(' ').slice(1).join(' ')}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 bg-emerald-950/30 border border-emerald-900/30 rounded-xl p-3">
            <p className="text-[11px] text-emerald-400/80 font-outfit font-semibold mb-1">
              ⚡ Auto-Setup Included
            </p>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Clicking any demo button will automatically create the account
              if it doesn't exist, then log you in instantly.
              <br />
              <span className="text-gray-600">Password for all: <code className="text-emerald-600">demo1234</code></span>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
