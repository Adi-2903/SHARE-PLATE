import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ROLES = ['donor', 'ngo', 'volunteer', 'admin']
const ROLE_ICONS = { donor: '🏪', ngo: '🏥', volunteer: '🚴', admin: '🛡️' }
const ROLE_LABELS = { donor: 'Donor', ngo: 'NGO', volunteer: 'Volunteer', admin: 'Admin' }

export default function Register() {
  const { register } = useAuth()
  const navigate      = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'donor', orgName: '', city: '', pincode: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Account created! Welcome, ${user.name?.split(' ')[0]}! 🌱`)
      const routes = { donor: '/donate', ngo: '/ngo', volunteer: '/volunteer', admin: '/admin' }
      navigate(routes[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.')
    } finally { setLoading(false) }
  }

  const inputCls = 'w-full bg-white/5 border border-emerald-900/40 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-emerald-950/30 transition-all text-sm'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-10 relative">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-emerald-600/15 blur-[80px]" />
      </div>

      <div className="glass-card rounded-3xl p-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌱</div>
          <h1 className="font-outfit font-black text-3xl mb-2">Create Account</h1>
          <p className="text-gray-400 text-sm">Join SharePlate and start making a difference</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {ROLES.map(role => (
            <button key={role} type="button" onClick={() => setForm({ ...form, role })}
              className={`flex flex-col items-center py-3 px-2 rounded-xl border text-center transition-all ${form.role === role ? 'border-emerald-500 bg-emerald-950/50 text-emerald-400' : 'border-emerald-900/30 bg-white/3 text-gray-400 hover:border-emerald-800/50'}`}>
              <span className="text-xl mb-1">{ROLE_ICONS[role]}</span>
              <span className="font-outfit font-bold text-xs">{ROLE_LABELS[role]}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1.5">First Name *</label>
              <input value={form.firstName} onChange={set('firstName')} placeholder="Aditya" required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Last Name *</label>
              <input value={form.lastName} onChange={set('lastName')} placeholder="Kumar" required className={inputCls} />
            </div>
          </div>

          {(form.role === 'donor' || form.role === 'ngo') && (
            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Organization Name</label>
              <input value={form.orgName} onChange={set('orgName')} placeholder="e.g. Spice Garden Restaurant" className={inputCls} />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Phone *</label>
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" required className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1.5">City *</label>
              <input value={form.city} onChange={set('city')} placeholder="Pune" required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Pincode</label>
              <input value={form.pincode} onChange={set('pincode')} placeholder="411001" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Password * (min 6 chars)</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required className={inputCls} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-outfit font-bold rounded-xl transition-all mt-2">
            {loading ? '⏳ Creating Account…' : '🌱 Create My Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-emerald-400 font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  )
}
