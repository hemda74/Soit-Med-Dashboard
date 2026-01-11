import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { salesApi } from '@/services/sales/salesApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FileText, Building2, DollarSign, Calendar, User, Eye, Download, Package, FileCheck, CreditCard, Truck, Shield, Clock, Image, ExternalLink, ArrowLeft, CheckCircle, Archive } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';

interface OfferEquipment {
	id: number;
	offerId: number;
	name: string;
	model?: string;
	provider?: string;
	country?: string;
	year?: number;
	imagePath?: string;
	providerImagePath?: string;
	price: number;
	description?: string;
	inStock: boolean;
}

interface OfferTerms {
	id: number;
	offerId: number;
	warrantyPeriod?: string;
	deliveryTime?: string;
	maintenanceTerms?: string;
	otherTerms?: string;
}

interface InstallmentPlan {
	id: number;
	offerId: number;
	installmentNumber: number;
	amount: number;
	dueDate: string;
	status: string;
	notes?: string;
}

interface Offer {
	id: number;
	offerRequestId?: number;
	clientId: number;
	clientName: string;
	createdBy: string;
	createdByName: string;
	assignedTo: string;
	assignedToName: string;
	products: string;
	totalAmount: number;
	paymentTerms?: string[];
	deliveryTerms?: string[];
	warrantyTerms?: string[];
	validUntil?: string[];
	status: string;
	sentToClientAt?: string;
	clientResponse?: string;
	createdAt: string;
	updatedAt?: string;
	paymentType?: string;
	finalPrice?: number;
	discountAmount?: number;
	offerDuration?: string;
	notes?: string;
	equipment?: OfferEquipment[];
	terms?: OfferTerms;
	installments?: InstallmentPlan[];
}

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
	offer?: Offer;
	[key: string]: any;
}

const LegalDealsPage: React.FC = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [deals, setDeals] = useState<Deal[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
	const [showDealDialog, setShowDealDialog] = useState(false);
	const [totalDealsCount, setTotalDealsCount] = useState<number>(0);
	const [processingDealId, setProcessingDealId] = useState<number | null>(null);

	useEffect(() => {
		loadDeals();
		loadTotalCount();
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
					salesmanName: deal.salesmanName || deal.SalesManName || 'Unknown',
					status: deal.status || deal.Status || 'SentToLegal',
					offer: deal.offer || deal.Offer || null,
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

	const loadTotalCount = async () => {
		if (!user?.token) return;

		try {
			const response = await salesApi.getTotalDealsCount();
			if (response.success && response.data) {
				setTotalDealsCount(response.data.totalCount || 0);
			}
		} catch (error: any) {
			console.error('Failed to load total deals count:', error);
		}
	};

	const handleMarkAsReviewed = async (deal: Deal) => {
		if (!user?.token) return;

		setConfirmTitle('Mark Deal as Reviewed');
		setConfirmMessage('Are you sure you want to mark this deal as reviewed and archive it? This action cannot be undone.');
		setConfirmAction(() => async () => {
			try {
				setProcessingDealId(Number(deal.id));
				const response = await salesApi.markDealAsLegalReviewed(Number(deal.id));

				if (response.success) {
					toast.success('Deal marked as reviewed successfully');
					await loadDeals();
				} else {
					toast.error(response.message || 'Failed to mark deal as reviewed');
				}
			} catch (error: any) {
				console.error('Error marking deal as reviewed:', error);
				toast.error(error.message || 'Failed to mark deal as reviewed');
			} finally {
				setProcessingDealId(null);
				setShowConfirmModal(false);
				setConfirmAction(null);
			}
		});
		setShowConfirmModal(true);
	};

	const handleConfirm = () => {
		if (confirmAction) {
			confirmAction();
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'SentToLegal':
				return <Badge className="bg-purple-100 text-purple-800 border-purple-300 border dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700">Sent to Legal</Badge>;
			case 'ReturnedToSalesman':
				return <Badge className="bg-orange-100 text-orange-800 border-orange-300 border dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700">Returned to Salesman</Badge>;
			case 'LegalReviewed':
				return <Badge className="bg-green-100 text-green-800 border-green-300 border dark:bg-green-900 dark:text-green-200 dark:border-green-700">Reviewed & Archived</Badge>;
			default:
				return <Badge className="bg-gray-100 text-gray-800 border-gray-300 border dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">{status}</Badge>;
		}
	};

	// Calculate statistics
	const getStatusCounts = () => {
		const counts = {
			total: deals.length,
			sentToLegal: deals.filter(d => d.status === 'SentToLegal').length,
			returnedToSalesman: deals.filter(d => d.status === 'ReturnedToSalesman').length,
			legalReviewed: deals.filter(d => d.status === 'LegalReviewed').length,
			totalValue: deals.reduce((sum, d) => sum + (d.dealValue || 0), 0),
			sentToLegalValue: deals.filter(d => d.status === 'SentToLegal').reduce((sum, d) => sum + (d.dealValue || 0), 0),
			returnedToSalesmanValue: deals.filter(d => d.status === 'ReturnedToSalesman').reduce((sum, d) => sum + (d.dealValue || 0), 0),
			legalReviewedValue: deals.filter(d => d.status === 'LegalReviewed').reduce((sum, d) => sum + (d.dealValue || 0), 0),
		};
		return counts;
	};

	const statusCounts = getStatusCounts();
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
	const [confirmTitle, setConfirmTitle] = useState('');
	const [confirmMessage, setConfirmMessage] = useState('');

	const parseAttachments = (attachmentsJson?: string): string[] => {
		if (!attachmentsJson) return [];
		try {
			return JSON.parse(attachmentsJson);
		} catch {
			return [];
		}
	};

	const isImageFile = (filePath: string): boolean => {
		const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
		const lowerPath = filePath.toLowerCase();
		return imageExtensions.some(ext => lowerPath.endsWith(ext));
	};

	const isLocalFile = (filePath: string): boolean => {
		return filePath.startsWith('file://') || filePath.startsWith('/Users/') || filePath.startsWith('/var/');
	};

	const getFileName = (filePath: string): string => {
		if (isLocalFile(filePath)) {
			// Extract filename from local path
			const parts = filePath.split('/');
			return parts[parts.length - 1] || 'Attachment';
		}
		// Extract filename from URL
		try {
			const url = new URL(filePath);
			const pathParts = url.pathname.split('/');
			return pathParts[pathParts.length - 1] || 'Attachment';
		} catch {
			const pathParts = filePath.split('/');
			return pathParts[pathParts.length - 1] || 'Attachment';
		}
	};

	const getImageUrl = (filePath: string): string | null => {
		// If it's a local file, we can't display it
		if (isLocalFile(filePath)) {
			return null;
		}
		// If it's already a full URL, return as is
		if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
			return filePath;
		}
		// If it's a relative path (like "deal-reports/guid.jpg"), construct the full URL
		// Files are stored in wwwroot, so we can access them via the base URL
		// Use environment variable or fallback to shared config default
		// To update: edit shared-config.ts and run sync-config.js
		const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.8:5117';
		// Remove leading slash if present, then add it back
		const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
		return `${API_BASE_URL}${cleanPath}`;
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{t('legalDealsPageTitle')}</CardTitle>
					<CardDescription>{t('legalDealsPageDescription')}</CardDescription>
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
								{t('legalDealsPageTitle')}
							</CardTitle>
							<CardDescription className="mt-2 text-base space-y-1">
								<div>{deals.length} {deals.length === 1 ? 'deal' : 'deals'} in legal workflow</div>
								<div className="text-sm text-muted-foreground">Total deals in system: {totalDealsCount.toLocaleString()}</div>
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Statistics Section */}
					<div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
						{/* Total Deals */}
						<Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
											Total Deals
										</p>
										<p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
											{statusCounts.total}
										</p>
										<p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mt-1">
											EGP {statusCounts.totalValue.toLocaleString()}
										</p>
									</div>
									<div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-lg">
										<FileText className="h-6 w-6 text-purple-700 dark:text-purple-300" />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Sent to Legal */}
						<Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
											Sent to Legal
										</p>
										<p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
											{statusCounts.sentToLegal}
										</p>
										<p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mt-1">
											EGP {statusCounts.sentToLegalValue.toLocaleString()}
										</p>
									</div>
									<div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-lg">
										<Clock className="h-6 w-6 text-blue-700 dark:text-blue-300" />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Returned to Salesman */}
						<Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
											Returned
										</p>
										<p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
											{statusCounts.returnedToSalesman}
										</p>
										<p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mt-1">
											EGP {statusCounts.returnedToSalesmanValue.toLocaleString()}
										</p>
									</div>
									<div className="p-3 bg-orange-200 dark:bg-orange-800 rounded-lg">
										<ArrowLeft className="h-6 w-6 text-orange-700 dark:text-orange-300" />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Reviewed & Archived */}
						<Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
											Reviewed
										</p>
										<p className="text-3xl font-bold text-green-900 dark:text-green-100">
											{statusCounts.legalReviewed}
										</p>
										<p className="text-xs font-semibold text-green-700 dark:text-green-300 mt-1">
											EGP {statusCounts.legalReviewedValue.toLocaleString()}
										</p>
									</div>
									<div className="p-3 bg-green-200 dark:bg-green-800 rounded-lg">
										<Archive className="h-6 w-6 text-green-700 dark:text-green-300" />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

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
													{getStatusBadge(deal.status)}
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
													<p className="text-xs font-medium text-muted-foreground mb-1">SalesMan</p>
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
				<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-xl">Deal Details</DialogTitle>
					</DialogHeader>
					{selectedDeal && (
						<div className="space-y-6">
							{/* Basic Deal Information */}
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
									<p className="text-sm font-medium text-muted-foreground">SalesMan</p>
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

							{/* SalesMan Report */}
							{selectedDeal.reportText && (
								<div>
									<p className="text-sm font-medium text-muted-foreground mb-2">SalesMan Report</p>
									<div className="p-4 bg-muted rounded-lg">
										<p className="text-sm whitespace-pre-wrap">{selectedDeal.reportText}</p>
									</div>
								</div>
							)}

							{/* Report Attachments */}
							{selectedDeal.reportAttachments && parseAttachments(selectedDeal.reportAttachments).length > 0 && (
								<div>
									<p className="text-sm font-medium text-muted-foreground mb-2">Attachments</p>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{parseAttachments(selectedDeal.reportAttachments).map((attachment, index) => {
											const fileName = getFileName(attachment);
											const imageUrl = getImageUrl(attachment);
											const isImage = isImageFile(attachment);
											const isLocal = isLocalFile(attachment);

											return (
												<div
													key={index}
													className="border rounded-lg overflow-hidden bg-muted"
												>
													{isImage && imageUrl ? (
														// Display image if it's an image and has a valid URL
														<div className="relative">
															<img
																src={imageUrl}
																alt={fileName}
																className="w-full h-48 object-cover"
																onError={(e) => {
																	// Hide image on error
																	e.currentTarget.style.display = 'none';
																	e.currentTarget.nextElementSibling?.classList.remove('hidden');
																}}
															/>
															<div className="hidden p-4">
																<div className="flex items-center gap-2 text-sm text-muted-foreground">
																	<FileText className="h-4 w-4" />
																	<span className="truncate">{fileName}</span>
																</div>
																{isLocal && (
																	<p className="text-xs text-orange-600 mt-1">
																		Local file - cannot be displayed
																	</p>
																)}
															</div>
														</div>
													) : (
														// Display file info for non-images or local files
														<div className="p-4">
															<div className="flex items-center gap-2 mb-2">
																{isImage ? (
																	<Image className="h-5 w-5 text-blue-600" />
																) : (
																	<FileText className="h-5 w-5 text-gray-600" />
																)}
																<span className="text-sm font-medium truncate flex-1">{fileName}</span>
															</div>
															{isLocal ? (
																<div className="space-y-2">
																	<p className="text-xs text-orange-600">
																		⚠️ Local file path - cannot be displayed in web browser
																	</p>
																	<p className="text-xs text-muted-foreground break-all">
																		{attachment}
																	</p>
																</div>
															) : imageUrl ? (
																<Button
																	variant="outline"
																	size="sm"
																	className="w-full mt-2"
																	onClick={() => window.open(imageUrl, '_blank')}
																>
																	<ExternalLink className="h-4 w-4 mr-2" />
																	Open in new tab
																</Button>
															) : (
																<p className="text-xs text-muted-foreground">
																	{attachment}
																</p>
															)}
														</div>
													)}
												</div>
											);
										})}
									</div>
								</div>
							)}

							{/* Offer Information Section */}
							{selectedDeal.offer && (
								<div className="border-t pt-6 mt-6">
									<div className="flex items-center gap-2 mb-4">
										<FileCheck className="h-5 w-5 text-blue-600" />
										<h3 className="text-lg font-semibold">Original Offer Information</h3>
									</div>

									{/* Offer Basic Info */}
									<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-1">Offer ID</p>
											<p className="text-sm font-semibold">#{selectedDeal.offer.id}</p>
										</div>
										<div>
											<p className="text-xs font-medium text-muted-foreground mb-1">Total Amount</p>
											<p className="text-sm font-semibold text-green-600">
												EGP {selectedDeal.offer.totalAmount?.toLocaleString() || 'N/A'}
											</p>
										</div>
										{selectedDeal.offer.finalPrice && (
											<div>
												<p className="text-xs font-medium text-muted-foreground mb-1">Final Price</p>
												<p className="text-sm font-semibold text-blue-600">
													EGP {selectedDeal.offer.finalPrice.toLocaleString()}
												</p>
											</div>
										)}
										{selectedDeal.offer.discountAmount && selectedDeal.offer.discountAmount > 0 && (
											<div>
												<p className="text-xs font-medium text-muted-foreground mb-1">Discount</p>
												<p className="text-sm font-semibold text-orange-600">
													EGP {selectedDeal.offer.discountAmount.toLocaleString()}
												</p>
											</div>
										)}
										{selectedDeal.offer.paymentType && (
											<div>
												<p className="text-xs font-medium text-muted-foreground mb-1">Payment Type</p>
												<p className="text-sm font-semibold">{selectedDeal.offer.paymentType}</p>
											</div>
										)}
										{selectedDeal.offer.offerDuration && (
											<div>
												<p className="text-xs font-medium text-muted-foreground mb-1">Offer Duration</p>
												<p className="text-sm font-semibold">{selectedDeal.offer.offerDuration}</p>
											</div>
										)}
									</div>

									{/* Products Description */}
									{selectedDeal.offer.products && (
										<div className="mb-6">
											<p className="text-sm font-medium text-muted-foreground mb-2">Products Description</p>
											<div className="p-3 bg-muted rounded-lg">
												<p className="text-sm whitespace-pre-wrap">{selectedDeal.offer.products}</p>
											</div>
										</div>
									)}

									{/* Equipment List */}
									{selectedDeal.offer.equipment && selectedDeal.offer.equipment.length > 0 && (
										<div className="mb-6">
											<div className="flex items-center gap-2 mb-3">
												<Package className="h-4 w-4 text-purple-600" />
												<p className="text-sm font-medium">Equipment ({selectedDeal.offer.equipment.length} items)</p>
											</div>
											<div className="space-y-3">
												{selectedDeal.offer.equipment.map((item) => (
													<div key={item.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
														<div className="flex items-start justify-between mb-2">
															<div className="flex-1">
																<p className="font-semibold text-sm">{item.name}</p>
																{item.model && (
																	<p className="text-xs text-muted-foreground">Model: {item.model}</p>
																)}
															</div>
															<p className="text-sm font-semibold text-green-600">
																EGP {item.price.toLocaleString()}
															</p>
														</div>
														<div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs text-muted-foreground">
															{item.provider && <span>Provider: {item.provider}</span>}
															{item.country && <span>Country: {item.country}</span>}
															{item.year && <span>Year: {item.year}</span>}
															<span className={item.inStock ? 'text-green-600' : 'text-red-600'}>
																{item.inStock ? 'In Stock' : 'Out of Stock'}
															</span>
														</div>
														{item.description && (
															<p className="text-xs text-muted-foreground mt-2">{item.description}</p>
														)}
													</div>
												))}
											</div>
										</div>
									)}

									{/* Payment Terms */}
									{selectedDeal.offer.paymentTerms && selectedDeal.offer.paymentTerms.length > 0 && (
										<div className="mb-6">
											<div className="flex items-center gap-2 mb-2">
												<CreditCard className="h-4 w-4 text-blue-600" />
												<p className="text-sm font-medium">Payment Terms</p>
											</div>
											<ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
												{selectedDeal.offer.paymentTerms.map((term, index) => (
													<li key={index}>{term}</li>
												))}
											</ul>
										</div>
									)}

									{/* Delivery Terms */}
									{selectedDeal.offer.deliveryTerms && selectedDeal.offer.deliveryTerms.length > 0 && (
										<div className="mb-6">
											<div className="flex items-center gap-2 mb-2">
												<Truck className="h-4 w-4 text-orange-600" />
												<p className="text-sm font-medium">Delivery Terms</p>
											</div>
											<ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
												{selectedDeal.offer.deliveryTerms.map((term, index) => (
													<li key={index}>{term}</li>
												))}
											</ul>
										</div>
									)}

									{/* Warranty Terms */}
									{selectedDeal.offer.warrantyTerms && selectedDeal.offer.warrantyTerms.length > 0 && (
										<div className="mb-6">
											<div className="flex items-center gap-2 mb-2">
												<Shield className="h-4 w-4 text-green-600" />
												<p className="text-sm font-medium">Warranty Terms</p>
											</div>
											<ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
												{selectedDeal.offer.warrantyTerms.map((term, index) => (
													<li key={index}>{term}</li>
												))}
											</ul>
										</div>
									)}

									{/* Additional Terms */}
									{selectedDeal.offer.terms && (
										<div className="mb-6">
											<div className="flex items-center gap-2 mb-3">
												<FileCheck className="h-4 w-4 text-indigo-600" />
												<p className="text-sm font-medium">Additional Terms</p>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{selectedDeal.offer.terms.warrantyPeriod && (
													<div>
														<p className="text-xs font-medium text-muted-foreground mb-1">Warranty Period</p>
														<p className="text-sm">{selectedDeal.offer.terms.warrantyPeriod}</p>
													</div>
												)}
												{selectedDeal.offer.terms.deliveryTime && (
													<div>
														<p className="text-xs font-medium text-muted-foreground mb-1">Delivery Time</p>
														<p className="text-sm">{selectedDeal.offer.terms.deliveryTime}</p>
													</div>
												)}
												{selectedDeal.offer.terms.maintenanceTerms && (
													<div className="md:col-span-2">
														<p className="text-xs font-medium text-muted-foreground mb-1">Maintenance Terms</p>
														<p className="text-sm whitespace-pre-wrap">{selectedDeal.offer.terms.maintenanceTerms}</p>
													</div>
												)}
												{selectedDeal.offer.terms.otherTerms && (
													<div className="md:col-span-2">
														<p className="text-xs font-medium text-muted-foreground mb-1">Other Terms</p>
														<p className="text-sm whitespace-pre-wrap">{selectedDeal.offer.terms.otherTerms}</p>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Installment Plans */}
									{selectedDeal.offer.installments && selectedDeal.offer.installments.length > 0 && (
										<div className="mb-6">
											<div className="flex items-center gap-2 mb-3">
												<Clock className="h-4 w-4 text-purple-600" />
												<p className="text-sm font-medium">Installment Plan ({selectedDeal.offer.installments.length} installments)</p>
											</div>
											<div className="overflow-x-auto">
												<table className="w-full text-sm">
													<thead>
														<tr className="border-b">
															<th className="text-left p-2">#</th>
															<th className="text-left p-2">Amount</th>
															<th className="text-left p-2">Due Date</th>
															<th className="text-left p-2">Status</th>
														</tr>
													</thead>
													<tbody>
														{selectedDeal.offer.installments.map((installment) => (
															<tr key={installment.id} className="border-b">
																<td className="p-2">{installment.installmentNumber}</td>
																<td className="p-2 font-semibold">EGP {installment.amount.toLocaleString()}</td>
																<td className="p-2">
																	{format(new Date(installment.dueDate), 'MMM dd, yyyy')}
																</td>
																<td className="p-2">
																	<Badge variant={installment.status === 'Paid' ? 'default' : 'secondary'}>
																		{installment.status}
																	</Badge>
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</div>
									)}

									{/* Offer Notes */}
									{selectedDeal.offer.notes && (
										<div>
											<p className="text-sm font-medium text-muted-foreground mb-2">Offer Notes</p>
											<div className="p-3 bg-muted rounded-lg">
												<p className="text-sm whitespace-pre-wrap">{selectedDeal.offer.notes}</p>
											</div>
										</div>
									)}
								</div>
							)}

							{/* Action Buttons - Only show for deals with status "SentToLegal" */}
							{selectedDeal.status === 'SentToLegal' && (
								<div className="border-t pt-6 mt-6">
									<div className="flex items-center gap-2 mb-4">
										<Shield className="h-5 w-5 text-purple-600" />
										<h3 className="text-lg font-semibold">Legal Actions</h3>
									</div>
									<div className="flex justify-center">
										<Button
											onClick={() => handleMarkAsReviewed(selectedDeal)}
											disabled={processingDealId === Number(selectedDeal.id)}
											className="bg-green-600 hover:bg-green-700 text-white"
											size="lg"
										>
											{processingDealId === Number(selectedDeal.id) ? (
												<>
													<Clock className="h-4 w-4 mr-2 animate-spin" />
													Processing...
												</>
											) : (
												<>
													<Archive className="h-4 w-4 mr-2" />
													Mark as Reviewed
												</>
											)}
										</Button>
									</div>
									<p className="text-xs text-muted-foreground mt-3 text-center">
										• <strong>Mark as Reviewed:</strong> Archive the deal after review (no action needed)
									</p>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Confirmation Modal */}
			<Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
				<DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
					<DialogHeader>
						<DialogTitle className="text-gray-900 dark:text-white">{confirmTitle}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-sm text-gray-700 dark:text-gray-300">
							{confirmMessage}
						</p>
						<div className="flex gap-3 justify-end pt-2">
							<Button
								variant="outline"
								onClick={() => {
									setShowConfirmModal(false);
									setConfirmAction(null);
								}}
								className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
							>
								Cancel
							</Button>
							<Button
								onClick={handleConfirm}
								className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
							>
								<CheckCircle className="h-4 w-4 mr-2" />
								Confirm
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default LegalDealsPage;



