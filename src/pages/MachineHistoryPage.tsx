import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Search,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Wrench,
    User,
    FileText,
    DollarSign,
    Package,
    ChevronLeft,
    Download,
    History
} from 'lucide-react';
import { enhancedMaintenanceApi } from '@/services/maintenance/enhancedMaintenanceApi';
import type { MachineHistory } from '@/services/maintenance/enhancedMaintenanceApi';
import toast from 'react-hot-toast';

const MachineHistoryPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [machineId, setMachineId] = useState('');
    const [machineHistory, setMachineHistory] = useState<MachineHistory | null>(null);

    const handleSearch = async () => {
        if (!machineId) {
            toast.error('Please enter a machine ID');
            return;
        }

        setLoading(true);
        try {
            const history = await enhancedMaintenanceApi.getMachineHistory(parseInt(machineId));
            if (history) {
                setMachineHistory(history);
                toast.success('Machine history loaded');
            } else {
                toast.error('Machine not found');
                setMachineHistory(null);
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to load machine history');
            setMachineHistory(null);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-500';
            case 'pending':
                return 'bg-yellow-500';
            case 'in progress':
                return 'bg-blue-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getVisitTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'preventive maintenance':
                return 'bg-blue-500';
            case 'corrective maintenance':
                return 'bg-orange-500';
            case 'installation':
                return 'bg-green-500';
            case 'emergency':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const exportToCSV = () => {
        if (!machineHistory || machineHistory.visitHistory.length === 0) {
            toast.error('No data to export');
            return;
        }

        const headers = ['Visit ID', 'Date', 'Type', 'Technician', 'Status', 'Description', 'Parts Used', 'Value'];
        const rows = machineHistory.visitHistory.map(visit => [
            visit.visitId,
            visit.visitDate ? new Date(visit.visitDate).toLocaleDateString() : 'N/A',
            visit.visitType,
            visit.technicianName,
            visit.status,
            visit.description || '',
            visit.partsUsed || '',
            visit.visitValue || 0
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `machine_${machineHistory.machineId}_history_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Exported to CSV');
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Machine History</h1>
                    <p className="text-muted-foreground">View complete maintenance history for equipment</p>
                </div>
                <Button variant="outline" onClick={() => window.history.back()}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Search Machine
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="machineId">Machine ID (OOI_ID)</Label>
                            <Input
                                id="machineId"
                                type="number"
                                placeholder="Enter machine ID from legacy system"
                                value={machineId}
                                onChange={(e) => setMachineId(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleSearch} disabled={loading}>
                                <Search className="w-4 h-4 mr-2" />
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Machine Details */}
            {machineHistory && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Machine Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wrench className="w-5 h-5" />
                                    Machine Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Machine ID</p>
                                        <p className="font-semibold">#{machineHistory.machineId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Serial Number</p>
                                        <p className="font-mono font-semibold">{machineHistory.serialNumber}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Model</p>
                                        <p className="font-semibold">{machineHistory.model}</p>
                                    </div>
                                    {machineHistory.installationDate && (
                                        <div className="col-span-2">
                                            <p className="text-sm text-muted-foreground">Installation Date</p>
                                            <p className="font-semibold flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(machineHistory.installationDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Total Visits</p>
                                        <p className="font-semibold text-2xl">{machineHistory.totalVisits}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Current Client */}
                        {machineHistory.currentClient && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Current Client
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Client ID</p>
                                        <p className="font-semibold">#{machineHistory.currentClient.clientId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-semibold">{machineHistory.currentClient.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Address</p>
                                        <p className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                                            {machineHistory.currentClient.address}
                                        </p>
                                    </div>
                                    {machineHistory.currentClient.phone && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-muted-foreground" />
                                                {machineHistory.currentClient.phone}
                                            </p>
                                        </div>
                                    )}
                                    {machineHistory.currentClient.email && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                {machineHistory.currentClient.email}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Visit History */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <History className="w-5 h-5" />
                                    Visit History ({machineHistory.visitHistory.length} visits)
                                </CardTitle>
                                {machineHistory.visitHistory.length > 0 && (
                                    <Button variant="outline" size="sm" onClick={exportToCSV}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {machineHistory.visitHistory.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No visit history found for this machine</p>
                                </div>
                            ) : (
                                <div className="h-[600px] overflow-y-auto pr-4">
                                    <div className="space-y-4">
                                        {machineHistory.visitHistory.map((visit) => (
                                            <Card key={visit.visitId} className="border-l-4" style={{ borderLeftColor: getStatusColor(visit.status).replace('bg-', '#') }}>
                                                <CardContent className="pt-6">
                                                    <div className="space-y-4">
                                                        {/* Visit Header */}
                                                        <div className="flex items-start justify-between">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="font-semibold">Visit #{visit.visitId}</h3>
                                                                    <Badge className={getVisitTypeColor(visit.visitType)}>
                                                                        {visit.visitType}
                                                                    </Badge>
                                                                    <Badge className={getStatusColor(visit.status)}>
                                                                        {visit.status}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                    {visit.visitDate && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="w-4 h-4" />
                                                                            {new Date(visit.visitDate).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                    <span className="flex items-center gap-1">
                                                                        <User className="w-4 h-4" />
                                                                        {visit.technicianName}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {visit.visitValue && (
                                                                <div className="text-right">
                                                                    <p className="text-sm text-muted-foreground">Visit Value</p>
                                                                    <p className="font-semibold flex items-center gap-1">
                                                                        <DollarSign className="w-4 h-4" />
                                                                        {visit.visitValue.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Separator />

                                                        {/* Visit Details */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {visit.description && (
                                                                <div className="col-span-2">
                                                                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                                                                    <p className="text-sm flex items-start gap-2">
                                                                        <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                                                        {visit.description}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {visit.partsUsed && (
                                                                <div className="col-span-2">
                                                                    <p className="text-sm text-muted-foreground mb-1">Parts Used</p>
                                                                    <p className="text-sm flex items-start gap-2">
                                                                        <Package className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                                                        {visit.partsUsed}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {visit.mediaFiles && visit.mediaFiles.length > 0 && (
                                                                <div className="col-span-2">
                                                                    <p className="text-sm text-muted-foreground mb-2">Media Files ({visit.mediaFiles.length})</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {visit.mediaFiles.map((file, fileIndex) => (
                                                                            <Badge key={fileIndex} variant="outline" className="flex items-center gap-1">
                                                                                <FileText className="w-3 h-3" />
                                                                                {file.fileName}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default MachineHistoryPage;
