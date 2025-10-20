// Salesman Dashboard - Personal dashboard for individual salesmen

import { useEffect, useState } from 'react';
import {
    Users,
    Calendar,
    Target,
    TrendingUp,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    Star,
    MapPin,
    Phone,
    Mail,
    Activity,
    BarChart3
} from 'lucide-react';
import { useSalesStore } from '@/stores/salesStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClientSearch from './ClientSearch';
import ClientDetails from './ClientDetails';
import type { Client } from '@/types/sales.types';

export default function SalesmanDashboard() {
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [timeRange] = useState('monthly');

    const {
        salesDashboard,
        salesAnalytics,
        upcomingVisits,
        overdueVisits,
        clients,
        analyticsLoading,
        getSalesDashboard,
        getSalesAnalytics,
        getUpcomingVisits,
        getOverdueVisits,
        getMyClients,
    } = useSalesStore();

    useEffect(() => {
        // Load dashboard data
        getSalesDashboard();
        getSalesAnalytics(timeRange);
        getUpcomingVisits(7);
        getOverdueVisits();
        getMyClients();
    }, [timeRange, getSalesDashboard, getSalesAnalytics, getUpcomingVisits, getOverdueVisits, getMyClients]);

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

    const getVisitTypeColor = (type: string) => {
        const colors = {
            Initial: 'bg-blue-100 text-blue-800',
            'Follow-up': 'bg-green-100 text-green-800',
            Maintenance: 'bg-purple-100 text-purple-800',
            Support: 'bg-orange-100 text-orange-800',
            Presentation: 'bg-pink-100 text-pink-800',
            Negotiation: 'bg-yellow-100 text-yellow-800',
            Closing: 'bg-red-100 text-red-800',
        };
        return colors[type as keyof typeof colors] || colors.Initial;
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
                    <h1 className="text-3xl font-bold">My Sales Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Track your sales performance</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Client
                    </Button>
                    <Button variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Visit
                    </Button>
                </div>
            </div>

            {/* Personal Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <Users className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">My Clients</span>
                        </div>
                        <p className="text-2xl font-bold">{clients.length}</p>
                        <p className="text-xs text-muted-foreground">
                            {salesAnalytics?.activeClients || 0} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium">This Month</span>
                        </div>
                        <p className="text-2xl font-bold">{salesAnalytics?.totalVisits || 0}</p>
                        <p className="text-xs text-muted-foreground">
                            {upcomingVisits.length} upcoming
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <Target className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium">Success Rate</span>
                        </div>
                        <p className="text-2xl font-bold">{salesAnalytics?.successRate || 0}%</p>
                        <p className="text-xs text-muted-foreground">
                            Conversion rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                            <span className="text-sm font-medium">Performance</span>
                        </div>
                        <p className="text-2xl font-bold">{salesAnalytics?.conversionRate || 0}%</p>
                        <p className="text-xs text-muted-foreground">
                            Overall performance
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="clients">My Clients</TabsTrigger>
                    <TabsTrigger value="visits">My Visits</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Today's Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Today's Schedule</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {upcomingVisits
                                        .filter(visit => {
                                            const visitDate = new Date(visit.visitDate);
                                            const today = new Date();
                                            return visitDate.toDateString() === today.toDateString();
                                        })
                                        .slice(0, 5)
                                        .map((visit) => (
                                            <div key={visit.id} className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">{visit.clientName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {visit.visitType} • {new Date(visit.visitDate).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                <Badge className={getVisitTypeColor(visit.visitType)}>
                                                    {visit.visitType}
                                                </Badge>
                                            </div>
                                        ))}
                                    {upcomingVisits.filter(visit => {
                                        const visitDate = new Date(visit.visitDate);
                                        const today = new Date();
                                        return visitDate.toDateString() === today.toDateString();
                                    }).length === 0 && (
                                            <p className="text-sm text-muted-foreground">No visits scheduled for today</p>
                                        )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upcoming Visits */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5" />
                                    <span>Upcoming Visits</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {upcomingVisits.slice(0, 5).map((visit) => (
                                        <div key={visit.id} className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">{visit.clientName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {visit.visitType} • {new Date(visit.visitDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge variant="outline">{visit.location}</Badge>
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
                                                {new Date(activity.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                )) || (
                                        <p className="text-sm text-muted-foreground">No recent activity</p>
                                    )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* My Clients Tab */}
                <TabsContent value="clients" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">My Clients</h3>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Client
                        </Button>
                    </div>

                    {/* Client Search */}
                    <ClientSearch onClientSelect={handleClientSelect} />

                    {/* Clients Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {clients.map((client) => (
                            <Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleClientSelect(client)}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{client.name}</h4>
                                            <p className="text-sm text-muted-foreground">{client.type}</p>
                                            {client.specialization && (
                                                <p className="text-xs text-muted-foreground">{client.specialization}</p>
                                            )}
                                        </div>
                                        <Badge className={getStatusColor(client.status)}>
                                            {client.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1 text-xs text-muted-foreground">
                                        {client.location && (
                                            <div className="flex items-center space-x-1">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">{client.location}</span>
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-center space-x-1">
                                                <Phone className="h-3 w-3" />
                                                <span>{client.phone}</span>
                                            </div>
                                        )}
                                        {client.email && (
                                            <div className="flex items-center space-x-1">
                                                <Mail className="h-3 w-3" />
                                                <span className="truncate">{client.email}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-1">
                                                <Star className="h-3 w-3" />
                                                <span>{client.totalVisits} visits</span>
                                            </div>
                                            {client.lastVisitDate && (
                                                <span className="text-xs">
                                                    Last: {new Date(client.lastVisitDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* My Visits Tab */}
                <TabsContent value="visits" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">My Visits</h3>
                        <Button>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Visit
                        </Button>
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

                    {/* Recent Visits */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Visits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingVisits.slice(0, 10).map((visit) => (
                                    <div key={visit.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{visit.clientName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {visit.visitType} • {visit.location}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(visit.visitDate).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge className={getVisitTypeColor(visit.visitType)}>
                                                {visit.visitType}
                                            </Badge>
                                            <Badge variant={visit.status === 'Completed' ? 'default' : 'secondary'}>
                                                {visit.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {upcomingVisits.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">No visits found</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">My Performance Analytics</h3>
                        <Button variant="outline">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Details
                        </Button>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">Success Rate</span>
                                </div>
                                <p className="text-2xl font-bold">{salesAnalytics?.successRate || 0}%</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-medium">Conversion Rate</span>
                                </div>
                                <p className="text-2xl font-bold">{salesAnalytics?.conversionRate || 0}%</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5 text-blue-500" />
                                    <span className="text-sm font-medium">Avg Duration</span>
                                </div>
                                <p className="text-2xl font-bold">{salesAnalytics?.averageVisitDuration || 0}m</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Users className="h-5 w-5 text-purple-500" />
                                    <span className="text-sm font-medium">Clients/Week</span>
                                </div>
                                <p className="text-2xl font-bold">{salesAnalytics?.totalClients || 0}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Chart Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Performance chart will be displayed here</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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

