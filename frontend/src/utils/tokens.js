const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

export const getStoredTokens = () => {
  const access = localStorage.getItem(ACCESS_KEY)
  const refresh = localStorage.getItem(REFRESH_KEY)
  if (!access || !refresh) return null
  return { access, refresh }
}

export const setAuthTokens = (access, refresh) => {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export const refreshToken = async (refresh) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!res.ok) throw new Error('Refresh failed')
  return res.json()
}