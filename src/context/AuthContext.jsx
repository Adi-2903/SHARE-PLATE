import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, restore user from token
  useEffect(() => {
    const token = localStorage.getItem('shareplate_token')
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => {
          // If offline mode token, restore mock user
          if (token === 'mock-token-123') {
            const mockUser = JSON.parse(localStorage.getItem('shareplate_mock_user'))
            if (mockUser) setUser(mockUser)
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
      localStorage.setItem('shareplate_token', data.token)
      setUser(data)
      return data
    } catch (err) {
      // 🚨 OFFLINE PREVIEW FALLBACK 🚨
      // If backend is down (network error or Vite proxy 502/504), mock the login
      if (!err.response || err.response.status >= 500) {
        toast('Backend offline: Using Preview Mode', { icon: '👁️' })
        
        // Extract role from the email (e.g. ngo@demo.com -> ngo)
        const roleMatch = email.split('@')[0]
        const role = ['donor', 'ngo', 'volunteer', 'admin'].includes(roleMatch) ? roleMatch : 'donor'

        const mockData = {
          _id: 'mock-123',
          name: 'Demo ' + role.charAt(0).toUpperCase() + role.slice(1),
          email: email,
          role: role,
          token: 'mock-token-123'
        }
        localStorage.setItem('shareplate_token', mockData.token)
        localStorage.setItem('shareplate_mock_user', JSON.stringify(mockData))
        setUser(mockData)
        return mockData
      }
      throw err // If it's a real 401/404, throw normally
    }
  }

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData)
    localStorage.setItem('shareplate_token', data.token)
    setUser(data)
    return data
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
