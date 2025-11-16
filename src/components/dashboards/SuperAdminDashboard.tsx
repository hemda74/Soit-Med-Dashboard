import React, { useEffect } from 'react';
import { Users, UserPlus, Settings, TestTube, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useStatistics, useStatisticsLoading, useStatisticsError, useStatisticsStore } from '@/stores/statisticsStore';
import { useAuthStore } from '@/stores/authStore';
import {
    UserGrowthChart,
    UnifiedAnalyticsCard,
    MonthlyActivityChart,
    SystemHealthChart
} from '@/components/charts';
import { usePerformance } from '@/hooks/usePerformance';

const SuperAdminDashboard: React.FC = () => {
    usePerformance('SuperAdminDashboard');
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const statistics = useStatistics();
    const loading = useStatisticsLoading();
    const error = useStatisticsError();
    const fetchStatistics = useStatisticsStore((state) => state.fetchStatistics);

    useEffect(() => {
        if (user?.token) {
            fetchStatistics(user.token);
        }
    }, [user?.token, fetchStatistics]);

    return (
        <>
            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fadeIn">
                {loading ? (
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
                    <div className="col-span-full bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                        <p className="text-destructive font-medium">{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-32 flex flex-col justify-center">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground font-semibold text-sm">{t('totalUsers')}</p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {(statistics?.totalUsers ?? 0).toLocaleString()}
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
                                        {(statistics?.activeUsers ?? 0).toLocaleString()}
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
                                        {(statistics?.inactiveUsers ?? 0).toLocaleString()}
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
                                        {statistics?.activeUsers && statistics?.totalUsers && statistics.totalUsers > 0 ?
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

                <div className="grid gap-6 lg:grid-cols-2">
                    <UserGrowthChart />
                    <UnifiedAnalyticsCard />
                </div>

                <div className="grid gap-6">
                    <MonthlyActivityChart />
                </div>

                <div className="grid gap-6">
                    <SystemHealthChart />
                </div>
            </div>
        </>
    );
};

export default SuperAdminDashboard;

