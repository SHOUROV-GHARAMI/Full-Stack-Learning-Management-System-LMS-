import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../state/AuthProvider'
import LoadingBlock from '../components/LoadingBlock'
import StatusMessage from '../components/StatusMessage'
import EmptyState from '../components/EmptyState'

const MyCoursesPage = () => {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {

    const endpoint = user?.role === 'instructor' ? '/courses/' : '/my-courses/'

    api
      .get(endpoint)
      .then(({ data }) => setItems(data.results || data || []))
      .catch(() => setError(user?.role === 'instructor' ? 'Failed to load courses' : 'Failed to load enrollments'))
      .finally(() => setLoading(false))
  }, [user])

  if (error) return <StatusMessage type="error">{error}</StatusMessage>

  if (user && user.role === 'admin') {
    return <StatusMessage type="warning">Admins manage users and system. Use Admin menu to manage the platform.</StatusMessage>
  }

  const isInstructor = user?.role === 'instructor'

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ background: isInstructor ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', padding: '2rem', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
          {isInstructor ? '📖 My Courses' : '📚 My Enrolled Courses'}
        </h1>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
          {isInstructor ? 'Courses you are teaching' : 'Your active learning journey'}
        </p>
      </div>

      {loading && <LoadingBlock label={isInstructor ? "Loading your courses..." : "Loading enrollments..."} />}
      {!loading && items.length === 0 && (
        <div style={{ background: '#f7fafc', padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
            {isInstructor ? '📚' : '🎯'}
          </span>
          <EmptyState 
            title={isInstructor ? "No courses assigned" : "No enrollments yet"} 
            hint={isInstructor ? "Contact an admin to have courses assigned to you." : "Enroll in a published course to see it here."} 
          />
        </div>
      )}
      {!loading && items.length > 0 && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {items.map((item) => {

            const courseTitle = isInstructor ? item.title : item.course?.title || item.course_title
            const courseStatus = isInstructor ? item.status : item.course?.status || item.course_status || 'unknown'
            const date = isInstructor ? item.created_at : item.enrolled_at
            const enrollmentCount = isInstructor ? item.enrollment_count : null

            return (
              <div key={item.id} style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontSize: '1.25rem' }}>{courseTitle}</h3>
                    <span style={{ fontSize: '0.9rem', color: '#718096' }}>
                      {isInstructor ? `Created on ${new Date(date).toLocaleDateString()}` : `Enrolled on ${new Date(date).toLocaleDateString()}`}
                    </span>
                  </div>
                  <span style={{ 
                    background: courseStatus === 'published' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 
                                courseStatus === 'draft' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 
                                '#cbd5e0', 
                    color: 'white', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '12px', 
                    fontSize: '0.85rem', 
                    fontWeight: '600', 
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap'
                  }}>
                    {courseStatus}
                  </span>
                </div>
                {isInstructor && enrollmentCount !== undefined && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: '500' }}>
                      👥 {enrollmentCount} {enrollmentCount === 1 ? 'student' : 'students'} enrolled
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyCoursesPage