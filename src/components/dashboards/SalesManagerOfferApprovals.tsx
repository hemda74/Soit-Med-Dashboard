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
import OfferApprovalForm from '@/components/sales/OfferApprovalForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';

interface Offer {
	id: string;
	clientId: string;
	clientName: string;
	totalAmount: number;
	status: string;
	createdAt: string;
	createdBy: string;
	createdByName: string;
	products?: string;
	assignedTo?: string;
	assignedToName?: string;
}

const SalesManagerOfferApprovals: React.FC = () => {
	usePerformance('SalesManagerOfferApprovals');
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [pendingOffers, setPendingOffers] = useState<Offer[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
	const [showApprovalDialog, setShowApprovalDialog] = useState(false);

	useEffect(() => {
		loadPendingApprovals();
	}, []);

	const loadPendingApprovals = async () => {
		if (!user?.token) return;

		try {
			setLoading(true);
			const response = await salesApi.getPendingSalesManagerApprovals();
			if (response.success && response.data) {
				setPendingOffers(response.data);
			}
		} catch (error: any) {
			console.error('Failed to load pending offer approvals:', error);
			toast.error('Failed to load pending offer approvals');
		} finally {
			setLoading(false);
		}
	};

	const handleViewOffer = async (offerId: string) => {
		try {
			const response = await salesApi.getOffer(offerId);
			if (response.success && response.data) {
				setSelectedOffer(response.data);
				setShowApprovalDialog(true);
			}
		} catch (error: any) {
			toast.error('Failed to load offer details');
		}
	};

	const handleApprovalSuccess = () => {
		setShowApprovalDialog(false);
		setSelectedOffer(null);
		loadPendingApprovals();
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Pending Offer Approvals</CardTitle>
					<CardDescription>Review and approve offers awaiting your approval</CardDescription>
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
						<Clock className="h-5 w-5" />
						Pending Offer Approvals
					</CardTitle>
					<CardDescription>
						Review and approve offers before they are sent to salesmen
					</CardDescription>
				</CardHeader>
				<CardContent>
					{pendingOffers.length === 0 ? (
						<EmptyState
							title="No Pending Approvals"
							description="All offers have been reviewed. Check back later for new approvals."
							icon={CheckCircle2}
						/>
					) : (
						<div className="space-y-4">
							{pendingOffers.map((offer) => (
								<Card key={offer.id} className="border-l-4 border-l-yellow-500">
									<CardContent className="pt-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-3 mb-3">
													<Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400">
														Pending Approval
													</Badge>
													<span className="text-sm text-muted-foreground">
														#{offer.id}
													</span>
												</div>
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<Building2 className="h-4 w-4 text-muted-foreground" />
														<span className="font-medium">{offer.clientName}</span>
													</div>
													<div className="flex items-center gap-2">
														<DollarSign className="h-4 w-4 text-muted-foreground" />
														<span className="text-lg font-bold text-green-600 dark:text-green-400">
															{offer.totalAmount.toLocaleString()} EGP
														</span>
													</div>
													{offer.assignedToName && (
														<div className="flex items-center gap-2">
															<User className="h-4 w-4 text-muted-foreground" />
															<span className="text-sm text-muted-foreground">
																Assigned to: {offer.assignedToName}
															</span>
														</div>
													)}
													<div className="flex items-center gap-2">
														<User className="h-4 w-4 text-muted-foreground" />
														<span className="text-sm text-muted-foreground">
															Created by: {offer.createdByName || 'SalesSupport'}
														</span>
													</div>
													<div className="text-sm text-muted-foreground">
														Created: {format(new Date(offer.createdAt), 'MMM dd, yyyy HH:mm')}
													</div>
												</div>
											</div>
											<Button
												onClick={() => handleViewOffer(offer.id)}
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
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Review Offer</DialogTitle>
					</DialogHeader>
					{selectedOffer && (
						<OfferApprovalForm
							offer={selectedOffer}
							onSuccess={handleApprovalSuccess}
							onCancel={() => {
								setShowApprovalDialog(false);
								setSelectedOffer(null);
							}}
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default SalesManagerOfferApprovals;

