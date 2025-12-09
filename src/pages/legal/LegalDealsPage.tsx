import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { salesApi } from '@/services/sales/salesApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FileText, Building2, DollarSign, Calendar, User, Eye, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';

interface Deal {
	id: string | number;
	clientName: string;
	dealValue: number;
	expectedCloseDate?: string;
	createdAt: string;
	sentToLegalAt?: string;
	reportText?: string;
	reportAttachments?: string;
	salesmanName?: string;
	status: string;
	[key: string]: any;
}

const LegalDealsPage: React.FC = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [deals, setDeals] = useState<Deal[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
	const [showDealDialog, setShowDealDialog] = useState(false);

	useEffect(() => {
		loadDeals();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.token]);

	const loadDeals = async () => {
		if (!user?.token) return;

		try {
			setLoading(true);
			const response = await salesApi.getDealsForLegal();

			if (response.success && response.data) {
				const normalizedDeals = response.data.map((deal: any) => ({
					...deal,
					id: String(deal.id || deal.Id),
					clientName: deal.clientName || deal.ClientName || 'Unknown Client',
					dealValue: deal.dealValue || deal.DealValue || deal.totalValue || deal.TotalValue || 0,
					expectedCloseDate: deal.expectedCloseDate || deal.ExpectedDeliveryDate || deal.expectedDeliveryDate,
					createdAt: deal.createdAt || deal.CreatedAt || new Date().toISOString(),
					sentToLegalAt: deal.sentToLegalAt || deal.SentToLegalAt,
					reportText: deal.reportText || deal.ReportText,
					reportAttachments: deal.reportAttachments || deal.ReportAttachments,
					salesmanName: deal.salesmanName || deal.SalesmanName || 'Unknown',
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

	const parseAttachments = (attachmentsJson?: string): string[] => {
		if (!attachmentsJson) return [];
		try {
			return JSON.parse(attachmentsJson);
		} catch {
			return [];
		}
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Legal Department - Deals</CardTitle>
					<CardDescription>Review deals sent to legal department</CardDescription>
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
								<FileText className="h-6 w-6 text-purple-600" />
								Legal Department - Deals
							</CardTitle>
							<CardDescription className="mt-2 text-base">
								{deals.length} {deals.length === 1 ? 'deal' : 'deals'} received for review
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{deals.length === 0 ? (
						<EmptyState
							title="No Deals Received"
							description="No deals have been sent to the legal department yet."
						/>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{deals.map((deal) => (
								<Card
									key={String(deal.id)}
									className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-white/[0.03]"
								>
									<CardContent className="pt-6">
										<div className="flex items-start justify-between mb-4">
											<div>
												<div className="flex items-center gap-2 mb-2">
													<Badge className="bg-purple-100 text-purple-800 border-purple-300 border">
														Sent to Legal
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

											<div className="flex items-start gap-3">
												<div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
													<User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-xs font-medium text-muted-foreground mb-1">Salesman</p>
													<p className="text-sm text-gray-900 dark:text-white">
														{deal.salesmanName}
													</p>
												</div>
											</div>

											{deal.sentToLegalAt && (
												<div className="flex items-start gap-3">
													<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
														<Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-xs font-medium text-muted-foreground mb-1">Received At</p>
														<p className="text-sm text-gray-900 dark:text-white">
															{format(new Date(deal.sentToLegalAt), 'MMM dd, yyyy HH:mm')}
														</p>
													</div>
												</div>
											)}
										</div>

										<Button
											onClick={() => {
												setSelectedDeal(deal);
												setShowDealDialog(true);
											}}
											className="w-full bg-purple-600 hover:bg-purple-700 text-white"
											size="lg"
										>
											<Eye className="h-4 w-4 mr-2" />
											View Details
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog open={showDealDialog} onOpenChange={setShowDealDialog}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-xl">Deal Details</DialogTitle>
					</DialogHeader>
					{selectedDeal && (
						<div className="space-y-6">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Client</p>
									<p className="text-base font-semibold">{selectedDeal.clientName}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Deal Value</p>
									<p className="text-base font-semibold text-green-600">
										EGP {selectedDeal.dealValue.toLocaleString()}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Salesman</p>
									<p className="text-base font-semibold">{selectedDeal.salesmanName}</p>
								</div>
								{selectedDeal.sentToLegalAt && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">Received At</p>
										<p className="text-base font-semibold">
											{format(new Date(selectedDeal.sentToLegalAt), 'MMM dd, yyyy HH:mm')}
										</p>
									</div>
								)}
							</div>

							{selectedDeal.reportText && (
								<div>
									<p className="text-sm font-medium text-muted-foreground mb-2">Salesman Report</p>
									<div className="p-4 bg-muted rounded-lg">
										<p className="text-sm whitespace-pre-wrap">{selectedDeal.reportText}</p>
									</div>
								</div>
							)}

							{selectedDeal.reportAttachments && parseAttachments(selectedDeal.reportAttachments).length > 0 && (
								<div>
									<p className="text-sm font-medium text-muted-foreground mb-2">Attachments</p>
									<div className="space-y-2">
										{parseAttachments(selectedDeal.reportAttachments).map((attachment, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-2 bg-muted rounded-lg"
											>
												<span className="text-sm truncate flex-1">{attachment}</span>
												<Button variant="ghost" size="sm">
													<Download className="h-4 w-4" />
												</Button>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default LegalDealsPage;



