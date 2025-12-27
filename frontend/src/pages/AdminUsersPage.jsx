import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import LoadingBlock from '../components/LoadingBlock'
import StatusMessage from '../components/StatusMessage'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../state/AuthProvider'

const roleOptions = [
  { value: '', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'student', label: 'Student' },
]

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [filters, setFilters] = useState({ q: '', role: '', active: '' })
  const [refreshKey, setRefreshKey] = useState(0)

  const activeOptions = useMemo(
    () => [
      { value: '', label: 'Any status' },
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' },
    ],
    []
  )

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError('')
      try {
        const params = {
          q: filters.q || undefined,
          role: filters.role || undefined,
          active: filters.active || undefined,
        }
        const { data } = await api.get('/auth/users/', { params })
        setUsers(data.results || [])
      } catch (err) {
        setError('Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [filters.role, filters.active, refreshKey])

  const onSearchSubmit = (e) => {
    e.preventDefault()
    setRefreshKey((v) => v + 1)
  }

  const updateUser = async (id, payload) => {
    setBusyId(id)
    setError('')
    try {
      const { data } = await api.patch(`/auth/users/${id}/`, payload)
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)))
    } catch (err) {
      setError('Update failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '2rem', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>👥 User Management</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>Search, filter, and update user accounts</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '1.5rem', borderRadius: '12px' }}>
        <form
          onSubmit={onSearchSubmit}
          style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <input
            placeholder="🔍 Search by email"
            value={filters.q}
            onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
            style={{ minWidth: '200px', padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem', flex: 1 }}
          />
          <select
            value={filters.role}
            onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
            style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem', cursor: 'pointer' }}
          >
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={filters.active}
            onChange={(e) => setFilters((prev) => ({ ...prev, active: e.target.value }))}
            style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '1rem', cursor: 'pointer' }}
          >
            {activeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button type="submit" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}>
            Search
          </button>
        </form>
      </div>

      {loading && <LoadingBlock label="Loading users..." />}
      {error && <StatusMessage type="error">{error}</StatusMessage>}

      {!loading && !users.length && !error && (
        <EmptyState title="No users match the filters" hint="Adjust filters or try a different search." />
      )}

      {!loading && !!users.length && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.25rem' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.25rem' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.25rem' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.25rem' }}>Joined</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.25rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {

                const availableRoleOptions = roleOptions
                  .filter((opt) => opt.value)
                  .filter((opt) => {

                    if (u.role === 'admin') return opt.value === 'admin'

                    if (currentUser?.role === 'instructor') return opt.value === 'student'

                    return opt.value !== 'admin'
                  })

                const canChangeRole = currentUser?.role === 'admin' && u.role !== 'admin'

                return (
                  <tr key={u.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem 0.25rem' }}>{u.email}</td>
                    <td style={{ padding: '0.5rem 0.25rem' }}>
                      {canChangeRole ? (
                        <select
                          value={u.role}
                          onChange={(e) => updateUser(u.id, { role: e.target.value })}
                          disabled={busyId === u.id}
                        >
                          {availableRoleOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ 
                          textTransform: 'capitalize', 
                          fontWeight: u.role === 'admin' ? '600' : '400',
                          color: u.role === 'admin' ? '#667eea' : '#333'
                        }}>
                          {u.role}
                        </span>
                      )}
                    </td>
                  <td style={{ padding: '0.5rem 0.25rem' }}>
                    <span style={{ color: u.is_active ? '#1f6f4a' : '#8a1f1f' }}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem 0.25rem' }}>
                    {new Date(u.date_joined).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.5rem 0.25rem', display: 'flex', gap: '0.4rem' }}>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => updateUser(u.id, { is_active: !u.is_active })}
                        disabled={busyId === u.id}
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                    {u.role === 'admin' && (
                      <span style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>Protected</span>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage