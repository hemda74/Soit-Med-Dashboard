import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, FileText, X } from 'lucide-react';
import type { CreateSalesReportDto } from '@/types/salesReport.types';

const createReportSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    body: z.string().min(1, 'Body is required').max(2000, 'Body must be less than 2000 characters'),
    type: z.enum(['daily', 'weekly'], {
        required_error: 'Please select a report type',
    }),
    reportDate: z.string().min(1, 'Report date is required'),
});

type CreateReportFormData = z.infer<typeof createReportSchema>;

interface CreateSalesReportModalProps {
    onClose: () => void;
    onSubmit: (data: CreateSalesReportDto) => Promise<boolean>;
}

const CreateSalesReportModal: React.FC<CreateSalesReportModalProps> = ({
    onClose,
    onSubmit,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CreateReportFormData>({
        resolver: zodResolver(createReportSchema),
        defaultValues: {
            title: '',
            body: '',
            type: 'daily',
            reportDate: new Date().toISOString().split('T')[0], // Today's date
        },
    });

    const watchedType = watch('type');

    const handleFormSubmit = async (data: CreateReportFormData) => {
        setIsSubmitting(true);

        try {
            // Validate that report date is not in the future
            const reportDate = new Date(data.reportDate);
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today

            if (reportDate > today) {
                throw new Error('Report date cannot be in the future');
            }

            const success = await onSubmit(data);
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Error creating report:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getReportTypeDescription = (type: string) => {
        switch (type) {
            case 'daily':
                return 'Daily sales performance and activities';
            case 'weekly':
                return 'Weekly sales summary and achievements';
            case 'monthly':
                return 'Monthly sales analysis and targets';
            case 'custom':
                return 'Custom period sales report';
            default:
                return '';
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Create Sales Report
                    </DialogTitle>
                    <DialogDescription>
                        Create a new sales report to track your performance and activities.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Report Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type">Report Type *</Label>
                        <Select
                            value={watchedType}
                            onValueChange={(value) => setValue('type', value as any)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily Report</SelectItem>
                                <SelectItem value="weekly">Weekly Report</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.type.message}
                            </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getReportTypeDescription(watchedType)}
                        </p>
                    </div>

                    {/* Report Date */}
                    <div className="space-y-2">
                        <Label htmlFor="reportDate">Report Date *</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="reportDate"
                                type="date"
                                {...register('reportDate')}
                                className="pl-10"
                                max={new Date().toISOString().split('T')[0]} // Cannot select future dates
                            />
                        </div>
                        {errors.reportDate && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.reportDate.message}
                            </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Select the date this report covers (cannot be in the future)
                        </p>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Report Title *</Label>
                        <Input
                            id="title"
                            placeholder="Enter a descriptive title for your report"
                            {...register('title')}
                        />
                        {errors.title && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.title.message}
                            </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {watch('title')?.length || 0}/100 characters
                        </p>
                    </div>

                    {/* Body */}
                    <div className="space-y-2">
                        <Label htmlFor="body">Report Content *</Label>
                        <Textarea
                            id="body"
                            placeholder="Describe your sales activities, achievements, challenges, and insights..."
                            rows={8}
                            {...register('body')}
                            className="resize-none"
                        />
                        {errors.body && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.body.message}
                            </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {watch('body')?.length || 0}/2000 characters
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Create Report
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateSalesReportModal;
