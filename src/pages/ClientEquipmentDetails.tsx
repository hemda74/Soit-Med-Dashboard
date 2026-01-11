import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Users,
    Wrench,
    Calendar,
    FileText,
    Phone,
    Mail,
    MapPin,
    Eye,
    Edit,
    MoreVertical,
    CheckCircle,
    Clock,
    XCircle,
    Activity,
    RefreshCw
} from 'lucide-react';
import type {
    CustomerDTO,
    EquipmentDTO,
    MaintenanceVisitDTO,
    MaintenanceContractDTO
} from '@/services/maintenance/comprehensiveMaintenanceApi';
import {
    comprehensiveMaintenanceApi,
    VisitStatus,
    ContractStatus,
    ComprehensiveMaintenanceApi
} from '@/services/maintenance/comprehensiveMaintenanceApi';

const ClientEquipmentDetails: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();

    const [customer, setCustomer] = useState<CustomerDTO | null>(null);
    const [customerEquipment, setCustomerEquipment] = useState<EquipmentDTO[]>([]);
    const [customerVisits, setCustomerVisits] = useState<MaintenanceVisitDTO[]>([]);
    const [customerContracts, setCustomerContracts] = useState<MaintenanceContractDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('equipment');

    useEffect(() => {
        if (customerId) {
            loadCustomerData();
        }
    }, [customerId]);

    const loadCustomerData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log(`Searching for customer with ID: "${customerId}"`);

            // First try to search for the specific customer
            let foundCustomer = null;
            let allCustomers: any[] = [];

            try {
                // Try to search by customer ID or partial ID
                const customersResult = await comprehensiveMaintenanceApi.searchCustomers({
                    searchTerm: customerId,
                    page: 1,
                    pageSize: 100
                });
                allCustomers = customersResult.data;
                foundCustomer = customersResult.data.find(c => c.id === customerId);
                console.log(`Search results for "${customerId}":`, customersResult.data.length, 'customers found');
                console.log('Available customer IDs:', customersResult.data.map(c => c.id));
            } catch (searchError) {
                console.log('Search failed, trying broader search...', searchError);
            }

            // If not found, try a broader search
            if (!foundCustomer) {
                try {
                    const allCustomersResult = await comprehensiveMaintenanceApi.searchCustomers({
                        page: 1,
                        pageSize: 200 // Load more customers
                    });
                    allCustomers = allCustomersResult.data;
                    foundCustomer = allCustomersResult.data.find(c => c.id === customerId);
                    console.log(`Broad search results:`, allCustomersResult.data.length, 'customers found');
                    console.log('Available customer IDs in broad search:', allCustomersResult.data.map(c => c.id));
                } catch (broadSearchError) {
                    console.log('Broad search failed too', broadSearchError);
                }
            }

            // If still not found, try exact ID match (case-insensitive)
            if (!foundCustomer) {
                try {
                    const allCustomersResult = await comprehensiveMaintenanceApi.searchCustomers({
                        page: 1,
                        pageSize: 500 // Load even more customers
                    });
                    allCustomers = allCustomersResult.data;
                    foundCustomer = allCustomersResult.data.find(c =>
                        c.id.toLowerCase() === customerId!.toLowerCase() ||
                        c.id.includes(customerId!) ||
                        customerId!.includes(c.id)
                    );
                    console.log(`Final search results:`, allCustomersResult.data.length, 'customers found');
                    console.log('Looking for ID matches:', {
                        exact: customerId,
                        lowerCase: customerId!.toLowerCase(),
                        available: allCustomersResult.data.map(c => ({ id: c.id, lower: c.id.toLowerCase() }))
                    });
                } catch (finalSearchError) {
                    console.log('Final search attempt failed', finalSearchError);
                }
            }

            if (!foundCustomer) {
                console.error(`Customer with ID "${customerId}" not found after multiple search attempts`);
                console.log('Total customers searched:', allCustomers.length);
                if (allCustomers.length > 0) {
                    console.log('Sample customer IDs:', allCustomers.slice(0, 10).map(c => c.id));
                }
                // Show error message instead of redirecting immediately
                setError(`Customer with ID "${customerId}" was not found. We searched through ${allCustomers.length} customers. Please check the customer ID and try again.`);
                return;
            }

            console.log('Customer found:', foundCustomer);
            setCustomer(foundCustomer);
            setError(null); // Clear any previous errors

            // Load customer's equipment, visits, and contracts
            const [equipmentData, visitsData, contractsData] = await Promise.all([
                comprehensiveMaintenanceApi.getCustomerEquipment(customerId!, { page: 1, pageSize: 50 }),
                comprehensiveMaintenanceApi.getCustomerEquipmentVisits(customerId!),
                comprehensiveMaintenanceApi.getCustomerContracts(customerId!, { page: 1, pageSize: 50 })
            ]);

            setCustomerEquipment(equipmentData.data);
            setCustomerVisits(visitsData.visits);
            setCustomerContracts(contractsData.data);
        } catch (error) {
            console.error('Error loading customer data:', error);
            setError('Failed to load customer data. Please try again later.');
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                    </div>
                    <div className="space-x-4">
                        <Link to="/maintenance-dashboard-ui">
                            <Button className="mt-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={() => loadCustomerData()} className="mt-4">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <p className="text-gray-500">Customer not found</p>
                    <Link to="/maintenance-dashboard-ui">
                        <Button className="mt-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center space-x-4 mb-6">
                    <Link to="/maintenance-dashboard-ui">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                        <p className="text-gray-600">Client Equipment Details</p>
                    </div>
                </div>

                {/* Customer Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">Phone</span>
                            </div>
                            <p className="text-lg">{customer.phone}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">Email</span>
                            </div>
                            <p className="text-lg">{customer.email || 'Not provided'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">Address</span>
                            </div>
                            <p className="text-lg">{customer.address || 'Not provided'}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Total Equipment</p>
                                    <p className="text-3xl font-bold text-gray-900">{customerEquipment.length}</p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                    <Wrench className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Total Visits</p>
                                    <p className="text-3xl font-bold text-gray-900">{customerVisits.length}</p>
                                </div>
                                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                    <Calendar className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Active Contracts</p>
                                    <p className="text-3xl font-bold text-gray-900">{customerContracts.length}</p>
                                </div>
                                <div className="p-3 rounded-full bg-green-100 text-green-600">
                                    <FileText className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                                    <p className="text-lg font-bold">{customer.isActive ? 'Active' : 'Inactive'}</p>
                                </div>
                                <div className="p-3 rounded-full bg-gray-100 text-gray-600">
                                    <Users className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for Equipment, Visits, Contracts */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 bg-white p-1 rounded-lg shadow-sm">
                        <TabsTrigger value="equipment" className="flex items-center space-x-2">
                            <Wrench className="h-4 w-4" />
                            <span>Equipment ({customerEquipment.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="visits" className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Visits ({customerVisits.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="contracts" className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Contracts ({customerContracts.length})</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Equipment Tab */}
                    <TabsContent value="equipment">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Equipment List
                                    <Button>
                                        <Wrench className="h-4 w-4 mr-2" />
                                        Add Equipment
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Serial Number</TableHead>
                                            <TableHead>Model</TableHead>
                                            <TableHead>Manufacturer</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customerEquipment.map((equipment) => (
                                            <TableRow key={equipment.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    {equipment.serialNumber}
                                                </TableCell>
                                                <TableCell>{equipment.model}</TableCell>
                                                <TableCell>{equipment.manufacturer || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge className={getEquipmentStatusColor(equipment.status)}>
                                                        {equipment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{equipment.location || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
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

                    {/* Visits Tab */}
                    <TabsContent value="visits">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Maintenance Visits
                                    <Button>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Schedule Visit
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Equipment</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Engineer</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customerVisits.map((visit) => (
                                            <TableRow key={visit.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    {new Date(visit.visitDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {visit.equipmentSerialNumber}
                                                </TableCell>
                                                <TableCell>
                                                    {ComprehensiveMaintenanceApi.getVisitTypeDisplay(visit.visitType)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(visit.status)}
                                                        <span>{ComprehensiveMaintenanceApi.getVisitStatusDisplay(visit.status)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{visit.engineerName || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
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

                    {/* Contracts Tab */}
                    <TabsContent value="contracts">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Maintenance Contracts
                                    <Button>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Add Contract
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Contract Number</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>End Date</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customerContracts.map((contract) => (
                                            <TableRow key={contract.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    {contract.contractNumber}
                                                </TableCell>
                                                <TableCell>{contract.contractType || '-'}</TableCell>
                                                <TableCell>
                                                    {new Date(contract.startDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(contract.endDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    ${contract.contractValue.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    {getContractStatusBadge(contract.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
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
                </Tabs>
            </div>
        </div>
    );
};

export default ClientEquipmentDetails;
