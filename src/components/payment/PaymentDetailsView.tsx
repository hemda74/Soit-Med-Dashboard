// Payment Details View Component

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePayment } from '@/hooks/usePaymentQueries';
import {
	CurrencyDollarIcon,
	UserIcon,
	CalendarIcon,
	CheckCircleIcon,
	XCircleIcon,
	ClockIcon,
	ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { usePerformance } from '@/hooks/usePerformance';
import { LoadingSpinner } from '@/components/shared';
import { PaymentStatus } from '@/types/payment.types';

const PaymentDetailsView: React.FC = () => {
	usePerformance('PaymentDetailsView');
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const paymentId = id ? parseInt(id, 10) : 0;

	const { data: payment, isLoading, error } = usePayment(paymentId);

	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<LoadingSpinner />
			</div>
		);
	}

	if (error || !payment) {
		return (
			<div className="container mx-auto p-6">
				<Card>
					<CardContent className="p-6">
						<p className="text-red-600">Failed to load payment details</p>
						<Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
							<ArrowLeftIcon className="h-4 w-4 mr-2" />
							Go Back
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Get status badge
	const getStatusBadge = (status: PaymentStatus) => {
		const config: Record<PaymentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
			[PaymentStatus.Pending]: { label: 'Pending', variant: 'secondary' },
			[PaymentStatus.Processing]: { label: 'Processing', variant: 'default' },
			[PaymentStatus.Completed]: { label: 'Completed', variant: 'default' },
			[PaymentStatus.Failed]: { label: 'Failed', variant: 'destructive' },
			[PaymentStatus.Refunded]: { label: 'Refunded', variant: 'outline' },
		};

		const statusConfig = config[status];
		return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button onClick={() => navigate(-1)} variant="outline" size="sm">
						<ArrowLeftIcon className="h-4 w-4 mr-2" />
						Back
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
							Payment #{payment.id}
						</h1>
						<p className="text-gray-600 dark:text-gray-400 mt-1">
							{payment.customerName} - {payment.paymentMethodName}
						</p>
					</div>
				</div>
				{getStatusBadge(payment.status)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Details */}
				<div className="lg:col-span-2 space-y-6">
					{/* Payment Information */}
					<Card>
						<CardHeader>
							<CardTitle>Payment Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
									<p className="text-3xl font-bold text-green-600">
										{payment.amount.toLocaleString()} EGP
									</p>
								</div>
								<CurrencyDollarIcon className="h-12 w-12 text-green-600" />
							</div>

							<Separator />

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Payment Method
									</label>
									<p className="mt-1 font-medium">{payment.paymentMethodName}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Status
									</label>
									<div className="mt-1">{getStatusBadge(payment.status)}</div>
								</div>
								{payment.transactionId && (
									<div>
										<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
											Transaction ID
										</label>
										<p className="mt-1 font-mono text-sm">{payment.transactionId}</p>
									</div>
								)}
								{payment.paymentReference && (
									<div>
										<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
											Payment Reference
										</label>
										<p className="mt-1 font-mono text-sm">{payment.paymentReference}</p>
									</div>
								)}
							</div>

							<Separator />

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Created At
									</label>
									<p className="mt-1 text-gray-900 dark:text-white">
										{format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
									</p>
								</div>
								{payment.paidAt && (
									<div>
										<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
											Paid At
										</label>
										<p className="mt-1 text-gray-900 dark:text-white">
											{format(new Date(payment.paidAt), 'MMM dd, yyyy HH:mm')}
										</p>
									</div>
								)}
								{payment.confirmedAt && (
									<div>
										<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
											Confirmed At
										</label>
										<p className="mt-1 text-gray-900 dark:text-white">
											{format(new Date(payment.confirmedAt), 'MMM dd, yyyy HH:mm')}
										</p>
									</div>
								)}
								{payment.processedAt && (
									<div>
										<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
											Processed At
										</label>
										<p className="mt-1 text-gray-900 dark:text-white">
											{format(new Date(payment.processedAt), 'MMM dd, yyyy HH:mm')}
										</p>
									</div>
								)}
							</div>

							{payment.accountingNotes && (
								<>
									<Separator />
									<div>
										<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
											Accounting Notes
										</label>
										<p className="mt-1 text-gray-900 dark:text-white">{payment.accountingNotes}</p>
									</div>
								</>
							)}
						</CardContent>
					</Card>

					{/* Related Information */}
					{payment.maintenanceRequestId && (
						<Card>
							<CardHeader>
								<CardTitle>Related Maintenance Request</CardTitle>
							</CardHeader>
							<CardContent>
								<Button
									variant="outline"
									onClick={() => navigate(`/maintenance/requests/${payment.maintenanceRequestId}`)}
								>
									View Request #{payment.maintenanceRequestId}
								</Button>
							</CardContent>
						</Card>
					)}

					{payment.sparePartRequestId && (
						<Card>
							<CardHeader>
								<CardTitle>Related Spare Part Request</CardTitle>
							</CardHeader>
							<CardContent>
								<Button variant="outline" onClick={() => navigate('/maintenance/spare-parts')}>
									View Spare Part Request #{payment.sparePartRequestId}
								</Button>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Customer Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<UserIcon className="h-5 w-5" />
								Customer Information
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="font-medium">{payment.customerName}</p>
						</CardContent>
					</Card>

					{/* Processing Information */}
					{payment.processedByAccountantName && (
						<Card>
							<CardHeader>
								<CardTitle>Processing Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<div>
									<label className="text-sm text-gray-500 dark:text-gray-400">Processed By</label>
									<p className="font-medium">{payment.processedByAccountantName}</p>
								</div>
								{payment.processedAt && (
									<div>
										<label className="text-sm text-gray-500 dark:text-gray-400">Processed At</label>
										<p className="text-sm">
											{format(new Date(payment.processedAt), 'MMM dd, yyyy HH:mm')}
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
};

export default PaymentDetailsView;


