import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, Utensils } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  // Hide top Navbar on portal/dashboard routes that have their own sidebar
  const isDashboardRoute = ['/donate', '/ngo', '/volunteer', '/admin', '/donations'].includes(location.pathname)
  if (isDashboardRoute) return null

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  const roleLinks = {
    donor:     { label: 'Donate Food', to: '/donate' },
    ngo:       { label: 'NGO Portal',  to: '/ngo' },
    volunteer: { label: 'My Pickups',  to: '/volunteer' },
    admin:     { label: 'Admin Panel', to: '/admin' },
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#070d0a]/95 backdrop-blur-xl border-b border-emerald-900/30 shadow-2xl py-3' : 'py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-outfit font-black text-xl">
          <Utensils className="text-emerald-400" size={24} />
          <span>Share<span className="text-emerald-400">Plate</span></span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center gap-1">
          <li><Link to="/donations" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/donations') ? 'text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-emerald-900/20'}`}>Donations</Link></li>
          {user && roleLinks[user.role] && (
            <li>
              <Link to={roleLinks[user.role].to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(roleLinks[user.role].to) ? 'text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-emerald-900/20'}`}>
                {roleLinks[user.role].label}
              </Link>
            </li>
          )}
          {user?.role === 'admin' && (
            <li><Link to="/admin" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin') ? 'text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-emerald-900/20'}`}>Admin</Link></li>
          )}
        </ul>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-400 font-outfit">
                👤 {user.name?.split(' ')[0]} <span className="text-emerald-400 text-xs">({user.role})</span>
              </span>
              <button onClick={handleLogout}
                className="px-4 py-2 text-sm font-outfit font-semibold text-gray-400 border border-emerald-900/40 rounded-xl hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/40 transition-all">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-outfit font-semibold text-emerald-400 border border-emerald-800/60 rounded-xl hover:bg-emerald-900/20 transition-all">Login</Link>
              <Link to="/register" className="px-4 py-2 text-sm font-outfit font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/40">Join Now</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button className="lg:hidden text-gray-400" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-[#0d1a14] border-t border-emerald-900/30 px-6 py-4 flex flex-col gap-3">
          <Link to="/donations" className="text-sm text-gray-300 hover:text-emerald-400 py-2" onClick={() => setOpen(false)}>Donations</Link>
          {user && roleLinks[user.role] && (
            <Link to={roleLinks[user.role].to} className="text-sm text-gray-300 hover:text-emerald-400 py-2" onClick={() => setOpen(false)}>
              {roleLinks[user.role].label}
            </Link>
          )}
          {!user ? (
            <>
              <Link to="/login" className="text-sm text-emerald-400 py-2" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl text-center" onClick={() => setOpen(false)}>Join Now</Link>
            </>
          ) : (
            <button onClick={() => { handleLogout(); setOpen(false) }} className="text-sm text-red-400 py-2 text-left">Logout</button>
          )}
        </div>
      )}
    </nav>
  )
}
