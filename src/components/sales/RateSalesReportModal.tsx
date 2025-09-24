import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare, X, Save } from 'lucide-react';
import type { RateSalesReportDto, SalesReportResponseDto } from '@/types/salesReport.types';

const rateReportSchema = z.object({
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
    comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
}).refine(
    (data) => data.rating || data.comment,
    {
        message: "Either rating or comment must be provided",
        path: ["rating"],
    }
);

type RateReportFormData = z.infer<typeof rateReportSchema>;

interface RateSalesReportModalProps {
    report: SalesReportResponseDto;
    onClose: () => void;
    onSubmit: (id: number, data: RateSalesReportDto) => Promise<boolean>;
}

const RateSalesReportModal: React.FC<RateSalesReportModalProps> = ({
    report,
    onClose,
    onSubmit,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<RateReportFormData>({
        resolver: zodResolver(rateReportSchema),
        defaultValues: {
            rating: report.rating || undefined,
            comment: report.comment || '',
        },
    });

    const watchedRating = watch('rating');
    const watchedComment = watch('comment');

    const handleFormSubmit = async (data: RateReportFormData) => {
        setIsSubmitting(true);

        try {
            const success = await onSubmit(report.id, data);
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Error rating report:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStarClick = (rating: number) => {
        setValue('rating', rating);
    };

    const handleStarHover = (rating: number) => {
        setHoveredStar(rating);
    };

    const handleStarLeave = () => {
        setHoveredStar(0);
    };

    const renderStars = () => {
        const stars = [];
        const currentRating = hoveredStar || watchedRating || 0;

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <button
                    key={i}
                    type="button"
                    className={`h-8 w-8 transition-colors ${i <= currentRating
                        ? 'text-yellow-400 hover:text-yellow-500'
                        : 'text-gray-300 hover:text-yellow-400'
                        }`}
                    onClick={() => handleStarClick(i)}
                    onMouseEnter={() => handleStarHover(i)}
                    onMouseLeave={handleStarLeave}
                >
                    <Star className="h-full w-full fill-current" />
                </button>
            );
        }

        return stars;
    };

    const getRatingText = (rating: number) => {
        switch (rating) {
            case 1: return 'Poor';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Very Good';
            case 5: return 'Excellent';
            default: return '';
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Rate Sales Report
                    </DialogTitle>
                    <DialogDescription>
                        Provide feedback and rating for this sales report.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Report Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">{report.title}</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><strong>Type:</strong> {report.type.charAt(0).toUpperCase() + report.type.slice(1)}</p>
                            <p><strong>Date:</strong> {new Date(report.reportDate).toLocaleDateString()}</p>
                            <p><strong>Employee:</strong> {report.employeeName}</p>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="space-y-3">
                        <Label>Rating (1-5 stars) *</Label>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                {renderStars()}
                            </div>
                            {watchedRating && (
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                    {getRatingText(watchedRating)}
                                </span>
                            )}
                        </div>
                        {errors.rating && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.rating.message}
                            </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Click on a star to rate this report (1 = Poor, 5 = Excellent)
                        </p>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Comment (Optional)</Label>
                        <Textarea
                            id="comment"
                            placeholder="Provide additional feedback or comments about this report..."
                            rows={4}
                            {...register('comment')}
                            className="resize-none"
                        />
                        {errors.comment && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.comment.message}
                            </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {watchedComment?.length || 0}/500 characters
                        </p>
                    </div>

                    {/* Validation Message */}
                    {errors.rating && errors.rating.type === 'custom' && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                Either rating or comment must be provided
                            </p>
                        </div>
                    )}

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
                            disabled={isSubmitting || (!watchedRating && !watchedComment)}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Submit Rating
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RateSalesReportModal;
