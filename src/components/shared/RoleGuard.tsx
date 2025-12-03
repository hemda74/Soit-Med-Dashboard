import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface RoleGuardProps {
    requiredAnyRoles?: string[]
    children: React.ReactElement
}

export default function RoleGuard({ requiredAnyRoles, children }: RoleGuardProps) {
    const { isAuthenticated, hasAnyRole, user } = useAuthStore()

    if (!isAuthenticated) return <Navigate to="/login" replace />

    // Case-insensitive role check helper
    const hasAnyRoleCaseInsensitive = (roles: string[]): boolean => {
        if (!user?.roles || !Array.isArray(user.roles)) return false
        
        const userRolesLower = user.roles.map(r => r.toLowerCase())
        const requiredRolesLower = roles.map(r => r.toLowerCase())
        
        return requiredRolesLower.some(role => userRolesLower.includes(role))
    }

    // SuperAdmin/superadmin can access any route (case-insensitive)
    if (hasAnyRoleCaseInsensitive(['SuperAdmin', 'superadmin'])) return children

    if (requiredAnyRoles && requiredAnyRoles.length > 0 && !hasAnyRoleCaseInsensitive(requiredAnyRoles)) {
        return <Navigate to="/not-found" replace />
    }

    return children
}


