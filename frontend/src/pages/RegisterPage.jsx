import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'

const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/auth/register/', { email, password, role })
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.password?.[0] || err.response?.data?.detail || 'Registration failed'
      setError(msg)
    }
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '450px', margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '2rem', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>🎓</span>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Join Us Today!</h1>
        <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>Create your account and start learning</p>
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
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>Register As</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem', cursor: 'pointer' }}
            >
              <option value="student">👨‍🎓 Student</option>
              <option value="instructor">👨‍🏫 Instructor</option>
            </select>
          </div>
          {error && <div style={{ background: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '8px', fontWeight: '500' }}>{error}</div>}
          <button 
            type="submit"
            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}
          >
            Create Account
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', color: '#4a5568' }}>
        <p>Already have an account? <Link to="/login" style={{ color: '#f093fb', fontWeight: '600', textDecoration: 'none' }}>Login</Link></p>
      </div>
    </div>
  )
}

export default RegisterPage