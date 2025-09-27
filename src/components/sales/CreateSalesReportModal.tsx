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
    type: z.enum(['daily', 'weekly', 'monthly', 'custom']),
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


    const getTypeDescription = (type: string) => {
        switch (type) {
            case 'daily':
                return 'Daily sales performance and activities';
            case 'weekly':
                return 'Weekly sales summary and achievements';
            case 'monthly':
                return 'Monthly sales overview and analysis';
            case 'custom':
                return 'Custom sales report with specific focus';
            default:
                return 'Sales report details';
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
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
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Report Title</Label>
                            <Input
                                id="title"
                                {...register('title')}
                                placeholder="Enter report title"
                                className={errors.title ? 'border-red-500' : ''}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Report Type</Label>
                            <Select
                                value={watchedType}
                                onValueChange={(value) => setValue('type', value as 'daily' | 'weekly' | 'monthly' | 'custom')}
                            >
                                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Daily Report
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="weekly">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Weekly Report
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="monthly">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Monthly Report
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="custom">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Custom Report
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-sm text-red-500">{errors.type.message}</p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {getTypeDescription(watchedType)}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reportDate">Report Date</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="reportDate"
                                    type="date"
                                    {...register('reportDate')}
                                    className={`pl-10 ${errors.reportDate ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.reportDate && (
                                <p className="text-sm text-red-500">{errors.reportDate.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="body">Report Content</Label>
                            <Textarea
                                id="body"
                                {...register('body')}
                                placeholder="Describe your sales activities, achievements, challenges, and plans..."
                                rows={6}
                                className={errors.body ? 'border-red-500' : ''}
                            />
                            {errors.body && (
                                <p className="text-sm text-red-500">{errors.body.message}</p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Include details about your sales activities, customer interactions,
                                achievements, challenges faced, and future plans.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
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
                            className="flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <FileText className="h-4 w-4" />
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
