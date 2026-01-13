import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedMaintenanceApi, type EnhancedCustomer, type EnhancedEquipment, type EnhancedVisit, type CompleteVisitRequest } from '@/services/maintenance/enhancedMaintenanceApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Users,
    Wrench,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Loader2,
    Eye,
    FileText,
    Database,
    RefreshCw,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import VisitDetailsSlideOver from '@/components/maintenance/VisitDetailsSlideOver';

const EnhancedClientEquipmentVisitsPage: React.FC = () => {
    const { language } = useTranslation();
    const isRTL = language === 'ar';

    // State management
    const [selectedCustomer, setSelectedCustomer] = useState<EnhancedCustomer | null>(null);
    const [selectedEquipment, setSelectedEquipment] = useState<EnhancedEquipment | null>(null);
    const [selectedVisit, setSelectedVisit] = useState<EnhancedVisit | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [includeLegacy, setIncludeLegacy] = useState(true);
    const [pageNumber] = useState(1);
    const [pageSize] = useState(20);
    const [showCompleteVisitDialog, setShowCompleteVisitDialog] = useState(false);
    const [showVisitDetailsDialog, setShowVisitDetailsDialog] = useState(false);
    const [showVisitSlideOver, setShowVisitSlideOver] = useState(false);

    // Form state for visit completion
    const [visitCompletionForm, setVisitCompletionForm] = useState<CompleteVisitRequest>({
        visitId: '',
        source: 'New',
        report: '',
        actionsTaken: '',
        partsUsed: '',
        serviceFee: undefined,
        outcome: 'Completed',
        notes: '',
    });

    const queryClient = useQueryClient();

    // Fetch customers
    const { data: customersData, isLoading: customersLoading, error: customersError } = useQuery({
        queryKey: ['enhanced-customers', pageNumber, pageSize, searchTerm, includeLegacy],
        queryFn: async () => {
            try {
                console.log('Fetching customers with criteria:', { searchTerm, pageNumber, pageSize, includeLegacy });
                const result = await enhancedMaintenanceApi.searchCustomers({
                    searchTerm,
                    pageNumber,
                    pageSize,
                    includeLegacy,
                });
                console.log('Customers fetched successfully:', result);
                return result;
            } catch (error) {
                console.error('Error fetching customers:', error);
                throw error;
            }
        },
        retry: 2,
    });

    // Fetch customer equipment and visits
    const { data: customerData, isLoading: customerDataLoading, refetch: refetchCustomerData } = useQuery({
        queryKey: ['customer-equipment-visits', selectedCustomer?.id, includeLegacy],
        queryFn: async () => {
            if (!selectedCustomer) return null;
            return await enhancedMaintenanceApi.getCustomerEquipmentVisits(selectedCustomer.id, includeLegacy);
        },
        enabled: !!selectedCustomer,
    });

    // Fetch equipment visits
    const { data: equipmentData, isLoading: equipmentDataLoading } = useQuery({
        queryKey: ['equipment-visits', selectedEquipment?.id, includeLegacy],
        queryFn: async () => {
            if (!selectedEquipment) return null;
            return await enhancedMaintenanceApi.getEquipmentVisits(selectedEquipment.id, includeLegacy);
        },
        enabled: !!selectedEquipment,
    });

    // Complete visit mutation
    const completeVisitMutation = useMutation({
        mutationFn: (request: CompleteVisitRequest) => enhancedMaintenanceApi.completeVisit(request),
        onSuccess: () => {
            toast.success(isRTL ? 'تم إكمال الزيارة بنجاح' : 'Visit completed successfully');
            setShowCompleteVisitDialog(false);
            setSelectedVisit(null);
            // Refresh data
            refetchCustomerData();
            queryClient.invalidateQueries({ queryKey: ['equipment-visits'] });
        },
        onError: (error: any) => {
            toast.error(error.message || (isRTL ? 'فشل إكمال الزيارة' : 'Failed to complete visit'));
        },
    });

    // Helper functions
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'inprogress':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            case 'inprogress':
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

    const handleCompleteVisit = () => {
        if (!selectedVisit) return;

        const request: CompleteVisitRequest = {
            visitId: selectedVisit.id,
            source: selectedVisit.source,
            report: visitCompletionForm.report,
            actionsTaken: visitCompletionForm.actionsTaken,
            partsUsed: visitCompletionForm.partsUsed,
            serviceFee: visitCompletionForm.serviceFee,
            outcome: visitCompletionForm.outcome,
            notes: visitCompletionForm.notes,
        };

        completeVisitMutation.mutate(request);
    };

    return (
        <div className={cn('space-y-6 p-6', isRTL && 'rtl')}>
            {/* Instructions Banner */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-full p-2">
                            <Wrench className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900">
                                {isRTL ? 'كيفية عرض زيارات المعدات' : 'How to View Machine Visits'}
                            </h3>
                            <p className="text-sm text-blue-700">
                                {isRTL
                                    ? '1. ابحث عن عميل واختره من الجدول ↓ 2. انقر على أي جهاز في قائمة المعدات 👆 3. ستظهر زيارات الجهاز في الأسفل'
                                    : '1. Search and select a customer from the table ↓ 2. Click on any machine in the equipment list 👆 3. Machine visits will appear below'
                                }
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Real Data Banner */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-100 rounded-full p-2">
                            <Database className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-green-900">
                                {isRTL ? 'بيانات حقيقية من قاعدة البيانات' : 'Real Data from Database'}
                            </h3>
                            <p className="text-sm text-green-700">
                                {isRTL
                                    ? 'متصل الآن بقاعدة البيانات الفعلية مع بيانات من نظام التراث والنظام الجديد'
                                    : 'Now connected to real database with data from both legacy and new systems'
                                }
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isRTL ? 'إدارة الصيانة المعززة' : 'Enhanced Maintenance Management'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isRTL ? 'إدارة شاملة للعملاء والمعدات والزيارات' : 'Comprehensive customer, equipment, and visits management'}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setIncludeLegacy(!includeLegacy)}
                        className="flex items-center space-x-2"
                    >
                        <Database className="h-4 w-4" />
                        <span>{includeLegacy ? (isRTL ? 'تضمين البيانات القديمة' : 'Include Legacy') : (isRTL ? 'بيانات جديدة فقط' : 'New Only')}</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => queryClient.invalidateQueries()}
                        className="flex items-center space-x-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>{isRTL ? 'تحديث' : 'Refresh'}</span>
                    </Button>
                </div>
            </div>

            {/* Customer Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>{isRTL ? 'البحث عن العملاء' : 'Customer Search'}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={isRTL ? 'ابحث بالاسم، الهاتف، أو البريد الإلكتروني...' : 'Search by name, phone, or email...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={cn('pl-10', isRTL && 'pr-10')}
                            />
                        </div>
                    </div>

                    {customersLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : customersError ? (
                        <div className="text-center py-8 text-red-600">
                            <div className="mb-4">
                                <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">
                                {isRTL ? 'حدث خطأ في تحميل العملاء' : 'Error loading customers'}
                            </h3>
                            <p className="text-sm text-red-500 mb-4">
                                {customersError.message || (isRTL ? 'يرجى المحاولة مرة أخرى' : 'Please try again')}
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => queryClient.invalidateQueries({ queryKey: ['enhanced-customers'] })}
                                className="mt-2"
                            >
                                {isRTL ? 'إعادة المحاولة' : 'Retry'}
                            </Button>
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-xs text-gray-500">
                                    {isRTL ? 'عرض تفاصيل الخطأ' : 'Show error details'}
                                </summary>
                                <pre className="text-xs text-gray-600 mt-2 bg-gray-100 p-2 rounded">
                                    {JSON.stringify(customersError, null, 2)}
                                </pre>
                            </details>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{isRTL ? 'الاسم' : 'Name'}</TableHead>
                                        <TableHead>{isRTL ? 'الهاتف' : 'Phone'}</TableHead>
                                        <TableHead>{isRTL ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                                        <TableHead>{isRTL ? 'المصدر' : 'Source'}</TableHead>
                                        <TableHead>{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customersData?.items?.map((customer) => (
                                        <TableRow
                                            key={`${customer.source}-${customer.id}`}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => setSelectedCustomer(customer)}
                                        >
                                            <TableCell className="font-medium">{customer.name}</TableCell>
                                            <TableCell>{customer.phone}</TableCell>
                                            <TableCell>{customer.email}</TableCell>
                                            <TableCell>{getSourceBadge(customer.source)}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link to={`/client/${customer.id}/equipment`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Customer Details - Equipment and Visits */}
            {selectedCustomer && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Equipment List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Wrench className="h-5 w-5" />
                                <span>{isRTL ? 'معدات العميل' : 'Customer Equipment'}</span>
                                <Badge variant="outline">{customerData?.equipment?.length || 0}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {customerDataLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {customerData?.equipment?.map((equipment) => (
                                        <div
                                            key={`${equipment.source}-${equipment.id}`}
                                            className={cn(
                                                'p-3 border rounded-lg cursor-pointer transition-all duration-200',
                                                selectedEquipment?.id === equipment.id && 'border-primary bg-primary/10 shadow-sm',
                                                'hover:border-primary/50 hover:shadow-md hover:scale-[1.02]'
                                            )}
                                            onClick={() => setSelectedEquipment(equipment)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="font-medium text-lg flex items-center space-x-2">
                                                        <span>{equipment.model}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {isRTL ? 'انقر لعرض الزيارات' : 'Click to view visits'}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {isRTL ? 'الرقم التسلسلي:' : 'Serial:'} {equipment.serialNumber}
                                                    </div>
                                                    {equipment.location && equipment.location !== 'Unknown' && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {isRTL ? 'الموقع:' : 'Location:'} {equipment.location}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {getSourceBadge(equipment.source)}
                                                    <Badge className={getStatusColor(equipment.status)}>
                                                        {getStatusIcon(equipment.status)}
                                                        <span className="ml-1">{equipment.status}</span>
                                                    </Badge>
                                                    <div className="bg-primary/10 rounded-full p-1">
                                                        <Eye className="h-4 w-4 text-primary" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Visit History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>{isRTL ? 'سجل الزيارات' : 'Visit History'}</span>
                                    <Badge variant="outline">{customerData?.visits?.length || 0}</Badge>
                                </div>
                                {/* Statistics button removed - feature not implemented yet */}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {customerDataLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {customerData?.visits?.map((visit) => (
                                        <div
                                            key={`${visit.source}-${visit.id}`}
                                            className={cn(
                                                'p-4 border rounded-lg cursor-pointer transition-colors',
                                                selectedVisit?.id === visit.id && 'border-primary bg-primary/10',
                                                'hover:border-primary/50'
                                            )}
                                            onClick={() => {
                                                setSelectedVisit(visit);
                                                setShowVisitSlideOver(true);
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">
                                                        {format(new Date(visit.visitDate), 'MMM dd, yyyy')}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {isRTL ? 'المهندس:' : 'Engineer:'} {visit.engineerName}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {getSourceBadge(visit.source)}
                                                    <Badge className={getStatusColor(visit.status)}>
                                                        {getStatusIcon(visit.status)}
                                                        <span className="ml-1">{visit.status}</span>
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Equipment Details */}
            {selectedEquipment && equipmentData && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Wrench className="h-5 w-5" />
                                <span>
                                    {isRTL ? 'زيارات المعدات' : 'Equipment Visits'} - {selectedEquipment.model}
                                </span>
                                <Badge variant="outline">{equipmentData.visits?.length || 0} {isRTL ? 'زيارات' : 'visits'}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                                {getSourceBadge(selectedEquipment.source)}
                                <Badge className={getStatusColor(selectedEquipment.status)}>
                                    {getStatusIcon(selectedEquipment.status)}
                                    <span className="ml-1">{selectedEquipment.status}</span>
                                </Badge>
                            </div>
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                            {isRTL ? 'الرقم التسلسلي:' : 'Serial:'} {selectedEquipment.serialNumber}
                            {selectedEquipment.location && selectedEquipment.location !== 'Unknown' && (
                                <span className="ml-4">
                                    {isRTL ? 'الموقع:' : 'Location:'} {selectedEquipment.location}
                                </span>
                            )}
                        </div>
                        {!equipmentData.visits || equipmentData.visits.length === 0 ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    {isRTL ? '💡 تلميح: لا توجد زيارات لهذه المعدات. يمكنك إكمال الزيارات من جدول الزيارات العام.' : '💡 Tip: No visits found for this equipment. You can complete visits from the general visits table.'}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-green-800">
                                    {isRTL ? '✅ تم العثور على زيارات لهذه المعدات. يمكنك عرض التفاصيل أو إكمال الزيارات المعلقة.' : '✅ Found visits for this equipment. You can view details or complete pending visits.'}
                                </p>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {equipmentDataLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : equipmentData.visits && equipmentData.visits.length > 0 ? (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                                            <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                                            <TableHead>{isRTL ? 'المهندس' : 'Engineer'}</TableHead>
                                            <TableHead>{isRTL ? 'التقرير' : 'Report'}</TableHead>
                                            <TableHead>{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                                            <TableHead>{isRTL ? 'المصدر' : 'Source'}</TableHead>
                                            <TableHead>{isRTL ? 'العمليات' : 'Actions'}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {equipmentData.visits?.map((visit) => (
                                            <TableRow
                                                key={`${visit.source}-${visit.id}`}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => {
                                                    setSelectedVisit(visit);
                                                    setShowVisitSlideOver(true);
                                                }}
                                            >
                                                <TableCell className="font-medium">
                                                    {format(new Date(visit.visitDate), 'MMM dd, yyyy')}
                                                </TableCell>
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
                                                <TableCell>
                                                    <div className="max-w-xs truncate" title={visit.actionsTaken}>
                                                        {visit.actionsTaken || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getSourceBadge(visit.source)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedVisit(visit);
                                                                setShowCompleteVisitDialog(true);
                                                            }}
                                                            disabled={visit.status === 'Completed'}
                                                        >
                                                            {visit.status === 'Completed'
                                                                ? (isRTL ? 'مكتمل' : 'Completed')
                                                                : (isRTL ? 'إكمال' : 'Complete')
                                                            }
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedVisit(visit);
                                                                setShowVisitSlideOver(true);
                                                            }}
                                                            title={isRTL ? 'عرض تفاصيل الزيارة' : 'View visit details'}
                                                            className="hover:bg-blue-50 border-blue-200"
                                                        >
                                                            <Eye className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>{isRTL ? 'لا توجد زيارات لهذه المعدات' : 'No visits found for this equipment'}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Complete Visit Dialog */}
            <Dialog open={showCompleteVisitDialog} onOpenChange={setShowCompleteVisitDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5" />
                            <span>{isRTL ? 'إكمال الزيارة' : 'Complete Visit'}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>رقم الزيارة</Label>
                                <Input value={selectedVisit?.id || ''} disabled />
                            </div>
                            <div>
                                <Label>المصدر</Label>
                                <Input value={selectedVisit?.source || ''} disabled />
                            </div>
                        </div>

                        <div>
                            <Label>التقرير</Label>
                            <Textarea
                                placeholder="اكتب تقرير الزيارة هنا..."
                                value={visitCompletionForm.report}
                                onChange={(e) => setVisitCompletionForm({ ...visitCompletionForm, report: e.target.value })}
                                rows={3}
                                className="text-right"
                                dir="rtl"
                            />
                        </div>

                        <div>
                            <Label>الإجراءات المتخذة</Label>
                            <Textarea
                                placeholder="صف الإجراءات المتخذة..."
                                value={visitCompletionForm.actionsTaken}
                                onChange={(e) => setVisitCompletionForm({ ...visitCompletionForm, actionsTaken: e.target.value })}
                                rows={3}
                                className="text-right"
                                dir="rtl"
                            />
                        </div>

                        <div>
                            <Label>الأجزاء المستخدمة</Label>
                            <Textarea
                                placeholder="اذكر الأجزاء المستخدمة..."
                                value={visitCompletionForm.partsUsed}
                                onChange={(e) => setVisitCompletionForm({ ...visitCompletionForm, partsUsed: e.target.value })}
                                rows={2}
                                className="text-right"
                                dir="rtl"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>رسوم الخدمة</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={visitCompletionForm.serviceFee || ''}
                                    onChange={(e) => setVisitCompletionForm({ ...visitCompletionForm, serviceFee: parseFloat(e.target.value) || undefined })}
                                />
                            </div>
                            <div>
                                <Label>النتيجة</Label>
                                <Select
                                    value={visitCompletionForm.outcome}
                                    onValueChange={(value) => setVisitCompletionForm({ ...visitCompletionForm, outcome: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Completed">مكتمل</SelectItem>
                                        <SelectItem value="NeedsSecondVisit">يحتاج زيارة ثانية</SelectItem>
                                        <SelectItem value="NeedsSparePart">يحتاج قطعة غيار</SelectItem>
                                        <SelectItem value="CannotComplete">لا يمكن إكماله</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>ملاحظات</Label>
                            <Textarea
                                placeholder="أي ملاحظات إضافية..."
                                value={visitCompletionForm.notes}
                                onChange={(e) => setVisitCompletionForm({ ...visitCompletionForm, notes: e.target.value })}
                                rows={2}
                                className="text-right"
                                dir="rtl"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowCompleteVisitDialog(false)}>
                                إلغاء
                            </Button>
                            <Button onClick={handleCompleteVisit}>
                                إكمال الزيارة
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Visit Details Dialog */}
            <Dialog open={showVisitDetailsDialog} onOpenChange={setShowVisitDetailsDialog}>
                <DialogContent className="max-w-3xl z-50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <span>{isRTL ? 'تفاصيل الزيارة' : 'Visit Details'}</span>
                        </DialogTitle>
                    </DialogHeader>
                    {selectedVisit ? (
                        <div className="space-y-6">
                            {/* Visit Header */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">رقم الزيارة</Label>
                                    <p className="text-sm text-muted-foreground">{selectedVisit.id}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">المصدر</Label>
                                    <div>{getSourceBadge(selectedVisit.source)}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">التاريخ</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(selectedVisit.visitDate), 'MMM dd, yyyy HH:mm')}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">الحالة</Label>
                                    <div>
                                        <Badge className={getStatusColor(selectedVisit.status)}>
                                            {getStatusIcon(selectedVisit.status)}
                                            <span className="ml-1">{selectedVisit.status}</span>
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Visit Details */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">المهندس</Label>
                                    <p className="text-sm text-muted-foreground">{selectedVisit.engineerName}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">التقرير</Label>
                                    <div className="p-3 bg-muted rounded-md">
                                        <p className="text-sm text-right" dir="rtl">{selectedVisit.report || 'لا يوجد تقرير'}</p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">الإجراءات المتخذة</Label>
                                    <div className="p-3 bg-muted rounded-md">
                                        <p className="text-sm text-right" dir="rtl">{selectedVisit.actionsTaken || 'لا توجد إجراءات'}</p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">الأجزاء المستخدمة</Label>
                                    <div className="p-3 bg-muted rounded-md">
                                        <p className="text-sm text-right" dir="rtl">{selectedVisit.partsUsed || 'لا توجد أجزاء'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">رسوم الخدمة</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedVisit.serviceFee ? `${selectedVisit.serviceFee} ج.م` : 'غير محدد'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">النتيجة</Label>
                                        <p className="text-sm text-muted-foreground">{selectedVisit.outcome}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={() => setShowVisitDetailsDialog(false)}>
                                    {isRTL ? 'إغلاق' : 'Close'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>{isRTL ? 'لم يتم تحديد زيارة' : 'No visit selected'}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Action Buttons */}
            {
                selectedVisit && (
                    <div className="fixed bottom-6 right-6 flex space-x-2">
                        <Dialog open={showCompleteVisitDialog} onOpenChange={setShowCompleteVisitDialog}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>{isRTL ? 'إكمال الزيارة' : 'Complete Visit'}</span>
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>
                )
            }

            {/* Visit Details Slide Over */}
            <VisitDetailsSlideOver
                visit={selectedVisit}
                isOpen={showVisitSlideOver}
                onClose={() => {
                    setShowVisitSlideOver(false);
                    setSelectedVisit(null);
                }}
                isRTL={isRTL}
            />
        </div>
    );
};

export default EnhancedClientEquipmentVisitsPage;
