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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, X } from 'lucide-react';
import type { ReviewWeeklyPlanDto, WeeklyPlan } from '@/types/weeklyPlan.types';

const reviewPlanSchema = z.object({
    rating: z
        .number()
        .min(1, 'Please select a rating')
        .max(5, 'Rating must be between 1 and 5')
        .optional(),
    managerComment: z
        .string()
        .max(1000, 'Comment must be less than 1000 characters')
        .optional(),
}).refine(
    (data) => data.rating !== undefined || (data.managerComment && data.managerComment.length > 0),
    {
        message: 'Please provide either a rating or a comment',
        path: ['rating'],
    }
);

type ReviewPlanFormData = z.infer<typeof reviewPlanSchema>;

interface ReviewWeeklyPlanModalProps {
    plan: WeeklyPlan;
    onClose: () => void;
    onSubmit: (data: ReviewWeeklyPlanDto) => Promise<boolean>;
}

const ReviewWeeklyPlanModal: React.FC<ReviewWeeklyPlanModalProps> = ({
    plan,
    onClose,
    onSubmit,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRating, setSelectedRating] = useState<number | undefined>(
        plan.rating || undefined
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<ReviewPlanFormData>({
        resolver: zodResolver(reviewPlanSchema),
        defaultValues: {
            rating: plan.rating || undefined,
            managerComment: plan.managerComment || '',
        },
    });

    const handleRatingClick = (rating: number) => {
        setSelectedRating(rating);
        setValue('rating', rating);
    };

    const handleFormSubmit = async (data: ReviewPlanFormData) => {
        setIsSubmitting(true);
        try {
            const success = await onSubmit(data);
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Error reviewing plan:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Star className="h-6 w-6 text-yellow-500" />
                        Review Weekly Plan
                    </DialogTitle>
                    <DialogDescription>
                        Provide feedback and rating for this weekly plan.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border mb-4">
                    <h4 className="font-semibold mb-2">{plan.title}</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>Employee: {plan.employeeName}</p>
                        <p>
                            Progress: {plan.completedTasks}/
                            {plan.totalTasks} tasks completed (
                            {plan.completionPercentage}%)
                        </p>
                        <p>
                            Daily Updates: {plan.dailyProgresses.length}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Rating</Label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() =>
                                            handleRatingClick(
                                                rating
                                            )
                                        }
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`h-10 w-10 ${selectedRating &&
                                                    rating <=
                                                    selectedRating
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300 hover:text-yellow-200'
                                                }`}
                                        />
                                    </button>
                                ))}
                                {selectedRating && (
                                    <span className="ml-2 text-lg font-semibold">
                                        {selectedRating}/5
                                    </span>
                                )}
                            </div>
                            {errors.rating && (
                                <p className="text-sm text-red-500">
                                    {errors.rating.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="managerComment">
                                Manager Comment
                            </Label>
                            <Textarea
                                id="managerComment"
                                {...register('managerComment')}
                                placeholder="Provide feedback on performance, achievements, areas for improvement..."
                                rows={6}
                                className={
                                    errors.managerComment
                                        ? 'border-red-500'
                                        : ''
                                }
                            />
                            {errors.managerComment && (
                                <p className="text-sm text-red-500">
                                    {
                                        errors.managerComment
                                            .message
                                    }
                                </p>
                            )}
                            <p className="text-sm text-gray-500">
                                Provide constructive feedback to help the
                                employee improve.
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
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Star className="h-4 w-4" />
                                    Submit Review
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewWeeklyPlanModal;


