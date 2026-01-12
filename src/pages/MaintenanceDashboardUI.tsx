import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    MapPin,
    Phone,
    Mail,
    Activity,
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
    comprehensiveMaintenanceApi,
    VisitStatus,
    ContractStatus,
    ComprehensiveMaintenanceApi
} from '@/services/maintenance/comprehensiveMaintenanceApi';

const MaintenanceDashboardUI: React.FC = () => {
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

    const getStatusIcon = (status: VisitStatus) => {
        switch (status) {
            case VisitStatus.Scheduled:
                return <Clock className="h-4 w-4 text-blue-500" />;
            case VisitStatus.InProgress:
                return <Activity className="h-4 w-4 text-orange-500" />;
            case VisitStatus.Completed:
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case VisitStatus.Cancelled:
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getContractStatusBadge = (status: ContractStatus) => {
        const variants = {
            [ContractStatus.Active]: 'default',
            [ContractStatus.Draft]: 'secondary',
            [ContractStatus.Expired]: 'destructive',
            [ContractStatus.Terminated]: 'destructive',
            [ContractStatus.Suspended]: 'outline'
        } as const;

        return (
            <Badge variant={variants[status] || 'secondary'}>
                {ComprehensiveMaintenanceApi.getContractStatusDisplay(status)}
            </Badge>
        );
    };

    const getEquipmentStatusColor = (status: string) => {
        const colors = {
            'Operational': 'text-green-600 bg-green-100',
            'UnderMaintenance': 'text-orange-600 bg-orange-100',
            'OutOfOrder': 'text-red-600 bg-red-100',
            'Retired': 'text-gray-600 bg-gray-100'
        };
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
    };

    const StatCard: React.FC<{
        title: string;
        value: string | number;
        icon: React.ReactNode;
        change?: number;
        color?: string;
        description?: string;
    }> = ({ title, value, icon, change, color = 'blue', description }) => (
        <Card className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-sm">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                        {description && (
                            <p className="text-sm text-gray-500 mt-1">{description}</p>
                        )}
                        {change !== undefined && (
                            <div className="flex items-center mt-2">
                                {change >= 0 ? (
                                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                                ) : (
                                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                                )}
                                <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {Math.abs(change)}%
                                </span>
                            </div>
                        )}
                    </div>
                    <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600 ml-4`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

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
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Dashboard</h1>
                        <p className="text-gray-600">Manage your medical equipment maintenance operations</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Customers"
                        value={dashboardStats?.totalCustomers?.toLocaleString() || '0'}
                        icon={<Users className="h-6 w-6" />}
                        change={5}
                        color="blue"
                        description="Active customers in system"
                    />
                    <StatCard
                        title="Total Equipment"
                        value={dashboardStats?.totalEquipment?.toLocaleString() || '0'}
                        icon={<Wrench className="h-6 w-6" />}
                        change={3}
                        color="green"
                        description="Equipment units tracked"
                    />
                    <StatCard
                        title="Active Visits"
                        value={dashboardStats?.totalVisits?.toLocaleString() || '0'}
                        icon={<Calendar className="h-6 w-6" />}
                        change={-2}
                        color="purple"
                        description="Maintenance visits"
                    />
                    <StatCard
                        title="Completion Rate"
                        value={`${dashboardStats?.visitCompletionRate || 0}%`}
                        icon={<Target className="h-6 w-6" />}
                        change={8}
                        color="emerald"
                        description="Visit completion rate"
                    />
                </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-lg shadow-sm">
                    <TabsTrigger value="overview" className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="customers" className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Customers</span>
                    </TabsTrigger>
                    <TabsTrigger value="equipment" className="flex items-center space-x-2">
                        <Wrench className="h-4 w-4" />
                        <span>Equipment</span>
                    </TabsTrigger>
                    <TabsTrigger value="visits" className="flex items-center space-x-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>Visits</span>
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Activity */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Recent Activity
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-center py-8 text-gray-500">
                                        Recent activity will be shown here. Click on a customer to view their details.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <div className="space-y-6">
                            {/* Visit Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Visit Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Completed</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${dashboardStats?.visitCompletionRate || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium">{dashboardStats?.completedVisits || 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Pending</span>
                                        <Badge variant="secondary">{dashboardStats?.pendingVisits || 0}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Monthly</span>
                                        <Badge variant="outline">{dashboardStats?.monthlyVisits || 0}</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contracts */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Contracts</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Active</span>
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                            {dashboardStats?.activeContracts || 0}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Value</span>
                                        <span className="text-sm font-medium">$125,000</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Renewal Rate</span>
                                        <span className="text-sm font-medium text-green-600">85%</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* System Health */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">System Health</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Database</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm text-green-600">Healthy</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">API</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm text-green-600">Online</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Response Time</span>
                                        <span className="text-sm font-medium">120ms</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Customers Tab */}
                <TabsContent value="customers" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Customer Management
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search customers..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearchCustomers()}
                                            className="pl-10 w-64"
                                        />
                                    </div>
                                    <Button onClick={handleSearchCustomers}>
                                        Search
                                    </Button>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Customer
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Equipment</TableHead>
                                        <TableHead>Visits</TableHead>
                                        <TableHead>Contracts</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((customer) => (
                                        <TableRow key={customer.id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                                        {customer.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{customer.name}</p>
                                                        <p className="text-sm text-gray-600">ID: {customer.id.slice(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <Phone className="h-3 w-3 text-gray-400" />
                                                        <span>{customer.phone}</span>
                                                    </div>
                                                    {customer.email && (
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <Mail className="h-3 w-3 text-gray-400" />
                                                            <span>{customer.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">12</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">28</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">3</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                                                    {customer.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link to={`/client/${customer.id}/equipment`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Equipment Tab */}
                <TabsContent value="equipment" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Equipment Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-gray-500">
                                Equipment management interface coming soon...
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Visits Tab */}
                <TabsContent value="visits" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visit Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-gray-500">
                                Visit management interface coming soon...
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MaintenanceDashboardUI;
