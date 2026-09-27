import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

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
        .catch(() => localStorage.removeItem('shareplate_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('shareplate_token', data.token)
    setUser(data)
    return data
  }

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData)
    localStorage.setItem('shareplate_token', data.token)
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('shareplate_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
