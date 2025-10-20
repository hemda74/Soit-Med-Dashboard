// Sales Manager Dashboard - Comprehensive management dashboard for sales managers

import { useEffect, useState } from 'react';
import {
    Users,
    TrendingUp,
    Calendar,
    BarChart3,
    AlertCircle,
    CheckCircle,
    Clock,
    UserPlus,
    Activity,
    FileText,
    Download,
    Filter
} from 'lucide-react';
import { useSalesStore } from '@/stores/salesStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClientSearch from './ClientSearch';
import ClientDetails from './ClientDetails';
import type { Client } from '@/types/sales.types';

export default function SalesManagerDashboard() {
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [timeRange, setTimeRange] = useState('monthly');

    const {
        salesDashboard,
        salesAnalytics,
        salesPerformance,
        upcomingVisits,
        overdueVisits,
        clients,
        analyticsLoading,
        getSalesDashboard,
        getSalesAnalytics,
        getSalesPerformance,
        getUpcomingVisits,
        getOverdueVisits,
        getMyClients,
    } = useSalesStore();

    useEffect(() => {
        // Load dashboard data
        getSalesDashboard();
        getSalesAnalytics(timeRange);
        getSalesPerformance(undefined, timeRange);
        getUpcomingVisits(7);
        getOverdueVisits();
        getMyClients();
    }, [timeRange, getSalesDashboard, getSalesAnalytics, getSalesPerformance, getUpcomingVisits, getOverdueVisits, getMyClients]);

    const handleClientSelect = (client: Client) => {
        setSelectedClient(client);
        setSelectedTab('clients');
    };

    const getStatusColor = (status: string) => {
        const colors = {
            Active: 'bg-green-100 text-green-800',
            Inactive: 'bg-gray-100 text-gray-800',
            Prospect: 'bg-yellow-100 text-yellow-800',
            Lost: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || colors.Inactive;
    };


    if (analyticsLoading && !salesDashboard) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Sales Manager Dashboard</h1>
                    <p className="text-muted-foreground">Manage your sales team and track performance</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <Users className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Total Clients</span>
                        </div>
                        <p className="text-2xl font-bold">{salesDashboard?.overview.totalClients || 0}</p>
                        <p className="text-xs text-muted-foreground">
                            +{salesDashboard?.overview.newClientsThisMonth || 0} this month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium">Active Clients</span>
                        </div>
                        <p className="text-2xl font-bold">{salesDashboard?.overview.activeClients || 0}</p>
                        <p className="text-xs text-muted-foreground">
                            {salesDashboard?.overview.conversionRate || 0}% conversion rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium">Monthly Visits</span>
                        </div>
                        <p className="text-2xl font-bold">{salesDashboard?.overview.totalVisitsThisMonth || 0}</p>
                        <p className="text-xs text-muted-foreground">
                            {upcomingVisits.length} upcoming
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                            <span className="text-sm font-medium">Team Performance</span>
                        </div>
                        <p className="text-2xl font-bold">{salesDashboard?.overview.teamPerformance || 0}%</p>
                        <p className="text-xs text-muted-foreground">
                            Average across team
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="clients">Clients</TabsTrigger>
                    <TabsTrigger value="visits">Visits</TabsTrigger>
                    <TabsTrigger value="team">Team Performance</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5" />
                                    <span>Recent Activity</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {salesDashboard?.recentActivity?.slice(0, 5).map((activity, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm">{activity.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {activity.salesmanName || 'Unknown'} • {new Date(activity.timestamp).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )) || (
                                            <p className="text-sm text-muted-foreground">No recent activity</p>
                                        )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upcoming Visits */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Upcoming Visits</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {upcomingVisits.slice(0, 5).map((visit) => (
                                        <div key={visit.id} className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">{visit.clientName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {visit.visitType} • {new Date(visit.visitDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge variant="outline">Salesman</Badge>
                                        </div>
                                    ))}
                                    {upcomingVisits.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No upcoming visits</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Overdue Items */}
                    {overdueVisits.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-destructive">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>Overdue Items ({overdueVisits.length})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {overdueVisits.slice(0, 5).map((visit) => (
                                        <div key={visit.id} className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-destructive rounded-full"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">{visit.clientName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {visit.visitType} • Due {new Date(visit.visitDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge variant="destructive">Overdue</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Clients Tab */}
                <TabsContent value="clients" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Client Management</h3>
                        <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Client
                        </Button>
                    </div>

                    {/* Client Search */}
                    <ClientSearch onClientSelect={handleClientSelect} />

                    {/* Clients List */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {clients.slice(0, 12).map((client) => (
                            <Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleClientSelect(client)}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{client.name}</h4>
                                            <p className="text-sm text-muted-foreground">{client.type}</p>
                                        </div>
                                        <Badge className={getStatusColor(client.status)}>
                                            {client.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1 text-xs text-muted-foreground">
                                        {client.location && (
                                            <p className="truncate">{client.location}</p>
                                        )}
                                        {client.phone && (
                                            <p>{client.phone}</p>
                                        )}
                                        <p>{client.totalVisits} visits</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Visits Tab */}
                <TabsContent value="visits" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Visit Management</h3>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                            <Button>
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Visit
                            </Button>
                        </div>
                    </div>

                    {/* Visits Overview */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    <span className="text-sm font-medium">Total Visits</span>
                                </div>
                                <p className="text-2xl font-bold">{salesAnalytics?.totalVisits || 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-medium">Completed</span>
                                </div>
                                <p className="text-2xl font-bold">{salesAnalytics?.completedVisits || 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                    <span className="text-sm font-medium">Upcoming</span>
                                </div>
                                <p className="text-2xl font-bold">{upcomingVisits.length}</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Team Performance Tab */}
                <TabsContent value="team" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Team Performance</h3>
                        <Button>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Analytics
                        </Button>
                    </div>

                    {/* Team Performance Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {salesPerformance.map((performance) => (
                            <Card key={performance.salesmanId}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{performance.salesmanName || 'Unknown'}</h4>
                                        <Badge variant={performance.successRate > 80 ? 'default' : 'secondary'}>
                                            {performance.successRate}%
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Clients:</span>
                                            <span>{performance.totalClients}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Visits:</span>
                                            <span>{performance.totalVisits}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Last Activity:</span>
                                            <span>{new Date(Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Sales Reports</h3>
                        <Button>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Report
                        </Button>
                    </div>

                    {/* Reports Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    <span className="font-medium">Monthly Performance</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Team performance for current month</p>
                            </CardContent>
                        </Card>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    <span className="font-medium">Client Analysis</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Detailed client breakdown and trends</p>
                            </CardContent>
                        </Card>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    <span className="font-medium">Sales Trends</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Revenue and conversion trends</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Client Details Modal */}
            {selectedClient && (
                <ClientDetails
                    clientId={selectedClient.id}
                    onEdit={(client) => {
                        // Handle client edit
                        console.log('Edit client:', client);
                    }}
                    onDelete={() => {
                        // Handle client delete
                        setSelectedClient(null);
                    }}
                />
            )}
        </div>
    );
}

