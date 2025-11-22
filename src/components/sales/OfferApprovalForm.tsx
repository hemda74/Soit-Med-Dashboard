// Offer Approval Form Component - SalesManager approves/rejects offers

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { salesApi } from '@/services/sales/salesApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';

// Validation schema for offer approval
const approvalSchema = z.object({
    comments: z.string().optional(),
    rejectionReason: z.string().optional(),
}).refine((data) => {
    // If rejecting, rejectionReason is required
    return true; // We'll handle this in the submit handler
}, {
    message: 'Rejection reason is required when rejecting',
});

type ApprovalFormValues = z.infer<typeof approvalSchema>;

interface Offer {
    id: string;
    clientId: string;
    clientName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    createdBy: string;
    createdByName: string;
    products?: string;
    assignedTo?: string;
    assignedToName?: string;
}

interface OfferApprovalFormProps {
    offer: Offer;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function OfferApprovalForm({ offer, onSuccess, onCancel }: OfferApprovalFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const { t } = useTranslation();

    const form = useForm<ApprovalFormValues>({
        resolver: zodResolver(approvalSchema),
        defaultValues: {
            comments: '',
            rejectionReason: '',
        },
    });

    const onSubmit = async (data: ApprovalFormValues) => {
        if (!action) return;

        if (action === 'reject' && !data.rejectionReason?.trim()) {
            toast.error('Rejection reason is required when rejecting an offer');
            return;
        }

        setIsSubmitting(true);
        try {
            const approvalData = {
                approved: action === 'approve',
                comments: data.comments,
                rejectionReason: action === 'reject' ? data.rejectionReason : undefined,
            };

            await salesApi.salesManagerApproval(offer.id, approvalData);
            toast.success(action === 'approve' ? 'Offer approved successfully' : 'Offer rejected');
            onSuccess?.();
        } catch (error: any) {
            console.error('Failed to process offer approval:', error);
            toast.error(error.message || 'Failed to process offer approval');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PendingSalesManagerApproval':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'Sent':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'Rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PendingSalesManagerApproval':
                return <AlertCircle className="h-4 w-4" />;
            case 'Sent':
                return <CheckCircle className="h-4 w-4" />;
            case 'Rejected':
                return <XCircle className="h-4 w-4" />;
            default:
                return null;
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Review Offer
                    <Badge className={getStatusColor(offer.status)}>
                        {getStatusIcon(offer.status)}
                        <span className="ml-1">{offer.status}</span>
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Offer Information */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Client</label>
                            <p className="text-sm font-semibold">{offer.clientName}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                EGP {offer.totalAmount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    {offer.assignedToName && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                            <p className="text-sm">{offer.assignedToName}</p>
                        </div>
                    )}
                    {offer.products && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Products</label>
                            <p className="text-sm">{offer.products}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Created By</label>
                            <p className="text-sm">{offer.createdByName || 'SalesSupport'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Created</label>
                            <p className="text-sm">
                                {offer.createdAt && !isNaN(new Date(offer.createdAt).getTime())
                                    ? format(new Date(offer.createdAt), 'PPP')
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Approval Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {action === 'reject' && (
                            <FormField
                                control={form.control}
                                name="rejectionReason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rejection Reason *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Please provide a reason for rejection (e.g., Pricing, Terms, Other)"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="comments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comments {action === 'approve' ? '(Optional)' : ''}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={action === 'approve' 
                                                ? 'Add any comments or notes about this approval...'
                                                : 'Add any additional comments...'}
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2">
                            {onCancel && (
                                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
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
                                Reject
                            </Button>
                            <Button
                                type="submit"
                                onClick={() => setAction('approve')}
                                disabled={isSubmitting || action === 'reject'}
                                className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {isSubmitting ? 'Processing...' : 'Approve'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

