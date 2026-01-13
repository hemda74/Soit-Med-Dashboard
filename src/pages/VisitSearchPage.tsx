import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search,
    Calendar,
    Filter,
    Download,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Wrench,
    User,
    MapPin,
    DollarSign
} from 'lucide-react';
import { enhancedMaintenanceApi } from '@/services/maintenance/enhancedMaintenanceApi';
import type { VisitSearchCriteria, VisitSearchResponse, VisitSearchItem } from '@/services/maintenance/enhancedMaintenanceApi';
import toast from 'react-hot-toast';
const VisitSearchPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<VisitSearchResponse | null>(null);
    const [criteria, setCriteria] = useState<VisitSearchCriteria>({
        dateFrom: '',
        dateTo: '',
        technicianId: undefined,
        governorate: '',
        status: '',
        machineSerial: '',
        page: 1,
        pageSize: 20
    });

    // Auto-load first 20 visits on mount
    useEffect(() => {
        handleSearch();
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const results = await enhancedMaintenanceApi.searchVisits(criteria);
            setSearchResults(results);
            if (results.totalCount > 0) {
                toast.success(`Found ${results.totalCount} visits`);
            } else {
                toast('No visits found. Try adjusting your filters.', { icon: 'ℹ️' });
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to search visits. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setCriteria({
            dateFrom: '',
            dateTo: '',
            technicianId: undefined,
            governorate: '',
            status: '',
            machineSerial: '',
            page: 1,
            pageSize: 20
        });
        setSearchResults(null);
    };

    const handlePageChange = (newPage: number) => {
        setCriteria({ ...criteria, page: newPage });
        handleSearch();
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
        if (!searchResults || searchResults.data.length === 0) {
            console.error('No data to export');
            return;
        }

        const headers = ['Visit ID', 'Date', 'Client', 'Machine', 'Serial', 'Technician', 'Type', 'Status', 'Governorate', 'Value'];
        const rows = searchResults.data.map((visit: VisitSearchItem) => [
            visit.visitId,
            new Date(visit.visitDate).toLocaleDateString(),
            visit.clientName,
            visit.machineModel,
            visit.machineSerial,
            visit.technicianName,
            visit.visitType,
            visit.status,
            visit.governorate,
            visit.visitValue || 0
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visits_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Exported to CSV');
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Visit Search</h1>
                    <p className="text-muted-foreground">Search and filter maintenance visits from legacy and new systems</p>
                </div>
                <Button variant="outline" onClick={() => window.history.back()}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>

            {/* Search Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Search Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Date From */}
                        <div className="space-y-2">
                            <Label htmlFor="dateFrom">Date From</Label>
                            <Input
                                id="dateFrom"
                                type="date"
                                value={criteria.dateFrom}
                                onChange={(e) => setCriteria({ ...criteria, dateFrom: e.target.value })}
                            />
                        </div>

                        {/* Date To */}
                        <div className="space-y-2">
                            <Label htmlFor="dateTo">Date To</Label>
                            <Input
                                id="dateTo"
                                type="date"
                                value={criteria.dateTo}
                                onChange={(e) => setCriteria({ ...criteria, dateTo: e.target.value })}
                            />
                        </div>

                        {/* Technician ID */}
                        <div className="space-y-2">
                            <Label htmlFor="technicianId">Technician ID</Label>
                            <Input
                                id="technicianId"
                                type="number"
                                placeholder="Enter technician ID"
                                value={criteria.technicianId || ''}
                                onChange={(e) => setCriteria({ ...criteria, technicianId: e.target.value || undefined })}
                            />
                        </div>

                        {/* Governorate */}
                        <div className="space-y-2">
                            <Label htmlFor="governorate">Governorate</Label>
                            <Select value={criteria.governorate || "all"} onValueChange={(value) => setCriteria({ ...criteria, governorate: value === "all" ? "" : value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select governorate" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="01">Cairo</SelectItem>
                                    <SelectItem value="02">Alexandria</SelectItem>
                                    <SelectItem value="03">Port Said</SelectItem>
                                    <SelectItem value="21">Giza</SelectItem>
                                    <SelectItem value="13">Sharqia</SelectItem>
                                    <SelectItem value="14">Qalyubia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={criteria.status || "all"} onValueChange={(value) => setCriteria({ ...criteria, status: value === "all" ? "" : value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Machine Serial */}
                        <div className="space-y-2">
                            <Label htmlFor="machineSerial">Machine Serial</Label>
                            <Input
                                id="machineSerial"
                                placeholder="Enter serial number"
                                value={criteria.machineSerial}
                                onChange={(e) => setCriteria({ ...criteria, machineSerial: e.target.value })}
                            />
                        </div>

                        {/* Page Size */}
                        <div className="space-y-2">
                            <Label htmlFor="pageSize">Results Per Page</Label>
                            <Select value={criteria.pageSize.toString()} onValueChange={(value) => setCriteria({ ...criteria, pageSize: parseInt(value) })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-6">
                        <Button onClick={handleSearch} disabled={loading} className="flex-1">
                            <Search className="w-4 h-4 mr-2" />
                            {loading ? 'Searching...' : 'Search Visits'}
                        </Button>
                        <Button variant="outline" onClick={handleReset}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                        {searchResults && searchResults.data.length > 0 && (
                            <Button variant="outline" onClick={exportToCSV}>
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            {searchResults && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                Search Results ({searchResults.totalCount} visits found)
                            </CardTitle>
                            <div className="text-sm text-muted-foreground">
                                Page {searchResults.pageNumber} of {searchResults.totalPages}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {searchResults.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No visits found matching your criteria</p>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Visit ID</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Client</TableHead>
                                                <TableHead>Machine</TableHead>
                                                <TableHead>Serial</TableHead>
                                                <TableHead>Technician</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Governorate</TableHead>
                                                <TableHead className="text-right">Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {searchResults.data.map((visit: VisitSearchItem) => (
                                                <TableRow key={visit.visitId}>
                                                    <TableCell className="font-medium">#{visit.visitId}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                                            {new Date(visit.visitDate).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-muted-foreground" />
                                                            {visit.clientName}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Wrench className="w-4 h-4 text-muted-foreground" />
                                                            {visit.machineModel}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">{visit.machineSerial}</TableCell>
                                                    <TableCell>{visit.technicianName}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getVisitTypeColor(visit.visitType)}>
                                                            {visit.visitType}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(visit.status)}>
                                                            {visit.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                                            {visit.governorate}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {visit.visitValue ? (
                                                            <div className="flex items-center justify-end gap-1">
                                                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                                                {visit.visitValue.toFixed(2)}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {searchResults.totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {((searchResults.pageNumber - 1) * searchResults.pageSize) + 1} to{' '}
                                            {Math.min(searchResults.pageNumber * searchResults.pageSize, searchResults.totalCount)} of{' '}
                                            {searchResults.totalCount} results
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(searchResults.pageNumber - 1)}
                                                disabled={searchResults.pageNumber === 1}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(searchResults.pageNumber + 1)}
                                                disabled={searchResults.pageNumber === searchResults.totalPages}
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default VisitSearchPage;
