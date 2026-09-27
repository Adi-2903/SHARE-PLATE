import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Utensils, LogIn } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name?.split(' ')[0]}! 🎉`)
      // Role-based redirect
      const routes = { donor: '/donate', ngo: '/ngo', volunteer: '/volunteer', admin: '/admin' }
      navigate(routes[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Demo quick login
  const demoLogin = async (email, password) => {
    setForm({ email, password })
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Demo login as ${user.role}`)
      const routes = { donor: '/donate', ngo: '/ngo', volunteer: '/volunteer', admin: '/admin' }
      navigate(routes[user.role] || '/')
    } catch {
      toast.error('Demo account not set up. Register first.')
    } finally { setLoading(false) }
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
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com" required
              className="w-full bg-white/5 border border-emerald-900/40 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-emerald-950/30 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-300 mb-2">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" required
              className="w-full bg-white/5 border border-emerald-900/40 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-emerald-950/30 transition-all text-sm" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-outfit font-bold rounded-xl transition-all flex items-center justify-center gap-2">
            {loading ? '⏳ Logging in…' : <><LogIn size={18} /> Login to SharePlate</>}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
            <div className="flex-1 h-px bg-emerald-900/30" />Demo Accounts
            <div className="flex-1 h-px bg-emerald-900/30" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '🏪 Donor',     email: 'donor@demo.com',     pass: 'demo1234' },
              { label: '🏥 NGO',       email: 'ngo@demo.com',       pass: 'demo1234' },
              { label: '🚴 Volunteer', email: 'volunteer@demo.com', pass: 'demo1234' },
              { label: '🛡️ Admin',     email: 'admin@demo.com',     pass: 'demo1234' },
            ].map(d => (
              <button key={d.label} onClick={() => demoLogin(d.email, d.pass)}
                className="text-xs py-2 px-3 bg-white/5 border border-emerald-900/30 rounded-lg text-gray-300 hover:text-emerald-400 hover:border-emerald-800/50 transition-all text-left">
                {d.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-600 mt-2 text-center">Register demo accounts first if not present</p>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account? <Link to="/register" className="text-emerald-400 font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  )
}
