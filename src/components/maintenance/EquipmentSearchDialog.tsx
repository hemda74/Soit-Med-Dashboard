import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { enhancedMaintenanceApi, type EnhancedEquipment, type EquipmentVisits } from '@/services/maintenance/enhancedMaintenanceApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search,
    Wrench,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Loader2,
    Eye,
    Database,
    RefreshCw,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface EquipmentSearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onEquipmentSelect: (equipment: EnhancedEquipment) => void;
}

const EquipmentSearchDialog: React.FC<EquipmentSearchDialogProps> = ({
    isOpen,
    onClose,
    onEquipmentSelect,
}) => {
    const { language } = useTranslation();
    const isRTL = language === 'ar';

    const [searchTerm, setSearchTerm] = useState('');
    const [includeLegacy, setIncludeLegacy] = useState(true);
    const [selectedEquipment, setSelectedEquipment] = useState<EnhancedEquipment | null>(null);
    const [showEquipmentDetails, setShowEquipmentDetails] = useState(false);

    // Search equipment by serial number or ID
    const { data: equipmentData, isLoading, error, refetch } = useQuery({
        queryKey: ['equipment-search', searchTerm, includeLegacy],
        queryFn: async () => {
            if (!searchTerm.trim()) return null;
            return await enhancedMaintenanceApi.getEquipmentVisits(searchTerm.trim(), includeLegacy);
        },
        enabled: isOpen && searchTerm.trim().length > 0,
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return <CheckCircle className="h-4 w-4" />;
            case 'inactive':
                return <XCircle className="h-4 w-4" />;
            case 'maintenance':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getSourceBadge = (source: string) => {
        return (
            <Badge variant={source === 'Legacy' ? 'secondary' : 'default'}>
                {source}
            </Badge>
        );
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            refetch();
        }
    };

    const handleEquipmentClick = (equipment: EnhancedEquipment) => {
        setSelectedEquipment(equipment);
        setShowEquipmentDetails(true);
    };

    const handleSelectEquipment = () => {
        if (selectedEquipment) {
            onEquipmentSelect(selectedEquipment);
            onClose();
            setSelectedEquipment(null);
            setShowEquipmentDetails(false);
            setSearchTerm('');
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Wrench className="h-5 w-5" />
                        <span>{isRTL ? 'البحث عن المعدات' : 'Equipment Search'}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Controls */}
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={isRTL ? 'ابحث بالرقم التسلسلي أو معرف المعدات...' : 'Search by serial number or equipment ID...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className={cn('pl-10', isRTL && 'pr-10')}
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={!searchTerm.trim()}>
                            {isRTL ? 'بحث' : 'Search'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIncludeLegacy(!includeLegacy)}
                            className="flex items-center space-x-2"
                        >
                            <Database className="h-4 w-4" />
                            <span>{includeLegacy ? (isRTL ? 'تضمين القديم' : 'Include Legacy') : (isRTL ? 'جديد فقط' : 'New Only')}</span>
                        </Button>
                    </div>

                    {/* Search Results */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600">
                            {isRTL ? 'حدث خطأ في البحث عن المعدات' : 'Error searching equipment'}
                        </div>
                    ) : equipmentData?.equipment ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Wrench className="h-5 w-5" />
                                    <span>{isRTL ? 'نتائج البحث' : 'Search Results'}</span>
                                    <Badge variant="outline">1 {isRTL ? 'نتيجة' : 'result'}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={cn(
                                        'p-4 border rounded-lg cursor-pointer transition-colors',
                                        'hover:border-primary/50'
                                    )}
                                    onClick={() => equipmentData.equipment && handleEquipmentClick(equipmentData.equipment)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-lg">{equipmentData.equipment?.model}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {isRTL ? 'الرقم التسلسلي:' : 'Serial:'} {equipmentData.equipment?.serialNumber}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {isRTL ? 'المعرف:' : 'ID:'} {equipmentData.equipment?.id}
                                            </div>
                                            {equipmentData.equipment?.location && (
                                                <div className="text-sm text-muted-foreground">
                                                    {isRTL ? 'الموقع:' : 'Location:'} {equipmentData.equipment.location}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getSourceBadge(equipmentData.equipment?.source)}
                                            <Badge className={getStatusColor(equipmentData.equipment?.status)}>
                                                {getStatusIcon(equipmentData.equipment?.status)}
                                                <span className="ml-1">{equipmentData.equipment?.status}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : searchTerm.trim() ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {isRTL ? 'لا توجد نتائج للبحث' : 'No search results found'}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            {isRTL ? 'أدخل رقمًا تسلسليًا أو معرف المعدات للبحث' : 'Enter serial number or equipment ID to search'}
                        </div>
                    )}

                    {/* Equipment Details Dialog */}
                    {selectedEquipment && (
                        <Dialog open={showEquipmentDetails} onOpenChange={setShowEquipmentDetails}>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center space-x-2">
                                        <Wrench className="h-5 w-5" />
                                        <span>{isRTL ? 'تفاصيل المعدات' : 'Equipment Details'}</span>
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4">
                                    {/* Equipment Info */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{isRTL ? 'معلومات المعدات' : 'Equipment Information'}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-sm text-muted-foreground">{isRTL ? 'النموذج:' : 'Model:'}</span>
                                                    <div className="font-medium">{selectedEquipment.model}</div>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-muted-foreground">{isRTL ? 'الرقم التسلسلي:' : 'Serial:'}</span>
                                                    <div className="font-medium">{selectedEquipment.serialNumber}</div>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-muted-foreground">{isRTL ? 'المعرف:' : 'ID:'}</span>
                                                    <div className="font-medium">{selectedEquipment.id}</div>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-muted-foreground">{isRTL ? 'الحالة:' : 'Status:'}</span>
                                                    <div className="font-medium">
                                                        <Badge className={getStatusColor(selectedEquipment.status)}>
                                                            {getStatusIcon(selectedEquipment.status)}
                                                            <span className="ml-1">{selectedEquipment.status}</span>
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {selectedEquipment.location && (
                                                    <div className="col-span-2">
                                                        <span className="text-sm text-muted-foreground">{isRTL ? 'الموقع:' : 'Location:'}</span>
                                                        <div className="font-medium">{selectedEquipment.location}</div>
                                                    </div>
                                                )}
                                                <div className="col-span-2">
                                                    <span className="text-sm text-muted-foreground">{isRTL ? 'المصدر:' : 'Source:'}</span>
                                                    <div className="font-medium">{getSourceBadge(selectedEquipment.source)}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Visit History */}
                                    {equipmentData?.visits && equipmentData.visits.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center space-x-2">
                                                    <Calendar className="h-5 w-5" />
                                                    <span>{isRTL ? 'سجل الزيارات' : 'Visit History'}</span>
                                                    <Badge variant="outline">{equipmentData.visits.length}</Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="max-h-64 overflow-y-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                                                                <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                                                                <TableHead>{isRTL ? 'المهندس' : 'Engineer'}</TableHead>
                                                                <TableHead>{isRTL ? 'التقرير' : 'Report'}</TableHead>
                                                                <TableHead>{isRTL ? 'المصدر' : 'Source'}</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {equipmentData.visits.map((visit) => (
                                                                <TableRow key={`${visit.source}-${visit.id}`}>
                                                                    <TableCell>{format(new Date(visit.visitDate), 'MMM dd, yyyy')}</TableCell>
                                                                    <TableCell>
                                                                        <Badge className={getStatusColor(visit.status)}>
                                                                            {getStatusIcon(visit.status)}
                                                                            <span className="ml-1">{visit.status}</span>
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>{visit.engineerName}</TableCell>
                                                                    <TableCell>
                                                                        <div className="max-w-xs truncate" title={visit.report}>
                                                                            {visit.report || '-'}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>{getSourceBadge(visit.source)}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setShowEquipmentDetails(false)}>
                                            {isRTL ? 'إغلاق' : 'Close'}
                                        </Button>
                                        <Button onClick={handleSelectEquipment}>
                                            {isRTL ? 'اختر المعدات' : 'Select Equipment'}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EquipmentSearchDialog;
