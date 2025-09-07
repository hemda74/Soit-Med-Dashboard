import { useAuthStore } from '@/stores/authStore'
import { ThemeProvider } from '@/components/ThemeProvider'
import LoginForm from '@/components/LoginForm'
import Dashboard from '@/components/Dashboard'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        {isAuthenticated ? <Dashboard /> : <LoginForm />}
      </div>
    </ThemeProvider>
  )
}

export default App
