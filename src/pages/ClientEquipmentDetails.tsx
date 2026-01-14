import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Wrench,
    Calendar,
    Phone,
    Mail,
    MapPin,
    Activity,
    RefreshCw,
    CheckCircle,
    Clock,
    XCircle,
    Eye
} from 'lucide-react';
import { enhancedMaintenanceApi } from '@/services/maintenance/enhancedMaintenanceApi';
import VisitDetailsSlideOver from '@/components/maintenance/VisitDetailsSlideOver';
import type {
    EnhancedCustomer,
    EnhancedEquipment,
    EnhancedVisit
} from '@/services/maintenance/enhancedMaintenanceApi';

const ClientEquipmentDetails: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();

    const [customer, setCustomer] = useState<EnhancedCustomer | null>(null);
    const [customerEquipment, setCustomerEquipment] = useState<EnhancedEquipment[]>([]);
    const [customerVisits, setCustomerVisits] = useState<EnhancedVisit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('equipment');
    const [selectedEquipment, setSelectedEquipment] = useState<EnhancedEquipment | null>(null);
    const [selectedVisit, setSelectedVisit] = useState<EnhancedVisit | null>(null);
    const [showVisitSlideOver, setShowVisitSlideOver] = useState(false);

    useEffect(() => {
        if (customerId) {
            loadCustomerData();
        }
    }, [customerId]);

    const loadCustomerData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log(`Loading data for customer ID: "${customerId}"`);

            const data = await enhancedMaintenanceApi.getCustomerEquipmentVisits(customerId!, true);

            if (!data.customer) {
                setError(`Customer with ID "${customerId}" was not found.`);
                setLoading(false);
                return;
            }

            console.log('Customer data loaded:', data);
            setCustomer(data.customer);
            setCustomerEquipment(data.equipment || []);
            setCustomerVisits(data.visits || []);
            setError(null);
        } catch (error) {
            console.error('Error loading customer data:', error);
            setError('Failed to load customer data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            'Completed': 'bg-green-100 text-green-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'InProgress': 'bg-blue-100 text-blue-800',
            'Cancelled': 'bg-red-100 text-red-800',
        };
        return (
            <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
                {status}
            </Badge>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'Pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'InProgress':
                return <Activity className="w-4 h-4 text-blue-600" />;
            case 'Cancelled':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    // Fetch equipment visits when equipment is selected
    const { data: equipmentData } = useQuery({
        queryKey: ['equipment-visits', selectedEquipment?.id],
        queryFn: () => enhancedMaintenanceApi.getEquipmentVisits(selectedEquipment!.id, true),
        enabled: !!selectedEquipment,
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Error</h2>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <div className="flex gap-2 justify-center">
                                <Button onClick={loadCustomerData}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Retry
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link to="/maintenance/client-equipment-visits">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Customers
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!customer) {
        return null;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/maintenance/client-equipment-visits">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Customer Details</h1>
                </div>
                <Button onClick={loadCustomerData} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Customer Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        {customer.name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{customer.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{customer.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{customer.address || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Badge variant={customer.source === 'New' ? 'default' : 'secondary'}>
                            {customer.source} Database
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="equipment">
                        <Wrench className="w-4 h-4 mr-2" />
                        Equipment ({customerEquipment.length})
                    </TabsTrigger>
                    <TabsTrigger value="visits">
                        <Calendar className="w-4 h-4 mr-2" />
                        Visits ({customerVisits.length})
                    </TabsTrigger>
                </TabsList>

                {/* Equipment Tab */}
                <TabsContent value="equipment">
                    <Card>
                        <CardHeader>
                            <CardTitle>Equipment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {customerEquipment.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No equipment found for this customer.
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Model</TableHead>
                                            <TableHead>Serial Number</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Source</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customerEquipment.map((equipment) => (
                                            <TableRow
                                                key={equipment.id}
                                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => {
                                                    setSelectedEquipment(equipment);
                                                    setActiveTab('visits');
                                                }}
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Eye className="w-4 h-4 text-primary" />
                                                        {equipment.model}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{equipment.serialNumber || 'N/A'}</TableCell>
                                                <TableCell>{getStatusBadge(equipment.status)}</TableCell>
                                                <TableCell>{equipment.location || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={equipment.source === 'New' ? 'default' : 'secondary'}>
                                                        {equipment.source}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Visits Tab */}
                <TabsContent value="visits">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {selectedEquipment
                                    ? `Visits for ${selectedEquipment.model} (${selectedEquipment.serialNumber})`
                                    : 'All Customer Visits'
                                }
                            </CardTitle>
                            {selectedEquipment && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedEquipment(null)}
                                    className="mt-2"
                                >
                                    Show All Visits
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {(selectedEquipment ? equipmentData?.visits : customerVisits)?.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    {selectedEquipment
                                        ? 'No visits found for this equipment.'
                                        : 'No visits found for this customer.'
                                    }
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Engineer</TableHead>
                                            <TableHead>Report</TableHead>
                                            <TableHead>Actions Taken</TableHead>
                                            <TableHead>Service Fee</TableHead>
                                            <TableHead>Source</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(selectedEquipment ? equipmentData?.visits : customerVisits)?.map((visit) => (
                                            <TableRow
                                                key={visit.id}
                                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => {
                                                    setSelectedVisit(visit);
                                                    setShowVisitSlideOver(true);
                                                }}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                                        {new Date(visit.visitDate).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(visit.status)}
                                                        {getStatusBadge(visit.status)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{visit.engineerName || 'N/A'}</TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {visit.report || 'N/A'}
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {visit.actionsTaken || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {visit.serviceFee ? `$${visit.serviceFee.toFixed(2)}` : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={visit.source === 'New' ? 'default' : 'secondary'}>
                                                        {visit.source}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Visit Details Slide Over */}
            <VisitDetailsSlideOver
                visit={selectedVisit}
                isOpen={showVisitSlideOver}
                onClose={() => {
                    setShowVisitSlideOver(false);
                    setSelectedVisit(null);
                }}
                isRTL={false}
            />
        </div>
    );
};

export default ClientEquipmentDetails;
