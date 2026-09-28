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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Hide top Navbar on portal/dashboard and auth routes that have their own sidebar/layout
  const isDashboardOrAuthRoute = ['/donate', '/ngo', '/volunteer', '/admin', '/donations', '/login', '/register'].includes(location.pathname)
  if (isDashboardOrAuthRoute) return null

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
      scrolled
        ? 'py-3'
        : 'py-4'
    }`}
    style={{
      background: scrolled ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.82)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid rgba(188, 202, 192, 0.35)',
      boxShadow: scrolled ? '0 10px 30px -6px rgba(0, 105, 72, 0.1)' : '0 4px 20px -4px rgba(0, 105, 72, 0.05)',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #006948, #00855d)' }}>
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <span className="text-[#006948] text-xl font-black">Share<span className="text-[#00855d]">Plate</span></span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center gap-2">
          <li>
            <Link to="/donations"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                isActive('/donations')
                  ? 'text-[#006948] bg-[#006948]/10 font-bold'
                  : 'text-[#3d4a42] hover:text-[#006948] hover:bg-[#006948]/8'
              }`}>
              Live Rescue Board
            </Link>
          </li>
          {user && roleLinks[user.role] && (
            <li>
              <Link to={roleLinks[user.role].to}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive(roleLinks[user.role].to)
                    ? 'text-[#006948] bg-[#006948]/10 font-bold'
                    : 'text-[#3d4a42] hover:text-[#006948] hover:bg-[#006948]/8'
                }`}>
                {roleLinks[user.role].label}
              </Link>
            </li>
          )}
          {user?.role === 'admin' && (
            <li>
              <Link to="/admin"
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive('/admin')
                    ? 'text-[#006948] bg-[#006948]/10 font-bold'
                    : 'text-[#3d4a42] hover:text-[#006948] hover:bg-[#006948]/8'
                }`}>
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold"
                style={{ background: 'rgba(242,243,255,0.8)', borderColor: 'rgba(188,202,192,0.4)', color: '#131b2e' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: '#006948' }} />
                <span>{user.firstName || user.name?.split(' ')[0]}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] text-white font-bold capitalize" style={{ background: '#006948' }}>
                  {user.role}
                </span>
              </div>
              <button onClick={handleLogout}
                className="px-4 py-2 text-xs font-bold text-[#3d4a42] border rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                style={{ borderColor: 'rgba(188,202,192,0.5)' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="px-5 py-2.5 text-xs font-bold text-[#006948] border rounded-full hover:bg-[#006948]/10 transition-all"
                style={{ borderColor: 'rgba(0,105,72,0.3)' }}>
                Sign In
              </Link>
              <Link to="/login"
                className="px-5 py-2.5 text-xs font-bold text-white rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #006948, #00855d)', boxShadow: '0 4px 16px -2px rgba(0,105,72,0.3)' }}>
                Join Now
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button className="lg:hidden text-[#131b2e] p-2 rounded-full hover:bg-gray-100" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t px-6 py-4 flex flex-col gap-3 mt-3 animate-fadeIn"
          style={{ background: 'rgba(255,255,255,0.98)', borderColor: 'rgba(188,202,192,0.3)' }}>
          <Link to="/donations" className="text-sm font-semibold text-[#131b2e] hover:text-[#006948] py-2" onClick={() => setOpen(false)}>Live Rescue Board</Link>
          {user && roleLinks[user.role] && (
            <Link to={roleLinks[user.role].to} className="text-sm font-semibold text-[#131b2e] hover:text-[#006948] py-2" onClick={() => setOpen(false)}>
              {roleLinks[user.role].label}
            </Link>
          )}
          {!user ? (
            <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: 'rgba(188,202,192,0.3)' }}>
              <Link to="/login" className="text-sm font-bold text-[#006948] py-2 text-center rounded-full border" style={{ borderColor: 'rgba(0,105,72,0.3)' }} onClick={() => setOpen(false)}>Sign In</Link>
              <Link to="/login" className="text-sm font-bold bg-[#006948] text-white px-4 py-2.5 rounded-full text-center shadow-md" onClick={() => setOpen(false)}>Join Now</Link>
            </div>
          ) : (
            <button onClick={() => { handleLogout(); setOpen(false) }} className="text-sm font-bold text-red-600 py-2 text-left">Sign Out</button>
          )}
        </div>
      )}
    </nav>
  )
}
