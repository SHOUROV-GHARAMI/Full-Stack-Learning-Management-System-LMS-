import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { refreshToken, setAuthTokens, clearAuthTokens, getStoredTokens } from '../utils/tokens'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tokens = getStoredTokens()
    if (!tokens) {
      setLoading(false)
      return
    }

    refreshToken(tokens.refresh)
      .then((data) => {
        setAuthTokens(data.access, data.refresh)
        setUser(data.user)
      })
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(
    () => ({ user, setUser, loading, setLoading, logout: () => { clearAuthTokens(); setUser(null) } }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)