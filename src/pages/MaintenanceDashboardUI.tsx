import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Search,
    Plus,
    Edit,
    Calendar,
    Users,
    Wrench,
    Phone,
    Mail,
    BarChart3,
    Filter,
    Download,
    RefreshCw,
    Eye,
    MoreVertical,
    ArrowUp,
    ArrowDown,
    Target,
    CalendarDays
} from 'lucide-react';
import type {
    CustomerDTO,
    MaintenanceDashboardStats
} from '@/services/maintenance/comprehensiveMaintenanceApi';
import {
    comprehensiveMaintenanceApi
} from '@/services/maintenance/comprehensiveMaintenanceApi';

const MaintenanceDashboardUI: React.FC = () => {
    const { t } = useTranslation();

    // State management
    const [dashboardStats, setDashboardStats] = useState<MaintenanceDashboardStats | null>(null);
    const [customers, setCustomers] = useState<CustomerDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);

    // Load initial data
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [stats, customersData] = await Promise.all([
                comprehensiveMaintenanceApi.getDashboardStatistics(),
                comprehensiveMaintenanceApi.searchCustomers({ page: 1, pageSize: 50 })
            ]);

            setDashboardStats(stats);
            setCustomers(customersData.data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const handleSearchCustomers = async () => {
        if (!searchTerm.trim()) return;

        try {
            const result = await comprehensiveMaintenanceApi.searchCustomers({
                searchTerm,
                page: 1,
                pageSize: 50
            });
            setCustomers(result.data);
        } catch (error) {
            console.error('Error searching customers:', error);
        }
    };


    const StatCard: React.FC<{
        title: string;
        value: string | number;
        icon: React.ReactNode;
        change?: number;
        color?: string;
        description?: string;
    }> = ({ title, value, icon, change, color = 'blue', description }) => {
        const iconBgColors: Record<string, string> = {
            blue: 'bg-blue-100 dark:bg-blue-900/20',
            green: 'bg-green-100 dark:bg-green-900/20',
            purple: 'bg-purple-100 dark:bg-purple-900/20',
            emerald: 'bg-emerald-100 dark:bg-emerald-900/20',
            orange: 'bg-orange-100 dark:bg-orange-900/20',
        };

        const iconTextColors: Record<string, string> = {
            blue: 'text-blue-600 dark:text-blue-400',
            green: 'text-green-600 dark:text-green-400',
            purple: 'text-purple-600 dark:text-purple-400',
            emerald: 'text-emerald-600 dark:text-emerald-400',
            orange: 'text-orange-600 dark:text-orange-400',
        };

        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-200">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconBgColors[color] || iconBgColors.blue}`}>
                    <div className={iconTextColors[color] || iconTextColors.blue}>
                        {icon}
                    </div>
                </div>

                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {title}
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-3xl dark:text-white/90">
                            {value}
                        </h4>
                        {description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                        )}
                    </div>
                    {change !== undefined && (
                        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${change >= 0
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                            {change >= 0 ? (
                                <ArrowUp className="h-3 w-3" />
                            ) : (
                                <ArrowDown className="h-3 w-3" />
                            )}
                            {Math.abs(change)}%
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 md:text-3xl">{t('maintenanceDashboard')}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('manageYourMedicalEquipmentMaintenance')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="border-gray-200 dark:border-gray-800"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                {t('refresh')}
                            </Button>
                            <Button size="sm" className="bg-brand-500 hover:bg-brand-600">
                                <Download className="h-4 w-4 mr-2" />
                                {t('export')}
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
                        <StatCard
                            title={t('totalCustomers')}
                            value={dashboardStats?.totalCustomers?.toLocaleString() || '0'}
                            icon={<Users className="h-6 w-6" />}
                            change={5}
                            color="blue"
                        />
                        <StatCard
                            title={t('totalEquipment')}
                            value={dashboardStats?.totalEquipment?.toLocaleString() || '0'}
                            icon={<Wrench className="h-6 w-6" />}
                            change={3}
                            color="green"
                        />
                        <StatCard
                            title={t('activeVisits')}
                            value={dashboardStats?.totalVisits?.toLocaleString() || '0'}
                            icon={<Calendar className="h-6 w-6" />}
                            change={-2}
                            color="purple"
                        />
                        <StatCard
                            title={t('completionRate')}
                            value={`${dashboardStats?.visitCompletionRate || 0}%`}
                            icon={<Target className="h-6 w-6" />}
                            change={8}
                            color="emerald"
                        />
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
                    <TabsList className="inline-flex h-auto w-full items-center justify-start gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-900 md:w-auto">
                        <TabsTrigger
                            value="overview"
                            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white"
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('overview')}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="customers"
                            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white"
                        >
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('customers')}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="equipment"
                            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white"
                        >
                            <Wrench className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('equipment')}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="visits"
                            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white"
                        >
                            <CalendarDays className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('visits')}</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
                            {/* Recent Activity */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 lg:col-span-2">
                                <div className="mb-5 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{t('recentActivity')}</h3>
                                    <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-800">
                                        <Filter className="h-4 w-4 mr-2" />
                                        {t('filter')}
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        {t('maintenanceRecentActivityPlaceholder')}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="space-y-4 md:space-y-6">
                                {/* Visit Status */}
                                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                                    <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">{t('maintenanceVisitStatus')}</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{t('completed')}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full dark:bg-green-400"
                                                        style={{ width: `${dashboardStats?.visitCompletionRate || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-800 dark:text-white/90">{dashboardStats?.completedVisits || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{t('pending')}</span>
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{dashboardStats?.pendingVisits || 0}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{t('monthly')}</span>
                                            <Badge variant="outline" className="border-gray-200 dark:border-gray-700">{dashboardStats?.monthlyVisits || 0}</Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Contracts */}
                                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                                    <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">{t('contracts')}</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{t('active')}</span>
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                {dashboardStats?.activeContracts || 0}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{t('contractTotalValue')}</span>
                                            <span className="text-sm font-medium text-gray-800 dark:text-white/90">$125,000</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{t('contractRenewalRate')}</span>
                                            <span className="text-sm font-medium text-green-600 dark:text-green-400">85%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* System Health */}
                                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                                    <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">{t('systemHealth')}</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{t('database')}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full dark:bg-green-400"></div>
                                                <span className="text-sm text-green-600 dark:text-green-400">{t('healthy')}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{t('api')}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full dark:bg-green-400"></div>
                                                <span className="text-sm text-green-600 dark:text-green-400">{t('online')}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{t('apiResponseTime')}</span>
                                            <span className="text-sm font-medium text-gray-800 dark:text-white/90">120ms</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Customers Tab */}
                    <TabsContent value="customers" className="space-y-4 md:space-y-6">
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                            <div className="border-b border-gray-200 p-5 dark:border-gray-800 md:p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{t('customerManagement')}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder={t('searchCustomers')}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSearchCustomers()}
                                                className="pl-10 w-full md:w-64 border-gray-200 dark:border-gray-800"
                                            />
                                        </div>
                                        <Button onClick={handleSearchCustomers} size="sm" variant="outline" className="border-gray-200 dark:border-gray-800">
                                            {t('search')}
                                        </Button>
                                        <Button size="sm" className="bg-brand-500 hover:bg-brand-600">
                                            <Plus className="h-4 w-4 mr-2" />
                                            {t('add')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-200 dark:border-gray-800">
                                            <TableHead className="text-gray-500 dark:text-gray-400">{t('customer')}</TableHead>
                                            <TableHead className="text-gray-500 dark:text-gray-400">{t('contact')}</TableHead>
                                            <TableHead className="text-gray-500 dark:text-gray-400">{t('equipment')}</TableHead>
                                            <TableHead className="text-gray-500 dark:text-gray-400">{t('visits')}</TableHead>
                                            <TableHead className="text-gray-500 dark:text-gray-400">{t('contracts')}</TableHead>
                                            <TableHead className="text-gray-500 dark:text-gray-400">{t('status')}</TableHead>
                                            <TableHead className="text-gray-500 dark:text-gray-400">{t('actions')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customers.map((customer) => (
                                            <TableRow key={customer.id} className="border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                            {customer.name.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 dark:text-white/90">{customer.name}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {customer.id.slice(0, 8)}...</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                            <Phone className="h-3 w-3 text-gray-400" />
                                                            <span>{customer.phone}</span>
                                                        </div>
                                                        {customer.email && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                                <Mail className="h-3 w-3 text-gray-400" />
                                                                <span>{customer.email}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-gray-200 dark:border-gray-700">12</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-gray-200 dark:border-gray-700">28</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-gray-200 dark:border-gray-700">3</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={customer.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}>
                                                        {customer.isActive ? t('active') : t('inactive')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Link to={`/client/${customer.id}/equipment`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Equipment Tab */}
                    <TabsContent value="equipment" className="space-y-4 md:space-y-6">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">{t('equipmentOverview')}</h3>
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                {t('equipmentManagementPlaceholder')}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Visits Tab */}
                    <TabsContent value="visits" className="space-y-4 md:space-y-6">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">{t('visitSchedule')}</h3>
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                {t('visitManagementPlaceholder')}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default MaintenanceDashboardUI;
