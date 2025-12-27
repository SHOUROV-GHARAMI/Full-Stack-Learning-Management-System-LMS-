import { useEffect, useState } from 'react'
import api from '../api/client'
import LoadingBlock from '../components/LoadingBlock'
import StatusMessage from '../components/StatusMessage'

const AdminReportsPage = () => {
  const [instructors, setInstructors] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [usersResp, coursesResp, summaryResp] = await Promise.all([
          api.get('/auth/users/'),
          api.get('/courses/'),
          api.get('/dashboard/summary/')
        ])

        const allUsers = usersResp.data.results || usersResp.data || []
        setInstructors(allUsers.filter(u => u.role === 'instructor'))
        setStudents(allUsers.filter(u => u.role === 'student'))
        setCourses(coursesResp.data.results || coursesResp.data || [])
        setSummary(summaryResp.data)
      } catch (err) {
        setError('Failed to load reports')
        console.error('Error loading reports:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingBlock label="Loading reports..." />
  if (error) return <StatusMessage type="error">{error}</StatusMessage>

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>📊 Platform Reports</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
          Comprehensive analytics and insights
        </p>
      </div>

      {}
      {summary && (
        <div style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', padding: '2rem', borderRadius: '12px' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📈</span> Platform Summary
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea' }}>{summary.total_active_users || 0}</div>
              <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.5rem', fontWeight: '600' }}>Total Active Users</div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f5576c' }}>{instructors.length}</div>
              <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.5rem', fontWeight: '600' }}>Total Instructors</div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4facfe' }}>{students.length}</div>
              <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.5rem', fontWeight: '600' }}>Total Students</div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fa709a' }}>{courses.length}</div>
              <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.5rem', fontWeight: '600' }}>Total Courses</div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#38f9d7' }}>{summary.total_enrollments || 0}</div>
              <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.5rem', fontWeight: '600' }}>Total Enrollments</div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fee140' }}>{courses.filter(c => c.status === 'published').length}</div>
              <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.5rem', fontWeight: '600' }}>Published Courses</div>
            </div>
          </div>
        </div>
      )}

      {}
      <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '2rem', borderRadius: '12px' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>👨‍🏫</span> Instructors Report ({instructors.length})
        </h2>
        {instructors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>No instructors registered yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', borderCollapse: 'collapse', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ background: '#667eea', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Reg Number</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Phone</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Courses</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Join Date</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((instructor, idx) => {
                  const instructorCourses = courses.filter(c => c.instructor_email === instructor.email)
                  return (
                    <tr key={instructor.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? 'white' : '#f7fafc' }}>
                      <td style={{ padding: '1rem', color: '#667eea', fontWeight: '600', fontSize: '0.85rem', letterSpacing: '0.5px' }}>{instructor.registration_number || 'N/A'}</td>
                      <td style={{ padding: '1rem', color: '#2d3748', fontWeight: '500' }}>{instructor.email}</td>
                      <td style={{ padding: '1rem', color: '#4a5568' }}>{instructor.profile?.name || '-'}</td>
                      <td style={{ padding: '1rem', color: '#4a5568' }}>{instructor.profile?.phone || '-'}</td>
                      <td style={{ padding: '1rem', color: '#667eea', fontWeight: '600' }}>{instructorCourses.length}</td>
                      <td style={{ padding: '1rem', color: '#718096', fontSize: '0.9rem' }}>{new Date(instructor.date_joined).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ 
                          background: instructor.is_active ? '#48bb78' : '#cbd5e0',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {instructor.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      <div style={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', padding: '2rem', borderRadius: '12px' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🎓</span> Students Report ({students.length})
        </h2>
        {students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>No students registered yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', borderCollapse: 'collapse', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ background: '#f5576c', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Reg Number</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Phone</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Join Date</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? 'white' : '#f7fafc' }}>
                    <td style={{ padding: '1rem', color: '#f5576c', fontWeight: '600', fontSize: '0.85rem', letterSpacing: '0.5px' }}>{student.registration_number || 'N/A'}</td>
                    <td style={{ padding: '1rem', color: '#2d3748', fontWeight: '500' }}>{student.email}</td>
                    <td style={{ padding: '1rem', color: '#4a5568' }}>{student.profile?.name || '-'}</td>
                    <td style={{ padding: '1rem', color: '#4a5568' }}>{student.profile?.phone || '-'}</td>
                    <td style={{ padding: '1rem', color: '#718096', fontSize: '0.9rem' }}>{new Date(student.date_joined).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ 
                        background: student.is_active ? '#48bb78' : '#cbd5e0',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      <div style={{ background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', padding: '2rem', borderRadius: '12px' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📚</span> Courses Report ({courses.length})
        </h2>
        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>No courses created yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', borderCollapse: 'collapse', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ background: '#764ba2', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Course Title</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Instructor</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Instructor Reg#</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Created Date</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, idx) => (
                  <tr key={course.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? 'white' : '#f7fafc' }}>
                    <td style={{ padding: '1rem', color: '#2d3748', fontWeight: '600' }}>{course.title}</td>
                    <td style={{ padding: '1rem', color: '#667eea', fontWeight: '500' }}>{course.instructor_email || 'Unknown'}</td>
                    <td style={{ padding: '1rem', color: '#764ba2', fontWeight: '600', fontSize: '0.85rem', letterSpacing: '0.5px' }}>{course.instructor_registration_number || 'N/A'}</td>
                    <td style={{ padding: '1rem', color: '#4a5568' }}>{course.category?.name || 'Uncategorized'}</td>
                    <td style={{ padding: '1rem', color: '#718096', fontSize: '0.9rem' }}>{new Date(course.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ 
                        background: course.status === 'published' 
                          ? '#48bb78' 
                          : course.status === 'draft' 
                          ? '#ed8936' 
                          : '#718096',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminReportsPage