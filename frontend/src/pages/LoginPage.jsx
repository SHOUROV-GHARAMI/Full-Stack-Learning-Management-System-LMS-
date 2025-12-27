import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { setAuthTokens } from '../utils/tokens'
import { useAuth } from '../state/AuthProvider'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setUser, setLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login/', { email, password })
      setAuthTokens(data.access, data.refresh)
      setUser(data.user)

      if (data.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (data.user.role === 'instructor') {
        navigate('/instructor/dashboard')
      } else if (data.user.role === 'student') {
        navigate('/student/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '450px', margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>🔐</span>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Welcome Back!</h1>
        <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>Login to continue your learning journey</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '2rem', borderRadius: '12px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>Email</label>
            <input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              type="email" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>Password</label>
            <input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem' }}
            />
          </div>
          {error && <div style={{ background: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '8px', fontWeight: '500' }}>{error}</div>}
          <button 
            type="submit"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}
          >
            Login
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', color: '#4a5568' }}>
        <p>Need an account? <Link to="/register" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>Register</Link></p>
        <p><Link to="/forgot-password" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>Forgot password?</Link></p>
      </div>
    </div>
  )
}

export default LoginPage