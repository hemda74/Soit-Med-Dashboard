import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { salesApi } from '@/services/sales/salesApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { UserPlus, Building2, DollarSign, Calendar, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface Deal {
	id: string | number;
	clientName: string;
	clientId: number;
	dealValue: number;
	expectedCloseDate?: string;
	createdAt: string;
	status: string;
	[key: string]: any;
}

const ClientAccountCreationPage: React.FC = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [deals, setDeals] = useState<Deal[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingId, setProcessingId] = useState<string | number | null>(null);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

	useEffect(() => {
		loadDeals();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.token]);

	const loadDeals = async () => {
		if (!user?.token) return;

		try {
			setLoading(true);
			const response = await salesApi.getDeals({ status: 'AwaitingClientAccountCreation' });

			if (response.success && response.data) {
				const normalizedDeals = response.data.map((deal: any) => ({
					...deal,
					id: String(deal.id || deal.Id),
					clientId: deal.clientId || deal.ClientId,
					clientName: deal.clientName || deal.ClientName || 'Unknown Client',
					dealValue: deal.dealValue || deal.DealValue || deal.totalValue || deal.TotalValue || 0,
					expectedCloseDate: deal.expectedCloseDate || deal.ExpectedDeliveryDate || deal.expectedDeliveryDate,
					createdAt: deal.createdAt || deal.CreatedAt || new Date().toISOString(),
				}));
				setDeals(normalizedDeals);
			} else {
				setDeals([]);
			}
		} catch (error: any) {
			console.error('Failed to load deals:', error);
			toast.error(t('failedToLoadDeals'));
			setDeals([]);
		} finally {
			setLoading(false);
		}
	};

	const handleMarkAccountCreatedClick = (deal: Deal) => {
		setSelectedDeal(deal);
		setShowConfirmModal(true);
	};

	const handleConfirmMarkAccountCreated = async () => {
		if (!selectedDeal) return;

		try {
			setProcessingId(selectedDeal.id);
			const response = await salesApi.markClientAccountCreated(selectedDeal.id);

			if (response.success) {
				toast.success(t('clientAccountMarkedAsCreated'));
				setShowConfirmModal(false);
				setSelectedDeal(null);
				loadDeals(); // This will remove the deal from the list since status changed
			} else {
				toast.error(response.message || 'Failed to mark account as created');
			}
		} catch (error: any) {
			console.error('Error marking account as created:', error);
			toast.error(error.message || 'Failed to mark account as created');
		} finally {
			setProcessingId(null);
		}
	};

	const handleCancelConfirm = () => {
		setShowConfirmModal(false);
		setSelectedDeal(null);
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Client Account Creation</CardTitle>
					<CardDescription>Create accounts for clients with approved deals</CardDescription>
				</CardHeader>
				<CardContent>
					<LoadingSpinner />
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2 text-2xl">
								<UserPlus className="h-6 w-6 text-orange-600" />
								Client Account Creation
							</CardTitle>
							<CardDescription className="mt-2 text-base">
								{deals.length} {deals.length === 1 ? 'deal' : 'deals'} awaiting client account creation
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{deals.length === 0 ? (
						<EmptyState
							title="No Deals Awaiting Account Creation"
							description="All client accounts have been created. Check back later for new deals."
						/>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{deals.map((deal) => (
								<Card
									key={String(deal.id)}
									className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-white/[0.03]"
								>
									<CardContent className="pt-6">
										<div className="flex items-start justify-between mb-4">
											<div>
												<div className="flex items-center gap-2 mb-2">
													<Badge className="bg-orange-100 text-orange-800 border-orange-300 border">
														Awaiting Account Creation
													</Badge>
													<span className="text-sm text-muted-foreground font-medium">
														Deal #{deal.id}
													</span>
												</div>
											</div>
										</div>

										<div className="space-y-4 mb-6">
											<div className="flex items-start gap-3">
												<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
													<Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-xs font-medium text-muted-foreground mb-1">Client</p>
													<p className="text-base font-semibold text-gray-900 dark:text-white truncate">
														{deal.clientName}
													</p>
													<p className="text-xs text-muted-foreground mt-1">Client ID: {deal.clientId}</p>
												</div>
											</div>

											<div className="flex items-start gap-3">
												<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
													<DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-xs font-medium text-muted-foreground mb-1">Deal Value</p>
													<p className="text-lg font-bold text-green-600 dark:text-green-400">
														EGP {deal.dealValue.toLocaleString()}
													</p>
												</div>
											</div>

											{deal.expectedCloseDate && (
												<div className="flex items-start gap-3">
													<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
														<Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-xs font-medium text-muted-foreground mb-1">Expected Close Date</p>
														<p className="text-sm text-gray-900 dark:text-white">
															{format(new Date(deal.expectedCloseDate), 'MMM dd, yyyy')}
														</p>
													</div>
												</div>
											)}
										</div>

										{deal.status === 'AwaitingClientAccountCreation' && (
											<Button
												onClick={() => handleMarkAccountCreatedClick(deal)}
												disabled={processingId === deal.id}
												className="w-full bg-orange-600 hover:bg-orange-700 text-white"
												size="lg"
											>
												{processingId === deal.id ? (
													<>
														<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														Processing...
													</>
												) : (
													<>
														<CheckCircle className="h-4 w-4 mr-2" />
														Mark Account Created
													</>
												)}
											</Button>
										)}
										{deal.status !== 'AwaitingClientAccountCreation' && (
											<Badge className="w-full justify-center bg-green-100 text-green-800 border-green-300 border py-2">
												<CheckCircle className="h-4 w-4 mr-2" />
												Account Created
											</Badge>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Confirmation Modal */}
			<Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-orange-600" />
							Confirm Account Creation
						</DialogTitle>
						<DialogDescription className="pt-2">
							Are you sure you want to mark the client account as created for this deal?
						</DialogDescription>
					</DialogHeader>
					{selectedDeal && (
						<div className="py-4 space-y-3">
							<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
								<div className="flex justify-between">
									<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Deal ID:</span>
									<span className="text-sm font-semibold">#{selectedDeal.id}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Client:</span>
									<span className="text-sm font-semibold">{selectedDeal.clientName}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Deal Value:</span>
									<span className="text-sm font-semibold">EGP {selectedDeal.dealValue.toLocaleString()}</span>
								</div>
							</div>
							<div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
								<p className="text-sm text-orange-800 dark:text-orange-200">
									<strong>Note:</strong> After confirming, the deal will move to the next stage (Awaiting SalesMan Report) and will no longer appear in this list.
								</p>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={handleCancelConfirm}
							disabled={processingId !== null}
						>
							Cancel
						</Button>
						<Button
							onClick={handleConfirmMarkAccountCreated}
							disabled={processingId !== null}
							className="bg-orange-600 hover:bg-orange-700 text-white"
						>
							{processingId !== null ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Processing...
								</>
							) : (
								<>
									<CheckCircle className="h-4 w-4 mr-2" />
									Confirm
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ClientAccountCreationPage;



