/**
 * Payment Transactions Component
 * 
 * Lists PaymentTransactions by Status
 * Allows Accountants to:
 * - Confirm collection (for Delegate method)
 * - Approve online payments (for Gateway method)
 * 
 * Filter by Visit, Customer, Date Range
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { API_ENDPOINTS } from '@/services/shared/endpoints';
import { getAuthToken } from '@/utils/authUtils';
import { getApiBaseUrl } from '@/utils/apiConfig';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircleIcon, CreditCardIcon } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface PaymentTransaction {
	id: number;
	paymentId: number;
	visitId?: number;
	transactionType: string;
	amount: number;
	method: string;
	status: string;
	gatewayTransactionId?: string;
	collectionDelegateId?: string;
	accountsApproverId?: string;
	createdAt: string;
}

interface PaymentTransactionsFilters {
	visitId?: number;
	customerId?: string;
	status?: string;
	dateFrom?: Date;
	dateTo?: Date;
}

export const PaymentTransactions: React.FC = () => {
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const [filters, setFilters] = useState<PaymentTransactionsFilters>({});
	const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(null);

	// Fetch payment transactions
	const { data: transactionsData, isLoading } = useQuery({
		queryKey: ['paymentTransactions', filters],
		queryFn: async () => {
			const token = getAuthToken();
			const params = new URLSearchParams();
			if (filters.visitId) params.append('visitId', filters.visitId.toString());
			if (filters.customerId) params.append('customerId', filters.customerId);
			if (filters.status) params.append('status', filters.status);
			if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
			if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());

			const response = await fetch(
				`${getApiBaseUrl()}/api/PaymentTransaction?${params.toString()}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) throw new Error('Failed to fetch transactions');
			const result = await response.json();
			return result.data as PaymentTransaction[];
		},
		enabled: !!user,
	});

	// Confirm collection mutation (for Delegate)
	const confirmCollectionMutation = useMutation({
		mutationFn: async (transactionId: number) => {
			const token = getAuthToken();
			const response = await fetch(
				`${getApiBaseUrl()}/api/PaymentTransaction/${transactionId}/confirm-collection`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to confirm collection');
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success('Collection confirmed');
			queryClient.invalidateQueries({ queryKey: ['paymentTransactions'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to confirm collection');
		},
	});

	// Approve payment mutation (for Gateway)
	const approvePaymentMutation = useMutation({
		mutationFn: async (transactionId: number) => {
			const token = getAuthToken();
			const response = await fetch(
				`${getApiBaseUrl()}/api/PaymentTransaction/${transactionId}/approve`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to approve payment');
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success('Payment approved');
			queryClient.invalidateQueries({ queryKey: ['paymentTransactions'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to approve payment');
		},
	});

	const transactions = transactionsData || [];

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'Collected':
			case 'PaidOnline':
				return 'default';
			case 'PendingCollection':
				return 'secondary';
			case 'Unpaid':
				return 'destructive';
			default:
				return 'outline';
		}
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CreditCardIcon className="h-6 w-6" />
						Payment Transactions
					</CardTitle>
					<CardDescription>
						Review and confirm payment transactions
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Filters */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						<div>
							<Label>Status</Label>
							<Select
								value={filters.status || ''}
								onValueChange={(value) =>
									setFilters({ ...filters, status: value || undefined })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="All Statuses" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Statuses</SelectItem>
									<SelectItem value="Unpaid">Unpaid</SelectItem>
									<SelectItem value="PendingCollection">Pending Collection</SelectItem>
									<SelectItem value="Collected">Collected</SelectItem>
									<SelectItem value="PaidOnline">Paid Online</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Date From</Label>
							<Popover open={showDatePicker === 'from'} onOpenChange={(open) => setShowDatePicker(open ? 'from' : null)}>
								<PopoverTrigger asChild>
									<Button variant="outline" className="w-full justify-start text-left font-normal">
										<CalendarIcon className="mr-2 h-4 w-4" />
										{filters.dateFrom ? format(filters.dateFrom, 'PPP') : 'Select date'}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={filters.dateFrom}
										onSelect={(date) => {
											setFilters({ ...filters, dateFrom: date });
											setShowDatePicker(null);
										}}
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div>
							<Label>Date To</Label>
							<Popover open={showDatePicker === 'to'} onOpenChange={(open) => setShowDatePicker(open ? 'to' : null)}>
								<PopoverTrigger asChild>
									<Button variant="outline" className="w-full justify-start text-left font-normal">
										<CalendarIcon className="mr-2 h-4 w-4" />
										{filters.dateTo ? format(filters.dateTo, 'PPP') : 'Select date'}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={filters.dateTo}
										onSelect={(date) => {
											setFilters({ ...filters, dateTo: date });
											setShowDatePicker(null);
										}}
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div>
							<Label>Visit ID</Label>
							<Input
								type="number"
								placeholder="Filter by Visit ID"
								value={filters.visitId || ''}
								onChange={(e) =>
									setFilters({ ...filters, visitId: e.target.value ? parseInt(e.target.value) : undefined })
								}
							/>
						</div>
					</div>

					{/* Transactions List */}
					{isLoading ? (
						<div className="text-center py-8">Loading transactions...</div>
					) : transactions.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No transactions found matching the filters
						</div>
					) : (
						<div className="space-y-4">
							{transactions.map((transaction) => (
								<Card key={transaction.id} className="hover:shadow-md transition-shadow">
									<CardContent className="pt-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<h3 className="font-semibold">Transaction #{transaction.id}</h3>
													<Badge variant={getStatusBadgeVariant(transaction.status)}>
														{transaction.status}
													</Badge>
													<Badge variant="outline">{transaction.method}</Badge>
												</div>
												<div className="grid grid-cols-2 gap-4 mt-4">
													<div>
														<p className="text-sm font-medium text-muted-foreground">Amount</p>
														<p className="text-sm font-semibold">{transaction.amount.toFixed(2)} EGP</p>
													</div>
													<div>
														<p className="text-sm font-medium text-muted-foreground">Type</p>
														<p className="text-sm">{transaction.transactionType}</p>
													</div>
													{transaction.visitId && (
														<div>
															<p className="text-sm font-medium text-muted-foreground">Visit ID</p>
															<p className="text-sm">#{transaction.visitId}</p>
														</div>
													)}
													<div>
														<p className="text-sm font-medium text-muted-foreground">Created</p>
														<p className="text-sm">{format(new Date(transaction.createdAt), 'PPP p')}</p>
													</div>
													{transaction.gatewayTransactionId && (
														<div>
															<p className="text-sm font-medium text-muted-foreground">Gateway Transaction ID</p>
															<p className="text-sm font-mono text-xs">{transaction.gatewayTransactionId}</p>
														</div>
													)}
												</div>
											</div>
											<div className="flex gap-2 ml-4">
												{transaction.method === 'Delegate' && transaction.status === 'PendingCollection' && (
													<Button
														variant="default"
														size="sm"
														onClick={() => confirmCollectionMutation.mutate(transaction.id)}
														disabled={confirmCollectionMutation.isPending}
														className="flex items-center gap-1"
													>
														<CheckCircleIcon className="h-4 w-4" />
														Confirm Collection
													</Button>
												)}
												{transaction.method === 'Gateway' && transaction.status === 'PaidOnline' && !transaction.accountsApproverId && (
													<Button
														variant="default"
														size="sm"
														onClick={() => approvePaymentMutation.mutate(transaction.id)}
														disabled={approvePaymentMutation.isPending}
														className="flex items-center gap-1"
													>
														<CheckCircleIcon className="h-4 w-4" />
														Approve Payment
													</Button>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

