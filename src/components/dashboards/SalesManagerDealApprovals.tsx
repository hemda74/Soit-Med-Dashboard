import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { salesApi } from '@/services/sales/salesApi';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';
import { usePerformance } from '@/hooks/usePerformance';
import { Clock, DollarSign, Building2, User, CheckCircle2, XCircle, Eye } from 'lucide-react';
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
	paymentTerms?: string;
	deliveryTerms?: string;
	notes?: string;
}

const SalesManagerDealApprovals: React.FC = () => {
	usePerformance('SalesManagerDealApprovals');
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [pendingDeals, setPendingDeals] = useState<Deal[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
	const [showApprovalDialog, setShowApprovalDialog] = useState(false);

	useEffect(() => {
		loadPendingApprovals();
	}, []);

	const loadPendingApprovals = async () => {
		if (!user?.token) return;

		try {
			setLoading(true);
			const response = await salesApi.getPendingApprovals();
			if (response.success && response.data) {
				// Filter only pending manager approvals
				const managerApprovals = response.data.filter(
					(deal: any) => deal.status === 'PendingManagerApproval'
				);
				setPendingDeals(managerApprovals);
			}
		} catch (error: any) {
			console.error('Failed to load pending approvals:', error);
			toast.error('Failed to load pending approvals');
		} finally {
			setLoading(false);
		}
	};

	const handleViewDeal = async (dealId: string) => {
		try {
			const response = await salesApi.getDeal(dealId);
			if (response.success && response.data) {
				setSelectedDeal(response.data);
				setShowApprovalDialog(true);
			}
		} catch (error: any) {
			toast.error('Failed to load deal details');
		}
	};

	const handleApprovalSuccess = () => {
		setShowApprovalDialog(false);
		setSelectedDeal(null);
		loadPendingApprovals();
		toast.success('Deal approval processed successfully');
	};

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
						<Clock className="h-5 w-5 text-yellow-600" />
						Pending Deal Approvals
					</CardTitle>
					<CardDescription>
						{pendingDeals.length} {pendingDeals.length === 1 ? 'deal' : 'deals'} awaiting your approval
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
								<Card key={deal.id} className="border-l-4 border-l-yellow-500">
									<CardContent className="pt-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-3 mb-3">
													<Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
														Pending Approval
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
						<DialogTitle>Review Deal Approval</DialogTitle>
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
};

export default SalesManagerDealApprovals;

