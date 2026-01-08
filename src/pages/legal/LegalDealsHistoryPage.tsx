import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { salesApi } from '@/services/sales/salesApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { 
	FileText, Building2, DollarSign, Calendar, User, Eye, 
	Package, FileCheck, CreditCard, Truck, Shield, Clock,
	Image, ExternalLink, Archive, Filter, Search, X, ArrowLeft
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface Deal {
	id: string | number;
	clientName: string;
	dealValue: number;
	expectedCloseDate?: string;
	createdAt: string;
	sentToLegalAt?: string;
	returnedToSalesmanAt?: string;
	legalReviewedAt?: string;
	reportText?: string;
	reportAttachments?: string;
	salesmanName?: string;
	status: string;
	offer?: any;
	[key: string]: any;
}

const LegalDealsHistoryPage: React.FC = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [deals, setDeals] = useState<Deal[]>([]);
	const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
	const [showDealDialog, setShowDealDialog] = useState(false);

	// Filters
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [dateFrom, setDateFrom] = useState<string>('');
	const [dateTo, setDateTo] = useState<string>('');

	useEffect(() => {
		loadDeals();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.token]);

	useEffect(() => {
		applyFilters();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deals, statusFilter, searchQuery, dateFrom, dateTo]);

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
					returnedToSalesmanAt: deal.returnedToSalesmanAt || deal.ReturnedToSalesmanAt,
					legalReviewedAt: deal.legalReviewedAt || deal.LegalReviewedAt,
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

	const applyFilters = () => {
		let filtered = [...deals];

		// Status filter
		if (statusFilter !== 'all') {
			filtered = filtered.filter(deal => deal.status === statusFilter);
		}

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(deal =>
				deal.clientName?.toLowerCase().includes(query) ||
				deal.salesmanName?.toLowerCase().includes(query) ||
				String(deal.id).includes(query) ||
				deal.reportText?.toLowerCase().includes(query)
			);
		}

		// Date filters
		if (dateFrom) {
			filtered = filtered.filter(deal => {
				const dealDate = deal.sentToLegalAt || deal.createdAt;
				return dealDate && new Date(dealDate) >= new Date(dateFrom);
			});
		}

		if (dateTo) {
			filtered = filtered.filter(deal => {
				const dealDate = deal.sentToLegalAt || deal.createdAt;
				return dealDate && new Date(dealDate) <= new Date(dateTo + 'T23:59:59');
			});
		}

		// Sort by date (most recent first)
		filtered.sort((a, b) => {
			const dateA = a.sentToLegalAt || a.createdAt;
			const dateB = b.sentToLegalAt || b.createdAt;
			return new Date(dateB).getTime() - new Date(dateA).getTime();
		});

		setFilteredDeals(filtered);
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

	const clearFilters = () => {
		setStatusFilter('all');
		setSearchQuery('');
		setDateFrom('');
		setDateTo('');
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
			const parts = filePath.split('/');
			return parts[parts.length - 1] || 'Attachment';
		}
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
		if (isLocalFile(filePath)) {
			return null;
		}
		if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
			return filePath;
		}
		// Use environment variable or fallback to shared config default
		// To update: edit shared-config.ts and run sync-config.js
		const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.10.9.100:5117';
		const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
		return `${API_BASE_URL}${cleanPath}`;
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{t('legalDealsHistoryPageTitle')}</CardTitle>
					<CardDescription>{t('legalDealsHistoryPageDescription')}</CardDescription>
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
								<Archive className="h-6 w-6 text-purple-600 dark:text-purple-400" />
								{t('legalDealsHistoryPageTitle')}
							</CardTitle>
							<CardDescription className="mt-2 text-base">
								{filteredDeals.length} of {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
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

					{/* Filters Section */}
					<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
						<div className="flex items-center gap-2 mb-4">
							<Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
							{(statusFilter !== 'all' || searchQuery || dateFrom || dateTo) && (
								<Button
									variant="ghost"
									size="sm"
									onClick={clearFilters}
									className="ml-auto text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
								>
									<X className="h-4 w-4 mr-1" />
									Clear Filters
								</Button>
							)}
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							{/* Search */}
							<div>
								<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
									Search
								</label>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Client, Salesman, Deal ID..."
										className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
									/>
								</div>
							</div>

							{/* Status Filter */}
							<div>
								<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
									Status
								</label>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
										<SelectValue placeholder="All Statuses" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Statuses</SelectItem>
										<SelectItem value="SentToLegal">Sent to Legal</SelectItem>
										<SelectItem value="ReturnedToSalesman">Returned to Salesman</SelectItem>
										<SelectItem value="LegalReviewed">Reviewed & Archived</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Date From */}
							<div>
								<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
									Date From
								</label>
								<Input
									type="date"
									value={dateFrom}
									onChange={(e) => setDateFrom(e.target.value)}
									className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
								/>
							</div>

							{/* Date To */}
							<div>
								<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
									Date To
								</label>
								<Input
									type="date"
									value={dateTo}
									onChange={(e) => setDateTo(e.target.value)}
									className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
								/>
							</div>
						</div>
					</div>

					{filteredDeals.length === 0 ? (
						<EmptyState
							title="No Deals Found"
							description={deals.length === 0 
								? "No deals have been sent to the legal department yet."
								: "No deals match the current filters. Try adjusting your search criteria."
							}
						/>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{filteredDeals.map((deal) => (
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
														<p className="text-xs font-medium text-muted-foreground mb-1">Sent to Legal</p>
														<p className="text-sm text-gray-900 dark:text-white">
															{format(new Date(deal.sentToLegalAt), 'MMM dd, yyyy HH:mm')}
														</p>
													</div>
												</div>
											)}

											{deal.returnedToSalesmanAt && (
												<div className="flex items-start gap-3">
													<div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex-shrink-0">
														<ArrowLeft className="h-5 w-5 text-orange-600 dark:text-orange-400" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-xs font-medium text-muted-foreground mb-1">Returned to Salesman</p>
														<p className="text-sm text-gray-900 dark:text-white">
															{format(new Date(deal.returnedToSalesmanAt), 'MMM dd, yyyy HH:mm')}
														</p>
													</div>
												</div>
											)}

											{deal.legalReviewedAt && (
												<div className="flex items-start gap-3">
													<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
														<Archive className="h-5 w-5 text-green-600 dark:text-green-400" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-xs font-medium text-muted-foreground mb-1">Reviewed & Archived</p>
														<p className="text-sm text-gray-900 dark:text-white">
															{format(new Date(deal.legalReviewedAt), 'MMM dd, yyyy HH:mm')}
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

			{/* Deal Details Dialog - Same as LegalDealsPage */}
			<Dialog open={showDealDialog} onOpenChange={setShowDealDialog}>
				<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
					<DialogHeader>
						<DialogTitle className="text-xl text-gray-900 dark:text-white">Deal Details</DialogTitle>
					</DialogHeader>
					{selectedDeal && (
						<div className="space-y-6">
							{/* Basic Deal Information */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Client</p>
									<p className="text-base font-semibold text-gray-900 dark:text-white">{selectedDeal.clientName}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Deal Value</p>
									<p className="text-base font-semibold text-green-600 dark:text-green-400">
										EGP {selectedDeal.dealValue.toLocaleString()}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">SalesMan</p>
									<p className="text-base font-semibold text-gray-900 dark:text-white">{selectedDeal.salesmanName}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Status</p>
									<div className="mt-1">{getStatusBadge(selectedDeal.status)}</div>
								</div>
							</div>

							{/* SalesMan Report */}
							{selectedDeal.reportText && (
								<div>
									<p className="text-sm font-medium text-muted-foreground mb-2">SalesMan Report</p>
									<div className="p-4 bg-muted rounded-lg">
										<p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">{selectedDeal.reportText}</p>
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
														<div className="relative">
															<img
																src={imageUrl}
																alt={fileName}
																className="w-full h-48 object-cover"
																onError={(e) => {
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
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default LegalDealsHistoryPage;

