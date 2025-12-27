import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/client'

const ResetPasswordPage = () => {
  const [params] = useSearchParams()
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const uid = params.get('uid') || ''
  const token = params.get('token') || ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      await api.post('/auth/reset-password/', { uid, token, new_password: newPassword })
      setMessage('Password reset successful. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError('Reset failed')
    }
  }

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label>New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <button type="submit">Reset</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p><Link to="/login">Back to login</Link></p>
    </div>
  )
}

export default ResetPasswordPage