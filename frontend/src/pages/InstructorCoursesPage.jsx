import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../state/AuthProvider'
import LoadingBlock from '../components/LoadingBlock'
import StatusMessage from '../components/StatusMessage'
import EmptyState from '../components/EmptyState'

const emptyForm = { title: '', description: '', category_id: '', status: 'draft' }

const InstructorCoursesPage = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [studentEmail, setStudentEmail] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [enrollments, setEnrollments] = useState([])
  const [showEnrollments, setShowEnrollments] = useState({})

  const isInstructor = useMemo(() => user && (user.role === 'instructor' || user.role === 'admin'), [user])

  useEffect(() => {
    if (!isInstructor) return
    const load = async () => {
      setLoading(true)
      try {
        const [catResp, courseResp, enrollResp] = await Promise.all([
          api.get('/courses/categories/'),
          api.get('/courses/'),
          api.get('/my-courses/')
        ])
        setCategories(catResp.data.results || catResp.data || [])
        setCourses(courseResp.data.results || courseResp.data || [])
        setEnrollments(enrollResp.data.results || enrollResp.data || [])
      } catch (err) {
        setError('Failed to load instructor data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isInstructor])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const { data } = await api.post('/courses/', form)
      setCourses((prev) => [data, ...prev])
      setForm(emptyForm)
      setMessage('Course created')
    } catch (err) {
      setError('Create failed')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id, status) => {
    setMessage('')
    setError('')
    try {
      const { data } = await api.patch(`/courses/${id}/`, { status })
      setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status: data.status } : c)))
      setMessage('Status updated')
    } catch (err) {
      setError('Update failed')
    }
  }

  const handleEnrollStudent = async (e) => {
    e.preventDefault()
    if (!selectedCourse || !studentEmail) return
    setEnrolling(true)
    setMessage('')
    setError('')
    try {
      const { data } = await api.post(`/instructor-enroll/${selectedCourse}/`, { student_email: studentEmail })
      setMessage('Student enrolled successfully')
      setStudentEmail('')
      setSelectedCourse(null)

      const enrollResp = await api.get('/my-courses/')
      setEnrollments(enrollResp.data.results || enrollResp.data || [])
    } catch (err) {
      const msg = err.response?.data?.student_email?.[0] || err.response?.data?.detail || 'Enrollment failed'
      setError(msg)
    } finally {
      setEnrolling(false)
    }
  }

  const handleUnenroll = async (enrollmentId, studentEmail, courseTitle) => {
    if (!window.confirm(`Are you sure you want to unenroll ${studentEmail} from "${courseTitle}"?`)) {
      return
    }

    setMessage('')
    setError('')
    try {
      await api.delete(`/unenroll/${enrollmentId}/`)
      setMessage(`Student ${studentEmail} unenrolled successfully`)

      const enrollResp = await api.get('/my-courses/')
      setEnrollments(enrollResp.data.results || enrollResp.data || [])
    } catch (err) {
      const msg = err.response?.data?.detail || 'Unenroll failed'
      setError(msg)
    }
  }

  const toggleEnrollments = (courseId) => {
    setShowEnrollments(prev => ({ ...prev, [courseId]: !prev[courseId] }))
  }

  const getCourseEnrollments = (courseId) => {

    return enrollments.filter(e => e.course.id === courseId && e.status === 'active')
  }

  if (!isInstructor) return <StatusMessage type="warning">Only instructors/admins can manage courses.</StatusMessage>

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', padding: '2rem', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>👨‍🏫 Manage Your Courses</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>Create, edit, and enroll students</p>
      </div>

      {message && <StatusMessage type="success">{message}</StatusMessage>}
      {error && <StatusMessage type="error">{error}</StatusMessage>}

      {loading && <LoadingBlock label="Loading courses and categories..." />}

      {!loading && (
        <>
          <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '2rem', borderRadius: '12px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#2d3748' }}>➕ Create New Course</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
              <input 
                name="title" 
                placeholder="Course Title" 
                value={form.title} 
                onChange={handleChange} 
                required 
                style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem' }}
              />
              <textarea 
                name="description" 
                placeholder="Course Description" 
                value={form.description} 
                onChange={handleChange} 
                required 
                rows="4"
                style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem', resize: 'vertical' }}
              />
              <select 
                name="category_id" 
                value={form.category_id} 
                onChange={handleChange} 
                required
                style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem', cursor: 'pointer' }}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select 
                name="status" 
                value={form.status} 
                onChange={handleChange}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem', cursor: 'pointer' }}
              >
                <option value="draft">📝 Draft</option>
                <option value="published">✅ Published</option>
                <option value="archived">📦 Archived</option>
              </select>
              <button 
                type="submit" 
                disabled={saving}
                style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}
              >
                {saving ? '💾 Saving...' : '✨ Create Course'}
              </button>
            </form>
          </div>

          {courses.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', padding: '2rem', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>📧 Enroll Student by Email</h3>
              <form onSubmit={handleEnrollStudent} style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
                <select
                  value={selectedCourse || ''}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  required
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem', cursor: 'pointer' }}
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  required
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem' }}
                />
                <button 
                  type="submit" 
                  disabled={enrolling}
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}
                >
                  {enrolling ? '🔄 Enrolling...' : '✅ Enroll Student'}
                </button>
              </form>
            </div>
          )}

          <div>
            <h2 style={{ marginBottom: '1rem', color: '#2d3748' }}>📚 Your Courses</h2>
            {courses.length === 0 && (
              <div style={{ background: '#f7fafc', padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📖</span>
                <EmptyState title="No courses yet" hint="Create your first course to see it listed." />
              </div>
            )}
            {courses.length > 0 && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {courses.map((c) => {
                  const courseEnrollments = getCourseEnrollments(c.id)
                  const isExpanded = showEnrollments[c.id]

                  return (
                    <div key={c.id} style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontSize: '1.25rem' }}>{c.title}</h3>
                          <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>{c.description}</p>
                        </div>
                        <select
                          value={c.status}
                          onChange={(e) => updateStatus(c.id, e.target.value)}
                          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                          <option value="draft">📝 Draft</option>
                          <option value="published">✅ Published</option>
                          <option value="archived">📦 Archived</option>
                        </select>
                      </div>

                      {}
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #e2e8f0' }}>
                        <button
                          onClick={() => toggleEnrollments(c.id)}
                          style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                            color: 'white', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '8px', 
                            border: 'none', 
                            fontWeight: '600', 
                            fontSize: '0.9rem', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <span>{isExpanded ? '👇' : '👉'}</span>
                          <span>Enrolled Students ({courseEnrollments.length})</span>
                        </button>

                        {isExpanded && (
                          <div style={{ marginTop: '1rem' }}>
                            {courseEnrollments.length === 0 ? (
                              <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px', textAlign: 'center', color: '#718096' }}>
                                No students enrolled yet
                              </div>
                            ) : (
                              <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {courseEnrollments.map((enrollment) => (
                                  <div 
                                    key={enrollment.id} 
                                    style={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center', 
                                      padding: '1rem', 
                                      background: '#f7fafc', 
                                      borderRadius: '8px',
                                      border: '1px solid #e2e8f0'
                                    }}
                                  >
                                    <div>
                                      <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '0.25rem' }}>
                                        {enrollment.student.email}
                                      </div>
                                      <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                                        Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleUnenroll(enrollment.id, enrollment.student.email, c.title)}
                                      style={{ 
                                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                                        color: 'white', 
                                        padding: '0.5rem 1rem', 
                                        borderRadius: '6px', 
                                        border: 'none', 
                                        fontWeight: '600', 
                                        fontSize: '0.85rem', 
                                        cursor: 'pointer' 
                                      }}
                                    >
                                      🚫 Drop Student
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default InstructorCoursesPage