// Deal Approval Form Component - Approve or reject deals according to business logic

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import { salesApi } from '@/services/sales/salesApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Deal, DealApprovalDto } from '@/types/sales.types';

// Validation schema for deal approval
const approvalSchema = z.object({
    notes: z.string().optional(),
    superAdminRequired: z.boolean().optional(),
});

type ApprovalFormValues = z.infer<typeof approvalSchema>;

interface DealApprovalFormProps {
    deal: Deal;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function DealApprovalForm({ deal, onSuccess, onCancel }: DealApprovalFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const { user } = useAuthStore();
    const { approveDeal } = useSalesStore();

    const form = useForm<ApprovalFormValues>({
        resolver: zodResolver(approvalSchema),
        defaultValues: {
            notes: '',
            superAdminRequired: false,
        },
    });

    const onSubmit = async (data: ApprovalFormValues) => {
        if (!action) return;

        setIsSubmitting(true);
        try {
            const approvalData: DealApprovalDto = {
                approved: action === 'approve',
                notes: data.notes,
                superAdminRequired: action === 'approve' ? data.superAdminRequired : undefined,
            };

            // Use correct endpoint based on user role and deal status
            if (user?.roles.includes('SuperAdmin') && deal.status === 'PendingSuperAdminApproval') {
                await salesApi.superAdminApproval(deal.id, approvalData);
            } else if (user?.roles.includes('SalesManager') && deal.status === 'PendingManagerApproval') {
                await approveDeal(deal.id, approvalData);
            } else {
                throw new Error('Invalid approval action');
            }
            
            onSuccess?.();
        } catch (error) {
            console.error('Error approving deal:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PendingManagerApproval':
                return 'bg-yellow-100 text-yellow-800';
            case 'PendingSuperAdminApproval':
                return 'bg-blue-100 text-blue-800';
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PendingManagerApproval':
                return <AlertCircle className="h-4 w-4" />;
            case 'PendingSuperAdminApproval':
                return <AlertCircle className="h-4 w-4" />;
            case 'Approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'Rejected':
                return <XCircle className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const canApprove = () => {
        if (!user) return false;

        // SuperAdmin can approve any deal
        if (user.roles.includes('SuperAdmin')) {
            return deal.status === 'PendingSuperAdminApproval';
        }

        // SalesManager can approve deals pending manager approval
        if (user.roles.includes('SalesManager')) {
            return deal.status === 'PendingManagerApproval';
        }

        return false;
    };

    if (!canApprove()) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                        <p>You don't have permission to approve this deal.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Deal Approval
                    <Badge className={getStatusColor(deal.status)}>
                        {getStatusIcon(deal.status)}
                        <span className="ml-1">{deal.status.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Deal Information */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Client</label>
                            <p className="text-sm">{deal.clientName}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Deal Value</label>
                            <p className="text-sm font-semibold">EGP {deal.dealValue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <p className="text-sm">{deal.dealDescription}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Expected Close Date</label>
                            <p className="text-sm">
                                {deal.expectedCloseDate && !isNaN(new Date(deal.expectedCloseDate).getTime())
                                    ? format(new Date(deal.expectedCloseDate), 'PPP')
                                    : 'Not specified'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Created</label>
                            <p className="text-sm">
                                {deal.createdAt && !isNaN(new Date(deal.createdAt).getTime())
                                    ? format(new Date(deal.createdAt), 'PPP')
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Approval Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any notes or comments..."
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {action === 'approve' && (
                            <FormField
                                control={form.control}
                                name="superAdminRequired"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Require SuperAdmin approval</FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                Check this if the deal requires additional SuperAdmin approval
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2">
                            {onCancel && (
                                <Button type="button" variant="outline" onClick={onCancel}>
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setAction('reject')}
                                disabled={isSubmitting || action === 'approve'}
                                className={action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Deal
                            </Button>
                            <Button
                                type="submit"
                                onClick={() => setAction('approve')}
                                disabled={isSubmitting || action === 'reject'}
                                className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {isSubmitting ? 'Processing...' : 'Approve Deal'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}


