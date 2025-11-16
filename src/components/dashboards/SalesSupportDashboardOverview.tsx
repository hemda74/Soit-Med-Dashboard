import React, { useEffect, useState } from 'react';
import { HeadphonesIcon, Users, UserPlus, BarChart3, Activity, Clock, CheckCircle2, XCircle, Send, User, Building2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { salesApi } from '@/services/sales/salesApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { usePerformance } from '@/hooks/usePerformance';

const SalesSupportDashboardOverview: React.FC = () => {
    usePerformance('SalesSupportDashboardOverview');
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [activityLoading, setActivityLoading] = useState(false);

    const loadRecentActivity = async () => {
        setActivityLoading(true);
        try {
            const response = await salesApi.getRecentActivity(20);
            if (response.success && response.data) {
                setRecentActivity(response.data);
            }
        } catch (error) {
            // Error loading activity
        } finally {
            setActivityLoading(false);
        }
    };

    useEffect(() => {
        loadRecentActivity();
    }, []);

    return (
        <>
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    {t('salesSupportDashboard')}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {t('salesSupportDashboardDescription')}
                </p>
            </div>

            {/* Quick Action Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
                {/* Support Dashboard Card */}
                <Link to="/sales-support" className="block">
                    <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <HeadphonesIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">12</p>
                                <p className="text-sm text-muted-foreground">Active Tickets</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-green-600 transition-colors">
                            {t('salesSupportDashboard')}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {t('salesSupportDashboardDescription')}
                        </p>
                    </div>
                </Link>

                {/* Support Management Card */}
                <Link to="/sales-support/requests" className="block">
                    <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">8</p>
                                <p className="text-sm text-muted-foreground">Team Members</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-blue-600 transition-colors">
                            {t('salesSupportManagement')}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {t('salesSupportManagementDescription')}
                        </p>
                    </div>
                </Link>

                {/* Create Support User Card */}
                <Link to="/sales-support/offer" className="block">
                    <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">+</p>
                                <p className="text-sm text-muted-foreground">New User</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-purple-600 transition-colors">
                            {t('createSalesSupportUser')}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {t('salesSupportUserDescription')}
                        </p>
                    </div>
                </Link>
            </div>

            {/* Recent Activity Section - Dynamic */}
            <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
                </div>
                <Card className="shadow-lg border-2 border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            {t('recentActivity') || 'Recent Activity'}
                        </CardTitle>
                        <CardDescription>Latest offer lifecycle events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activityLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="mt-4 text-sm text-muted-foreground">Loading recent activity...</p>
                            </div>
                        ) : recentActivity && recentActivity.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {recentActivity.map((activity, index) => {
                                    const getActivityIcon = () => {
                                        switch (activity.type) {
                                            case 'Accepted':
                                                return <CheckCircle2 className="h-4 w-4 text-primary" />;
                                            case 'Completed':
                                                return <CheckCircle2 className="h-4 w-4 text-primary" />;
                                            case 'Rejected':
                                                return <XCircle className="h-4 w-4 text-destructive" />;
                                            case 'Sent':
                                                return <Send className="h-4 w-4 text-primary" />;
                                            default:
                                                return <Activity className="h-4 w-4 text-muted-foreground" />;
                                        }
                                    };

                                    return (
                                        <div
                                            key={index}
                                            className="group border border-border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <div className="p-2 bg-muted rounded-md">
                                                        {getActivityIcon()}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <p className="text-sm font-medium text-foreground">
                                                            {activity.description || activity.message}
                                                        </p>
                                                        <Badge variant="outline" className="text-xs">
                                                            {activity.type || activity.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                                                        {activity.clientName && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Building2 className="h-3 w-3" />
                                                                <span>{activity.clientName}</span>
                                                            </div>
                                                        )}
                                                        {activity.salesmanName && (
                                                            <div className="flex items-center gap-1.5">
                                                                <User className="h-3 w-3" />
                                                                <span>{activity.salesmanName}</span>
                                                            </div>
                                                        )}
                                                        {activity.offerId && (
                                                            <div className="flex items-center gap-1.5">
                                                                <FileText className="h-3 w-3" />
                                                                <span>{t('offer') || 'Offer'} #{activity.offerId}</span>
                                                            </div>
                                                        )}
                                                        {activity.timestamp && (
                                                            <div className="flex items-center gap-1.5 ml-auto">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Activity className="h-8 w-8 text-muted-foreground mb-3" />
                                <p className="text-sm font-medium text-foreground mb-1">No recent activity</p>
                                <p className="text-xs text-muted-foreground text-center">
                                    Activity will appear here as offers and requests are processed
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default SalesSupportDashboardOverview;

