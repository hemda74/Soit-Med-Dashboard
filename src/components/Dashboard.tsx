import { Settings } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import ProfileCompletionAlert from '@/components/ProfileCompletionAlert'
import { useProfileCompletionQuery } from '@/hooks/useAuthQueries'
import { usePerformance } from '@/hooks/usePerformance'
import { useTranslation } from '@/hooks/useTranslation'
import { lazy, Suspense, useMemo } from 'react'
import { LoadingSpinner } from '@/components/shared'

// Lazy load dashboard components for code splitting
const SuperAdminDashboard = lazy(() => import('@/components/dashboards/SuperAdminDashboard'))
const UnifiedSalesManagerDashboard = lazy(() => import('@/components/dashboards/UnifiedSalesManagerDashboard'))
const SalesSupportDashboard = lazy(() => import('@/components/sales/SalesSupportDashboard'))
const MaintenanceSupportDashboard = lazy(() => import('@/components/dashboards/MaintenanceSupportDashboard'))

// Loading fallback component
const DashboardSuspenseFallback = () => (
    <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
    </div>
)

export default function Dashboard() {
    usePerformance('Dashboard')
    const { t } = useTranslation()
    const { hasRole } = useAuthStore()
    
    // Memoize role checks to prevent unnecessary re-renders
    const roles = useMemo(() => ({
        isSuperAdmin: hasRole('SuperAdmin'),
        isSalesManager: hasRole('SalesManager'),
        isSalesSupport: hasRole('SalesSupport'),
        isMaintenanceSupport: hasRole('MaintenanceSupport'),
    }), [hasRole])

    // Get profile completion
    const { data: profileCompletion } = useProfileCompletionQuery()

    return (
        <div className="space-y-8">
            {/* Profile Completion Alert */}
            {profileCompletion && profileCompletion.progress < 100 && (
                <ProfileCompletionAlert
                    progress={profileCompletion.progress}
                    remainingSteps={profileCompletion.remainingSteps}
                    missingFields={profileCompletion.missingFields}
                />
            )}

            {/* SuperAdmin Only Content - Statistics and Charts */}
            {roles.isSuperAdmin && (
                <Suspense fallback={<DashboardSuspenseFallback />}>
                <SuperAdminDashboard />
                </Suspense>
            )}

            {/* Sales Manager Specific Content */}
            {roles.isSalesManager && !roles.isSuperAdmin && (
                <Suspense fallback={<DashboardSuspenseFallback />}>
                    <UnifiedSalesManagerDashboard />
                </Suspense>
            )}

            {/* Sales Support Specific Content */}
            {roles.isSalesSupport && !roles.isSuperAdmin && (
                <Suspense fallback={<DashboardSuspenseFallback />}>
                    <SalesSupportDashboard />
                </Suspense>
            )}

            {/* Maintenance Support Specific Content */}
            {roles.isMaintenanceSupport && !roles.isSuperAdmin && (
                <Suspense fallback={<DashboardSuspenseFallback />}>
                <MaintenanceSupportDashboard />
                </Suspense>
            )}

            {/* Default Content for other roles */}
            {!roles.isSuperAdmin && !roles.isSalesManager && !roles.isSalesSupport && !roles.isMaintenanceSupport && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Settings className="w-12 h-12 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-4">{t('dashboardWelcomeTitle')}</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            {t('dashboardNoPermissionMessage')}{' '}
                            {t('dashboardContactAdmin')}
                        </p>
                    </div>
                </div>
            )}
        </div >
    )
}
