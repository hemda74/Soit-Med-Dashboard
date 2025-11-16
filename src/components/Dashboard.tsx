import { Settings } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import ProfileCompletionAlert from '@/components/ProfileCompletionAlert'
import { useProfileCompletionQuery } from '@/hooks/useAuthQueries'
import { usePerformance } from '@/hooks/usePerformance'
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard'
import SalesManagerDashboardOverview from '@/components/dashboards/SalesManagerDashboardOverview'
import SalesSupportDashboardOverview from '@/components/dashboards/SalesSupportDashboardOverview'
import MaintenanceSupportDashboard from '@/components/dashboards/MaintenanceSupportDashboard'

export default function Dashboard() {
    usePerformance('Dashboard')
    const { hasRole } = useAuthStore()
    const isSuperAdmin = hasRole('SuperAdmin')
    const isSalesManager = hasRole('SalesManager')
    const isSalesSupport = hasRole('SalesSupport')
    const isMaintenanceSupport = hasRole('MaintenanceSupport')

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
            {isSuperAdmin && (
                <SuperAdminDashboard />
            )}

            {/* Sales Manager Specific Content */}
            {(isSalesManager || isSuperAdmin) && (
                <SalesManagerDashboardOverview isSuperAdmin={isSuperAdmin} />
            )}

            {/* Sales Support Specific Content */}
            {isSalesSupport && !isSuperAdmin && (
                <SalesSupportDashboardOverview />
            )}

            {/* Maintenance Support Specific Content */}
            {isMaintenanceSupport && !isSuperAdmin && (
                <MaintenanceSupportDashboard />
            )}

            {/* Default Content for other roles */}
            {!isSuperAdmin && !isSalesManager && !isSalesSupport && !isMaintenanceSupport && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Settings className="w-12 h-12 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-4">Welcome to Soit-Med Dashboard</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            You don't have permission to view analytics and statistics.
                            Please contact your administrator if you need access to this information.
                        </p>
                    </div>
                </div>
            )}
        </div >
    )
}
