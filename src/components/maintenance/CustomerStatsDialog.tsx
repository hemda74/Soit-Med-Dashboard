import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { enhancedMaintenanceApi, type CustomerVisitStats } from '@/services/maintenance/enhancedMaintenanceApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    TrendingUp,
    Users,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    DollarSign,
    Target,
    Loader2,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface CustomerStatsDialogProps {
    customerId: string;
    customerName: string;
    isOpen: boolean;
    onClose: () => void;
}

const CustomerStatsDialog: React.FC<CustomerStatsDialogProps> = ({
    customerId,
    customerName,
    isOpen,
    onClose,
}) => {
    const { language } = useTranslation();
    const isRTL = language === 'ar';

    const [months, setMonths] = React.useState(12);

    // Fetch customer statistics
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['customer-stats', customerId, months],
        queryFn: async () => {
            return await enhancedMaintenanceApi.getCustomerStatistics(customerId, months);
        },
        enabled: isOpen && !!customerId,
    });

    const getCompletionRateColor = (rate: number) => {
        if (rate >= 90) return 'text-green-600';
        if (rate >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getCompletionRateBadge = (rate: number) => {
        if (rate >= 90) return 'bg-green-100 text-green-800';
        if (rate >= 70) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>
                            {isRTL ? 'إحصائيات العميل' : 'Customer Statistics'} - {customerName}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Period Selection */}
                    <div className="flex items-center space-x-4">
                        <Label>{isRTL ? 'الفترة' : 'Period'}:</Label>
                        <select
                            value={months}
                            onChange={(e) => setMonths(Number(e.target.value))}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value={3}>{isRTL ? '3 أشهر' : '3 Months'}</option>
                            <option value={6}>{isRTL ? '6 أشهر' : '6 Months'}</option>
                            <option value={12}>{isRTL ? '12 شهر' : '12 Months'}</option>
                            <option value={24}>{isRTL ? '24 شهر' : '24 Months'}</option>
                        </select>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600">
                            {isRTL ? 'حدث خطأ في تحميل الإحصائيات' : 'Error loading statistics'}
                        </div>
                    ) : stats ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <div className="text-2xl font-bold">{stats.totalVisits}</div>
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
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <div>
                                                <div className="text-2xl font-bold">{stats.completedVisits}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {isRTL ? 'مكتملة' : 'Completed'}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-5 w-5 text-yellow-600" />
                                            <div>
                                                <div className="text-2xl font-bold">{stats.pendingVisits}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {isRTL ? 'قيد الانتظار' : 'Pending'}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="h-5 w-5 text-purple-600" />
                                            <div>
                                                <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {isRTL ? 'الإيرادات' : 'Revenue'}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Completion Rate */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Target className="h-5 w-5" />
                                            <span className="font-medium">
                                                {isRTL ? 'معدل الإنجاز' : 'Completion Rate'}
                                            </span>
                                        </div>
                                        <Badge className={getCompletionRateBadge(stats.completionRate)}>
                                            {stats.completionRate.toFixed(1)}%
                                        </Badge>
                                    </div>
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={cn(
                                                    'h-2 rounded-full transition-all duration-300',
                                                    stats.completionRate >= 90
                                                        ? 'bg-green-600'
                                                        : stats.completionRate >= 70
                                                            ? 'bg-yellow-600'
                                                            : 'bg-red-600'
                                                )}
                                                style={{ width: `${stats.completionRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            {isRTL ? 'توزيع الحالة' : 'Status Breakdown'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span>{isRTL ? 'مكتمل' : 'Completed'}</span>
                                                </div>
                                                <span className="font-medium">{stats.completedVisits}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-4 w-4 text-yellow-600" />
                                                    <span>{isRTL ? 'قيد الانتظار' : 'Pending'}</span>
                                                </div>
                                                <span className="font-medium">{stats.pendingVisits}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                    <span>{isRTL ? 'ملغاة' : 'Cancelled'}</span>
                                                </div>
                                                <span className="font-medium">{stats.cancelledVisits}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            {isRTL ? 'معلومات الفترة' : 'Period Information'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    {isRTL ? 'من' : 'From'}:
                                                </span>
                                                <span>{format(new Date(stats.startDate), 'MMM dd, yyyy')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    {isRTL ? 'إلى' : 'To'}:
                                                </span>
                                                <span>{format(new Date(stats.endDate), 'MMM dd, yyyy')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    {isRTL ? 'متوسط الإيراد للزيارة' : 'Avg Revenue per Visit'}:
                                                </span>
                                                <span className="font-medium">
                                                    ${stats.totalVisits > 0 ? (stats.totalRevenue / stats.totalVisits).toFixed(2) : '0.00'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : null}

                    <div className="flex justify-end">
                        <Button onClick={onClose}>
                            {isRTL ? 'إغلاق' : 'Close'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerStatsDialog;
