import { Users, UserPlus, Settings, TestTube, BarChart3 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import { fetchUserStatistics } from '@/services'
import type { UserStatistics } from '@/types/api.types'
import { useState, useEffect } from 'react'
import {
    UserGrowthChart,
    DepartmentDistributionChart,
    MonthlyActivityChart,
    SystemHealthChart
} from '@/components/charts'
export default function Dashboard() {
    const { user, hasRole } = useAuthStore()
    const { t } = useTranslation()
    const isSuperAdmin = hasRole('SuperAdmin')

    const [statistics, setStatistics] = useState<UserStatistics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStatistics = async () => {
            // Only fetch statistics for SuperAdmin users
            if (!isSuperAdmin) {
                setLoading(false)
                return
            }

            if (!user?.token) {
                setError('No authentication token available')
                setLoading(false)
                return
            }

            try {
                setError(null)
                const data = await fetchUserStatistics(user.token, setLoading)
                setStatistics(data)
            } catch (err) {
                console.error('Failed to fetch statistics:', err)
                setError('Failed to load statistics')
                setLoading(false)
            }
        }

        fetchStatistics()
    }, [user?.token, isSuperAdmin])

    return (
        <div className="space-y-8">
            {/* SuperAdmin Only Content - Statistics and Charts */}
            {isSuperAdmin && (
                <>
                    {/* Quick Stats */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fadeIn">
                        {loading ? (
                            // Loading state
                            Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="bg-card rounded-xl p-6 border-2 border-border shadow-lg h-32 flex flex-col justify-center">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                                            <div className="h-8 bg-muted animate-pulse rounded w-16"></div>
                                        </div>
                                        <div className="w-14 h-14 bg-muted animate-pulse rounded-xl"></div>
                                    </div>
                                </div>
                            ))
                        ) : error ? (
                            // Error state
                            <div className="col-span-full bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                                <p className="text-destructive font-medium">{error}</p>
                            </div>
                        ) : (
                            // Data state
                            <>
                                <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-32 flex flex-col justify-center">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-muted-foreground font-semibold text-sm">{t('totalUsers')}</p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {statistics?.totalUsers.toLocaleString() || '0'}
                                            </p>
                                        </div>
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                                            <Users className="w-7 h-7 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-32 flex flex-col justify-center">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-muted-foreground font-semibold text-sm">{t('activeUsers')}</p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {statistics?.activeUsers.toLocaleString() || '0'}
                                            </p>
                                        </div>
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                                            <TestTube className="w-7 h-7 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-32 flex flex-col justify-center">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-muted-foreground font-semibold text-sm">{t('inactiveUsers')}</p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {statistics?.inactiveUsers.toLocaleString() || '0'}
                                            </p>
                                        </div>
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                                            <UserPlus className="w-7 h-7 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-32 flex flex-col justify-center">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-muted-foreground font-semibold text-sm">{t('successRate')}</p>
                                            <p className="text-3xl font-bold text-foreground">
                                                {statistics ?
                                                    `${((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1)}%` :
                                                    '0%'
                                                }
                                            </p>
                                        </div>
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                                            <Settings className="w-7 h-7 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Charts Section */}
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold text-foreground">Analytics & Insights</h2>
                        </div>

                        {/* First Row - User Growth and Department Distribution */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            <UserGrowthChart />
                            <DepartmentDistributionChart />
                        </div>

                        {/* Second Row - Monthly Activity */}
                        <div className="grid gap-6">
                            <MonthlyActivityChart />
                        </div>

                        {/* Third Row - System Health */}
                        <div className="grid gap-6">
                            <SystemHealthChart />
                        </div>
                    </div>
                </>
            )}

            {/* Non-SuperAdmin Content */}
            {!isSuperAdmin && (
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
        </div>
    )
}
