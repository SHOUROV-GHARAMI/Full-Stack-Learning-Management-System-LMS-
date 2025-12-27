import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../state/AuthProvider'
import LoadingBlock from '../components/LoadingBlock'
import StatusMessage from '../components/StatusMessage'

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', bio: '', profile_image: null })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .get('/profile/')
      .then(({ data }) => setForm({ ...data, profile_image: null }))
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const payload = { 
        name: form.name || '',
        phone: form.phone || ''
      }

      if (user?.role === 'instructor') {
        payload.bio = form.bio || ''
      }

      setSaving(true)
      const { data } = await api.patch('/profile/', payload)
      setMessage('Profile updated successfully!')
      setForm({ ...data, profile_image: null })

      if (user) {
        setUser({ 
          ...user, 
          profile: data
        })
      }
    } catch (err) {
      console.error('Profile update error:', err)
      console.error('Error response:', err.response)

      let errorMsg = 'Failed to update profile. Please try again.'

      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message
        } else if (err.response.data.error) {
          errorMsg = err.response.data.error
        } else {

          const fieldErrors = Object.entries(err.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ')
          if (fieldErrors) errorMsg = fieldErrors
        }
      }

      setError(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>👤 My Profile</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>Manage your account information</p>
      </div>

      {loading && <LoadingBlock label="Loading profile..." />}
      {message && <StatusMessage type="success">{message}</StatusMessage>}
      {error && <StatusMessage type="error">{error}</StatusMessage>}

      {!loading && (
        <>
          {}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748', fontSize: '1.2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              📋 Profile Information
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f7fafc', borderRadius: '6px' }}>
                <span style={{ fontWeight: '600', color: '#4a5568' }}>Email:</span>
                <span style={{ color: '#2d3748' }}>{user?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f7fafc', borderRadius: '6px' }}>
                <span style={{ fontWeight: '600', color: '#4a5568' }}>Registration Number:</span>
                <span style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>
                  {form.registration_number || user?.registration_number || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f7fafc', borderRadius: '6px' }}>
                <span style={{ fontWeight: '600', color: '#4a5568' }}>Role:</span>
                <span style={{ 
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {user?.role}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f7fafc', borderRadius: '6px' }}>
                <span style={{ fontWeight: '600', color: '#4a5568' }}>Name:</span>
                <span style={{ color: '#2d3748' }}>{form.name || 'Not set'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f7fafc', borderRadius: '6px' }}>
                <span style={{ fontWeight: '600', color: '#4a5568' }}>Phone:</span>
                <span style={{ color: '#2d3748' }}>{form.phone || 'Not set'}</span>
              </div>
              {user?.role === 'instructor' && (
                <div style={{ padding: '0.75rem', background: '#f7fafc', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '600', color: '#4a5568', display: 'block', marginBottom: '0.5rem' }}>Bio:</span>
                  <span style={{ color: '#2d3748', whiteSpace: 'pre-wrap' }}>{form.bio || 'Not set'}</span>
                </div>
              )}
            </div>
          </div>

          {}
          <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '2rem', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#2d3748', fontSize: '1.2rem', textAlign: 'center' }}>
              ✏️ Edit Profile
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem', maxWidth: '500px', margin: '0 auto' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>Name</label>
                <input 
                  name="name" 
                  value={form.name || ''} 
                  onChange={handleChange} 
                  disabled={saving}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>Phone</label>
                <input 
                  name="phone" 
                  value={form.phone || ''} 
                  onChange={handleChange} 
                  disabled={saving}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem' }}
                />
              </div>
              {user?.role === 'instructor' && (
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>Bio (Required for instructors)</label>
                  <textarea 
                    name="bio" 
                    value={form.bio || ''} 
                    onChange={handleChange} 
                    disabled={saving}
                    rows="4"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem', resize: 'vertical' }}
                  />
                </div>
              )}
              <button 
                type="submit" 
                disabled={saving}
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}
              >
                {saving ? '💾 Saving...' : '✅ Save Profile'}
              </button>
            </form>
          </div>

          {}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748', fontSize: '1.1rem' }}>Account Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '0.25rem' }}>Email</div>
                  <div style={{ fontSize: '0.9rem', color: '#718096' }}>{user?.email}</div>
                </div>
                <span style={{ 
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {user?.role}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                style={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                  color: 'white', 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '8px', 
                  border: 'none', 
                  fontWeight: '600', 
                  fontSize: '1rem', 
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ProfilePage