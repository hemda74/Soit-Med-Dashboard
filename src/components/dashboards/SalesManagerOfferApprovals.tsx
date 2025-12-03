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
import { Clock, DollarSign, Building2, User, Eye, Calendar, FileText, CheckCircle2 } from 'lucide-react';
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
	description?: string;
	notes?: string;
	[key: string]: any;
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
				// Normalize the data
				const normalizedOffers = (response.data || []).map((offer: any) => ({
					...offer,
					id: String(offer.id || offer.Id || ''),
					clientId: String(offer.clientId || offer.ClientId || ''),
					clientName: offer.clientName || offer.ClientName || 'Unknown Client',
					totalAmount: offer.totalAmount || offer.TotalAmount || offer.totalValue || offer.TotalValue || 0,
					createdBy: offer.createdBy || offer.CreatedBy || '',
					createdByName: offer.createdByName || offer.CreatedByName || offer.createdBy || 'SalesSupport',
					assignedTo: offer.assignedTo || offer.AssignedTo || '',
					assignedToName: offer.assignedToName || offer.AssignedToName || offer.assignedTo || '',
					description: offer.description || offer.Description || offer.notes || offer.Notes || '',
					createdAt: offer.createdAt || offer.CreatedAt || new Date().toISOString(),
					status: offer.status || offer.Status || 'PendingManagerApproval',
				}));
				setPendingOffers(normalizedOffers);
			} else {
				setPendingOffers([]);
			}
		} catch (error: any) {
			console.error('Failed to load pending offer approvals:', error);
			toast.error('Failed to load pending offer approvals');
			setPendingOffers([]);
		} finally {
			setLoading(false);
		}
	};

	const handleViewOffer = async (offerId: string) => {
		try {
			const response = await salesApi.getOffer(offerId);
			if (response.success && response.data) {
				// Normalize the offer data
				const offerData = response.data;
				const normalizedOffer: Offer = {
					...offerData,
					id: String(offerData.id || offerData.Id || ''),
					clientId: String(offerData.clientId || offerData.ClientId || ''),
					clientName: offerData.clientName || offerData.ClientName || 'Unknown Client',
					totalAmount: offerData.totalAmount || offerData.TotalAmount || offerData.totalValue || offerData.TotalValue || 0,
					createdBy: offerData.createdBy || offerData.CreatedBy || '',
					createdByName: offerData.createdByName || offerData.CreatedByName || offerData.createdBy || 'SalesSupport',
					assignedTo: offerData.assignedTo || offerData.AssignedTo || '',
					assignedToName: offerData.assignedToName || offerData.AssignedToName || offerData.assignedTo || '',
					description: offerData.description || offerData.Description || offerData.notes || offerData.Notes || '',
					createdAt: offerData.createdAt || offerData.CreatedAt || new Date().toISOString(),
					status: offerData.status || offerData.Status || 'PendingManagerApproval',
					products: offerData.products || offerData.Products || '',
					notes: offerData.notes || offerData.Notes || '',
				};
				setSelectedOffer(normalizedOffer);
				setShowApprovalDialog(true);
			}
		} catch (error: any) {
			console.error('Failed to load offer details:', error);
			toast.error('Failed to load offer details');
		}
	};

	const handleApprovalSuccess = () => {
		setShowApprovalDialog(false);
		setSelectedOffer(null);
		loadPendingApprovals();
		toast.success('Offer approval processed successfully');
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5 text-yellow-600" />
						Pending Offer Approvals
					</CardTitle>
					<CardDescription>Review and approve offers before they are sent to salesmen</CardDescription>
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
								<Clock className="h-6 w-6 text-yellow-600" />
						Pending Offer Approvals
					</CardTitle>
							<CardDescription className="mt-2 text-base">
								{pendingOffers.length} {pendingOffers.length === 1 ? 'offer' : 'offers'} awaiting your approval
					</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{pendingOffers.length === 0 ? (
						<EmptyState
							title="No Pending Approvals"
							description="All offers have been reviewed. Check back later for new approvals."
							icon={<CheckCircle2 className="h-12 w-12 text-gray-400" />}
						/>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{pendingOffers.map((offer) => (
								<Card 
									key={offer.id} 
									className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-white/[0.03]"
								>
									<CardContent className="pt-6">
										{/* Header with Badge */}
										<div className="flex items-start justify-between mb-4">
											<div>
												<div className="flex items-center gap-2 mb-2">
													<Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 border">
														Pending Approval
													</Badge>
													<span className="text-sm text-muted-foreground font-medium">
														Offer #{offer.id}
													</span>
												</div>
											</div>
										</div>

										{/* Offer Information Grid */}
										<div className="space-y-4 mb-6">
											{/* Client */}
											<div className="flex items-start gap-3">
												<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
													<Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-xs font-medium text-muted-foreground mb-1">Client</p>
													<p className="text-base font-semibold text-gray-900 dark:text-white truncate">
														{offer.clientName}
													</p>
												</div>
											</div>

											{/* Total Amount */}
											<div className="flex items-start gap-3">
												<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
													<DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-xs font-medium text-muted-foreground mb-1">Total Amount</p>
													<p className="text-lg font-bold text-green-600 dark:text-green-400">
														EGP {offer.totalAmount.toLocaleString()}
													</p>
												</div>
											</div>

											{/* Assigned To */}
											{offer.assignedToName && (
												<div className="flex items-start gap-3">
													<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
														<User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-xs font-medium text-muted-foreground mb-1">Assigned To</p>
														<p className="text-sm text-gray-900 dark:text-white">
															{offer.assignedToName}
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
														{offer.createdByName || 'SalesSupport'}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														{format(new Date(offer.createdAt), 'MMM dd, yyyy HH:mm')}
													</p>
												</div>
											</div>

											{/* Description/Notes Preview */}
											{(offer.description || offer.notes) && (
												<div className="flex items-start gap-3">
													<div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
														<FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
														<p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
															{offer.description || offer.notes || 'No description available'}
														</p>
													</div>
												</div>
											)}
											</div>

										{/* Action Button */}
											<Button
												onClick={() => handleViewOffer(offer.id)}
											className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
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
						<DialogTitle className="text-xl">Review Offer Approval</DialogTitle>
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
