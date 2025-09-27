import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, X, Save } from 'lucide-react';
import type { RateSalesReportDto, SalesReportResponseDto } from '@/types/salesReport.types';

const rateReportSchema = z.object({
    rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
    comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

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
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<RateReportFormData>({
        resolver: zodResolver(rateReportSchema),
        defaultValues: {
            rating: 0,
            comment: '',
        },
    });

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

    const handleRatingClick = (selectedRating: number) => {
        setRating(selectedRating);
        setValue('rating', selectedRating);
    };

    const handleRatingHover = (hoveredRating: number) => {
        setHoveredRating(hoveredRating);
    };

    const handleRatingLeave = () => {
        setHoveredRating(0);
    };

    const renderStars = () => {
        return [...Array(5)].map((_, index) => {
            const starValue = index + 1;
            const isFilled = starValue <= (hoveredRating || rating);

            return (
                <button
                    key={index}
                    type="button"
                    className={`p-1 transition-colors ${isFilled ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400`}
                    onClick={() => handleRatingClick(starValue)}
                    onMouseEnter={() => handleRatingHover(starValue)}
                    onMouseLeave={handleRatingLeave}
                >
                    <Star className="h-6 w-6 fill-current" />
                </button>
            );
        });
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Rate Sales Report
                    </DialogTitle>
                    <DialogDescription>
                        Rate and provide feedback for this sales report.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Report Info */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{report.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                        </p>
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                        <Label>Rating *</Label>
                        <div className="flex items-center gap-1">
                            {renderStars()}
                        </div>
                        {errors.rating && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.rating.message}
                            </p>
                        )}
                        <p className="text-sm text-gray-500">
                            {rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'}
                        </p>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Comment (Optional)</Label>
                        <Textarea
                            id="comment"
                            {...register('comment')}
                            placeholder="Share your feedback about this report..."
                            rows={3}
                        />
                        {errors.comment && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.comment.message}
                            </p>
                        )}
                        <p className="text-sm text-gray-500">
                            {watchedComment?.length || 0} / 500 characters
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
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
                            disabled={isSubmitting || rating === 0}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Rating...
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
