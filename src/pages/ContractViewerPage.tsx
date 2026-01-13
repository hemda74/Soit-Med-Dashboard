import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    ArrowLeft,
    Wrench,
    Calendar,
    MapPin,
    Phone,
    FileText,
    Image as ImageIcon,
    Loader2
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { enhancedMaintenanceApi } from '@/services/maintenance/enhancedMaintenanceApi';

// Types matching Media API structure
interface ClientSearchResult {
    clientId: number;
    clientName: string;
    address?: string;
    phone?: string;
    mobile?: string;
    machineCount: number;
    contractCount: number;
}

interface MachineInfo {
    machineId: number;
    serialNumber: string;
    model: string;
    itemCode?: string;
    visitCount: number;
    fileCount: number;
}


const ContractViewerPage: React.FC = () => {
    const { language } = useTranslation();
    const isRTL = language === 'ar';

    // Navigation state
    const [view, setView] = useState<'search' | 'machines' | 'history'>('search');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<ClientSearchResult | null>(null);
    const [selectedMachine, setSelectedMachine] = useState<MachineInfo | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);

    // Search clients
    const { data: searchResults, isLoading: searchLoading, refetch: searchClients } = useQuery({
        queryKey: ['client-search', searchTerm, currentPage],
        queryFn: async () => {
            if (!searchTerm.trim()) return { clients: [], totalCount: 0, totalPages: 0 };

            const result = await enhancedMaintenanceApi.searchCustomers({
                searchTerm: searchTerm.trim(),
                pageNumber: currentPage,
                pageSize: pageSize,
                includeLegacy: true
            });

            // Transform to match Media API structure
            return {
                clients: result.items.map((customer: any) => ({
                    clientId: parseInt(customer.id),
                    clientName: customer.name,
                    address: customer.address,
                    phone: customer.phone,
                    mobile: customer.phone,
                    machineCount: 0, // Will be populated from backend
                    contractCount: 0
                })),
                totalCount: result.totalCount,
                totalPages: result.totalPages
            };
        },
        enabled: false
    });

    // Get client machines
    const { data: clientMachines, isLoading: machinesLoading } = useQuery({
        queryKey: ['client-machines', selectedClient?.clientId],
        queryFn: async () => {
            if (!selectedClient) return null;

            const result = await enhancedMaintenanceApi.getCustomerEquipmentVisits(
                selectedClient.clientId.toString(),
                true
            );

            // Transform equipment to machine format
            return {
                customerId: selectedClient.clientId,
                customerName: selectedClient.clientName,
                customerAddress: selectedClient.address,
                customerPhone: selectedClient.phone,
                machineCount: result.equipment.length,
                machines: result.equipment.map(eq => ({
                    machineId: parseInt(eq.id),
                    serialNumber: eq.serialNumber || 'N/A',
                    model: eq.model || 'Unknown',
                    itemCode: eq.id,
                    visitCount: result.visits.filter(v => v.id === eq.id).length,
                    fileCount: 0
                }))
            };
        },
        enabled: !!selectedClient && view === 'machines'
    });

    // Get machine history
    const { data: machineHistory, isLoading: historyLoading } = useQuery({
        queryKey: ['machine-history', selectedMachine?.machineId],
        queryFn: async () => {
            if (!selectedMachine) return null;

            const result = await enhancedMaintenanceApi.getMachineHistory(selectedMachine.machineId);
            return result;
        },
        enabled: !!selectedMachine && view === 'history'
    });

    // Handlers
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setCurrentPage(1); // Reset to first page on new search
            searchClients();
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        searchClients();
    };

    const handleClientSelect = (client: ClientSearchResult) => {
        setSelectedClient(client);
        setView('machines');
    };

    const handleMachineSelect = (machine: MachineInfo) => {
        setSelectedMachine(machine);
        setView('history');
    };

    const handleBack = () => {
        if (view === 'history') {
            setSelectedMachine(null);
            setView('machines');
        } else if (view === 'machines') {
            setSelectedClient(null);
            setView('search');
        }
    };

    const getVisitTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            'Preventive': isRTL ? 'دورية' : 'Preventive',
            'Corrective': isRTL ? 'طارئة' : 'Repair',
            'Installation': isRTL ? 'تركيب' : 'Installation',
            'Inspection': isRTL ? 'فحص' : 'Inspection'
        };
        return types[type] || type;
    };

    const getStatusLabel = (status: string) => {
        const statuses: Record<string, string> = {
            'Completed': isRTL ? 'تم التنفيذ' : 'Completed',
            'Pending': isRTL ? 'مجدولة' : 'Scheduled',
            'Cancelled': isRTL ? 'ملغية' : 'Cancelled'
        };
        return statuses[status] || status;
    };

    // Render Search View
    if (view === 'search') {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            {isRTL ? 'البحث عن العملاء' : 'Client Search'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder={isRTL ? 'ابحث عن عميل...' : 'Search for a client...'}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1"
                                    dir={isRTL ? 'rtl' : 'ltr'}
                                />
                                <Button type="submit" disabled={searchLoading}>
                                    {searchLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Search className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </form>

                        {searchResults && searchResults.clients.length > 0 && (
                            <div className="mt-6 space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    {isRTL ? `تم العثور على ${searchResults.totalCount} عميل` : `Found ${searchResults.totalCount} clients`}
                                </p>
                                <div className="space-y-2">
                                    {searchResults.clients.map((client: ClientSearchResult) => (
                                        <Card
                                            key={client.clientId}
                                            className="cursor-pointer hover:bg-accent transition-colors"
                                            onClick={() => handleClientSelect(client)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <h3 className="font-semibold text-lg">{client.clientName}</h3>
                                                        {client.address && (
                                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {client.address}
                                                            </p>
                                                        )}
                                                        {client.phone && (
                                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <Phone className="w-3 h-3" />
                                                                {client.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant="secondary">
                                                            {client.machineCount} {isRTL ? 'أجهزة' : 'Machines'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {searchResults.totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            {isRTL
                                                ? `صفحة ${currentPage} من ${searchResults.totalPages}`
                                                : `Page ${currentPage} of ${searchResults.totalPages}`
                                            }
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1 || searchLoading}
                                            >
                                                {isRTL ? 'السابق' : 'Previous'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === searchResults.totalPages || searchLoading}
                                            >
                                                {isRTL ? 'التالي' : 'Next'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {searchResults && searchResults.clients.length === 0 && searchTerm && !searchLoading && (
                            <div className="mt-6 text-center text-muted-foreground">
                                {isRTL ? 'لم يتم العثور على نتائج' : 'No results found'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Render Machines View
    if (view === 'machines' && selectedClient) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Button variant="outline" onClick={handleBack} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {isRTL ? 'رجوع' : 'Back'}
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>{selectedClient.clientName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {isRTL ? `معرف العميل: ${selectedClient.clientId}` : `Customer ID: ${selectedClient.clientId}`}
                        </p>
                    </CardHeader>
                    <CardContent>
                        {machinesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        ) : clientMachines && clientMachines.machines.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Wrench className="w-5 h-5" />
                                    <h3 className="font-semibold">
                                        {clientMachines.machineCount} {isRTL ? 'أجهزة' : 'Machines'}
                                    </h3>
                                </div>
                                <div className="grid gap-4">
                                    {clientMachines.machines.map((machine) => (
                                        <Card
                                            key={machine.machineId}
                                            className="cursor-pointer hover:bg-accent transition-colors"
                                            onClick={() => handleMachineSelect(machine)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Wrench className="w-4 h-4" />
                                                            <span className="font-mono font-semibold">{machine.serialNumber}</span>
                                                        </div>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">{isRTL ? 'الموديل:' : 'Model:'}</span>{' '}
                                                            <span className="font-semibold">{machine.model}</span>
                                                        </p>
                                                        {machine.itemCode && (
                                                            <p className="text-sm text-muted-foreground">
                                                                # {isRTL ? 'كود الصنف:' : 'Item Code:'} {machine.itemCode}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right space-y-2">
                                                        <Badge variant="secondary">
                                                            {machine.visitCount} {isRTL ? 'زيارات' : 'visits'}
                                                        </Badge>
                                                        {machine.fileCount > 0 && (
                                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <FileText className="w-3 h-3" />
                                                                {machine.fileCount} {isRTL ? 'ملفات' : 'files'}
                                                            </p>
                                                        )}
                                                        <Button variant="link" size="sm">
                                                            {isRTL ? 'عرض السجل ←' : 'View History →'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                {isRTL ? 'لا توجد أجهزة لهذا العميل' : 'No machines found for this client'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Render Machine History View
    if (view === 'history' && selectedMachine && machineHistory) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Button variant="outline" onClick={handleBack} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {isRTL ? 'رجوع' : 'Back'}
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>{isRTL ? 'سجل الجهاز' : 'Machine History'}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {machineHistory.machineId}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Machine Information */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">{isRTL ? 'معرف الجهاز' : 'Machine ID'}</p>
                                <p className="font-semibold">{machineHistory.machineId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{isRTL ? 'الرقم التسلسلي' : 'Serial Number'}</p>
                                <p className="font-semibold">{machineHistory.serialNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{isRTL ? 'الموديل' : 'Model'}</p>
                                <p className="font-semibold">{machineHistory.model}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{isRTL ? 'حالة الضمان' : 'Warranty Status'}</p>
                                <Badge variant={machineHistory.warrantyStatus === 'Active' ? 'default' : 'secondary'}>
                                    {machineHistory.warrantyStatus}
                                </Badge>
                            </div>
                        </div>

                        {/* Current Client */}
                        {machineHistory.currentClient && (
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold mb-2">{isRTL ? 'العميل الحالي' : 'Current Client'}</h3>
                                <div className="space-y-1">
                                    <p><span className="text-muted-foreground">{isRTL ? 'المعرف:' : 'Client ID:'}</span> {machineHistory.currentClient.clientId}</p>
                                    <p><span className="text-muted-foreground">{isRTL ? 'الاسم:' : 'Name:'}</span> {machineHistory.currentClient.name}</p>
                                    <p><span className="text-muted-foreground">{isRTL ? 'العنوان:' : 'Address:'}</span> {machineHistory.currentClient.address}</p>
                                </div>
                            </div>
                        )}

                        {/* Visit History */}
                        <div>
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                {isRTL ? `سجل الزيارات (${machineHistory.totalVisits})` : `Visit History (${machineHistory.totalVisits})`}
                            </h3>

                            {historyLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                </div>
                            ) : machineHistory.visitsHistory && machineHistory.visitsHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {machineHistory.visitsHistory.map((visit: any) => (
                                        <Card key={visit.visitId}>
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-semibold">
                                                            {isRTL ? `معرف الزيارة: ${visit.visitId}` : `Visit ID: ${visit.visitId}`}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(visit.visitDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <Badge>{getStatusLabel(visit.status)}</Badge>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">{isRTL ? 'النوع:' : 'Type:'}</span>{' '}
                                                        {getVisitTypeLabel(visit.visitType)}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">{isRTL ? 'المهندس:' : 'Engineer:'}</span>{' '}
                                                        {visit.technicianName}
                                                    </div>
                                                </div>

                                                {visit.description && (
                                                    <div className="text-sm">
                                                        <span className="text-muted-foreground">{isRTL ? 'التقرير:' : 'Report:'}</span>{' '}
                                                        {visit.description}
                                                    </div>
                                                )}

                                                {visit.mediaFiles && visit.mediaFiles.length > 0 && (
                                                    <div className="pt-2 border-t">
                                                        <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                                                            <FileText className="w-4 h-4" />
                                                            {isRTL ? `ملفات مرفقة (${visit.mediaFiles.length}):` : `Attached Files (${visit.mediaFiles.length}):`}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {visit.mediaFiles.map((file: any, idx: number) => (
                                                                <Button
                                                                    key={idx}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex items-center gap-1"
                                                                    onClick={() => window.open(file.filePath, '_blank')}
                                                                >
                                                                    {file.fileType.match(/image/i) ? (
                                                                        <ImageIcon className="w-3 h-3" />
                                                                    ) : (
                                                                        <FileText className="w-3 h-3" />
                                                                    )}
                                                                    {file.fileName}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    {isRTL ? 'لا توجد زيارات لهذا الجهاز' : 'No visits found for this machine'}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return null;
};

export default ContractViewerPage;
