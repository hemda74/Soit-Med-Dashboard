import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { salesApi } from '@/services/sales/salesApi';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';
import { usePerformance } from '@/hooks/usePerformance';
import { Clock, DollarSign, Building2, User, CheckCircle2, XCircle, Eye, Shield } from 'lucide-react';
import DealApprovalForm from '@/components/sales/DealApprovalForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';

interface Deal {
	id: string;
	offerId: string;
	clientId: string;
	clientName: string;
	dealValue: number;
	status: 'PendingManagerApproval' | 'PendingSuperAdminApproval' | 'Approved' | 'Success' | 'Failed' | 'Rejected';
	createdAt: string;
	createdBy: string;
	createdByName: string;
	managerApprovedAt?: string;
	managerApprovedBy?: string;
	managerApprovedByName?: string;
	paymentTerms?: string;
	deliveryTerms?: string;
	notes?: string;
}

const SuperAdminDealApprovals: React.FC = React.memo(() => {
	usePerformance('SuperAdminDealApprovals');
	const { t } = useTranslation();
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
				// Filter only pending super admin approvals
				const superAdminApprovals = response.data.filter(
					(deal: any) => deal.status === 'PendingSuperAdminApproval'
				);
				setPendingDeals(superAdminApprovals);
			}
		} catch (error: any) {
			console.error('Failed to load pending approvals:', error);
			toast.error('Failed to load pending approvals');
		} finally {
			setLoading(false);
		}
	}, [user?.token]);

	const handleViewDeal = useCallback(async (dealId: string) => {
		try {
			const response = await salesApi.getDeal(dealId);
			if (response.success && response.data) {
				setSelectedDeal(response.data);
				setShowApprovalDialog(true);
			}
		} catch (error: any) {
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
					<CardTitle>Pending Deal Approvals</CardTitle>
					<CardDescription>Review and approve deals awaiting your approval</CardDescription>
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
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5 text-orange-600" />
						Pending Deal Approvals (Super Admin)
					</CardTitle>
					<CardDescription>
						{pendingDeals.length} {pendingDeals.length === 1 ? 'deal' : 'deals'} awaiting your final approval
					</CardDescription>
				</CardHeader>
				<CardContent>
					{pendingDeals.length === 0 ? (
						<EmptyState
							title="No Pending Approvals"
							description="All deals have been reviewed. Check back later for new approvals."
						/>
					) : (
						<div className="space-y-4">
							{pendingDeals.map((deal) => (
								<Card key={deal.id} className="border-l-4 border-l-orange-500">
									<CardContent className="pt-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-3 mb-3">
													<Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-300">
														Pending Super Admin Approval
													</Badge>
													<span className="text-sm text-muted-foreground">
														#{deal.id}
													</span>
												</div>
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<Building2 className="h-4 w-4 text-muted-foreground" />
														<span className="font-medium">{deal.clientName}</span>
													</div>
													<div className="flex items-center gap-2">
														<DollarSign className="h-4 w-4 text-muted-foreground" />
														<span className="text-lg font-bold text-green-600">
															{deal.dealValue.toLocaleString()} EGP
														</span>
													</div>
													{deal.managerApprovedByName && (
														<div className="flex items-center gap-2">
															<CheckCircle2 className="h-4 w-4 text-green-600" />
															<span className="text-sm text-muted-foreground">
																Approved by Manager: {deal.managerApprovedByName}
															</span>
															{deal.managerApprovedAt && (
																<span className="text-xs text-muted-foreground">
																	({format(new Date(deal.managerApprovedAt), 'MMM dd, yyyy')})
																</span>
															)}
														</div>
													)}
													<div className="flex items-center gap-2">
														<User className="h-4 w-4 text-muted-foreground" />
														<span className="text-sm text-muted-foreground">
															Created by: {deal.createdByName}
														</span>
													</div>
													<div className="text-sm text-muted-foreground">
														Created: {format(new Date(deal.createdAt), 'MMM dd, yyyy HH:mm')}
													</div>
												</div>
											</div>
											<Button
												onClick={() => handleViewDeal(deal.id)}
												variant="outline"
												size="sm"
												className="ml-4"
											>
												<Eye className="h-4 w-4 mr-2" />
												Review
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Approval Dialog */}
			<Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Review Deal Approval (Super Admin)</DialogTitle>
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

