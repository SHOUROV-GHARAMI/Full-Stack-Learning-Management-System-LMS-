import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../state/AuthProvider'
import LoadingBlock from '../components/LoadingBlock'
import StatusMessage from '../components/StatusMessage'
import EmptyState from '../components/EmptyState'

const CoursesPage = () => {
  const [courses, setCourses] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    api
      .get('/courses/')
      .then(({ data }) => setCourses(data.results || data || []))
      .catch(() => setError('Failed to load courses'))
      .finally(() => setLoading(false))
  }, [])

  if (error) return <StatusMessage type="error">{error}</StatusMessage>

  const handleEnroll = async (courseId) => {
    setActionMsg('')
    try {
      await api.post(`/enroll/${courseId}/`)
      setActionMsg('Enrolled successfully')
    } catch (err) {
      setActionMsg('Enrollment failed')
    }
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>🎓 Explore Courses</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>Discover your next learning adventure</p>
      </div>

      {actionMsg && (
        <StatusMessage type={actionMsg.includes('failed') ? 'error' : 'success'} dense>
          {actionMsg}
        </StatusMessage>
      )}
      {loading && <LoadingBlock label="Loading courses..." />}
      {!loading && courses.length === 0 && (
        <div style={{ background: '#f7fafc', padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📚</span>
          <EmptyState title="No courses yet" hint="Check back soon or ask an instructor to publish courses." />
        </div>
      )}
      {!loading && courses.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {courses.map((c) => (
            <div key={c.id} style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', transition: 'transform 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.25rem', fontWeight: 'bold', flex: 1 }}>{c.title}</h3>
                <span style={{ background: c.status === 'published' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : '#cbd5e0', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' }}>
                  {c.status}
                </span>
              </div>
              {c.description && (
                <p style={{ margin: '0 0 1.5rem 0', color: '#4a5568', lineHeight: '1.5' }}>{c.description}</p>
              )}
              <div style={{ display: 'grid', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>👨‍🏫</span>
                    <span style={{ color: '#718096', fontSize: '0.85rem' }}>{c.instructor_email}</span>
                  </div>
                </div>
                {c.instructor_registration_number && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#f7fafc', borderRadius: '6px' }}>
                    <span style={{ fontSize: '1rem' }}>🎫</span>
                    <span style={{ color: '#667eea', fontWeight: '600', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                      {c.instructor_registration_number}
                    </span>
                  </div>
                )}
              </div>
              {user?.role === 'student' && c.status === 'published' && (
                <button style={{ width: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer' }} onClick={() => handleEnroll(c.id)}>
                  Enroll
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CoursesPage