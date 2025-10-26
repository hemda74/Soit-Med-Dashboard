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
    Phone,
    Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SalesmanDashboardProps { }

interface SalesData {
    monthlyTarget: number;
    achieved: number;
    activeClients: number;
    newLeads: number;
    conversionRate: number;
    avgDealSize: number;
    pipelineValue: number;
    closedDeals: number;
    callsMade: number;
    emailsSent: number;
}

interface UpcomingTask {
    id: string;
    type: 'call' | 'meeting' | 'follow_up' | 'demo';
    title: string;
    client: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
}

interface RecentActivity {
    id: string;
    type: 'deal_closed' | 'new_lead' | 'meeting_completed' | 'call_made';
    description: string;
    timestamp: string;
    value?: number;
}

const SalesmanDashboard: React.FC<SalesmanDashboardProps> = () => {
    const [salesData, setSalesData] = useState<SalesData | null>(null);
    const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data - replace with actual API calls
        const mockSalesData: SalesData = {
            monthlyTarget: 150000,
            achieved: 120000,
            activeClients: 12,
            newLeads: 8,
            conversionRate: 15.2,
            avgDealSize: 15000,
            pipelineValue: 180000,
            closedDeals: 5,
            callsMade: 45,
            emailsSent: 78
        };

        const mockUpcomingTasks: UpcomingTask[] = [
            {
                id: '1',
                type: 'call',
                title: 'Follow-up call with Acme Corp',
                client: 'Acme Corp',
                time: '10:00 AM',
                priority: 'high'
            },
            {
                id: '2',
                type: 'meeting',
                title: 'Product demo with Tech Solutions',
                client: 'Tech Solutions',
                time: '2:00 PM',
                priority: 'high'
            },
            {
                id: '3',
                type: 'follow_up',
                title: 'Send proposal to Global Industries',
                client: 'Global Industries',
                time: '4:00 PM',
                priority: 'medium'
            },
            {
                id: '4',
                type: 'demo',
                title: 'Demo call with StartupXYZ',
                client: 'StartupXYZ',
                time: 'Tomorrow 11:00 AM',
                priority: 'medium'
            }
        ];

        const mockRecentActivity: RecentActivity[] = [
            {
                id: '1',
                type: 'deal_closed',
                description: 'Closed deal with Acme Corp',
                timestamp: '2 hours ago',
                value: 25000
            },
            {
                id: '2',
                type: 'call_made',
                description: 'Called Tech Solutions - interested in demo',
                timestamp: '4 hours ago'
            },
            {
                id: '3',
                type: 'meeting_completed',
                description: 'Completed demo with Global Industries',
                timestamp: '1 day ago'
            },
            {
                id: '4',
                type: 'new_lead',
                description: 'New lead from StartupXYZ',
                timestamp: '2 days ago'
            }
        ];

        setTimeout(() => {
            setSalesData(mockSalesData);
            setUpcomingTasks(mockUpcomingTasks);
            setRecentActivity(mockRecentActivity);
            setLoading(false);
        }, 1000);
    }, []);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTaskIcon = (type: string) => {
        switch (type) {
            case 'call':
                return <Phone className="h-4 w-4 text-blue-600" />;
            case 'meeting':
                return <Calendar className="h-4 w-4 text-purple-600" />;
            case 'follow_up':
                return <Activity className="h-4 w-4 text-orange-600" />;
            case 'demo':
                return <Eye className="h-4 w-4 text-green-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-600" />;
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'deal_closed':
                return <DollarSign className="h-4 w-4 text-green-600" />;
            case 'new_lead':
                return <Users className="h-4 w-4 text-blue-600" />;
            case 'meeting_completed':
                return <Calendar className="h-4 w-4 text-purple-600" />;
            case 'call_made':
                return <Phone className="h-4 w-4 text-orange-600" />;
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

    const progressPercentage = Math.round((salesData.achieved / salesData.monthlyTarget) * 100);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6" />
                    <h1 className="text-2xl font-bold">My Sales Dashboard</h1>
                </div>
                <div className="flex space-x-2">
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lead
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">Today's Tasks</TabsTrigger>
                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${salesData.achieved.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    of ${salesData.monthlyTarget.toLocaleString()}
                                </p>
                                <div className="mt-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Progress</span>
                                        <span>{progressPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
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
                                    +{salesData.newLeads} new leads
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
                                    {salesData.closedDeals} deals closed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${salesData.avgDealSize.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Pipeline: ${salesData.pipelineValue.toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Activity Summary */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Today's Activity</CardTitle>
                                <CardDescription>Your activity summary for today</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm">Calls Made</span>
                                    </div>
                                    <span className="font-semibold">{salesData.callsMade}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">Emails Sent</span>
                                    </div>
                                    <span className="font-semibold">{salesData.emailsSent}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm">Meetings Scheduled</span>
                                    </div>
                                    <span className="font-semibold">{upcomingTasks.filter(t => t.type === 'meeting').length}</span>
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
                                    <Phone className="h-4 w-4 mr-2" />
                                    Log Call
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Tasks</CardTitle>
                            <CardDescription>Your scheduled activities and follow-ups</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingTasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            {getTaskIcon(task.type)}
                                            <div>
                                                <h3 className="font-semibold">{task.title}</h3>
                                                <p className="text-sm text-gray-500">{task.client}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium">{task.time}</span>
                                                <Badge className={getPriorityColor(task.priority)}>
                                                    {task.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest sales activities and updates</CardDescription>
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

                <TabsContent value="performance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                            <CardDescription>Your sales performance and trends</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Performance charts coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SalesmanDashboard;


