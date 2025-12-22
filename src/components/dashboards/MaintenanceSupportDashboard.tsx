import React from 'react';
import { Wrench, Archive, CheckCircle2, Clock, FileText, AlertCircle, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePerformance } from '@/hooks/usePerformance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MaintenanceSupportDashboard: React.FC = () => {
    usePerformance('MaintenanceSupportDashboard');
    const { t } = useTranslation();

    // Static data for demonstration
    const requests = [
        {
            id: 1,
            title: 'Equipment Maintenance Request',
            description: 'MRI machine requires routine maintenance',
            status: 'Pending',
            priority: 'High',
            createdAt: '2024-01-15T10:30:00',
            equipment: 'MRI Scanner - Model XYZ',
            location: 'Building A, Room 101'
        },
        {
            id: 2,
            title: 'Repair Request',
            description: 'CT scanner showing error code E-123',
            status: 'In Progress',
            priority: 'Urgent',
            createdAt: '2024-01-14T14:20:00',
            equipment: 'CT Scanner - Model ABC',
            location: 'Building B, Room 205'
        },
        {
            id: 3,
            title: 'Preventive Maintenance',
            description: 'Quarterly maintenance for ultrasound equipment',
            status: 'Pending',
            priority: 'Medium',
            createdAt: '2024-01-13T09:15:00',
            equipment: 'Ultrasound Machine - Model DEF',
            location: 'Building C, Room 310'
        }
    ];

    const archivedRequests = [
        {
            id: 101,
            title: 'Completed Maintenance',
            description: 'X-ray machine maintenance completed successfully',
            status: 'Completed',
            priority: 'Medium',
            completedAt: '2024-01-10T16:45:00',
            equipment: 'X-ray Machine - Model GHI',
            location: 'Building A, Room 102'
        },
        {
            id: 102,
            title: 'Repair Completed',
            description: 'Ventilator repair completed and tested',
            status: 'Completed',
            priority: 'High',
            completedAt: '2024-01-08T11:30:00',
            equipment: 'Ventilator - Model JKL',
            location: 'Building D, Room 401'
        }
    ];

    const completedRequests = [
        {
            id: 201,
            title: 'Equipment Calibration',
            description: 'Blood analyzer calibration completed',
            status: 'Completed',
            priority: 'Low',
            completedAt: '2024-01-12T13:20:00',
            equipment: 'Blood Analyzer - Model MNO',
            location: 'Building E, Room 501',
            Technician: 'John Doe'
        },
        {
            id: 202,
            title: 'System Update',
            description: 'Lab information system update completed',
            status: 'Completed',
            priority: 'Medium',
            completedAt: '2024-01-11T10:00:00',
            equipment: 'LIS Server - Model PQR',
            location: 'IT Department',
            Technician: 'Jane Smith'
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
            case 'In Progress':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">In Progress</Badge>;
            case 'Completed':
                return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'Urgent':
                return <Badge variant="destructive">Urgent</Badge>;
            case 'High':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">High</Badge>;
            case 'Medium':
                return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Medium</Badge>;
            case 'Low':
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Low</Badge>;
            default:
                return <Badge variant="outline">{priority}</Badge>;
        }
    };

    return (
        <>
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Maintenance Support Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">
                    Manage maintenance requests and track equipment status
                </p>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fadeIn mb-8">
                <Card className="border-2 border-border shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Active Requests</p>
                                <p className="text-3xl font-bold text-foreground">{requests.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Wrench className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-border shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Archived Requests</p>
                                <p className="text-3xl font-bold text-foreground">{archivedRequests.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Archive className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-border shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                                <p className="text-3xl font-bold text-foreground">{completedRequests.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-border shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                                <p className="text-3xl font-bold text-foreground">
                                    {requests.filter(r => r.status === 'Pending').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="requests" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="requests">Active Requests</TabsTrigger>
                    <TabsTrigger value="archived">Archived Requests</TabsTrigger>
                    <TabsTrigger value="completed">Completed Requests</TabsTrigger>
                </TabsList>

                {/* Active Requests Tab */}
                <TabsContent value="requests" className="space-y-4">
                    <Card className="border-2 border-border shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-primary" />
                                Active Maintenance Requests
                            </CardTitle>
                            <CardDescription>
                                View and manage current maintenance requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {requests.length > 0 ? (
                                <div className="space-y-4">
                                    {requests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-foreground">
                                                            {request.title}
                                                        </h3>
                                                        {getStatusBadge(request.status)}
                                                        {getPriorityBadge(request.priority)}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {request.description}
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground">Equipment: </span>
                                                            <span className="font-medium">{request.equipment}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Location: </span>
                                                            <span className="font-medium">{request.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-border">
                                                <span className="text-xs text-muted-foreground">
                                                    Created: {new Date(request.createdAt).toLocaleDateString()}
                                                </span>
                                                <div className="flex gap-2">
                                                    <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No active requests</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Archived Requests Tab */}
                <TabsContent value="archived" className="space-y-4">
                    <Card className="border-2 border-border shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Archive className="w-5 h-5 text-primary" />
                                Archived Requests
                            </CardTitle>
                            <CardDescription>
                                View archived maintenance requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {archivedRequests.length > 0 ? (
                                <div className="space-y-4">
                                    {archivedRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors opacity-75"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-foreground">
                                                            {request.title}
                                                        </h3>
                                                        {getStatusBadge(request.status)}
                                                        {getPriorityBadge(request.priority)}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {request.description}
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground">Equipment: </span>
                                                            <span className="font-medium">{request.equipment}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Location: </span>
                                                            <span className="font-medium">{request.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-border">
                                                <span className="text-xs text-muted-foreground">
                                                    Completed: {new Date(request.completedAt).toLocaleDateString()}
                                                </span>
                                                <button className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No archived requests</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Completed Requests Tab */}
                <TabsContent value="completed" className="space-y-4">
                    <Card className="border-2 border-border shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                Completed Requests
                            </CardTitle>
                            <CardDescription>
                                View completed maintenance requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {completedRequests.length > 0 ? (
                                <div className="space-y-4">
                                    {completedRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors bg-green-50/50 dark:bg-green-950/20"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-foreground">
                                                            {request.title}
                                                        </h3>
                                                        {getStatusBadge(request.status)}
                                                        {getPriorityBadge(request.priority)}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {request.description}
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                                                        <div>
                                                            <span className="text-muted-foreground">Equipment: </span>
                                                            <span className="font-medium">{request.equipment}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Location: </span>
                                                            <span className="font-medium">{request.location}</span>
                                                        </div>
                                                    </div>
                                                    {request.Technician && (
                                                        <div className="text-sm">
                                                            <span className="text-muted-foreground">Technician: </span>
                                                            <span className="font-medium">{request.Technician}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-border">
                                                <span className="text-xs text-muted-foreground">
                                                    Completed: {new Date(request.completedAt).toLocaleDateString()}
                                                </span>
                                                <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No completed requests</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    );
};

export default MaintenanceSupportDashboard;

