import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Users,
    TrendingUp,
    Calendar,
    Target,
    DollarSign,
    Activity,
    Eye,
    Plus,
    Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SalesManagerDashboardProps { }

interface SalesData {
    totalRevenue: number;
    monthlyTarget: number;
    activeClients: number;
    newLeads: number;
    conversionRate: number;
    avgDealSize: number;
    pipelineValue: number;
    closedDeals: number;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    target: number;
    achieved: number;
    performance: number;
    status: 'excellent' | 'good' | 'needs_improvement';
}

interface RecentActivity {
    id: string;
    type: 'deal_closed' | 'new_lead' | 'meeting_scheduled' | 'follow_up';
    description: string;
    timestamp: string;
    value?: number;
}

const SalesManagerDashboard: React.FC<SalesManagerDashboardProps> = () => {
    const [salesData, setSalesData] = useState<SalesData | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data - replace with actual API calls
        const mockSalesData: SalesData = {
            totalRevenue: 1250000,
            monthlyTarget: 1500000,
            activeClients: 45,
            newLeads: 23,
            conversionRate: 18.5,
            avgDealSize: 25000,
            pipelineValue: 850000,
            closedDeals: 12
        };

        const mockTeamMembers: TeamMember[] = [
            {
                id: '1',
                name: 'Sarah Johnson',
                role: 'Senior Sales Rep',
                target: 200000,
                achieved: 180000,
                performance: 90,
                status: 'excellent'
            },
            {
                id: '2',
                name: 'Mike Chen',
                role: 'Sales Rep',
                target: 150000,
                achieved: 120000,
                performance: 80,
                status: 'good'
            },
            {
                id: '3',
                name: 'Emily Davis',
                role: 'Sales Rep',
                target: 150000,
                achieved: 90000,
                performance: 60,
                status: 'needs_improvement'
            }
        ];

        const mockRecentActivity: RecentActivity[] = [
            {
                id: '1',
                type: 'deal_closed',
                description: 'Closed deal with Acme Corp',
                timestamp: '2 hours ago',
                value: 50000
            },
            {
                id: '2',
                type: 'new_lead',
                description: 'New lead from Tech Solutions',
                timestamp: '4 hours ago'
            },
            {
                id: '3',
                type: 'meeting_scheduled',
                description: 'Demo scheduled with Global Industries',
                timestamp: '6 hours ago'
            },
            {
                id: '4',
                type: 'follow_up',
                description: 'Follow-up call with StartupXYZ',
                timestamp: '1 day ago'
            }
        ];

        setTimeout(() => {
            setSalesData(mockSalesData);
            setTeamMembers(mockTeamMembers);
            setRecentActivity(mockRecentActivity);
            setLoading(false);
        }, 1000);
    }, []);

    const getPerformanceColor = (performance: number) => {
        if (performance >= 90) return 'text-green-600';
        if (performance >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPerformanceBadge = (status: string) => {
        switch (status) {
            case 'excellent':
                return 'bg-green-100 text-green-800';
            case 'good':
                return 'bg-yellow-100 text-yellow-800';
            case 'needs_improvement':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'deal_closed':
                return <DollarSign className="h-4 w-4 text-green-600" />;
            case 'new_lead':
                return <Users className="h-4 w-4 text-blue-600" />;
            case 'meeting_scheduled':
                return <Calendar className="h-4 w-4 text-purple-600" />;
            case 'follow_up':
                return <Activity className="h-4 w-4 text-orange-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!salesData) {
        return <div>Error loading dashboard data</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6" />
                    <h1 className="text-2xl font-bold">Sales Manager Dashboard</h1>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Deal
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="team">Team Performance</TabsTrigger>
                    <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${salesData.totalRevenue.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Target: ${salesData.monthlyTarget.toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{salesData.activeClients}</div>
                                <p className="text-xs text-muted-foreground">
                                    +{salesData.newLeads} new leads this month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{salesData.conversionRate}%</div>
                                <p className="text-xs text-muted-foreground">
                                    +2.1% from last month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${salesData.avgDealSize.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {salesData.closedDeals} deals closed
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pipeline Overview */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pipeline Value</CardTitle>
                                <CardDescription>Total value of deals in pipeline</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    ${salesData.pipelineValue.toLocaleString()}
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Progress to Target</span>
                                        <span>{Math.round((salesData.totalRevenue / salesData.monthlyTarget) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${(salesData.totalRevenue / salesData.monthlyTarget) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Common tasks and shortcuts</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full justify-start" variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add New Lead
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule Meeting
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Reports
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="team" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Performance</CardTitle>
                            <CardDescription>Individual performance metrics for your sales team</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {teamMembers.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                <Users className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{member.name}</h3>
                                                <p className="text-sm text-gray-500">{member.role}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center space-x-2">
                                                <span className={`font-semibold ${getPerformanceColor(member.performance)}`}>
                                                    {member.performance}%
                                                </span>
                                                <Badge className={getPerformanceBadge(member.status)}>
                                                    {member.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                ${member.achieved.toLocaleString()} / ${member.target.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pipeline" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Pipeline</CardTitle>
                            <CardDescription>Deals in different stages of the sales process</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Pipeline visualization coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest updates from your sales team</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                        {getActivityIcon(activity.type)}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{activity.description}</p>
                                            {activity.value && (
                                                <p className="text-sm text-green-600 font-semibold">
                                                    +${activity.value.toLocaleString()}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SalesManagerDashboard;


