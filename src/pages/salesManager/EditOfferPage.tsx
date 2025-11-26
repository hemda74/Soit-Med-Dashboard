import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoadingSpinner, ErrorDisplay } from '@/components/shared';
import { salesApi } from '@/services/sales/salesApi';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// Validation schema for updating offer
const updateOfferSchema = z.object({
	products: z.string().min(1, 'Products description is required'),
	totalAmount: z.number().min(0.01, 'Total amount must be greater than 0'),
	paymentTerms: z.array(z.string()).optional(),
	deliveryTerms: z.array(z.string()).optional(),
	warrantyTerms: z.array(z.string()).optional(),
	validUntil: z.array(z.string()).optional(),
	notes: z.string().optional(),
	paymentType: z.enum(['Cash', 'Installments']).optional(),
	finalPrice: z.number().min(0.01).optional(),
	offerDuration: z.string().optional(),
}).refine((data) => {
	// If payment type is Installments, offerDuration should be provided
	if (data.paymentType === 'Installments' && !data.offerDuration) {
		return false;
	}
	return true;
}, {
	message: 'Installment duration is required when payment type is Installments',
	path: ['offerDuration'],
});

type UpdateOfferFormValues = z.infer<typeof updateOfferSchema>;

interface Salesman {
	id: string;
	firstName?: string;
	lastName?: string;
	userName?: string;
	email?: string;
}

const EditOfferPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [offer, setOffer] = useState<any>(null);
	const [salesmen, setSalesmen] = useState<Salesman[]>([]);
	const [paymentTerm, setPaymentTerm] = useState('');
	const [deliveryTerm, setDeliveryTerm] = useState('');
	const [warrantyTerm, setWarrantyTerm] = useState('');
	const [validUntilDate, setValidUntilDate] = useState('');

	const form = useForm<UpdateOfferFormValues>({
		resolver: zodResolver(updateOfferSchema),
		defaultValues: {
			products: '',
			totalAmount: 0,
			paymentTerms: [],
			deliveryTerms: [],
			warrantyTerms: [],
			validUntil: [],
			notes: '',
			paymentType: undefined,
			finalPrice: undefined,
			offerDuration: '',
		},
	});

	useEffect(() => {
		if (id) {
			loadOffer();
			loadSalesmen();
		}
	}, [id]);

	const loadOffer = async () => {
		if (!id) return;

		try {
			setLoading(true);
			setError(null);
			const response = await salesApi.getOffer(id);
			
			if (response.success && response.data) {
				const offerData = response.data;
				setOffer(offerData);
				
				// Set form values
				form.reset({
					products: offerData.products || '',
					totalAmount: offerData.totalAmount || 0,
					paymentTerms: offerData.paymentTerms || [],
					deliveryTerms: offerData.deliveryTerms || [],
					warrantyTerms: offerData.warrantyTerms || [],
					validUntil: offerData.validUntil || [],
					notes: offerData.notes || '',
					paymentType: offerData.paymentType,
					finalPrice: offerData.finalPrice,
					offerDuration: offerData.offerDuration || '',
				});
			} else {
				setError('Failed to load offer');
			}
		} catch (err: any) {
			setError(err.message || 'Failed to load offer');
			toast.error('Failed to load offer');
		} finally {
			setLoading(false);
		}
	};

	const loadSalesmen = async () => {
		try {
			const response = await salesApi.getOfferSalesmen();
			if (response.success && response.data) {
				setSalesmen(response.data);
			}
		} catch (err) {
			console.error('Failed to load salesmen:', err);
		}
	};

	const addPaymentTerm = () => {
		if (paymentTerm.trim()) {
			const current = form.getValues('paymentTerms') || [];
			form.setValue('paymentTerms', [...current, paymentTerm.trim()]);
			setPaymentTerm('');
		}
	};

	const removePaymentTerm = (index: number) => {
		const current = form.getValues('paymentTerms') || [];
		form.setValue('paymentTerms', current.filter((_, i) => i !== index));
	};

	const addDeliveryTerm = () => {
		if (deliveryTerm.trim()) {
			const current = form.getValues('deliveryTerms') || [];
			form.setValue('deliveryTerms', [...current, deliveryTerm.trim()]);
			setDeliveryTerm('');
		}
	};

	const removeDeliveryTerm = (index: number) => {
		const current = form.getValues('deliveryTerms') || [];
		form.setValue('deliveryTerms', current.filter((_, i) => i !== index));
	};

	const addWarrantyTerm = () => {
		if (warrantyTerm.trim()) {
			const current = form.getValues('warrantyTerms') || [];
			form.setValue('warrantyTerms', [...current, warrantyTerm.trim()]);
			setWarrantyTerm('');
		}
	};

	const removeWarrantyTerm = (index: number) => {
		const current = form.getValues('warrantyTerms') || [];
		form.setValue('warrantyTerms', current.filter((_, i) => i !== index));
	};

	const addValidUntil = () => {
		if (validUntilDate) {
			const current = form.getValues('validUntil') || [];
			form.setValue('validUntil', [...current, validUntilDate]);
			setValidUntilDate('');
		}
	};

	const removeValidUntil = (index: number) => {
		const current = form.getValues('validUntil') || [];
		form.setValue('validUntil', current.filter((_, i) => i !== index));
	};

	const onSubmit = async (data: UpdateOfferFormValues) => {
		if (!id) return;

		try {
			setSaving(true);
			const response = await salesApi.updateOfferBySalesManager(id, data);
			
			if (response.success) {
				toast.success('Offer updated successfully');
				navigate(-1); // Go back to previous page
			} else {
				toast.error(response.message || 'Failed to update offer');
			}
		} catch (err: any) {
			toast.error(err.message || 'Failed to update offer');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6">
				<LoadingSpinner />
			</div>
		);
	}

	if (error || !offer) {
		return (
			<div className="container mx-auto p-6">
				<ErrorDisplay message={error || 'Offer not found'} />
				<Button onClick={() => navigate(-1)} className="mt-4">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<Button
						variant="ghost"
						onClick={() => navigate(-1)}
						className="mb-2"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<h1 className="text-3xl font-bold">Edit Offer</h1>
					<p className="text-muted-foreground mt-1">
						Offer #{offer.id} - {offer.clientName}
					</p>
				</div>
				<Badge variant={offer.status === 'Draft' ? 'secondary' : 'default'}>
					{offer.status}
				</Badge>
			</div>

			{/* Form */}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>Client</Label>
									<Input value={offer.clientName} disabled />
								</div>
								<div>
									<Label>Assigned To</Label>
									<Input value={offer.assignedToName || offer.assignedTo} disabled />
								</div>
							</div>

							<FormField
								control={form.control}
								name="products"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Products Description</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												placeholder="Describe the products/services in this offer"
												rows={4}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="totalAmount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Total Amount</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												{...field}
												onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Payment Terms */}
					<Card>
						<CardHeader>
							<CardTitle>Payment Terms</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								<Input
									value={paymentTerm}
									onChange={(e) => setPaymentTerm(e.target.value)}
									placeholder="Add payment term"
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											addPaymentTerm();
										}
									}}
								/>
								<Button type="button" onClick={addPaymentTerm}>
									Add
								</Button>
							</div>
							<div className="flex flex-wrap gap-2">
								{form.watch('paymentTerms')?.map((term, index) => (
									<Badge key={index} variant="secondary" className="flex items-center gap-1">
										{term}
										<X
											className="h-3 w-3 cursor-pointer"
											onClick={() => removePaymentTerm(index)}
										/>
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Delivery Terms */}
					<Card>
						<CardHeader>
							<CardTitle>Delivery Terms</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								<Input
									value={deliveryTerm}
									onChange={(e) => setDeliveryTerm(e.target.value)}
									placeholder="Add delivery term"
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											addDeliveryTerm();
										}
									}}
								/>
								<Button type="button" onClick={addDeliveryTerm}>
									Add
								</Button>
							</div>
							<div className="flex flex-wrap gap-2">
								{form.watch('deliveryTerms')?.map((term, index) => (
									<Badge key={index} variant="secondary" className="flex items-center gap-1">
										{term}
										<X
											className="h-3 w-3 cursor-pointer"
											onClick={() => removeDeliveryTerm(index)}
										/>
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Warranty Terms */}
					<Card>
						<CardHeader>
							<CardTitle>Warranty Terms</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								<Input
									value={warrantyTerm}
									onChange={(e) => setWarrantyTerm(e.target.value)}
									placeholder="Add warranty term"
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											addWarrantyTerm();
										}
									}}
								/>
								<Button type="button" onClick={addWarrantyTerm}>
									Add
								</Button>
							</div>
							<div className="flex flex-wrap gap-2">
								{form.watch('warrantyTerms')?.map((term, index) => (
									<Badge key={index} variant="secondary" className="flex items-center gap-1">
										{term}
										<X
											className="h-3 w-3 cursor-pointer"
											onClick={() => removeWarrantyTerm(index)}
										/>
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Valid Until Dates */}
					<Card>
						<CardHeader>
							<CardTitle>Valid Until</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								<Input
									type="date"
									value={validUntilDate}
									onChange={(e) => setValidUntilDate(e.target.value)}
								/>
								<Button type="button" onClick={addValidUntil}>
									Add
								</Button>
							</div>
							<div className="flex flex-wrap gap-2">
								{form.watch('validUntil')?.map((date, index) => (
									<Badge key={index} variant="secondary" className="flex items-center gap-1">
										{format(new Date(date), 'MMM dd, yyyy')}
										<X
											className="h-3 w-3 cursor-pointer"
											onClick={() => removeValidUntil(index)}
										/>
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Payment Information */}
					<Card>
						<CardHeader>
							<CardTitle>Payment Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="paymentType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Payment Type *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value || ''}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select payment type (Cash or Installments)" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="Cash">Cash</SelectItem>
												<SelectItem value="Installments">Installments</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
										<p className="text-sm text-muted-foreground">
											Select whether payment will be made in cash or installments
										</p>
									</FormItem>
								)}
							/>

							{form.watch('paymentType') === 'Cash' && (
								<FormField
									control={form.control}
									name="finalPrice"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Final Price (Cash Payment)</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													{...field}
													value={field.value || ''}
													onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
													placeholder="Enter final price for cash payment"
												/>
											</FormControl>
											<FormMessage />
											<p className="text-sm text-muted-foreground">
												The final price for cash payment (may include discounts)
											</p>
										</FormItem>
									)}
								/>
							)}

							{form.watch('paymentType') === 'Installments' && (
								<>
									<FormField
										control={form.control}
										name="finalPrice"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Total Amount (Installments)</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="0.01"
														{...field}
														value={field.value || ''}
														onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
														placeholder="Enter total amount for installment plan"
													/>
												</FormControl>
												<FormMessage />
												<p className="text-sm text-muted-foreground">
													The total amount that will be paid in installments
												</p>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="offerDuration"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Installment Duration</FormLabel>
												<FormControl>
													<Input {...field} placeholder="e.g., 12 months, 6 months" />
												</FormControl>
												<FormMessage />
												<p className="text-sm text-muted-foreground">
													Specify the duration for the installment plan (e.g., "12 months", "6 months")
												</p>
											</FormItem>
										)}
									/>
								</>
							)}

							<FormField
								control={form.control}
								name="notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Notes</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												placeholder="Additional notes about this offer"
												rows={4}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Actions */}
					<div className="flex justify-end gap-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate(-1)}
							disabled={saving}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={saving}>
							{saving ? (
								<>
									<LoadingSpinner className="mr-2" />
									Saving...
								</>
							) : (
								<>
									<Save className="h-4 w-4 mr-2" />
									Save Changes
								</>
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default EditOfferPage;

