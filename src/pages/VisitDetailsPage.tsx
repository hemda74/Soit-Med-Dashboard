import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { enhancedMaintenanceApi } from '@/services/maintenance/enhancedMaintenanceApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft,
    Calendar,
    User,
    Wrench,
    FileText,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

const VisitDetailsPage: React.FC = () => {
    const { customerId, visitId } = useParams<{ customerId: string; visitId: string }>();
    const navigate = useNavigate();

    // Fetch customer data to get the visit details
    const { data: customerData, isLoading } = useQuery({
        queryKey: ['customer-equipment-visits', customerId],
        queryFn: () => enhancedMaintenanceApi.getCustomerEquipmentVisits(customerId!, true),
        enabled: !!customerId,
    });

    const visit = customerData?.visits?.find(v => v.id === visitId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!visit) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold mb-2">Visit Not Found</h2>
                            <p className="text-muted-foreground mb-4">
                                The visit you're looking for doesn't exist or has been removed.
                            </p>
                            <Button onClick={() => navigate(-1)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Go Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode }> = {
            'Completed': { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
            'Pending': { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
            'Cancelled': { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
            'Scheduled': { variant: 'outline', icon: <Calendar className="h-3 w-3 mr-1" /> },
        };

        const config = statusConfig[status] || statusConfig['Pending'];
        return (
            <Badge variant={config.variant} className="flex items-center w-fit">
                {config.icon}
                {status}
            </Badge>
        );
    };

    const getOutcomeBadge = (outcome: string) => {
        const outcomeConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' }> = {
            'Completed': { variant: 'default' },
            'Cancelled': { variant: 'destructive' },
            'Pending': { variant: 'secondary' },
        };

        const config = outcomeConfig[outcome] || outcomeConfig['Pending'];
        return <Badge variant={config.variant}>{outcome}</Badge>;
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Visit Details</h1>
                        <p className="text-muted-foreground mt-1">
                            Visit ID: {visit.id}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(visit.status)}
                        <Badge variant="outline" className="text-xs">
                            {visit.source}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Visit Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Visit Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Visit Date</Label>
                            <p className="font-medium">
                                {visit.visitDate
                                    ? format(new Date(visit.visitDate), 'PPP')
                                    : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Scheduled Date</Label>
                            <p className="font-medium">
                                {visit.scheduledDate
                                    ? format(new Date(visit.scheduledDate), 'PPP')
                                    : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Status</Label>
                            <div className="mt-1">
                                {getStatusBadge(visit.status)}
                            </div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Outcome</Label>
                            <div className="mt-1">
                                {getOutcomeBadge(visit.outcome)}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Engineer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Engineer Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label className="text-muted-foreground">Engineer Name</Label>
                            <p className="font-medium">{visit.engineerName || 'Not assigned'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Visit Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Visit Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {visit.report && (
                            <div>
                                <Label className="text-muted-foreground">Report / Issue Description</Label>
                                <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                                    {visit.report}
                                </p>
                            </div>
                        )}
                        {visit.actionsTaken && (
                            <div>
                                <Label className="text-muted-foreground">Actions Taken</Label>
                                <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                                    {visit.actionsTaken}
                                </p>
                            </div>
                        )}
                        {!visit.report && !visit.actionsTaken && (
                            <p className="text-muted-foreground text-sm">No detailed report available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Parts Used */}
                {visit.partsUsed && Array.isArray(visit.partsUsed) && visit.partsUsed.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wrench className="h-5 w-5" />
                                Parts Used
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {visit.partsUsed.map((part: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                        <div>
                                            <p className="font-medium">{part.partName || part.name || 'Unknown Part'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Quantity: {part.quantity || 1}
                                            </p>
                                        </div>
                                        {part.cost && (
                                            <p className="font-medium">${part.cost.toFixed(2)}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Financial Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Financial Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label className="text-muted-foreground">Service Fee</Label>
                            <p className="font-bold text-2xl text-primary mt-1">
                                {visit.serviceFee
                                    ? `$${visit.serviceFee.toFixed(2)}`
                                    : 'N/A'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Customer Information */}
                {customerData?.customer && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Customer Name</Label>
                                <p className="font-medium">{customerData.customer.name}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Phone</Label>
                                <p className="font-medium">{customerData.customer.phone || 'N/A'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <Label className="text-muted-foreground">Address</Label>
                                <p className="font-medium">{customerData.customer.address || 'N/A'}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default VisitDetailsPage;
