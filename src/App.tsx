import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ThemeProvider } from '@/components/ThemeProvider'
import AppLayout from '@/components/layout/AppLayout'
import LoginForm from '@/components/LoginForm'
import Dashboard from '@/components/Dashboard'
import UserProfile from '@/components/UserProfile'
import RoleSpecificUserCreation from '@/components/admin/RoleSpecificUserCreation'
import UsersList from '@/components/UsersList'
import LoadingScreen from '@/components/LoadingScreen'

function App() {
  const { isAuthenticated } = useAuthStore()

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
                <Route path="admin/create-role-user" element={<RoleSpecificUserCreation />} />
                <Route path="admin/users" element={<UsersList />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          ) : (
            <LoginForm />
          )}
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
