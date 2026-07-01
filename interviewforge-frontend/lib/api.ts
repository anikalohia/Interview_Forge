import axios from 'axios'
import { getAccessToken, setTokens, getRefreshToken, clearAuth } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = getRefreshToken()
      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refresh,
          })
          setTokens(res.data.access_token, refresh)
          original.headers.Authorization = `Bearer ${res.data.access_token}`
          return api(original)
        } catch {
          clearAuth()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
      } else {
        clearAuth()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
