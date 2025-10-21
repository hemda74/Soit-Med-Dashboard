import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface RoleGuardProps {
    requiredAnyRoles?: string[]
    children: React.ReactElement
}

export default function RoleGuard({ requiredAnyRoles, children }: RoleGuardProps) {
    const { isAuthenticated, hasAnyRole } = useAuthStore()

    if (!isAuthenticated) return <Navigate to="/login" replace />

    // SuperAdmin can access any route
    if (hasAnyRole(['SuperAdmin'])) return children

    if (requiredAnyRoles && requiredAnyRoles.length > 0 && !hasAnyRole(requiredAnyRoles)) {
        return <Navigate to="/not-found" replace />
    }

    return children
}


