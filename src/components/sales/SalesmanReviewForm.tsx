import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { salesApi } from '@/services/sales/salesApi';
import toast from 'react-hot-toast';
import { FileText, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface SalesmanReviewFormProps {
	dealId: string | number;
	dealClientName?: string;
	reviewType: 'first' | 'second';
	onSuccess?: () => void;
	onCancel?: () => void;
}

const SalesmanReviewForm: React.FC<SalesmanReviewFormProps> = ({
	dealId,
	dealClientName,
	reviewType,
	onSuccess,
	onCancel,
}) => {
	const { t } = useTranslation();
	const [reviewText, setReviewText] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!reviewText.trim()) {
			toast.error(t('pleaseEnterReviewText') || 'Please enter review text');
			return;
		}

		try {
			setSubmitting(true);

			const response =
				reviewType === 'first'
					? await salesApi.submitFirstSalesManReview(dealId, reviewText)
					: await salesApi.submitSecondSalesManReview(dealId, reviewText);

			if (response.success) {
				toast.success(
					t('reviewSubmittedSuccessfully') ||
						'Review submitted successfully'
				);
				setReviewText('');
				onSuccess?.();
			} else {
				toast.error(
					response.message || t('failedToSubmitReview') || 'Failed to submit review'
				);
			}
		} catch (error: any) {
			console.error('Error submitting review:', error);
			toast.error(error.message || t('failedToSubmitReview') || 'Failed to submit review');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					{t('submitReview') || 'Submit Review'}
				</CardTitle>
				<CardDescription>
					{reviewType === 'first'
						? t('submitFirstReviewForLegal') ||
						  'Submit your review for the legal team'
						: t('submitSecondReviewForLegal') ||
						  'Submit your review for the legal team'}
					{dealClientName && ` - ${dealClientName}`}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="reviewText">
							{t('reviewText') || 'Review Text'} *
						</Label>
						<Textarea
							id="reviewText"
							value={reviewText}
							onChange={(e) => setReviewText(e.target.value)}
							placeholder={
								t('enterReviewDetails') ||
								'Enter your review details for the legal team...'
							}
							rows={8}
							required
							className="resize-none"
						/>
						<p className="text-sm text-muted-foreground">
							{t('provideDetailedReview') ||
								'Provide a detailed review that will be sent to the legal team'}
						</p>
					</div>

					<div className="flex items-center justify-end gap-4">
						{onCancel && (
							<Button type="button" variant="outline" onClick={onCancel}>
								{t('cancel') || 'Cancel'}
							</Button>
						)}
						<Button type="submit" disabled={submitting}>
							{submitting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									{t('submitting') || 'Submitting...'}
								</>
							) : (
								t('submitReview') || 'Submit Review'
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};

export default SalesmanReviewForm;

