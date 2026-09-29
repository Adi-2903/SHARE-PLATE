import { createContext, useContext, useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

// Normalise any API user payload to a consistent shape used across the app.
// Both /auth/login, /auth/register and /auth/me return slightly different shapes.
function normaliseUser(data) {
  if (!data) return null
  return {
    ...data,
    // Ensure `name` is always present (login/register return it; /me does not)
    name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)
  // Keep a ref so the Axios 401 interceptor (registered once) can access current setter
  const setUserRef = useRef(setUser)
  setUserRef.current = setUser

  // Register 401 interceptor once — clears BOTH token AND React user state
  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('shareplate_token')
          localStorage.removeItem('shareplate_mock_user')
          setUserRef.current(null)
        }
        return Promise.reject(err)
      }
    )
    return () => api.interceptors.response.eject(id)
  }, [])

  // On mount, restore user from token
  useEffect(() => {
    const token = localStorage.getItem('shareplate_token')
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => setUser(normaliseUser(data)))
        .catch(() => {
          // If offline mode token, restore mock user
          if (token === 'mock-token-123') {
            const mockUser = JSON.parse(localStorage.getItem('shareplate_mock_user') || 'null')
            if (mockUser) setUser(normaliseUser(mockUser))
          } else {
            localStorage.removeItem('shareplate_token')
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const u = normaliseUser(data)
      localStorage.setItem('shareplate_token', data.token)
      setUser(u)
      return u
    } catch (err) {
      // 🚨 OFFLINE PREVIEW FALLBACK 🚨
      // If backend is down (network error or Vite proxy 502/504), mock the login
      if (!err.response || err.response.status >= 500) {
        toast('Backend offline: Using Preview Mode', { icon: '👁️' })

        // Extract role from the email (e.g. ngo@demo.com -> ngo)
        const roleMatch = email.split('@')[0]
        const role = ['donor', 'ngo', 'volunteer', 'admin'].includes(roleMatch) ? roleMatch : 'donor'

        const mockData = normaliseUser({
          _id: 'mock-123',
          firstName: 'Demo',
          lastName: role.charAt(0).toUpperCase() + role.slice(1),
          name: 'Demo ' + role.charAt(0).toUpperCase() + role.slice(1),
          email,
          role,
          token: 'mock-token-123',
        })
        localStorage.setItem('shareplate_token', mockData.token)
        localStorage.setItem('shareplate_mock_user', JSON.stringify(mockData))
        setUser(mockData)
        return mockData
      }
      throw err // If it's a real 401/404, throw normally
    }
  }

  // register: create account, store token, set user — returns a navigation-ready user object.
  // Callers should NOT call login() again after register(); the user is already authenticated.
  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData)
    const u = normaliseUser(data)
    localStorage.setItem('shareplate_token', data.token)
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('shareplate_token')
    localStorage.removeItem('shareplate_mock_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
