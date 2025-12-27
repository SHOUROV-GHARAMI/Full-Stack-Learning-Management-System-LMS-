import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthProvider'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoIcon}>🎓</span>
            <span style={styles.logoText}>LMS Platform</span>
          </Link>

          <nav style={styles.nav}>
            {user && (
              <>
                {}
                {user.role === 'instructor' && (
                  <>
                    <Link to="/instructor/dashboard" style={styles.navLink}>Dashboard</Link>
                    <Link to="/instructor/my-courses" style={styles.navLink}>My Courses</Link>
                    <Link to="/instructor/courses" style={styles.navLink}>Manage Courses</Link>
                    <Link to="/instructor/profile" style={styles.navLink}>Profile</Link>
                  </>
                )}
                {user.role === 'student' && (
                  <>
                    <Link to="/student/dashboard" style={styles.navLink}>Dashboard</Link>
                    <Link to="/student/courses" style={styles.navLink}>Courses</Link>
                    <Link to="/student/my-courses" style={styles.navLink}>My Courses</Link>
                    <Link to="/student/profile" style={styles.navLink}>Profile</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/dashboard" style={styles.navLink}>Dashboard</Link>
                    <Link to="/admin/users" style={styles.navLink}>Users</Link>
                    <Link to="/admin/reports" style={styles.navLink}>Reports</Link>
                    <Link to="/admin/profile" style={styles.navLink}>Profile</Link>
                  </>
                )}
                <button onClick={handleLogout} style={styles.navLogoutBtn}>Logout</button>
              </>
            )}
          </nav>

          <div style={styles.userSection}>
            {user ? (
              <div style={styles.userInfo}>
                <span style={styles.userAvatar}>{user.email[0].toUpperCase()}</span>
                <div style={styles.userDetails}>
                  <span style={styles.userEmail}>{user.email}</span>
                  <span style={styles.userRole}>{user.role}</span>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" style={styles.authLink}>Login</Link>
                <Link to="/register" style={styles.authBtn}>Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.mainContent}>
          <Outlet />
        </div>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>LMS Platform</h3>
            <p style={styles.footerText}>Empowering education through technology</p>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerSubtitle}>Quick Links</h4>
            <div style={styles.footerLinks}>
              {user?.role === 'instructor' && (
                <>
                  <Link to="/instructor/courses" style={styles.footerLink}>Browse Courses</Link>
                  <Link to="/instructor/dashboard" style={styles.footerLink}>Dashboard</Link>
                  <Link to="/instructor/profile" style={styles.footerLink}>Profile</Link>
                </>
              )}
              {user?.role === 'student' && (
                <>
                  <Link to="/student/courses" style={styles.footerLink}>Browse Courses</Link>
                  <Link to="/student/dashboard" style={styles.footerLink}>Dashboard</Link>
                  <Link to="/student/profile" style={styles.footerLink}>Profile</Link>
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/users" style={styles.footerLink}>Manage Users</Link>
                  <Link to="/admin/dashboard" style={styles.footerLink}>Dashboard</Link>
                  <Link to="/admin/profile" style={styles.footerLink}>Profile</Link>
                </>
              )}
              {!user && (
                <>
                  <Link to="/login" style={styles.footerLink}>Login</Link>
                  <Link to="/register" style={styles.footerLink}>Register</Link>
                </>
              )}
            </div>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerSubtitle}>Contact</h4>
            <p style={styles.footerText}>support@lms.edu</p>
            <p style={styles.footerText}>© 2025 LMS Platform</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    color: 'white',
    fontWeight: 'bold',
  },
  logoIcon: {
    fontSize: '1.75rem',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '700',
  },
  nav: {
    display: 'flex',
    gap: '1.5rem',
    flex: 1,
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    transition: 'background 0.2s',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  navLogoutBtn: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    whiteSpace: 'nowrap',
    marginLeft: '0.5rem',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'white',
    padding: '0.5rem',
    borderRadius: '8px',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'white',
    color: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userEmail: {
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  userRole: {
    fontSize: '0.75rem',
    opacity: 0.9,
    textTransform: 'capitalize',
  },
  logoutBtn: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  authLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'background 0.2s',
  },
  authBtn: {
    background: 'white',
    color: '#667eea',
    textDecoration: 'none',
    padding: '0.5rem 1.5rem',
    borderRadius: '6px',
    fontWeight: '600',
    transition: 'transform 0.2s',
  },
  main: {
    flex: 1,
    padding: '2rem 1rem',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    minHeight: '500px',
  },
  footer: {
    background: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    color: 'white',
    padding: '2rem 1rem',
    marginTop: 'auto',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  footerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  footerTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: 0,
  },
  footerSubtitle: {
    fontSize: '1rem',
    fontWeight: '600',
    margin: 0,
  },
  footerText: {
    fontSize: '0.9rem',
    opacity: 0.8,
    margin: 0,
  },
  footerLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  footerLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.9rem',
    opacity: 0.8,
    transition: 'opacity 0.2s',
  },
}

export default Layout