import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { salesApi } from '@/services/sales/salesApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FileText, Key, Building2, DollarSign, Calendar, Loader2, CheckCircle, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import SalesmanReviewForm from '@/components/sales/SalesmanReviewForm';
import SetClientCredentialsForm from '@/components/admin/SetClientCredentialsForm';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface Deal {
	id: string | number;
	clientName: string;
	clientId: number;
	dealValue: number;
	salesManId: string;
	salesManName: string;
	secondSalesManId?: string;
	secondSalesManName?: string;
	firstSalesManReview?: string;
	firstSalesManReviewSubmittedAt?: string;
	secondSalesManReview?: string;
	secondSalesManReviewSubmittedAt?: string;
	clientUsername?: string;
	clientCredentialsSetAt?: string;
	createdAt: string;
	status: string;
	[key: string]: any;
}

const DealsReviewsAndAccountSetupPage: React.FC = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [deals, setDeals] = useState<Deal[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [showCredentialsModal, setShowCredentialsModal] = useState(false);
	const [reviewType, setReviewType] = useState<'first' | 'second'>('first');
	const [activeTab, setActiveTab] = useState<'reviews' | 'credentials'>('reviews');

	const isAdmin = user?.roles?.includes('Admin') || user?.roles?.includes('SuperAdmin');
	const isSalesman = user?.roles?.includes('SalesMan');

	useEffect(() => {
		loadDeals();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.token]);

	const loadDeals = async () => {
		if (!user?.token) return;

		try {
			setLoading(true);
			const response = await salesApi.getDealsAwaitingReviewsAndAccountSetup();

			if (response.success && response.data) {
				const normalizedDeals = response.data.map((deal: any) => ({
					...deal,
					id: String(deal.id || deal.Id),
					clientId: deal.clientId || deal.ClientId,
					clientName: deal.clientName || deal.ClientName || 'Unknown Client',
					dealValue: deal.dealValue || deal.DealValue || deal.totalValue || deal.TotalValue || 0,
					salesManId: deal.salesManId || deal.SalesManId,
					salesManName: deal.salesManName || deal.SalesManName,
					secondSalesManId: deal.secondSalesManId || deal.SecondSalesManId,
					secondSalesManName: deal.secondSalesManName || deal.SecondSalesManName,
					firstSalesManReview: deal.firstSalesManReview || deal.FirstSalesManReview,
					firstSalesManReviewSubmittedAt: deal.firstSalesManReviewSubmittedAt || deal.FirstSalesManReviewSubmittedAt,
					secondSalesManReview: deal.secondSalesManReview || deal.SecondSalesManReview,
					secondSalesManReviewSubmittedAt: deal.secondSalesManReviewSubmittedAt || deal.SecondSalesManReviewSubmittedAt,
					clientUsername: deal.clientUsername || deal.ClientUsername,
					clientCredentialsSetAt: deal.clientCredentialsSetAt || deal.ClientCredentialsSetAt,
					createdAt: deal.createdAt || deal.CreatedAt || new Date().toISOString(),
				}));
				setDeals(normalizedDeals);
			} else {
				setDeals([]);
			}
		} catch (error: any) {
			console.error('Failed to load deals:', error);
			toast.error(t('failedToLoadDeals') || 'Failed to load deals');
			setDeals([]);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmitReview = (type: 'first' | 'second') => {
		if (!selectedDeal) return;
		setReviewType(type);
		setShowReviewModal(true);
	};

	const handleSetCredentials = () => {
		setShowCredentialsModal(true);
	};

	const handleReviewSuccess = () => {
		setShowReviewModal(false);
		setSelectedDeal(null);
		loadDeals();
	};

	const handleCredentialsSuccess = () => {
		setShowCredentialsModal(false);
		setSelectedDeal(null);
		loadDeals();
	};

	const canSubmitFirstReview = (deal: Deal) => {
		if (!isSalesman) return false;
		return deal.salesManId === user?.id && !deal.firstSalesManReview;
	};

	const canSubmitSecondReview = (deal: Deal) => {
		if (!isSalesman) return false;
		return deal.secondSalesManId === user?.id && !deal.secondSalesManReview;
	};

	const canSetCredentials = (deal: Deal) => {
		if (!isAdmin) return false;
		return !deal.clientUsername;
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Deals Awaiting Reviews & Account Setup</CardTitle>
					<CardDescription>Submit reviews and set client credentials</CardDescription>
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
								Deals Awaiting Reviews & Account Setup
							</CardTitle>
							<CardDescription className="mt-2 text-base">
								{deals.length} {deals.length === 1 ? 'deal' : 'deals'} awaiting action
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{deals.length === 0 ? (
						<EmptyState
							title="No Deals Awaiting Action"
							description="All deals have been processed. Check back later for new deals."
						/>
					) : (
						<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'reviews' | 'credentials')}>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="reviews">
									<FileText className="h-4 w-4 mr-2" />
									Salesmen Reviews
								</TabsTrigger>
								<TabsTrigger value="credentials">
									<Key className="h-4 w-4 mr-2" />
									Client Credentials
								</TabsTrigger>
							</TabsList>

							<TabsContent value="reviews" className="mt-6">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									{deals.map((deal) => (
										<Card
											key={String(deal.id)}
											className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all"
										>
											<CardContent className="pt-6">
												<div className="flex items-start justify-between mb-4">
													<div>
														<Badge className="bg-purple-100 text-purple-800 mb-2">
															Awaiting Reviews
														</Badge>
														<p className="text-sm text-muted-foreground">Deal #{deal.id}</p>
													</div>
												</div>

												<div className="space-y-4 mb-6">
													<div className="flex items-start gap-3">
														<Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
														<div>
															<p className="font-semibold">{deal.clientName}</p>
															<p className="text-sm text-muted-foreground">
																EGP {deal.dealValue.toLocaleString()}
															</p>
														</div>
													</div>

													<div className="space-y-2">
														<div className="flex items-center justify-between p-2 bg-gray-50 rounded">
															<span className="text-sm">First Salesman Review:</span>
															{deal.firstSalesManReview ? (
																<Badge variant="outline" className="bg-green-50">
																	<CheckCircle className="h-3 w-3 mr-1" />
																	Submitted
																</Badge>
															) : (
																<Badge variant="outline" className="bg-yellow-50">
																	Pending
																</Badge>
															)}
														</div>

														{deal.secondSalesManId && (
															<div className="flex items-center justify-between p-2 bg-gray-50 rounded">
																<span className="text-sm">Second Salesman Review:</span>
																{deal.secondSalesManReview ? (
																	<Badge variant="outline" className="bg-green-50">
																		<CheckCircle className="h-3 w-3 mr-1" />
																		Submitted
																	</Badge>
																) : (
																	<Badge variant="outline" className="bg-yellow-50">
																		Pending
																	</Badge>
																)}
															</div>
														)}
													</div>
												</div>

												<div className="flex gap-2">
													{canSubmitFirstReview(deal) && (
														<Button
															size="sm"
															onClick={() => {
																setSelectedDeal(deal);
																handleSubmitReview('first');
															}}
															className="flex-1"
														>
															<FileText className="h-4 w-4 mr-2" />
															Submit First Review
														</Button>
													)}
													{canSubmitSecondReview(deal) && (
														<Button
															size="sm"
															onClick={() => {
																setSelectedDeal(deal);
																handleSubmitReview('second');
															}}
															className="flex-1"
														>
															<FileText className="h-4 w-4 mr-2" />
															Submit Second Review
														</Button>
													)}
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</TabsContent>

							<TabsContent value="credentials" className="mt-6">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									{deals.map((deal) => (
										<Card
											key={String(deal.id)}
											className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all"
										>
											<CardContent className="pt-6">
												<div className="flex items-start justify-between mb-4">
													<div>
														<Badge className="bg-blue-100 text-blue-800 mb-2">
															Awaiting Credentials
														</Badge>
														<p className="text-sm text-muted-foreground">Deal #{deal.id}</p>
													</div>
												</div>

												<div className="space-y-4 mb-6">
													<div className="flex items-start gap-3">
														<Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
														<div>
															<p className="font-semibold">{deal.clientName}</p>
															<p className="text-sm text-muted-foreground">
																EGP {deal.dealValue.toLocaleString()}
															</p>
														</div>
													</div>

													<div className="p-2 bg-gray-50 rounded">
														<span className="text-sm">Credentials Status: </span>
														{deal.clientUsername ? (
															<Badge variant="outline" className="bg-green-50">
																<CheckCircle className="h-3 w-3 mr-1" />
																Set ({deal.clientUsername})
															</Badge>
														) : (
															<Badge variant="outline" className="bg-yellow-50">
																Pending
															</Badge>
														)}
													</div>
												</div>

												{canSetCredentials(deal) && (
													<Button
														size="sm"
														onClick={() => {
															setSelectedDeal(deal);
															handleSetCredentials();
														}}
														className="w-full"
													>
														<Key className="h-4 w-4 mr-2" />
														Set Credentials
													</Button>
												)}
											</CardContent>
										</Card>
									))}
								</div>
							</TabsContent>
						</Tabs>
					)}
				</CardContent>
			</Card>

			{/* Review Modal */}
			<Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
				<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Submit Review</DialogTitle>
						<DialogDescription>
							Submit your review for the legal team
						</DialogDescription>
					</DialogHeader>
					{selectedDeal && (
						<SalesmanReviewForm
							dealId={selectedDeal.id}
							dealClientName={selectedDeal.clientName}
							reviewType={reviewType}
							onSuccess={handleReviewSuccess}
							onCancel={() => {
								setShowReviewModal(false);
								setSelectedDeal(null);
							}}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Credentials Modal */}
			<Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
				<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Set Client Credentials</DialogTitle>
						<DialogDescription>
							Set username and password for the client account
						</DialogDescription>
					</DialogHeader>
					{selectedDeal && (
						<SetClientCredentialsForm
							dealId={selectedDeal.id}
							dealClientName={selectedDeal.clientName}
							onSuccess={handleCredentialsSuccess}
							onCancel={() => {
								setShowCredentialsModal(false);
								setSelectedDeal(null);
							}}
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default DealsReviewsAndAccountSetupPage;

