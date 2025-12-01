import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { salesApi } from '@/services/sales/salesApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { usePerformance } from '@/hooks/usePerformance';
import { DollarSign, Building2, User, Eye, Shield, Calendar, FileText } from 'lucide-react';
import DealApprovalForm from '@/components/sales/DealApprovalForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';

interface Deal {
	id: string;
	offerId: string;
	clientId: string;
	clientName: string;
	dealValue: number;
	dealDescription: string;
	expectedCloseDate: string;
	status: 'PendingManagerApproval' | 'PendingSuperAdminApproval' | 'Approved' | 'Success' | 'Failed' | 'Rejected';
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	createdByName: string;
	managerApprovedAt?: string;
	managerApprovedBy?: string;
	managerApprovedByName?: string;
	paymentTerms?: string;
	deliveryTerms?: string;
	notes?: string;
	[key: string]: any;
}

const SuperAdminDealApprovals: React.FC = React.memo(() => {
	usePerformance('SuperAdminDealApprovals');
	const { user } = useAuthStore();
	const [pendingDeals, setPendingDeals] = useState<Deal[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
	const [showApprovalDialog, setShowApprovalDialog] = useState(false);

	const loadPendingApprovals = useCallback(async () => {
		if (!user?.token) return;

		try {
			setLoading(true);
			const response = await salesApi.getPendingSuperAdminApprovals();

			if (response.success && response.data) {
				const normalizedDeals = response.data
					.filter((deal: any) =>
						deal.status === 'PendingManagerApproval' ||
						deal.status === 'PendingSuperAdminApproval'
					)
					.map((deal: any) => ({
						...deal,
						id: String(deal.id || deal.Id),
						offerId: String(deal.offerId || deal.OfferId || ''),
						clientId: String(deal.clientId || deal.ClientId || ''),
						dealValue: deal.dealValue || deal.DealValue || deal.totalValue || deal.TotalValue || 0,
						dealDescription: deal.dealDescription || deal.Notes || deal.notes || 'No description available',
						expectedCloseDate: deal.expectedCloseDate || deal.ExpectedDeliveryDate || deal.expectedDeliveryDate || new Date().toISOString(),
						clientName: deal.clientName || deal.ClientName || 'Unknown Client',
						createdBy: deal.createdBy || deal.CreatedBy || deal.salesmanId || deal.SalesmanId || '',
						createdByName: deal.createdByName || deal.CreatedByName || deal.salesmanName || deal.SalesmanName || 'Unknown',
						createdAt: deal.createdAt || deal.CreatedAt || new Date().toISOString(),
						updatedAt: deal.updatedAt || deal.UpdatedAt || deal.createdAt || deal.CreatedAt || new Date().toISOString(),
						status: deal.status || deal.Status,
					}));

				setPendingDeals(normalizedDeals);
			} else {
				setPendingDeals([]);
			}
		} catch (error: any) {
			console.error('Failed to load pending approvals:', error);
			toast.error('Failed to load pending approvals');
			setPendingDeals([]);
		} finally {
			setLoading(false);
		}
	}, [user?.token]);

	const handleViewDeal = useCallback(async (dealId: string | number) => {
		try {
			const response = await salesApi.getDeal(String(dealId));
			if (response.success && response.data) {
				const dealData = response.data;
				const dealStatus = dealData.status || dealData.Status || 'PendingManagerApproval';

				const normalizedDeal: Deal = {
					...dealData,
					id: String(dealData.id || dealData.Id),
					offerId: String(dealData.offerId || dealData.OfferId || ''),
					clientId: String(dealData.clientId || dealData.ClientId || ''),
					dealValue: dealData.dealValue || dealData.DealValue || dealData.totalValue || dealData.TotalValue || 0,
					dealDescription: dealData.dealDescription || dealData.Notes || dealData.notes || 'No description available',
					expectedCloseDate: dealData.expectedCloseDate || dealData.ExpectedDeliveryDate || dealData.expectedDeliveryDate || new Date().toISOString(),
					clientName: dealData.clientName || dealData.ClientName || 'Unknown Client',
					createdBy: dealData.createdBy || dealData.CreatedBy || dealData.salesmanId || dealData.SalesmanId || '',
					createdByName: dealData.createdByName || dealData.CreatedByName || dealData.salesmanName || dealData.SalesmanName || 'Unknown',
					createdAt: dealData.createdAt || dealData.CreatedAt || new Date().toISOString(),
					updatedAt: dealData.updatedAt || dealData.UpdatedAt || dealData.createdAt || dealData.CreatedAt || new Date().toISOString(),
					status: dealStatus as 'PendingManagerApproval' | 'PendingSuperAdminApproval' | 'Approved' | 'Success' | 'Failed' | 'Rejected',
				};
				setSelectedDeal(normalizedDeal);
				setShowApprovalDialog(true);
			}
		} catch (error: any) {
			console.error('Failed to load deal details:', error);
			toast.error('Failed to load deal details');
		}
	}, []);

	const handleApprovalSuccess = useCallback(() => {
		setShowApprovalDialog(false);
		setSelectedDeal(null);
		loadPendingApprovals();
		toast.success('Deal approval processed successfully');
	}, [loadPendingApprovals]);

	useEffect(() => {
		loadPendingApprovals();
	}, [loadPendingApprovals]);

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5 text-blue-600" />
						Pending Deal Approvals (Super Admin)
					</CardTitle>
					<CardDescription>Review and approve deals awaiting your final approval</CardDescription>
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
								<Shield className="h-6 w-6 text-blue-600" />
								Pending Deal Approvals (Super Admin)
							</CardTitle>
							<CardDescription className="mt-2 text-base">
								{pendingDeals.length} {pendingDeals.length === 1 ? 'deal' : 'deals'} awaiting your final approval
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{pendingDeals.length === 0 ? (
						<EmptyState
							title="No Pending Approvals"
							description="All deals have been reviewed. Check back later for new approvals."
						/>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{pendingDeals.map((deal) => (
								<Card
									key={String(deal.id)}
									className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-white/[0.03]"
								>
									<CardContent className="pt-6">
										{/* Header with Badge */}
										<div className="flex items-start justify-between mb-4">
											<div>
												<div className="flex items-center gap-2 mb-2">
													<Badge className="bg-blue-100 text-blue-800 border-blue-300 border">
														Pending Approval
													</Badge>
													<span className="text-sm text-muted-foreground font-medium">
														Deal #{deal.id}
													</span>
												</div>
											</div>
										</div>

										{/* Deal Information Grid */}
										<div className="space-y-4 mb-6">
											{/* Client */}
											<div className="flex items-start gap-3">
												<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
													<Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-xs font-medium text-muted-foreground mb-1">Client</p>
													<p className="text-base font-semibold text-gray-900 dark:text-white truncate">
														{deal.clientName}
													</p>
												</div>
											</div>

											{/* Deal Value */}
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

											{/* Expected Close Date */}
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

											{/* Created By */}
											<div className="flex items-start gap-3">
												<div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
													<User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-xs font-medium text-muted-foreground mb-1">Created By</p>
													<p className="text-sm text-gray-900 dark:text-white">
														{deal.createdByName}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														{format(new Date(deal.createdAt), 'MMM dd, yyyy HH:mm')}
													</p>
												</div>
											</div>

											{/* Description Preview */}
											{deal.dealDescription && (
												<div className="flex items-start gap-3">
													<div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
														<FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
														<p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
															{deal.dealDescription}
														</p>
													</div>
												</div>
											)}
										</div>

										{/* Action Button */}
										<Button
											onClick={() => handleViewDeal(deal.id)}
											className="w-full bg-blue-600 hover:bg-blue-700 text-white"
											size="lg"
										>
											<Eye className="h-4 w-4 mr-2" />
											Review & Approve
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Approval Dialog */}
			<Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-xl">Review Deal Approval (Super Admin)</DialogTitle>
					</DialogHeader>
					{selectedDeal && (
						<DealApprovalForm
							deal={selectedDeal}
							onSuccess={handleApprovalSuccess}
							onCancel={() => setShowApprovalDialog(false)}
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
});

SuperAdminDealApprovals.displayName = 'SuperAdminDealApprovals';

export default SuperAdminDealApprovals;
