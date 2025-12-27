import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import LoadingBlock from '../components/LoadingBlock'
import StatusMessage from '../components/StatusMessage'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../state/AuthProvider'

const DashboardPage = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [enrollmentRequests, setEnrollmentRequests] = useState([])
  const [newInstructors, setNewInstructors] = useState([])
  const [courses, setCourses] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError('')
      try {
        const { data: summaryData } = await api.get('/dashboard/summary/')
        setData(summaryData)

        if (user?.role === 'admin') {

          try {
            const { data: coursesData } = await api.get('/courses/')
            setCourses(coursesData.results || coursesData || [])
          } catch (err) {
            console.error('Failed to fetch courses:', err)
          }

          try {
            const { data: requestsData } = await api.get('/enrollments/enrollment-requests/list/')
            setEnrollmentRequests(requestsData.filter(req => req.status === 'pending'))
          } catch (err) {
            console.error('Failed to fetch enrollment requests:', err)
          }

          try {
            const { data: usersData } = await api.get('/admin/users/')
            const instructors = usersData.results?.filter(u => u.role === 'instructor') || []

            const recentInstructors = instructors.sort((a, b) => 
              new Date(b.date_joined) - new Date(a.date_joined)
            ).slice(0, 10)
            setNewInstructors(recentInstructors)
          } catch (err) {
            console.error('Failed to fetch instructors:', err)
          }
        }
      } catch (err) {
        setError('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [user])

  const roleCounts = useMemo(() => data?.role_counts || [], [data])
  const courseStats = useMemo(() => data?.course_enrollment_stats || [], [data])

  if (loading) return <LoadingBlock label="Loading dashboard..." />
  if (error) return <StatusMessage type="error">{error}</StatusMessage>

  if (!data) return <EmptyState title="No dashboard data" />

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Welcome to Your Dashboard 👋</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
          {user?.email} - {user?.role}
        </p>
      </div>

      {data.detail && <StatusMessage type="warning">{data.detail}</StatusMessage>}

      {user?.role === 'admin' && !data.detail && (
        <>
          {}
          {courses.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📚</span> All Courses ({courses.length})
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {courses.map((course) => (
                  <div key={course.id} style={{ 
                    background: 'white', 
                    padding: '1.25rem', 
                    borderRadius: '8px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', color: '#2d3748', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                          {course.title}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                          {course.description}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>👨‍🏫</span>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', fontWeight: '600' }}>
                                Instructor
                              </div>
                              <div style={{ fontSize: '0.9rem', color: '#2d3748', fontWeight: '600' }}>
                                {course.instructor_email || 'Unknown'}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>🏷️</span>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', fontWeight: '600' }}>
                                Category
                              </div>
                              <div style={{ fontSize: '0.9rem', color: '#2d3748', fontWeight: '600' }}>
                                {course.category?.name || 'Uncategorized'}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>📅</span>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', fontWeight: '600' }}>
                                Created
                              </div>
                              <div style={{ fontSize: '0.9rem', color: '#2d3748', fontWeight: '600' }}>
                                {new Date(course.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span style={{ 
                          background: course.status === 'published' 
                            ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' 
                            : course.status === 'draft' 
                            ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' 
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          display: 'inline-block'
                        }}>
                          {course.status === 'published' ? '✅ Published' : course.status === 'draft' ? '📝 Draft' : '📦 Archived'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          {newInstructors.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>👨‍🏫</span> Recent Instructor Registrations
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {newInstructors.map((instructor) => (
                  <div key={instructor.id} style={{ 
                    background: 'white', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '0.25rem' }}>
                        {instructor.email}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                        {instructor.profile?.name || 'No name provided'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.25rem' }}>
                        Joined: {new Date(instructor.date_joined).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span style={{ 
                        background: instructor.is_active ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : '#cbd5e0',
                        color: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {instructor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          {enrollmentRequests.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📝</span> Pending Enrollment Requests
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {enrollmentRequests.map((request) => (
                  <div key={request.id} style={{ 
                    background: 'white', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#2d3748' }}>
                          {request.student_email || 'Unknown Student'}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#667eea', marginTop: '0.25rem' }}>
                          Course: {request.course_title || 'Unknown Course'}
                        </div>
                      </div>
                      <span style={{ 
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        color: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        height: 'fit-content'
                      }}>
                        Pending
                      </span>
                    </div>
                    {request.message && (
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: '#4a5568', 
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: '#f7fafc',
                        borderRadius: '4px',
                        borderLeft: '3px solid #667eea'
                      }}>
                        "{request.message}"
                      </div>
                    )}
                    <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.5rem' }}>
                      Requested: {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {user?.role === 'instructor' && !data.detail && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <MetricCard label="My Courses" value={data.course_count} gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" />
          <MetricCard label="Total Students" value={data.total_students} gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)" />
        </div>
      )}

      {user?.role === 'instructor' && courseStats.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>📊 Course Enrollment Stats</h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'grid', gap: '0.5rem' }}>
            {courseStats.map((item) => (
              <li key={item["course__title"]} style={{ padding: '0.5rem', background: 'white', borderRadius: '6px', listStyle: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <strong>{item["course__title"]}</strong>: <span style={{ color: '#667eea', fontWeight: 'bold' }}>{item.count} students</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!data.detail && user?.role === 'student' && (
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎓</span>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Welcome Student!</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Start exploring courses to begin your learning journey</p>
        </div>
      )}
    </div>
  )
}

const MetricCard = ({ label, value, gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }) => (
  <div
    style={{
      padding: '1.5rem',
      borderRadius: '12px',
      background: gradient,
      color: 'white',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      textAlign: 'center',
    }}
  >
    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9, fontWeight: '500' }}>{label}</p>
    <p style={{ margin: '0.5rem 0 0', fontWeight: 'bold', fontSize: '2rem' }}>{value}</p>
  </div>
)

export default DashboardPage