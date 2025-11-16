// Accounting Dashboard Component

import React, { useState } from 'react';
import {
	usePendingPayments,
	useConfirmPayment,
	useRejectPayment,
	useDailyReport,
	useMonthlyReport,
	useOutstandingPayments,
} from '@/hooks/usePaymentQueries';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { usePerformance } from '@/hooks/usePerformance';
import {
	CurrencyDollarIcon,
	ClockIcon,
	CheckCircleIcon,
	XCircleIcon,
	ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { PaymentResponseDTO, ConfirmPaymentDTO, RejectPaymentDTO } from '@/types/payment.types';
import { PaymentMethod, PaymentStatus } from '@/types/payment.types';

const AccountingDashboard: React.FC = () => {
	usePerformance('AccountingDashboard');
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [activeTab, setActiveTab] = useState('pending');
	const [selectedPayment, setSelectedPayment] = useState<PaymentResponseDTO | null>(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [confirmNotes, setConfirmNotes] = useState('');
	const [rejectReason, setRejectReason] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedDate, setSelectedDate] = useState<string>(
		format(new Date(), 'yyyy-MM-dd')
	);

	// React Query hooks
	const { data: pendingPayments = [], isLoading: loadingPending, refetch: refetchPending } =
		usePendingPayments();
	const { data: outstandingPayments = [], isLoading: loadingOutstanding } =
		useOutstandingPayments();
	const { data: dailyReport, isLoading: loadingReport } = useDailyReport(selectedDate);

	const confirmMutation = useConfirmPayment();
	const rejectMutation = useRejectPayment();

	// Filter payments
	const filteredPendingPayments = pendingPayments.filter((payment) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			payment.customerName.toLowerCase().includes(query) ||
			payment.paymentMethodName.toLowerCase().includes(query) ||
			payment.transactionId?.toLowerCase().includes(query) ||
			payment.id.toString().includes(query)
		);
	});

	// Handle confirm payment
	const handleConfirm = async () => {
		if (!selectedPayment) return;

		const confirmData: ConfirmPaymentDTO = {
			notes: confirmNotes || undefined,
		};

		try {
			await confirmMutation.mutateAsync({
				paymentId: selectedPayment.id,
				data: confirmData,
			});
			setShowConfirmDialog(false);
			setSelectedPayment(null);
			setConfirmNotes('');
			refetchPending();
		} catch (error) {
			// Error handled by mutation
		}
	};

	// Handle reject payment
	const handleReject = async () => {
		if (!selectedPayment || !rejectReason.trim()) {
			toast.error('Please provide a rejection reason');
			return;
		}

		const rejectData: RejectPaymentDTO = {
			reason: rejectReason,
		};

		try {
			await rejectMutation.mutateAsync({
				paymentId: selectedPayment.id,
				data: rejectData,
			});
			setShowRejectDialog(false);
			setSelectedPayment(null);
			setRejectReason('');
			refetchPending();
		} catch (error) {
			// Error handled by mutation
		}
	};

	// Get payment status badge
	const getStatusBadge = (status: PaymentStatus) => {
		const config: Record<PaymentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
			[PaymentStatus.Pending]: { label: 'Pending', variant: 'secondary' },
			[PaymentStatus.Processing]: { label: 'Processing', variant: 'default' },
			[PaymentStatus.Completed]: { label: 'Completed', variant: 'default' },
			[PaymentStatus.Failed]: { label: 'Failed', variant: 'destructive' },
			[PaymentStatus.Refunded]: { label: 'Refunded', variant: 'outline' },
		};

		const statusConfig = config[status];
		return (
			<Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
		);
	};

	// Statistics
	const stats = {
		pending: pendingPayments.length,
		outstanding: outstandingPayments.length,
		todayRevenue: dailyReport?.totalRevenue || 0,
		todayTransactions: dailyReport?.totalTransactions || 0,
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Accounting Dashboard
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-2">
						Manage payments and financial reports
					</p>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
									Pending Payments
								</p>
								<p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
							</div>
							<ClockIcon className="h-8 w-8 text-orange-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
									Outstanding
								</p>
								<p className="text-2xl font-bold text-red-600">{stats.outstanding}</p>
							</div>
							<XCircleIcon className="h-8 w-8 text-red-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
									Today Revenue
								</p>
								<p className="text-2xl font-bold text-green-600">
									{stats.todayRevenue.toLocaleString()} EGP
								</p>
							</div>
							<CurrencyDollarIcon className="h-8 w-8 text-green-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
									Today Transactions
								</p>
								<p className="text-2xl font-bold text-blue-600">{stats.todayTransactions}</p>
							</div>
							<ChartBarIcon className="h-8 w-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="pending">Pending Payments</TabsTrigger>
					<TabsTrigger value="outstanding">Outstanding</TabsTrigger>
					<TabsTrigger value="reports">Reports</TabsTrigger>
				</TabsList>

				{/* Pending Payments Tab */}
				<TabsContent value="pending" className="space-y-4">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Pending Payments</CardTitle>
									<CardDescription>
										Review and confirm or reject pending payments
									</CardDescription>
								</div>
								<Input
									placeholder="Search payments..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-64"
								/>
							</div>
						</CardHeader>
						<CardContent>
							{loadingPending ? (
								<div className="text-center py-8">
									<p className="text-gray-500">Loading payments...</p>
								</div>
							) : filteredPendingPayments.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-gray-500">No pending payments found</p>
								</div>
							) : (
								<div className="space-y-4">
									{filteredPendingPayments.map((payment) => (
										<Card key={payment.id} className="hover:shadow-md transition-shadow">
											<CardContent className="p-6">
												<div className="flex items-start justify-between">
													<div className="flex-1 space-y-3">
														<div className="flex items-center gap-3">
															<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
																Payment #{payment.id}
															</h3>
															{getStatusBadge(payment.status)}
															<Badge variant="outline">{payment.paymentMethodName}</Badge>
														</div>

														<div className="grid grid-cols-2 gap-4 text-sm">
															<div>
																<p className="text-gray-500 dark:text-gray-400">Customer</p>
																<p className="font-medium">{payment.customerName}</p>
															</div>
															<div>
																<p className="text-gray-500 dark:text-gray-400">Amount</p>
																<p className="font-medium text-lg text-green-600">
																	{payment.amount.toLocaleString()} EGP
																</p>
															</div>
															{payment.transactionId && (
																<div>
																	<p className="text-gray-500 dark:text-gray-400">Transaction ID</p>
																	<p className="font-medium font-mono text-xs">{payment.transactionId}</p>
																</div>
															)}
															<div>
																<p className="text-gray-500 dark:text-gray-400">Created</p>
																<p className="font-medium">
																	{format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
																</p>
															</div>
														</div>

														{payment.accountingNotes && (
															<div>
																<p className="text-gray-500 dark:text-gray-400 mb-1">Notes</p>
																<p className="text-sm">{payment.accountingNotes}</p>
															</div>
														)}
													</div>

													<div className="flex flex-col gap-2 ml-4">
														<Button
															onClick={() => {
																setSelectedPayment(payment);
																setShowConfirmDialog(true);
															}}
															className="w-full"
															variant="default"
														>
															<CheckCircleIcon className="h-4 w-4 mr-2" />
															Confirm
														</Button>
														<Button
															onClick={() => {
																setSelectedPayment(payment);
																setShowRejectDialog(true);
															}}
															className="w-full"
															variant="destructive"
														>
															<XCircleIcon className="h-4 w-4 mr-2" />
															Reject
														</Button>
														<Button
															variant="outline"
															onClick={() => {
																setSelectedPayment(payment);
																// TODO: Open details modal
															}}
															className="w-full"
														>
															View Details
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Outstanding Payments Tab */}
				<TabsContent value="outstanding" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Outstanding Payments</CardTitle>
							<CardDescription>
								Payments that are overdue or require attention
							</CardDescription>
						</CardHeader>
						<CardContent>
							{loadingOutstanding ? (
								<div className="text-center py-8">
									<p className="text-gray-500">Loading outstanding payments...</p>
								</div>
							) : outstandingPayments.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-gray-500">No outstanding payments</p>
								</div>
							) : (
								<div className="space-y-4">
									{outstandingPayments.map((payment) => (
										<Card key={payment.id} className="hover:shadow-md transition-shadow">
											<CardContent className="p-6">
												<div className="flex items-start justify-between">
													<div className="flex-1 space-y-3">
														<div className="flex items-center gap-3">
															<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
																Payment #{payment.id}
															</h3>
															{getStatusBadge(payment.status)}
														</div>

														<div className="grid grid-cols-2 gap-4 text-sm">
															<div>
																<p className="text-gray-500 dark:text-gray-400">Customer</p>
																<p className="font-medium">{payment.customerName}</p>
															</div>
															<div>
																<p className="text-gray-500 dark:text-gray-400">Amount</p>
																<p className="font-medium text-lg text-red-600">
																	{payment.amount.toLocaleString()} EGP
																</p>
															</div>
															<div>
																<p className="text-gray-500 dark:text-gray-400">Created</p>
																<p className="font-medium">
																	{format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
																</p>
															</div>
														</div>
													</div>

													<div className="flex flex-col gap-2 ml-4">
														<Button
															variant="outline"
															onClick={() => {
																setSelectedPayment(payment);
																// TODO: Open details modal
															}}
															className="w-full"
														>
															View Details
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Reports Tab */}
				<TabsContent value="reports" className="space-y-4">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Daily Report</CardTitle>
									<CardDescription>View financial report for a specific date</CardDescription>
								</div>
								<Input
									type="date"
									value={selectedDate}
									onChange={(e) => setSelectedDate(e.target.value)}
									className="w-48"
								/>
							</div>
						</CardHeader>
						<CardContent>
							{loadingReport ? (
								<div className="text-center py-8">
									<p className="text-gray-500">Loading report...</p>
								</div>
							) : dailyReport ? (
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
											<p className="text-2xl font-bold text-green-600">
												{dailyReport.totalRevenue.toLocaleString()} EGP
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">Total Payments</p>
											<p className="text-2xl font-bold text-blue-600">
												{dailyReport.totalPayments.toLocaleString()} EGP
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">Outstanding</p>
											<p className="text-2xl font-bold text-red-600">
												{dailyReport.outstandingPayments.toLocaleString()} EGP
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
											<p className="text-2xl font-bold">{dailyReport.totalTransactions}</p>
										</CardContent>
									</Card>
								</div>
							) : (
								<div className="text-center py-8">
									<p className="text-gray-500">No report data available</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Confirm Payment Dialog */}
			<Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Payment</DialogTitle>
						<DialogDescription>
							Confirm this payment and add optional notes
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{selectedPayment && (
							<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<p className="text-sm text-gray-600 dark:text-gray-400">Payment #{selectedPayment.id}</p>
								<p className="font-medium text-lg">
									{selectedPayment.amount.toLocaleString()} EGP
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{selectedPayment.customerName} - {selectedPayment.paymentMethodName}
								</p>
							</div>
						)}

						<div>
							<Label htmlFor="confirm-notes">Notes (Optional)</Label>
							<Textarea
								id="confirm-notes"
								value={confirmNotes}
								onChange={(e) => setConfirmNotes(e.target.value)}
								placeholder="Add confirmation notes..."
								rows={3}
							/>
						</div>

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
								Cancel
							</Button>
							<Button
								onClick={handleConfirm}
								disabled={confirmMutation.isPending}
							>
								{confirmMutation.isPending ? 'Confirming...' : 'Confirm Payment'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Reject Payment Dialog */}
			<Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Payment</DialogTitle>
						<DialogDescription>
							Reject this payment and provide a reason
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{selectedPayment && (
							<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<p className="text-sm text-gray-600 dark:text-gray-400">Payment #{selectedPayment.id}</p>
								<p className="font-medium text-lg">
									{selectedPayment.amount.toLocaleString()} EGP
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{selectedPayment.customerName} - {selectedPayment.paymentMethodName}
								</p>
							</div>
						)}

						<div>
							<Label htmlFor="reject-reason">Rejection Reason *</Label>
							<Textarea
								id="reject-reason"
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								placeholder="Enter rejection reason..."
								rows={4}
								required
							/>
						</div>

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setShowRejectDialog(false)}>
								Cancel
							</Button>
							<Button
								onClick={handleReject}
								disabled={!rejectReason.trim() || rejectMutation.isPending}
								variant="destructive"
							>
								{rejectMutation.isPending ? 'Rejecting...' : 'Reject Payment'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default AccountingDashboard;

