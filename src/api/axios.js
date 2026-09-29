import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shareplate_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// NOTE: The 401 response interceptor is registered in AuthContext so it can
// also clear React user state. Do not add a global 401 handler here.

export default api
