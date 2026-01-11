import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Search,
    Plus,
    Edit,
    Calendar,
    Users,
    Wrench,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import type {
    CustomerDTO,
    EquipmentDTO,
    MaintenanceVisitDTO,
    MaintenanceContractDTO,
    MaintenanceDashboardStats
} from '@/services/maintenance/comprehensiveMaintenanceApi';
import {
    comprehensiveMaintenanceApi,
    VisitStatus,
    ContractStatus,
    ComprehensiveMaintenanceApi
} from '@/services/maintenance/comprehensiveMaintenanceApi';

const ComprehensiveMaintenanceDashboard: React.FC = () => {
    // State management
    const [dashboardStats, setDashboardStats] = useState<MaintenanceDashboardStats | null>(null);
    const [customers, setCustomers] = useState<CustomerDTO[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(null);
    const [customerEquipment, setCustomerEquipment] = useState<EquipmentDTO[]>([]);
    const [customerVisits, setCustomerVisits] = useState<MaintenanceVisitDTO[]>([]);
    const [customerContracts, setCustomerContracts] = useState<MaintenanceContractDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Form states
    const [showCustomerDialog, setShowCustomerDialog] = useState(false);
    const [showEquipmentDialog, setShowEquipmentDialog] = useState(false);
    const [showVisitDialog, setShowVisitDialog] = useState(false);
    const [showContractDialog, setShowContractDialog] = useState(false);

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

    const loadCustomerData = async (customer: CustomerDTO) => {
        try {
            setSelectedCustomer(customer);
            const [equipmentData, visitsData, contractsData] = await Promise.all([
                comprehensiveMaintenanceApi.getCustomerEquipment(customer.id, { page: 1, pageSize: 50 }),
                comprehensiveMaintenanceApi.getCustomerEquipmentVisits(customer.id),
                comprehensiveMaintenanceApi.getCustomerContracts(customer.id, { page: 1, pageSize: 50 })
            ]);

            setCustomerEquipment(equipmentData.data);
            setCustomerVisits(visitsData.visits);
            setCustomerContracts(contractsData.data);
        } catch (error) {
            console.error('Error loading customer data:', error);
        }
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

    const getStatusIcon = (status: number) => {
        switch (status) {
            case VisitStatus.Completed:
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case VisitStatus.Scheduled:
                return <Clock className="h-4 w-4 text-blue-500" />;
            case VisitStatus.InProgress:
                return <AlertCircle className="h-4 w-4 text-orange-500" />;
            case VisitStatus.Cancelled:
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getContractStatusBadge = (status: ContractStatus) => {
        const variants: Record<ContractStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            [ContractStatus.Active]: 'default',
            [ContractStatus.Draft]: 'secondary',
            [ContractStatus.Expired]: 'destructive',
            [ContractStatus.Terminated]: 'destructive',
            [ContractStatus.Suspended]: 'outline'
        };

        return (
            <Badge variant={variants[status]}>
                {ComprehensiveMaintenanceApi.getContractStatusDisplay(status)}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Comprehensive Maintenance Dashboard</h1>
                <div className="flex space-x-2">
                    <Button onClick={loadDashboardData} variant="outline">
                        Refresh
                    </Button>
                    <Button onClick={() => setShowCustomerDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Customer
                    </Button>
                </div>
            </div>

            {/* Dashboard Statistics */}
            {dashboardStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.totalCustomers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.totalEquipment}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Visits</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.pendingVisits}</div>
                            <p className="text-xs text-muted-foreground">
                                {dashboardStats.monthlyVisits} this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.visitCompletionRate.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">
                                {dashboardStats.completedVisits} completed
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="visits">Visits</TabsTrigger>
                    <TabsTrigger value="contracts">Contracts</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Activity feed will be implemented here
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Customers</CardTitle>
                                <div className="flex space-x-2">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search customers..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 w-64"
                                        />
                                    </div>
                                    <Button onClick={handleSearchCustomers}>Search</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell className="font-medium">{customer.name}</TableCell>
                                            <TableCell>{customer.phone}</TableCell>
                                            <TableCell>{customer.email || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                                                    {customer.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => loadCustomerData(customer)}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
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

                <TabsContent value="visits" className="space-y-4">
                    {selectedCustomer ? (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Visits for {selectedCustomer.name}</CardTitle>
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
                                                <TableRow key={visit.id}>
                                                    <TableCell>{new Date(visit.visitDate).toLocaleDateString()}</TableCell>
                                                    <TableCell>{visit.equipmentSerialNumber || '-'}</TableCell>
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
                                                        <Button variant="outline" size="sm">
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-8">
                                Please select a customer to view visits
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="contracts" className="space-y-4">
                    {selectedCustomer ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Contracts for {selectedCustomer.name}</CardTitle>
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
                                            <TableRow key={contract.id}>
                                                <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                                                <TableCell>{contract.contractType || '-'}</TableCell>
                                                <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                                                <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                                                <TableCell>${contract.contractValue.toFixed(2)}</TableCell>
                                                <TableCell>{getContractStatusBadge(contract.status)}</TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm">
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-8">
                                Please select a customer to view contracts
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Customer Details Dialog */}
            {selectedCustomer && (
                <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>{selectedCustomer.name} - Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Phone</label>
                                    <p>{selectedCustomer.phone}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <p>{selectedCustomer.email || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Address</label>
                                    <p>{selectedCustomer.address || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <p>{selectedCustomer.isActive ? 'Active' : 'Inactive'}</p>
                                </div>
                            </div>

                            <Tabs>
                                <TabsList>
                                    <TabsTrigger value="equipment">Equipment ({customerEquipment.length})</TabsTrigger>
                                    <TabsTrigger value="visits">Visits ({customerVisits.length})</TabsTrigger>
                                    <TabsTrigger value="contracts">Contracts ({customerContracts.length})</TabsTrigger>
                                </TabsList>

                                <TabsContent value="equipment">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Serial Number</TableHead>
                                                <TableHead>Model</TableHead>
                                                <TableHead>Manufacturer</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Location</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customerEquipment.map((equipment) => (
                                                <TableRow key={equipment.id}>
                                                    <TableCell>{equipment.serialNumber}</TableCell>
                                                    <TableCell>{equipment.model}</TableCell>
                                                    <TableCell>{equipment.manufacturer || '-'}</TableCell>
                                                    <TableCell>{equipment.status}</TableCell>
                                                    <TableCell>{equipment.location || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TabsContent>

                                <TabsContent value="visits">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Engineer</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customerVisits.map((visit) => (
                                                <TableRow key={visit.id}>
                                                    <TableCell>{new Date(visit.visitDate).toLocaleDateString()}</TableCell>
                                                    <TableCell>{ComprehensiveMaintenanceApi.getVisitTypeDisplay(visit.visitType)}</TableCell>
                                                    <TableCell>{ComprehensiveMaintenanceApi.getVisitStatusDisplay(visit.status)}</TableCell>
                                                    <TableCell>{visit.engineerName || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TabsContent>

                                <TabsContent value="contracts">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Contract Number</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Value</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customerContracts.map((contract) => (
                                                <TableRow key={contract.id}>
                                                    <TableCell>{contract.contractNumber}</TableCell>
                                                    <TableCell>{contract.contractType || '-'}</TableCell>
                                                    <TableCell>${contract.contractValue.toFixed(2)}</TableCell>
                                                    <TableCell>{getContractStatusBadge(contract.status)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default ComprehensiveMaintenanceDashboard;
