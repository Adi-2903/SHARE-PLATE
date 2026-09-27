import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import DonatePage from './pages/DonatePage'
import DonationsBoard from './pages/DonationsBoard'
import NGODashboard from './pages/NGODashboard'
import VolunteerDashboard from './pages/VolunteerDashboard'
import AdminDashboard from './pages/AdminDashboard'

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-emerald-400 text-xl font-outfit animate-pulse">Loading SharePlate…</div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/donations" element={<DonationsBoard />} />

        <Route path="/donate" element={
          <ProtectedRoute allowedRoles={['donor', 'admin']}>
            <DonatePage />
          </ProtectedRoute>
        } />
        <Route path="/ngo" element={
          <ProtectedRoute allowedRoles={['ngo', 'admin']}>
            <NGODashboard />
          </ProtectedRoute>
        } />
        <Route path="/volunteer" element={
          <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0d1a14',
              color: '#f0fdf4',
              border: '1px solid rgba(16,185,129,0.3)',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#f0fdf4' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
