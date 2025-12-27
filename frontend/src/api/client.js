import axios from 'axios'
import { clearAuthTokens, getStoredTokens, setAuthTokens } from '../utils/tokens'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE}/api`,
})

api.interceptors.request.use((config) => {
  const tokens = getStoredTokens()
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`
  }
  return config
})

let refreshing = null
api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const status = error.response?.status
    const original = error.config
    if (status === 401 && !original._retry) {
      original._retry = true
      try {
        if (!refreshing) {
          const tokens = getStoredTokens()
          refreshing = api.post('/auth/refresh/', { refresh: tokens?.refresh })
        }
        const { data } = await refreshing
        refreshing = null
        setAuthTokens(data.access, data.refresh)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch (err) {
        refreshing = null
        clearAuthTokens()
      }
    }
    return Promise.reject(error)
  }
)

export default api