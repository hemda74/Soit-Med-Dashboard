import { User, Users, UserPlus, Settings, TestTube } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { fetchUserStatistics } from '@/services/dashboardApi'
import type { UserStatistics } from '@/types/api.types'
import { useState, useEffect } from 'react'
import Logo from './Logo'
export default function Dashboard() {
    const { user, hasRole } = useAuthStore()
    const { t } = useTranslation()
    const isAdmin = hasRole('SuperAdmin') || hasRole('Admin')

    const [statistics, setStatistics] = useState<UserStatistics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStatistics = async () => {
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
    }, [user?.token])

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className=" bg-primary rounded-2xl p-8 text-white animate-slideIn shadow-2xl glow">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-white">{t('dashboard')}</h1>
                        <p className="text-white/90 text-lg font-medium">{t('welcomeBackUser')}, {user?.firstName}!</p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center float ">
                            <Logo />                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fadeIn">
                {loading ? (
                    // Loading state
                    Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 border-2 border-border shadow-lg h-32 flex flex-col justify-center">
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
                        <div className="bg-white rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-32 flex flex-col justify-center">
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

                        <div className="bg-white rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-32 flex flex-col justify-center">
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

                        <div className="bg-white rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-32 flex flex-col justify-center">
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

                        <div className="bg-white rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-32 flex flex-col justify-center">
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

            {/* Action Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
                {/* Profile Card */}
                <Link to="/profile">
                    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-2 border-border group shadow-lg h-64">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-foreground group-hover:text-foreground/90 font-bold">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                                {t('profile')}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">
                                {t('profileDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{t('fullName')}</span>
                                    <span className="text-muted-foreground">{user?.fullName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{t('department')}</span>
                                    <span className="text-muted-foreground">{user?.departmentName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{t('role')}</span>
                                    <span className="text-muted-foreground">{user?.roles.join(', ')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Users Management Card */}
                {isAdmin && (
                    <Link to="/admin/users">
                        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-2 border-border group shadow-lg h-64">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-foreground group-hover:text-foreground/90 font-bold">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    {t('usersManagement')}
                                </CardTitle>
                                <CardDescription className="text-muted-foreground font-medium">
                                    {t('usersManagementDescription')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground font-medium">
                                    {t('usersManagementDetails')}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                )}

                {/* User Creation Card */}
                {isAdmin && (
                    <Link to="/admin/create-role-user">
                        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-2 border-border group shadow-lg h-64">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-foreground group-hover:text-foreground/90 font-bold">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                                        <UserPlus className="h-6 w-6 text-white" />
                                    </div>
                                    {t('createUser')}
                                </CardTitle>
                                <CardDescription className="text-muted-foreground font-medium">
                                    {t('createUserDescription')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground font-medium">
                                    {t('createUserDetails')}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                )}
            </div>
        </div>
    )
}
