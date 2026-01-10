import { StrictMode, Profiler } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'
import { initWebVitals, onRenderCallback } from './utils/performance'

// Suppress React DevTools message
const originalLog = console.log;
console.log = function(...args: any[]) {
	const message = args.join(' ');
	if (message.includes('Download the React DevTools')) {
		return;
	}
	originalLog.apply(console, args);
};

// Initialize Web Vitals monitoring
initWebVitals()

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Profiler id="App" onRender={onRenderCallback}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </QueryClientProvider>
    </Profiler>
  </StrictMode>,
)
