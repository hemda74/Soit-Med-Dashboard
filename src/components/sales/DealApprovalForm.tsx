// Deal Approval Form Component - Approve or reject deals according to business logic

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { salesApi } from '@/services/sales/salesApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Building2, DollarSign, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import type { Deal, DealApprovalDto } from '@/types/sales.types';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';

// Validation schema for deal approval
const approvalSchema = z.object({
    notes: z.string().optional(),
    superAdminRequired: z.boolean().optional(),
    rejectionReason: z.string().optional(),
});

type ApprovalFormValues = z.infer<typeof approvalSchema>;

// Rejection reason options matching backend constants
const REJECTION_REASONS = [
    { value: 'Money', label: 'Money' },
    { value: 'CashFlow', label: 'Cash Flow' },
    { value: 'OtherNeeds', label: 'Other Needs' },
] as const;

interface DealApprovalFormProps {
    deal: Deal;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function DealApprovalForm({ deal, onSuccess, onCancel }: DealApprovalFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const { user } = useAuthStore();
    const { t } = useTranslation();

    const form = useForm<ApprovalFormValues>({
        resolver: zodResolver(approvalSchema),
        defaultValues: {
            notes: '',
            superAdminRequired: false,
            rejectionReason: '',
        },
    });

    const onSubmit = async (data: ApprovalFormValues) => {
        if (!action) return;

        // Validate rejection reason when rejecting
        if (action === 'reject' && !data.rejectionReason?.trim()) {
            form.setError('rejectionReason', {
                type: 'manual',
                message: 'Rejection reason is required when rejecting a deal',
            });
            toast.error('Please select a rejection reason');
            return;
        }

        setIsSubmitting(true);
        try {
            const approvalData: DealApprovalDto = {
                approved: action === 'approve',
                notes: data.notes,
                superAdminRequired: action === 'approve' ? data.superAdminRequired : undefined,
                rejectionReason: action === 'reject' ? data.rejectionReason : undefined,
            };

            if (user?.roles.includes('SuperAdmin') &&
                (deal.status === 'PendingSuperAdminApproval' || deal.status === 'PendingManagerApproval')) {
                await salesApi.superAdminApproval(deal.id, approvalData);
                toast.success(action === 'approve' ? 'Deal approved successfully' : 'Deal rejected successfully');
                onSuccess?.();
            } else {
                throw new Error(t('dealApprovalForm.errors.invalidAction') || 'You do not have permission to approve this deal');
            }
        } catch (error: any) {
            console.error('Approval error:', error);
            toast.error(error?.message || 'Failed to process approval');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = () => {
        const statusConfig = {
            'PendingManagerApproval': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending Manager Approval' },
            'PendingSuperAdminApproval': { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Pending Super Admin Approval' },
            'Approved': { color: 'bg-green-100 text-green-800 border-green-300', label: 'Approved' },
            'Rejected': { color: 'bg-red-100 text-red-800 border-red-300', label: 'Rejected' },
        };
        const config = statusConfig[deal.status as keyof typeof statusConfig] || statusConfig['PendingSuperAdminApproval'];
        return (
            <Badge className={`${config.color} border`}>
                {config.label}
            </Badge>
        );
    };

    const canApprove = () => {
        if (!user) return false;
        if (user.roles.includes('SuperAdmin')) {
            return deal.status === 'PendingSuperAdminApproval' || deal.status === 'PendingManagerApproval';
        }
        return false;
    };

    if (!canApprove()) {
        return (
            <Card className="border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                        <p className="text-lg font-medium mb-2">You don't have permission to approve this deal.</p>
                        <p className="text-sm">Please contact your Administrator if you believe this is an error.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Deal Information Card */}
            <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Deal #{deal.id}
                            </h3>
                            {getStatusBadge()}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Client Info */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Client</p>
                                <p className="text-base font-semibold text-gray-900 dark:text-white">{deal.clientName}</p>
                            </div>
                        </div>

                        {/* Deal Value */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Deal Value</p>
                                <p className="text-base font-bold text-green-600 dark:text-green-400">
                                    EGP {deal.dealValue.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Expected Close Date */}
                        {deal.expectedCloseDate && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Expected Close Date</p>
                                    <p className="text-base text-gray-900 dark:text-white">
                                        {format(new Date(deal.expectedCloseDate), 'PPP')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Created By */}
                        {deal.createdByName && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Created By</p>
                                    <p className="text-base text-gray-900 dark:text-white">{deal.createdByName}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {deal.dealDescription && (
                        <div className="mt-6 pt-6 border-t">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {deal.dealDescription}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Approval Form Card */}
            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Action Selection */}
                            {!action && (
                                <div className="space-y-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                                        Choose an action:
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            type="button"
                                            onClick={() => setAction('approve')}
                                            className="h-20 bg-green-600 hover:bg-green-700 text-white"
                                            variant="default"
                                        >
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            <div className="text-left">
                                                <div className="font-semibold">Approve</div>
                                                <div className="text-xs opacity-90">Approve this deal</div>
                                            </div>
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => setAction('reject')}
                                            className="h-20 bg-red-600 hover:bg-red-700 text-white"
                                            variant="destructive"
                                        >
                                            <XCircle className="h-5 w-5 mr-2" />
                                            <div className="text-left">
                                                <div className="font-semibold">Reject</div>
                                                <div className="text-xs opacity-90">Reject this deal</div>
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason - Show when reject is selected */}
                            {action === 'reject' && (
                                <FormField
                                    control={form.control}
                                    name="rejectionReason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">
                                                Rejection Reason <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Select a rejection reason" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {REJECTION_REASONS.map((reason) => (
                                                        <SelectItem key={reason.value} value={reason.value}>
                                                            {reason.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Notes - Show when action is selected */}
                            {action && (
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">
                                                {action === 'approve' ? 'Approval Notes' : 'Rejection Notes'} (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={action === 'approve'
                                                        ? 'Add any additional notes about this approval...'
                                                        : 'Add any additional notes about this rejection...'}
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Super Admin Required - Only for approval */}
                            {action === 'approve' && (
                                <FormField
                                    control={form.control}
                                    name="superAdminRequired"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="cursor-pointer">
                                                    Super Admin Required
                                                </FormLabel>
                                                <p className="text-sm text-muted-foreground">
                                                    Mark if this deal requires additional super Admin review
                                                </p>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Action Buttons */}
                            {action && (
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setAction(null);
                                            form.reset();
                                            onCancel?.();
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant={action === 'approve' ? 'default' : 'destructive'}
                                        disabled={isSubmitting}
                                        className={action === 'approve'
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-red-600 hover:bg-red-700 text-white'}
                                    >
                                        {isSubmitting ? (
                                            <>Processing...</>
                                        ) : (
                                            <>
                                                {action === 'approve' ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Approve Deal
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Reject Deal
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
