import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shareplate_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-redirect to login on 401 Unauthorized
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shareplate_token')
    }
    return Promise.reject(err)
  }
)

export default api
