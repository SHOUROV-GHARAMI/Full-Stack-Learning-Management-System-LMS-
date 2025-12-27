import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      await api.post('/auth/forgot-password/', { email })
      setMessage('If the email exists, a reset link has been sent.')
    } catch (err) {
      setError('Request failed')
    }
  }

  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit">Send reset link</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p><Link to="/login">Back to login</Link></p>
    </div>
  )
}

export default ForgotPasswordPage