import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Layout } from '@/components/Layout'
import LoginForm from '@/components/LoginForm'
import Dashboard from '@/components/Dashboard'
import UserProfile from '@/components/UserProfile'
import CreateUser from '@/components/admin/CreateUser'
import RoleSpecificUserCreation from '@/components/admin/RoleSpecificUserCreation'
import UserCreationTest from '@/components/admin/UserCreationTest'
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
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="admin/create-user" element={<CreateUser />} />
                <Route path="admin/create-role-user" element={<RoleSpecificUserCreation />} />
                <Route path="admin/test-user-creation" element={<UserCreationTest />} />
                <Route path="admin/users" element={<UsersList />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
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
