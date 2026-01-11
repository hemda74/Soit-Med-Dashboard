import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedMaintenanceApi, type EnhancedCustomer, type EnhancedEquipment, type EnhancedVisit, type CustomerEquipmentVisits, type CompleteVisitRequest } from '@/services/maintenance/enhancedMaintenanceApi';
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
    TrendingUp,
    Database,
    RefreshCw,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

const EnhancedClientEquipmentVisitsPage: React.FC = () => {
    const { t, language } = useTranslation();
    const isRTL = language === 'ar';

    // State management
    const [selectedCustomer, setSelectedCustomer] = useState<EnhancedCustomer | null>(null);
    const [selectedEquipment, setSelectedEquipment] = useState<EnhancedEquipment | null>(null);
    const [selectedVisit, setSelectedVisit] = useState<EnhancedVisit | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [includeLegacy, setIncludeLegacy] = useState(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(20);
    const [showCompleteVisitDialog, setShowCompleteVisitDialog] = useState(false);
    const [showStatsDialog, setShowStatsDialog] = useState(false);

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
            return await enhancedMaintenanceApi.searchCustomers({
                searchTerm,
                pageNumber,
                pageSize,
                includeLegacy,
            });
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
        onSuccess: (response) => {
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

    const resetForm = () => {
        setVisitCompletionForm({
            visitId: '',
            source: 'New',
            report: '',
            actionsTaken: '',
            partsUsed: '',
            serviceFee: undefined,
            outcome: 'Completed',
            notes: '',
        });
    };

    return (
        <div className={cn('space-y-6 p-6', isRTL && 'rtl')}>
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
                            {isRTL ? 'حدث خطأ في تحميل العملاء' : 'Error loading customers'}
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
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
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
                                                'p-3 border rounded-lg cursor-pointer transition-colors',
                                                selectedEquipment?.id === equipment.id && 'border-primary bg-primary/10',
                                                'hover:border-primary/50'
                                            )}
                                            onClick={() => setSelectedEquipment(equipment)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">{equipment.model}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {isRTL ? 'الرقم التسلسلي:' : 'Serial:'} {equipment.serialNumber}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {getSourceBadge(equipment.source)}
                                                    <Badge className={getStatusColor(equipment.status)}>
                                                        {getStatusIcon(equipment.status)}
                                                        <span className="ml-1">{equipment.status}</span>
                                                    </Badge>
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
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowStatsDialog(true)}
                                    className="flex items-center space-x-1"
                                >
                                    <TrendingUp className="h-4 w-4" />
                                    <span>{isRTL ? 'الإحصائيات' : 'Stats'}</span>
                                </Button>
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
                                                'p-3 border rounded-lg cursor-pointer transition-colors',
                                                selectedVisit?.id === visit.id && 'border-primary bg-primary/10',
                                                'hover:border-primary/50'
                                            )}
                                            onClick={() => setSelectedVisit(visit)}
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
                        <CardTitle className="flex items-center space-x-2">
                            <Wrench className="h-5 w-5" />
                            <span>
                                {isRTL ? 'زيارات المعدات' : 'Equipment Visits'} - {selectedEquipment.model}
                            </span>
                            <Badge variant="outline">{equipmentData.visits?.length || 0}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {equipmentDataLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
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
                                    {equipmentData.visits?.map((visit) => (
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
                                <Label>{isRTL ? 'رقم الزيارة' : 'Visit ID'}</Label>
                                <Input value={selectedVisit?.id || ''} disabled />
                            </div>
                            <div>
                                <Label>{isRTL ? 'المصدر' : 'Source'}</Label>
                                <Input value={selectedVisit?.source || ''} disabled />
                            </div>
                        </div>

                        <div>
                            <Label>{isRTL ? 'التقرير' : 'Report'}</Label>
                            <Textarea
                                placeholder={isRTL ? 'اكتب تقرير الزيارة هنا...' : 'Write visit report here...'}
                                value={visitCompletionForm.report}
                                onChange={(e) => setVisitCompletionForm({ ...visitCompletionForm, report: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label>{isRTL ? 'الإجراءات المتخذة' : 'Actions Taken'}</Label>
                            <Textarea
                                placeholder={isRTL ? 'صف الإجراءات المتخذة...' : 'Describe actions taken...'}
                                value={visitCompletionForm.actionsTaken}
                                onChange={(e) => setVisitCompletionForm({ ...visitCompletionForm, actionsTaken: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label>{isRTL ? 'الأجزاء المستخدمة' : 'Parts Used'}</Label>
                            <Textarea
                                placeholder={isRTL ? 'اذكر الأجزاء المستخدمة...' : 'List parts used...'}
                                value={visitCompletionForm.partsUsed}
                                onChange={(e) => setVisitCompletionForm({ ...visitCompletionForm, partsUsed: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>{isRTL ? 'رسوم الخدمة' : 'Service Fee'}</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={visitCompletionForm.serviceFee || ''}
                                    onChange={(e) => setVisitCompletionForm({ ...visitCompletionForm, serviceFee: parseFloat(e.target.value) || undefined })}
                                />
                            </div>
                            <div>
                                <Label>{isRTL ? 'النتيجة' : 'Outcome'}</Label>
                                <Select
                                    value={visitCompletionForm.outcome}
                                    onValueChange={(value) => setVisitCompletionForm({ ...visitCompletionForm, outcome: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Completed">{isRTL ? 'مكتمل' : 'Completed'}</SelectItem>
                                        <SelectItem value="NeedsSecondVisit">{isRTL ? 'يحتاج زيارة ثانية' : 'Needs Second Visit'}</SelectItem>
                                        <SelectItem value="NeedsSparePart">{isRTL ? 'يحتاج قطعة غيار' : 'Needs Spare Part'}</SelectItem>
                                        <SelectItem value="CannotComplete">{isRTL ? 'لا يمكن إكماله' : 'Cannot Complete'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
                            <Textarea
                                placeholder={isRTL ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
                                value={visitCompletionForm.notes}
                                onChange={(e) => setVisitCompletionForm({ ...visitCompletionForm, notes: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCompleteVisitDialog(false);
                                    resetForm();
                                }}
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </Button>
                            <Button
                                onClick={handleCompleteVisit}
                                disabled={completeVisitMutation.isPending}
                            >
                                {completeVisitMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                {isRTL ? 'إكمال الزيارة' : 'Complete Visit'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Action Buttons */}
            {selectedVisit && (
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
            )}
        </div>
    );
};

export default EnhancedClientEquipmentVisitsPage;
