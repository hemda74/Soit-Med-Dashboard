import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function NotFound() {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthStore()

    const handleGoHome = () => {
        if (isAuthenticated) {
            navigate('/dashboard')
        } else {
            navigate('/login')
        }
    }

    return (
        <section className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
            <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
                <div className="mx-auto max-w-screen-sm text-center">
                    <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary dark:text-primary">
                        404
                    </h1>
                    <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
                        Something's missing.
                    </p>
                    <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
                        Sorry, we can't find that page. You'll find lots to explore on the home page.
                    </p>
                    <button
                        onClick={handleGoHome}
                        className="inline-flex text-white bg-primary hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-primary/30 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary/50 my-4 transition-colors"
                    >
                        Back to Homepage
                    </button>
                </div>
            </div>
        </section>
    )
}
