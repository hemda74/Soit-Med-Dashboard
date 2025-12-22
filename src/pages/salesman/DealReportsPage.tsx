import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { salesApi } from '@/services/sales/salesApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FileText, Building2, DollarSign, Calendar, Eye } from 'lucide-react';
import SalesManReportForm from '@/components/sales/SalesManReportForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';

interface Deal {
	id: string | number;
	clientName: string;
	dealValue: number;
	expectedCloseDate?: string;
	createdAt: string;
	status: string;
	[key: string]: any;
}

const DealReportsPage: React.FC = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [deals, setDeals] = useState<Deal[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
	const [showReportDialog, setShowReportDialog] = useState(false);

	useEffect(() => {
		loadDeals();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.token]);

	const loadDeals = async () => {
		if (!user?.token) return;

		try {
			setLoading(true);
			const response = await salesApi.getDeals('AwaitingSalesManReport');

			if (response.success && response.data) {
				const normalizedDeals = response.data.map((deal: any) => ({
					...deal,
					id: String(deal.id || deal.Id),
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

	const handleSubmitReport = () => {
		setShowReportDialog(false);
		setSelectedDeal(null);
		loadDeals();
		toast.success(t('reportSubmittedSuccessfully'));
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Deals Awaiting Report</CardTitle>
					<CardDescription>Submit your reports for approved deals</CardDescription>
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
								<FileText className="h-6 w-6 text-blue-600" />
								Deals Awaiting Report
							</CardTitle>
							<CardDescription className="mt-2 text-base">
								{deals.length} {deals.length === 1 ? 'deal' : 'deals'} awaiting your report
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{deals.length === 0 ? (
						<EmptyState
							title="No Deals Awaiting Report"
							description="All reports have been submitted. Check back later for new deals."
						/>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{deals.map((deal) => (
								<Card
									key={String(deal.id)}
									className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-white/[0.03]"
								>
									<CardContent className="pt-6">
										<div className="flex items-start justify-between mb-4">
											<div>
												<div className="flex items-center gap-2 mb-2">
													<Badge className="bg-blue-100 text-blue-800 border-blue-300 border">
														Awaiting Report
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

										<Button
											onClick={() => {
												setSelectedDeal(deal);
												setShowReportDialog(true);
											}}
											className="w-full bg-blue-600 hover:bg-blue-700 text-white"
											size="lg"
										>
											<Eye className="h-4 w-4 mr-2" />
											Submit Report
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-xl">Submit Report</DialogTitle>
					</DialogHeader>
					{selectedDeal && (
						<SalesManReportForm
							dealId={selectedDeal.id}
							dealClientName={selectedDeal.clientName}
							onSuccess={handleSubmitReport}
							onCancel={() => setShowReportDialog(false)}
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default DealReportsPage;



