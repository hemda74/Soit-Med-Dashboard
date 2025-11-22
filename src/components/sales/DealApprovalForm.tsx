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
import { useTranslation } from '@/hooks/useTranslation';

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
	const { t } = useTranslation();

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
            // Note: SalesManager approval step has been removed - deals go directly to SuperAdmin
            if (user?.roles.includes('SuperAdmin') && deal.status === 'PendingSuperAdminApproval') {
                await salesApi.superAdminApproval(deal.id, approvalData);
			} else {
				throw new Error(t('dealApprovalForm.errors.invalidAction') || 'You do not have permission to approve this deal');
			}
            
            onSuccess?.();
        } catch (error) {
			console.error(t('dealApprovalForm.errors.approveFailed'), error);
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

	const getStatusLabel = (status: string) => {
		const key = `dealApprovalForm.statusLabels.${status}`;
		const translated = t(key);
		return translated === key ? status.replace(/([A-Z])/g, ' $1').trim() : translated;
	};

    const canApprove = () => {
        if (!user) return false;

        // SuperAdmin can approve any deal
        if (user.roles.includes('SuperAdmin')) {
            return deal.status === 'PendingSuperAdminApproval';
        }

        // Note: SalesManager approval step has been removed - deals go directly to SuperAdmin
        // SalesManager can no longer approve deals

        return false;
    };

    if (!canApprove()) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="pt-6">
					<div className="text-center text-muted-foreground">
						<AlertCircle className="h-12 w-12 mx-auto mb-4" />
						<p>{t('dealApprovalForm.noPermission')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{t('dealApprovalForm.title')}
					<Badge className={getStatusColor(deal.status)}>
						{getStatusIcon(deal.status)}
						<span className="ml-1">{getStatusLabel(deal.status)}</span>
					</Badge>
				</CardTitle>
			</CardHeader>
            <CardContent className="space-y-6">
                {/* Deal Information */}
                <div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium text-muted-foreground">{t('dealApprovalForm.info.client')}</label>
							<p className="text-sm">{deal.clientName}</p>
						</div>
						<div>
							<label className="text-sm font-medium text-muted-foreground">{t('dealApprovalForm.info.dealValue')}</label>
							<p className="text-sm font-semibold">EGP {deal.dealValue.toLocaleString()}</p>
						</div>
					</div>
					<div>
						<label className="text-sm font-medium text-muted-foreground">{t('dealApprovalForm.info.description')}</label>
						<p className="text-sm">{deal.dealDescription}</p>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium text-muted-foreground">{t('dealApprovalForm.info.expectedCloseDate')}</label>
							<p className="text-sm">
								{deal.expectedCloseDate && !isNaN(new Date(deal.expectedCloseDate).getTime())
									? format(new Date(deal.expectedCloseDate), 'PPP')
									: t('dealApprovalForm.info.notSpecified')}
							</p>
						</div>
						<div>
							<label className="text-sm font-medium text-muted-foreground">{t('dealApprovalForm.info.created')}</label>
							<p className="text-sm">
								{deal.createdAt && !isNaN(new Date(deal.createdAt).getTime())
									? format(new Date(deal.createdAt), 'PPP')
									: t('dealApprovalForm.info.notAvailable')}
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
									<FormLabel>{t('dealApprovalForm.form.notesLabel')}</FormLabel>
                                    <FormControl>
                                        <Textarea
											placeholder={t('dealApprovalForm.form.notesPlaceholder')}
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
											<FormLabel>{t('dealApprovalForm.form.superAdminLabel')}</FormLabel>
											<p className="text-sm text-muted-foreground">
												{t('dealApprovalForm.form.superAdminDescription')}
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
									{t('cancel')}
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
								{t('dealApprovalForm.actions.reject')}
                            </Button>
                            <Button
                                type="submit"
                                onClick={() => setAction('approve')}
                                disabled={isSubmitting || action === 'reject'}
                                className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
							>
                                <CheckCircle className="h-4 w-4 mr-2" />
								{isSubmitting
									? t('dealApprovalForm.actions.processing')
									: t('dealApprovalForm.actions.approve')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}


