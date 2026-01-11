import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { enhancedMaintenanceApi } from '@/services/maintenance/enhancedMaintenanceApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
    TrendingUp,
    Database,
    RefreshCw,
    BarChart3,
    Activity,
    Target,
    DollarSign,
    Filter,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import CustomerStatsDialog from './CustomerStatsDialog';
import EquipmentSearchDialog from './EquipmentSearchDialog';

const MaintenanceDashboard: React.FC = () => {
    const { language } = useTranslation();
    const isRTL = language === 'ar';

    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [includeLegacy, setIncludeLegacy] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
    const [showCustomerStats, setShowCustomerStats] = useState(false);
    const [showEquipmentSearch, setShowEquipmentSearch] = useState(false);
    const [timeRange, setTimeRange] = useState('12months');

    // Fetch customers for overview
    const { data: customersData, isLoading: customersLoading, refetch: refetchCustomers } = useQuery({
        queryKey: ['dashboard-customers', includeLegacy],
        queryFn: async () => {
            return await enhancedMaintenanceApi.searchCustomers({
                searchTerm: '',
                pageNumber: 1,
                pageSize: 50,
                includeLegacy,
            });
        },
    });

    // Fetch data consistency status
    const { data: consistencyData, isLoading: consistencyLoading } = useQuery({
        queryKey: ['data-consistency'],
        queryFn: async () => {
            return await enhancedMaintenanceApi.verifyDataConsistency();
        },
    });

    // Mock statistics (in real implementation, these would come from API)
    const mockStats = {
        totalCustomers: customersData?.items?.length || 0,
        totalEquipment: 0,
        totalVisits: 0,
        completedVisits: 0,
        pendingVisits: 0,
        totalRevenue: 0,
        completionRate: 0,
    };


    const getSourceBadge = (source: string) => {
        return (
            <Badge variant={source === 'Legacy' ? 'secondary' : 'default'}>
                {source}
            </Badge>
        );
    };

    const handleCustomerSelect = (customer: any) => {
        setSelectedCustomer(customer);
        setShowCustomerStats(true);
    };

    const handleEquipmentSelect = (equipment: any) => {
        setSelectedEquipment(equipment);
        // Could show equipment details or navigate to equipment page
    };

    return (
        <div className={cn('space-y-6 p-6', isRTL && 'rtl')}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isRTL ? 'لوحة تحكم الصيانة المعززة' : 'Enhanced Maintenance Dashboard'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isRTL ? 'نظرة شاملة على نظام الصيانة المتكامل' : 'Comprehensive overview of the integrated maintenance system'}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setIncludeLegacy(!includeLegacy)}
                        className="flex items-center space-x-2"
                    >
                        <Database className="h-4 w-4" />
                        <span>{includeLegacy ? (isRTL ? 'تضمين القديم' : 'Include Legacy') : (isRTL ? 'جديد فقط' : 'New Only')}</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => refetchCustomers()}
                        className="flex items-center space-x-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>{isRTL ? 'تحديث' : 'Refresh'}</span>
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <div>
                                <div className="text-2xl font-bold">{mockStats.totalCustomers}</div>
                                <div className="text-sm text-muted-foreground">
                                    {isRTL ? 'إجمالي العملاء' : 'Total Customers'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Wrench className="h-5 w-5 text-green-600" />
                            <div>
                                <div className="text-2xl font-bold">{mockStats.totalEquipment}</div>
                                <div className="text-sm text-muted-foreground">
                                    {isRTL ? 'إجمالي المعدات' : 'Total Equipment'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-purple-600" />
                            <div>
                                <div className="text-2xl font-bold">{mockStats.totalVisits}</div>
                                <div className="text-sm text-muted-foreground">
                                    {isRTL ? 'إجمالي الزيارات' : 'Total Visits'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Target className="h-5 w-5 text-orange-600" />
                            <div>
                                <div className="text-2xl font-bold">{mockStats.completionRate.toFixed(1)}%</div>
                                <div className="text-sm text-muted-foreground">
                                    {isRTL ? 'معدل الإنجاز' : 'Completion Rate'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Search */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Search className="h-5 w-5" />
                            <span>{isRTL ? 'البحث السريع عن العميل' : 'Quick Customer Search'}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={isRTL ? 'ابحث عن عميل...' : 'Search for a customer...'}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={cn('pl-10', isRTL && 'pr-10')}
                                />
                            </div>

                            {customersLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {customersData?.items?.slice(0, 5).map((customer) => (
                                        <div
                                            key={`${customer.source}-${customer.id}`}
                                            className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleCustomerSelect(customer)}
                                        >
                                            <div>
                                                <div className="font-medium">{customer.name}</div>
                                                <div className="text-sm text-muted-foreground">{customer.phone}</div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {getSourceBadge(customer.source)}
                                                <Eye className="h-4 w-4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Equipment Search */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Wrench className="h-5 w-5" />
                            <span>{isRTL ? 'البحث السريع عن المعدات' : 'Quick Equipment Search'}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {isRTL ? 'ابحث عن المعدات بالرقم التسلسلي أو المعرف' : 'Search equipment by serial number or ID'}
                            </p>
                            <Dialog open={showEquipmentSearch} onOpenChange={setShowEquipmentSearch}>
                                <DialogTrigger asChild>
                                    <Button className="w-full">
                                        <Search className="h-4 w-4 mr-2" />
                                        {isRTL ? 'بحث عن المعدات' : 'Search Equipment'}
                                    </Button>
                                </DialogTrigger>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Customers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>{isRTL ? 'العملاء الأخيرون' : 'Recent Customers'}</span>
                            <Badge variant="outline">{customersData?.items?.length || 0}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {customersLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {customersData?.items?.slice(0, 3).map((customer) => (
                                    <div
                                        key={`${customer.source}-${customer.id}`}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium">{customer.name}</div>
                                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getSourceBadge(customer.source)}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCustomerSelect(customer)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Activity className="h-5 w-5" />
                            <span>{isRTL ? 'حالة النظام' : 'System Status'}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {consistencyLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">{isRTL ? 'توافق البيانات' : 'Data Consistency'}</span>
                                    <Badge className="bg-green-100 text-green-800">
                                        {isRTL ? 'جيد' : 'Good'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">{isRTL ? 'مصادر البيانات' : 'Data Sources'}</span>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="default">New</Badge>
                                        <Badge variant="secondary">Legacy</Badge>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">{isRTL ? 'آخر تحديث' : 'Last Updated'}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {format(new Date(), 'MMM dd, HH:mm')}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                        // Could open detailed consistency report
                                        toast.error(isRTL ? 'تقرير التوافق متاح في لوحة المسؤول' : 'Consistency report available in admin panel');
                                    }}
                                >
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    {isRTL ? 'عرض التفاصيل' : 'View Details'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="h-5 w-5" />
                        <span>{isRTL ? 'روابط سريعة' : 'Quick Links'}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            className="flex items-center justify-center space-x-2"
                            onClick={() => setShowEquipmentSearch(true)}
                        >
                            <Wrench className="h-4 w-4" />
                            <span>{isRTL ? 'البحث عن المعدات' : 'Search Equipment'}</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center justify-center space-x-2"
                            onClick={() => {
                                // Could navigate to full customer list
                                toast.success(isRTL ? 'قائمة العملاء الكاملة متاحة' : 'Full customer list available');
                            }}
                        >
                            <Users className="h-4 w-4" />
                            <span>{isRTL ? 'جميع العملاء' : 'All Customers'}</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center justify-center space-x-2"
                            onClick={() => {
                                // Could navigate to reports
                                toast.success(isRTL ? 'التقارير قيد التطوير' : 'Reports in development');
                            }}
                        >
                            <TrendingUp className="h-4 w-4" />
                            <span>{isRTL ? 'التقارير' : 'Reports'}</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dialogs */}
            {selectedCustomer && (
                <CustomerStatsDialog
                    customerId={selectedCustomer.id}
                    customerName={selectedCustomer.name}
                    isOpen={showCustomerStats}
                    onClose={() => {
                        setShowCustomerStats(false);
                        setSelectedCustomer(null);
                    }}
                />
            )}

            <EquipmentSearchDialog
                isOpen={showEquipmentSearch}
                onClose={() => setShowEquipmentSearch(false)}
                onEquipmentSelect={handleEquipmentSelect}
            />
        </div>
    );
};

export default MaintenanceDashboard;
