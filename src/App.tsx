import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ThemeProvider } from '@/components/ThemeProvider'
import AppLayout from '@/components/layout/AppLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import LoginForm from '@/components/LoginForm'
import ForgotPassword from '@/pages/ForgotPassword'
import VerifyCode from '@/pages/VerifyCode'
import ResetPassword from '@/pages/ResetPassword'
import Dashboard from '@/components/Dashboard'
import UserProfile from '@/components/UserProfile'
import RoleSpecificUserCreation from '@/components/admin/RoleSpecificUserCreation'
import UsersList from '@/components/UsersList'
import LoadingScreen from '@/components/LoadingScreen'
import ReportsScreen from '@/components/finance/ReportsScreen'
import SalesReportsScreen from '@/components/sales/SalesReportsScreen'
import { WeeklyPlansScreen } from '@/components/weeklyPlan'

function App() {
  const { isAuthenticated, isAuthorizedToAccess, logout } = useAuthStore()

  // Check authorization on mount and when authentication changes
  if (isAuthenticated && !isAuthorizedToAccess()) {
    logout()
    return (
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <LoadingScreen />
          {isAuthenticated ? (
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<UsersList />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="reports" element={<ReportsScreen />} />
                <Route path="sales-reports" element={<SalesReportsScreen />} />
                <Route path="weekly-plans" element={<WeeklyPlansScreen />} />
                <Route path="admin/create-role-user" element={<RoleSpecificUserCreation />} />
                <Route path="admin/users" element={<UsersList />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<AuthLayout><LoginForm /></AuthLayout>} />
              <Route path="login" element={<AuthLayout><LoginForm /></AuthLayout>} />
              <Route path="forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
              <Route path="verify-code" element={<AuthLayout><VerifyCode /></AuthLayout>} />
              <Route path="reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
