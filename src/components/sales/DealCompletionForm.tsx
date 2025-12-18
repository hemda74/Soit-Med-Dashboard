// Deal Completion Form Component - Complete or fail deals according to business logic

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Deal, DealCompletionDto, DealFailureDto } from '@/types/sales.types';

// Validation schemas for deal completion
const completionSchema = z.object({
    completionNotes: z.string().min(10, 'Completion notes must be at least 10 characters').max(500, 'Completion notes must be less than 500 characters'),
});

const failureSchema = z.object({
    failureReason: z.string().min(5, 'Failure reason must be at least 5 characters').max(200, 'Failure reason must be less than 200 characters'),
    failureNotes: z.string().min(10, 'Failure notes must be at least 10 characters').max(500, 'Failure notes must be less than 500 characters'),
});

type CompletionFormValues = z.infer<typeof completionSchema>;
type FailureFormValues = z.infer<typeof failureSchema>;

interface DealCompletionFormProps {
    deal: Deal;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function DealCompletionForm({ deal, onSuccess, onCancel }: DealCompletionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [action, setAction] = useState<'complete' | 'fail' | null>(null);
    const { user } = useAuthStore();
    const { completeDeal, failDeal } = useSalesStore();

    const completionForm = useForm<CompletionFormValues>({
        resolver: zodResolver(completionSchema),
        defaultValues: {
            completionNotes: '',
        },
    });

    const failureForm = useForm<FailureFormValues>({
        resolver: zodResolver(failureSchema),
        defaultValues: {
            failureReason: '',
            failureNotes: '',
        },
    });

    const onSubmitCompletion = async (data: CompletionFormValues) => {
        setIsSubmitting(true);
        try {
            const completionData: DealCompletionDto = {
                completionNotes: data.completionNotes,
            };

            await completeDeal(deal.id, completionData);
            onSuccess?.();
        } catch (error) {
            console.error('Error completing deal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmitFailure = async (data: FailureFormValues) => {
        setIsSubmitting(true);
        try {
            const failureData: DealFailureDto = {
                failureReason: data.failureReason,
                failureNotes: data.failureNotes,
            };

            await failDeal(deal.id, failureData);
            onSuccess?.();
        } catch (error) {
            console.error('Error failing deal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Success':
                return 'bg-green-100 text-green-800';
            case 'Failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const canComplete = () => {
        if (!user) return false;

        // Only approved deals can be completed
        if (deal.status !== 'Approved') return false;

        // SuperAdmin can complete any deal
        if (user.roles.includes('SuperAdmin')) return true;

        // SalesManager can complete team deals
        if (user.roles.includes('SalesManager')) return true;

        // SalesMan can complete their own deals
        if (user.roles.includes('SalesMan')) {
            return deal.createdBy === user.id;
        }

        return false;
    };

    if (!canComplete()) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                        <p>This deal cannot be completed at this time.</p>
                        <p className="text-sm">Deal must be approved and you must have permission to complete it.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Deal Completion
                    <Badge className={getStatusColor(deal.status)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {deal.status}
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
                            <p className="text-sm">{format(new Date(deal.expectedCloseDate), 'PPP')}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Created</label>
                            <p className="text-sm">{format(new Date(deal.createdAt), 'PPP')}</p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Action Selection */}
                <div className="space-y-4">
                    <div className="flex space-x-4">
                        <Button
                            type="button"
                            variant={action === 'complete' ? 'default' : 'outline'}
                            onClick={() => setAction('complete')}
                            className="flex-1"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Successful
                        </Button>
                        <Button
                            type="button"
                            variant={action === 'fail' ? 'destructive' : 'outline'}
                            onClick={() => setAction('fail')}
                            className="flex-1"
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Mark as Failed
                        </Button>
                    </div>
                </div>

                {/* Completion Form */}
                {action === 'complete' && (
                    <Form {...completionForm}>
                        <form onSubmit={completionForm.handleSubmit(onSubmitCompletion)} className="space-y-6">
                            <FormField
                                control={completionForm.control}
                                name="completionNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Completion Notes *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the successful completion of this deal..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2">
                                {onCancel && (
                                    <Button type="button" variant="outline" onClick={onCancel}>
                                        Cancel
                                    </Button>
                                )}
                                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {isSubmitting ? 'Completing...' : 'Complete Deal'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}

                {/* Failure Form */}
                {action === 'fail' && (
                    <Form {...failureForm}>
                        <form onSubmit={failureForm.handleSubmit(onSubmitFailure)} className="space-y-6">
                            <FormField
                                control={failureForm.control}
                                name="failureReason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Failure Reason *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Brief reason for deal failure..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={failureForm.control}
                                name="failureNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Failure Notes *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Detailed notes about why the deal failed..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2">
                                {onCancel && (
                                    <Button type="button" variant="outline" onClick={onCancel}>
                                        Cancel
                                    </Button>
                                )}
                                <Button type="submit" disabled={isSubmitting} variant="destructive">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    {isSubmitting ? 'Marking as Failed...' : 'Mark as Failed'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
}

