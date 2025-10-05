import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit, X } from 'lucide-react';
import type { UpdateWeeklyPlanDto, WeeklyPlan } from '@/types/weeklyPlan.types';

const editPlanSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters'),
    description: z
        .string()
        .max(1000, 'Description must be less than 1000 characters')
        .optional(),
});

type EditPlanFormData = z.infer<typeof editPlanSchema>;

interface EditWeeklyPlanModalProps {
    plan: WeeklyPlan;
    onClose: () => void;
    onSubmit: (data: UpdateWeeklyPlanDto) => Promise<boolean>;
}

const EditWeeklyPlanModal: React.FC<EditWeeklyPlanModalProps> = ({
    plan,
    onClose,
    onSubmit,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EditPlanFormData>({
        resolver: zodResolver(editPlanSchema),
        defaultValues: {
            title: plan.title,
            description: plan.description || '',
        },
    });

    const handleFormSubmit = async (data: EditPlanFormData) => {
        setIsSubmitting(true);
        try {
            const success = await onSubmit(data);
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Error updating plan:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Edit className="h-6 w-6" />
                        Edit Weekly Plan
                    </DialogTitle>
                    <DialogDescription>
                        Update the title and description of your weekly
                        plan.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Plan Title *</Label>
                            <Input
                                id="title"
                                {...register('title')}
                                placeholder="Plan title"
                                className={
                                    errors.title
                                        ? 'border-red-500'
                                        : ''
                                }
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">
                                    {errors.title.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Plan description..."
                                rows={5}
                                className={
                                    errors.description
                                        ? 'border-red-500'
                                        : ''
                                }
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">
                                    {errors.description.message}
                                </p>
                            )}
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
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Edit className="h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditWeeklyPlanModal;


