import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Layout } from '@/components/Layout'
import LoginForm from '@/components/LoginForm'
import Dashboard from '@/components/Dashboard'
import UserProfile from '@/components/UserProfile'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          {isAuthenticated ? (
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<UserProfile />} />
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
