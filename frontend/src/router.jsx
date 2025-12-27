import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RoleBasedRedirect from './components/RoleBasedRedirect'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import CoursesPage from './pages/CoursesPage'
import MyCoursesPage from './pages/MyCoursesPage'
import ProfilePage from './pages/ProfilePage'
import InstructorCoursesPage from './pages/InstructorCoursesPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminReportsPage from './pages/AdminReportsPage'

const router = createBrowserRouter([
  {
    element: <Layout />, 
    children: [
      { path: '/', element: <RoleBasedRedirect /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      {
        element: <ProtectedRoute />, 
        children: [

          { path: '/student/dashboard', element: <ProtectedRoute roles={['student']} />, children: [{ index: true, element: <DashboardPage /> }] },
          { path: '/student/courses', element: <ProtectedRoute roles={['student']} />, children: [{ index: true, element: <CoursesPage /> }] },
          { path: '/student/my-courses', element: <ProtectedRoute roles={['student']} />, children: [{ index: true, element: <MyCoursesPage /> }] },
          { path: '/student/profile', element: <ProtectedRoute roles={['student']} />, children: [{ index: true, element: <ProfilePage /> }] },

          { path: '/instructor/dashboard', element: <ProtectedRoute roles={['instructor']} />, children: [{ index: true, element: <DashboardPage /> }] },
          { path: '/instructor/courses', element: <ProtectedRoute roles={['instructor']} />, children: [{ index: true, element: <InstructorCoursesPage /> }] },
          { path: '/instructor/my-courses', element: <ProtectedRoute roles={['instructor']} />, children: [{ index: true, element: <MyCoursesPage /> }] },
          { path: '/instructor/profile', element: <ProtectedRoute roles={['instructor']} />, children: [{ index: true, element: <ProfilePage /> }] },

          { path: '/admin/dashboard', element: <ProtectedRoute roles={['admin']} />, children: [{ index: true, element: <DashboardPage /> }] },
          { path: '/admin/users', element: <ProtectedRoute roles={['admin']} />, children: [{ index: true, element: <AdminUsersPage /> }] },
          { path: '/admin/reports', element: <ProtectedRoute roles={['admin']} />, children: [{ index: true, element: <AdminReportsPage /> }] },
          { path: '/admin/profile', element: <ProtectedRoute roles={['admin']} />, children: [{ index: true, element: <ProfilePage /> }] },

          { path: '/profile', element: <RoleBasedRedirect /> },

          { path: '/dashboard', element: <RoleBasedRedirect /> },
          { path: '/courses', element: <RoleBasedRedirect /> },
          { path: '/my-courses', element: <RoleBasedRedirect /> },
        ],
      },
    ],
  },
])

export default router