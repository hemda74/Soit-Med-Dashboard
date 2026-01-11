import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { contractApi } from '@/services/contracts/contractApi';
import type { Contract, ContractFilter, ContractTypeFilter, DetailedContract, ContractEquipment, ContractMediaFile } from '@/services/contracts/contractApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
	FileText,
	Search,
	Filter,
	ChevronLeft,
	ChevronRight,
	Eye,
	Download,
	Calendar,
	User,
	Building2,
	DollarSign,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	Archive,
	X,
	CreditCard,
	Cog,
	Image as ImageIcon,
	File,
	ExternalLink,
	ChevronLeft as ChevronLeftIcon,
	ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getStaticFileUrl, getAuthenticatedFileUrl, revokeBlobUrl, getApiUrl } from '@/utils/apiConfig';

const ContractsPage: React.FC = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [contracts, setContracts] = useState<Contract[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
	const [selectedContractDetails, setSelectedContractDetails] = useState<DetailedContract | null>(null);
	const [loadingDetails, setLoadingDetails] = useState(false);
	const [showContractDialog, setShowContractDialog] = useState(false);
	const [showMediaModal, setShowMediaModal] = useState(false);
	const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
	const [mediaBlobUrls, setMediaBlobUrls] = useState<Record<number, string>>({});
	const [totalCount, setTotalCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [totalPages, setTotalPages] = useState(0);

	// Filters
	const [filters, setFilters] = useState<ContractFilter>({
		page: 1,
		pageSize: 20,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [contractTypeFilter, setContractTypeFilter] = useState<string>('all');
	const [isLegacyFilter, setIsLegacyFilter] = useState<string>('all');
	const [hasInstallmentsFilter, setHasInstallmentsFilter] = useState<string>('all');

	useEffect(() => {
		loadContracts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.token, currentPage, contractTypeFilter, statusFilter, isLegacyFilter, hasInstallmentsFilter, searchTerm]);

	// Load authenticated file URLs when modal opens
	useEffect(() => {
		if (!showMediaModal || !selectedContractDetails?.mediaFiles) {
			// Cleanup blob URLs when modal closes
			setMediaBlobUrls(prev => {
				Object.values(prev).forEach(url => {
					if (url.startsWith('blob:')) {
						revokeBlobUrl(url);
					}
				});
				return {};
			});
			return;
		}

		// Load blob URLs for all media files
		const loadBlobUrls = async () => {
			const urls: Record<number, string> = {};
			for (let i = 0; i < selectedContractDetails.mediaFiles.length; i++) {
				const file = selectedContractDetails.mediaFiles[i];
				if (file.isAvailable && (file.isImage || file.isPdf)) {
					try {
						const blobUrl = await getAuthenticatedFileUrl(file.filePath);
						urls[i] = blobUrl;
					} catch (error) {
						console.error(`Failed to load blob URL for file ${i}:`, error);
						// Fallback: use getApiUrl for API endpoints, getStaticFileUrl for static files
						urls[i] = file.filePath?.startsWith('/api/') 
							? getApiUrl(file.filePath) 
							: getStaticFileUrl(file.filePath);
					}
				}
			}
			setMediaBlobUrls(urls);
		};

		loadBlobUrls();

		// Cleanup on unmount or when modal closes
		return () => {
			setMediaBlobUrls(prev => {
				Object.values(prev).forEach(url => {
					if (url.startsWith('blob:')) {
						revokeBlobUrl(url);
					}
				});
				return {};
			});
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showMediaModal, selectedContractDetails?.mediaFiles?.length]);

	// Keyboard navigation for media modal
	useEffect(() => {
		if (!showMediaModal || !selectedContractDetails?.mediaFiles) return;

		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				const prevIndex = selectedMediaIndex > 0 
					? selectedMediaIndex - 1 
					: selectedContractDetails.mediaFiles.length - 1;
				setSelectedMediaIndex(prevIndex);
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				const nextIndex = selectedMediaIndex < selectedContractDetails.mediaFiles.length - 1
					? selectedMediaIndex + 1
					: 0;
				setSelectedMediaIndex(nextIndex);
			} else if (e.key === 'Escape') {
				e.preventDefault();
				setShowMediaModal(false);
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [showMediaModal, selectedMediaIndex, selectedContractDetails?.mediaFiles]);

	const loadContracts = async () => {
		if (!user?.token) return;

		try {
			setLoading(true);
			const filterParams: ContractFilter = {
				...filters,
				page: currentPage,
				pageSize: pageSize,
				searchTerm: searchTerm || undefined,
				status: statusFilter !== 'all' ? statusFilter : undefined,
				contractType: contractTypeFilter !== 'all' ? contractTypeFilter as ContractTypeFilter : undefined,
				isLegacy: isLegacyFilter !== 'all' ? isLegacyFilter === 'true' : undefined,
				hasInstallments: hasInstallmentsFilter !== 'all' ? hasInstallmentsFilter === 'true' : undefined,
			};

			console.log('Loading contracts with filters:', {
				contractType: filterParams.contractType,
				status: filterParams.status,
				isLegacy: filterParams.isLegacy,
				page: filterParams.page,
			});

			const response = await contractApi.getContracts(filterParams);

			if (response.success && response.data) {
				setContracts(response.data.contracts);
				setTotalCount(response.data.totalCount);
				setTotalPages(response.data.totalPages);
			} else {
				setContracts([]);
				toast.error(response.message || 'Failed to load contracts');
			}
		} catch (error: any) {
			console.error('Failed to load contracts:', error);
			toast.error(error.message || 'Failed to load contracts');
			setContracts([]);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = () => {
		setCurrentPage(1);
		setFilters((prev) => ({ ...prev, page: 1 }));
		loadContracts();
	};

	const handleFilterChange = () => {
		setCurrentPage(1);
		setFilters((prev) => ({ ...prev, page: 1 }));
		// Force reload with new filters
		setTimeout(() => {
			loadContracts();
		}, 0);
	};

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
		setFilters((prev) => ({ ...prev, page: newPage }));
	};

	const clearFilters = () => {
		setSearchTerm('');
		setStatusFilter('all');
		setContractTypeFilter('all');
		setIsLegacyFilter('all');
		setHasInstallmentsFilter('all');
		setCurrentPage(1);
		setFilters({
			page: 1,
			pageSize: 20,
			sortBy: 'createdAt',
			sortOrder: 'desc',
		});
	};

	const getStatusBadge = (status: string | number) => {
		const statusStr = typeof status === 'string' ? status : String(status);
		switch (statusStr.toLowerCase()) {
			case 'draft':
				return <Badge className="bg-gray-100 text-gray-800 border-gray-300 border dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">Draft</Badge>;
			case 'senttocustomer':
				return <Badge className="bg-blue-100 text-blue-800 border-blue-300 border dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700">Sent to Customer</Badge>;
			case 'undernegotiation':
				return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 border dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700">Under Negotiation</Badge>;
			case 'signed':
				return <Badge className="bg-green-100 text-green-800 border-green-300 border dark:bg-green-900 dark:text-green-200 dark:border-green-700">Signed</Badge>;
			case 'cancelled':
				return <Badge className="bg-red-100 text-red-800 border-red-300 border dark:bg-red-900 dark:text-red-200 dark:border-red-700">Cancelled</Badge>;
			case 'expired':
				return <Badge className="bg-orange-100 text-orange-800 border-orange-300 border dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700">Expired</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const formatCurrency = (amount?: number) => {
		if (!amount) return 'N/A';
		return new Intl.NumberFormat('en-EG', {
			style: 'currency',
			currency: 'EGP',
		}).format(amount);
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return 'N/A';
		try {
			return format(new Date(dateString), 'MMM dd, yyyy');
		} catch {
			return dateString;
		}
	};

	// Calculate statistics
	const getStatusCounts = () => {
		const counts = {
			total: contracts.length,
			signed: contracts.filter(c => {
				const statusStr = typeof c.status === 'string' ? c.status : c.statusDisplay || String(c.status);
				return statusStr.toLowerCase() === 'signed';
			}).length,
			draft: contracts.filter(c => {
				const statusStr = typeof c.status === 'string' ? c.status : c.statusDisplay || String(c.status);
				return statusStr.toLowerCase() === 'draft';
			}).length,
			expired: contracts.filter(c => c.isExpired).length,
			withInstallments: contracts.filter(c => c.hasInstallments).length,
			totalValue: contracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0),
			signedValue: contracts.filter(c => {
				const statusStr = typeof c.status === 'string' ? c.status : c.statusDisplay || String(c.status);
				return statusStr.toLowerCase() === 'signed';
			}).reduce((sum, c) => sum + (c.totalAmount || 0), 0),
		};
		return counts;
	};

	const statusCounts = getStatusCounts();

	if (loading && contracts.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{t('contractsPageTitle')}</CardTitle>
					<CardDescription>{t('contractsPageDescription')}</CardDescription>
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
								{t('contractsPageTitle')}
							</CardTitle>
							<CardDescription className="mt-2 text-base space-y-1">
								<div>{totalCount.toLocaleString()} {totalCount === 1 ? 'contract' : 'contracts'} total</div>
								<div className="text-sm text-muted-foreground">Showing {contracts.length} on this page</div>
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Statistics Section */}
					<div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
						{/* Total Contracts */}
						<Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
											Total Contracts
										</p>
										<p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
											{totalCount}
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

						{/* Signed Contracts */}
						<Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
											Signed
										</p>
										<p className="text-3xl font-bold text-green-900 dark:text-green-100">
											{statusCounts.signed}
										</p>
										<p className="text-xs font-semibold text-green-700 dark:text-green-300 mt-1">
											EGP {statusCounts.signedValue.toLocaleString()}
										</p>
									</div>
									<div className="p-3 bg-green-200 dark:bg-green-800 rounded-lg">
										<CheckCircle className="h-6 w-6 text-green-700 dark:text-green-300" />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* With Installments */}
						<Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
											With Installments
										</p>
										<p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
											{statusCounts.withInstallments}
										</p>
										<p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mt-1">
											Payment Plans
										</p>
									</div>
									<div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-lg">
										<CreditCard className="h-6 w-6 text-blue-700 dark:text-blue-300" />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Expired */}
						<Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
											Expired
										</p>
										<p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
											{statusCounts.expired}
										</p>
										<p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mt-1">
											Requires Attention
										</p>
									</div>
									<div className="p-3 bg-orange-200 dark:bg-orange-800 rounded-lg">
										<AlertCircle className="h-6 w-6 text-orange-700 dark:text-orange-300" />
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
							{(statusFilter !== 'all' || contractTypeFilter !== 'all' || isLegacyFilter !== 'all' || hasInstallmentsFilter !== 'all' || searchTerm) && (
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
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
										placeholder="Contract #, Title, Client..."
										className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
									/>
								</div>
							</div>

							{/* Status Filter */}
							<div>
								<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
									Status
								</label>
								<Select value={statusFilter} onValueChange={(value) => {
									setStatusFilter(value);
									handleFilterChange();
								}}>
									<SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
										<SelectValue placeholder="All Statuses" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Statuses</SelectItem>
										<SelectItem value="Draft">Draft</SelectItem>
										<SelectItem value="SentToCustomer">Sent to Customer</SelectItem>
										<SelectItem value="UnderNegotiation">Under Negotiation</SelectItem>
										<SelectItem value="Signed">Signed</SelectItem>
										<SelectItem value="Cancelled">Cancelled</SelectItem>
										<SelectItem value="Expired">Expired</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Contract Type Filter */}
							<div>
								<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
									Contract Type
								</label>
								<Select value={contractTypeFilter} onValueChange={(value) => {
									setContractTypeFilter(value);
									handleFilterChange();
								}}>
									<SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
										<SelectValue placeholder="All Contract Types" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Contract Types</SelectItem>
										<SelectItem value="mainContracts">عقود الصيانة الرئيسية</SelectItem>
										<SelectItem value="activeContracts">عقود الصيانة السارية</SelectItem>
										<SelectItem value="expiredContracts">عقود الصيانة المنتهية</SelectItem>
										<SelectItem value="cancelledContracts">عقود الصيانة الملغاة</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Legacy Filter */}
							<div>
								<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
									Legacy
								</label>
								<Select value={isLegacyFilter} onValueChange={(value) => {
									setIsLegacyFilter(value);
									handleFilterChange();
								}}>
									<SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
										<SelectValue placeholder="All Types" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Types</SelectItem>
										<SelectItem value="true">Legacy (Migrated)</SelectItem>
										<SelectItem value="false">New Contracts</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Installments Filter */}
							<div>
								<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
									Installments
								</label>
								<Select value={hasInstallmentsFilter} onValueChange={(value) => {
									setHasInstallmentsFilter(value);
									handleFilterChange();
								}}>
									<SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
										<SelectValue placeholder="All" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All</SelectItem>
										<SelectItem value="true">With Installments</SelectItem>
										<SelectItem value="false">Without Installments</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="mt-4 flex justify-end">
							<Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700 text-white">
								<Search className="h-4 w-4 mr-2" />
								Apply Filters
							</Button>
						</div>
					</div>

					{/* Contracts Grid */}
					{contracts.length === 0 ? (
						<EmptyState
							icon={<FileText className="h-12 w-12 text-gray-400" />}
							title="No contracts found"
							description="Try adjusting your search or filters"
						/>
					) : (
						<>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								{contracts.map((contract) => (
									<Card
										key={contract.id}
										className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-white/[0.03]"
									>
										<CardContent className="pt-6">
											<div className="flex items-start justify-between mb-4">
												<div>
													<div className="flex items-center gap-2 mb-2 flex-wrap">
														{getStatusBadge(contract.statusDisplay || contract.status)}
														<span className="text-sm text-muted-foreground font-medium">
															{contract.contractNumber}
														</span>
														{contract.isLegacy && (
															<Badge variant="outline" className="text-xs">Legacy</Badge>
														)}
														{contract.contractTypeDisplay && (
															<Badge 
																variant="outline" 
																className={`text-xs ${
																	contract.contractTypeDisplay === 'Main' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
																	contract.contractTypeDisplay === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
																	contract.contractTypeDisplay === 'Expired' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
																	contract.contractTypeDisplay === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
																	''
																}`}
															>
																{contract.contractTypeDisplay === 'Main' ? 'عقد رئيسي' :
																 contract.contractTypeDisplay === 'Active' ? 'ساري' :
																 contract.contractTypeDisplay === 'Expired' ? 'منتهي' :
																 contract.contractTypeDisplay === 'Cancelled' ? 'ملغى' :
																 contract.contractTypeDisplay}
															</Badge>
														)}
													</div>
													<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
														{contract.title}
													</h3>
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
															{contract.clientName}
														</p>
													</div>
												</div>

												<div className="flex items-start gap-3">
													<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
														<DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-xs font-medium text-muted-foreground mb-1">Contract Value</p>
														<p className="text-lg font-bold text-green-600 dark:text-green-400">
															{formatCurrency(contract.totalAmount)}
														</p>
													</div>
												</div>

												{contract.hasInstallments && (
													<div className="flex items-start gap-3">
														<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
															<CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
														</div>
														<div className="flex-1 min-w-0">
															<p className="text-xs font-medium text-muted-foreground mb-1">Installments</p>
															<p className="text-sm text-gray-900 dark:text-white">
																{contract.paidInstallmentCount}/{contract.installmentCount} paid
																{contract.overdueInstallmentCount > 0 && (
																	<Badge variant="destructive" className="ml-2 text-xs">
																		{contract.overdueInstallmentCount} overdue
																	</Badge>
																)}
															</p>
														</div>
													</div>
												)}

												<div className="flex items-start gap-3">
													<div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
														<Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-xs font-medium text-muted-foreground mb-1">Signed Date</p>
														<p className="text-sm text-gray-900 dark:text-white">
															{formatDate(contract.signedAt)}
														</p>
														{contract.isExpired && (
															<p className="text-xs text-red-500 mt-1">
																Expired {contract.daysUntilExpiry && contract.daysUntilExpiry < 0
																	? `${Math.abs(contract.daysUntilExpiry)} days ago`
																	: ''}
															</p>
														)}
														{contract.daysUntilExpiry && contract.daysUntilExpiry > 0 && !contract.isExpired && (
															<p className="text-xs text-orange-500 mt-1">
																Expires in {contract.daysUntilExpiry} days
															</p>
														)}
													</div>
												</div>
											</div>

											<Button
												onClick={async () => {
													setSelectedContract(contract);
													setShowContractDialog(true);
													
													// Load detailed contract data if it's a legacy contract
													if (contract.isLegacy && contract.id) {
														try {
															setLoadingDetails(true);
															const detailsResponse = await contractApi.getContractWithDetails(contract.id);
															if (detailsResponse.success && detailsResponse.data) {
																setSelectedContractDetails(detailsResponse.data);
															}
														} catch (error: any) {
															console.error('Failed to load contract details:', error);
															toast.error(error.message || 'Failed to load contract details');
														} finally {
															setLoadingDetails(false);
														}
													} else {
														setSelectedContractDetails(null);
													}
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

							{/* Pagination */}
							<div className="flex items-center justify-between pt-6 mt-6 border-t">
								<div className="text-sm text-gray-500">
									Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} contracts
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage === 1}
									>
										<ChevronLeft className="h-4 w-4" />
										Previous
									</Button>
									<div className="text-sm px-4">
										Page {currentPage} of {totalPages}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={currentPage >= totalPages}
									>
										Next
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Contract Detail Dialog */}
			<Dialog open={showContractDialog} onOpenChange={(open) => {
				setShowContractDialog(open);
				if (!open) {
					setSelectedContract(null);
					setSelectedContractDetails(null);
				}
			}}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Contract Details
						</DialogTitle>
					</DialogHeader>
					{selectedContract && (
						<div className="space-y-6">
							{/* Basic Information */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-xs text-gray-500">Contract Number</Label>
									<div className="font-mono font-semibold">{selectedContract.contractNumber}</div>
								</div>
								<div>
									<Label className="text-xs text-gray-500">Status</Label>
									<div>{getStatusBadge(selectedContract.statusDisplay || selectedContract.status)}</div>
								</div>
								<div>
									<Label className="text-xs text-gray-500">Title</Label>
									<div className="font-medium">{selectedContract.title}</div>
								</div>
								<div>
									<Label className="text-xs text-gray-500">Client</Label>
									<div className="flex items-center gap-2">
										<Building2 className="h-4 w-4" />
										<span>{selectedContract.clientName}</span>
									</div>
								</div>
								<div>
									<Label className="text-xs text-gray-500">Total Amount</Label>
									<div className="font-semibold text-lg">{formatCurrency(selectedContract.totalAmount)}</div>
								</div>
								<div>
									<Label className="text-xs text-gray-500">Signed Date</Label>
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										<span>{formatDate(selectedContract.signedAt)}</span>
									</div>
								</div>
							</div>

							{/* Installments */}
							{selectedContract.hasInstallments && (
								<div>
									<Label className="text-sm font-semibold mb-2 block">Installment Schedule</Label>
									<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
										<div className="grid grid-cols-3 gap-4 text-sm">
											<div>
												<div className="text-gray-500">Total Installments</div>
												<div className="font-semibold">{selectedContract.installmentCount}</div>
											</div>
											<div>
												<div className="text-gray-500">Paid</div>
												<div className="font-semibold text-green-600">{selectedContract.paidInstallmentCount}</div>
											</div>
											<div>
												<div className="text-gray-500">Overdue</div>
												<div className="font-semibold text-red-600">{selectedContract.overdueInstallmentCount}</div>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Document */}
							{selectedContract.documentUrl && (
								<div>
									<Label className="text-sm font-semibold mb-2 block">Contract Document</Label>
									<Button
										variant="outline"
										onClick={() => window.open(selectedContract.documentUrl, '_blank')}
									>
										<Download className="h-4 w-4 mr-2" />
										View Document
									</Button>
								</div>
							)}

							{/* Equipment Section - Only for Legacy Contracts */}
							{selectedContract.isLegacy && (
								<div>
									<Label className="text-sm font-semibold mb-2 block flex items-center gap-2">
										<Cog className="h-4 w-4" />
										Equipment ({loadingDetails ? 'Loading...' : selectedContractDetails?.equipmentCount || 0})
									</Label>
									{loadingDetails ? (
										<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
											<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
											<p className="text-sm text-gray-500 mt-2">Loading equipment...</p>
										</div>
									) : selectedContractDetails?.equipment && selectedContractDetails.equipment.length > 0 ? (
										<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
											{selectedContractDetails.equipment.map((equipment, index) => (
												<div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0 last:pb-0">
													<div className="grid grid-cols-2 gap-3 text-sm">
														<div>
															<span className="text-gray-500">Model:</span>
															<div className="font-semibold">{equipment.modelName || equipment.modelNameEn || 'N/A'}</div>
														</div>
														<div>
															<span className="text-gray-500">Serial Number:</span>
															<div className="font-mono">{equipment.serialNumber || 'N/A'}</div>
														</div>
														{equipment.devicePlace && (
															<div>
																<span className="text-gray-500">Location:</span>
																<div>{equipment.devicePlace}</div>
															</div>
														)}
														{equipment.itemCode && (
															<div>
																<span className="text-gray-500">Item Code:</span>
																<div className="font-mono">{equipment.itemCode}</div>
															</div>
														)}
														{equipment.visitCount > 0 && (
															<div>
																<span className="text-gray-500">Visit Count:</span>
																<div>{equipment.visitCount}</div>
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									) : (
										<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center text-sm text-gray-500">
											No equipment found
										</div>
									)}
								</div>
							)}

							{/* Media Files Section - Only for Legacy Contracts */}
							{selectedContract.isLegacy && (
								<div>
									<Label className="text-sm font-semibold mb-2 block flex items-center gap-2">
										<ImageIcon className="h-4 w-4" />
										Media Files ({loadingDetails ? 'Loading...' : selectedContractDetails?.mediaFileCount || 0})
									</Label>
									{loadingDetails ? (
										<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
											<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
											<p className="text-sm text-gray-500 mt-2">Loading media files...</p>
										</div>
									) : selectedContractDetails?.mediaFiles && selectedContractDetails.mediaFiles.length > 0 ? (
										<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
												{selectedContractDetails.mediaFiles.map((file, index) => (
													<div 
														key={index} 
														className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 transition-colors ${
															file.canPreview && file.isAvailable 
																? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer' 
																: 'opacity-75'
														}`}
														onClick={() => {
															if (file.canPreview && file.isAvailable) {
																setSelectedMediaIndex(index);
																setShowMediaModal(true);
															}
														}}
													>
														<div className="flex items-start justify-between gap-2">
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-2 mb-1">
																	{file.isImage ? (
																		<ImageIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
																	) : file.isPdf ? (
																		<FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
																	) : (
																		<File className="h-4 w-4 text-gray-500 flex-shrink-0" />
																	)}
																	<span className="text-sm font-medium truncate">{file.fileName}</span>
																</div>
																{file.fileSizeFormatted && (
																	<div className="text-xs text-gray-500">{file.fileSizeFormatted}</div>
																)}
																{!file.isAvailable && (
																	<div className="text-xs text-orange-500 mt-1">{file.availabilityMessage || 'File not available'}</div>
																)}
															</div>
															{file.canPreview && file.isAvailable && (
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={(e) => {
																		e.stopPropagation();
																		setSelectedMediaIndex(index);
																		setShowMediaModal(true);
																	}}
																	className="flex-shrink-0"
																>
																	<Eye className="h-4 w-4" />
																</Button>
															)}
														</div>
													</div>
												))}
											</div>
										</div>
									) : (
										<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center text-sm text-gray-500">
											No media files found
										</div>
									)}
								</div>
							)}

							{/* Additional Info */}
							<div>
								<Label className="text-sm font-semibold mb-2 block">Additional Information</Label>
								<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-500">Drafted By:</span>
										<span>{selectedContract.drafterName || selectedContract.draftedBy}</span>
									</div>
									{selectedContract.customerSignerName && (
										<div className="flex justify-between">
											<span className="text-gray-500">Signed By:</span>
											<span>{selectedContract.customerSignerName}</span>
										</div>
									)}
									{selectedContract.isLegacy && (
										<div className="flex justify-between">
											<span className="text-gray-500">Legacy Contract ID:</span>
											<span>{selectedContract.legacyContractId}</span>
										</div>
									)}
									<div className="flex justify-between">
										<span className="text-gray-500">Created:</span>
										<span>{formatDate(selectedContract.createdAt)}</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Media File Viewer Modal */}
			<Dialog open={showMediaModal} onOpenChange={setShowMediaModal}>
				<DialogContent className="max-w-6xl max-h-[95vh] p-0">
					{selectedContractDetails?.mediaFiles && selectedContractDetails.mediaFiles.length > 0 && (
						<>
							<DialogHeader className="px-6 pt-6 pb-4 border-b">
								<div className="flex items-center justify-between">
									<DialogTitle className="text-xl">
										{selectedContractDetails.mediaFiles[selectedMediaIndex]?.fileName || 'Media File'}
									</DialogTitle>
									<div className="flex items-center gap-2">
										<span className="text-sm text-gray-500">
											{selectedMediaIndex + 1} / {selectedContractDetails.mediaFiles.length}
										</span>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setShowMediaModal(false)}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</DialogHeader>

							<div className="relative flex-1 overflow-hidden">
								{/* Navigation Buttons */}
								{selectedContractDetails.mediaFiles.length > 1 && (
									<>
										<Button
											variant="ghost"
											size="icon"
											className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
											onClick={() => {
												const prevIndex = selectedMediaIndex > 0 
													? selectedMediaIndex - 1 
													: selectedContractDetails.mediaFiles.length - 1;
												setSelectedMediaIndex(prevIndex);
											}}
											disabled={selectedContractDetails.mediaFiles.length <= 1}
										>
											<ChevronLeftIcon className="h-6 w-6" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
											onClick={() => {
												const nextIndex = selectedMediaIndex < selectedContractDetails.mediaFiles.length - 1
													? selectedMediaIndex + 1
													: 0;
												setSelectedMediaIndex(nextIndex);
											}}
											disabled={selectedContractDetails.mediaFiles.length <= 1}
										>
											<ChevronRightIcon className="h-6 w-6" />
										</Button>
									</>
								)}

								{/* File Content */}
								<div className="flex items-center justify-center min-h-[60vh] max-h-[80vh] overflow-auto bg-gray-100 dark:bg-gray-900 p-6">
									{(() => {
										const currentFile = selectedContractDetails.mediaFiles[selectedMediaIndex];
										if (!currentFile || !currentFile.isAvailable) {
											return (
												<div className="text-center p-8">
													<AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
													<p className="text-lg font-medium text-gray-700 dark:text-gray-300">
														File not available
													</p>
													<p className="text-sm text-gray-500 mt-2">
														{currentFile?.availabilityMessage || 'This file cannot be displayed'}
													</p>
												</div>
											);
										}

										// Use authenticated blob URL if available, otherwise fallback to appropriate URL
										const fileUrl = mediaBlobUrls[selectedMediaIndex] || 
											(currentFile.filePath?.startsWith('/api/') 
												? getApiUrl(currentFile.filePath) 
												: getStaticFileUrl(currentFile.filePath));
										const originalFileUrl = currentFile.filePath?.startsWith('/api/') 
											? getApiUrl(currentFile.filePath) 
											: getStaticFileUrl(currentFile.filePath);

										if (currentFile.isImage) {
											return (
												<div className="relative w-full h-full flex items-center justify-center">
													<img
														src={fileUrl}
														alt={currentFile.fileName}
														className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
														onError={(e) => {
															// If blob URL fails, try original URL
															if (fileUrl !== originalFileUrl) {
																e.currentTarget.src = originalFileUrl;
															} else {
																e.currentTarget.style.display = 'none';
																const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
																if (errorDiv) errorDiv.style.display = 'block';
															}
														}}
													/>
													<div className="hidden text-center p-8">
														<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
														<p className="text-lg font-medium text-gray-700 dark:text-gray-300">
															Failed to load image
														</p>
														<Button
															variant="outline"
															className="mt-4"
															onClick={() => window.open(originalFileUrl, '_blank')}
														>
															<ExternalLink className="h-4 w-4 mr-2" />
															Open in new tab
														</Button>
													</div>
												</div>
											);
										}

										if (currentFile.isPdf) {
											return (
												<div className="w-full h-full flex flex-col items-center justify-center">
													<iframe
														src={fileUrl}
														className="w-full h-[80vh] border-0 rounded-lg shadow-lg"
														title={currentFile.fileName}
														onError={() => {
															// If blob URL fails, try original URL
															if (fileUrl !== originalFileUrl) {
																const iframe = document.querySelector(`iframe[title="${currentFile.fileName}"]`) as HTMLIFrameElement;
																if (iframe) iframe.src = originalFileUrl;
															}
														}}
													/>
													<div className="mt-4 flex gap-2">
														<Button
															variant="outline"
															onClick={() => window.open(originalFileUrl, '_blank')}
														>
															<ExternalLink className="h-4 w-4 mr-2" />
															Open in new tab
														</Button>
														<Button
															variant="outline"
															onClick={async () => {
																try {
																	const token = user?.token;
																	if (!token) {
																		toast.error('Authentication required to download file');
																		return;
																	}
																	
																	const response = await fetch(originalFileUrl, {
																		headers: {
																			'Authorization': `Bearer ${token}`,
																		},
																	});
																	
																	if (!response.ok) {
																		throw new Error('Failed to download file');
																	}
																	
																	const blob = await response.blob();
																	const blobUrl = URL.createObjectURL(blob);
																	const link = document.createElement('a');
																	link.href = blobUrl;
																	link.download = currentFile.fileName;
																	link.click();
																	URL.revokeObjectURL(blobUrl);
																} catch (error) {
																	console.error('Download error:', error);
																	toast.error('Failed to download file');
																}
															}}
														>
															<Download className="h-4 w-4 mr-2" />
															Download
														</Button>
													</div>
												</div>
											);
										}

										// For other file types
										return (
											<div className="text-center p-8">
												<File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
												<p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
													{currentFile.fileName}
												</p>
												{currentFile.fileSizeFormatted && (
													<p className="text-sm text-gray-500 mb-4">
														{currentFile.fileSizeFormatted}
													</p>
												)}
												<div className="flex gap-2 justify-center">
													<Button
														variant="outline"
														onClick={() => window.open(originalFileUrl, '_blank')}
													>
														<ExternalLink className="h-4 w-4 mr-2" />
														Open in new tab
													</Button>
													<Button
														variant="outline"
														onClick={async () => {
															try {
																const token = user?.token;
																if (!token) {
																	toast.error('Authentication required to download file');
																	return;
																}
																
																const response = await fetch(originalFileUrl, {
																	headers: {
																		'Authorization': `Bearer ${token}`,
																	},
																});
																
																if (!response.ok) {
																	throw new Error('Failed to download file');
																}
																
																const blob = await response.blob();
																const blobUrl = URL.createObjectURL(blob);
																const link = document.createElement('a');
																link.href = blobUrl;
																link.download = currentFile.fileName;
																link.click();
																URL.revokeObjectURL(blobUrl);
															} catch (error) {
																console.error('Download error:', error);
																toast.error('Failed to download file');
															}
														}}
													>
														<Download className="h-4 w-4 mr-2" />
														Download
													</Button>
												</div>
											</div>
										);
									})()}
								</div>

								{/* File Info Footer */}
								<div className="border-t px-6 py-4 bg-gray-50 dark:bg-gray-800">
									<div className="flex items-center justify-between text-sm">
										<div className="flex items-center gap-4">
											{selectedContractDetails.mediaFiles[selectedMediaIndex]?.fileSizeFormatted && (
												<span className="text-gray-500">
													Size: {selectedContractDetails.mediaFiles[selectedMediaIndex].fileSizeFormatted}
												</span>
											)}
											{selectedContractDetails.mediaFiles[selectedMediaIndex]?.fileType && (
												<span className="text-gray-500">
													Type: {selectedContractDetails.mediaFiles[selectedMediaIndex].fileType.toUpperCase()}
												</span>
											)}
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={async () => {
													try {
													const file = selectedContractDetails.mediaFiles[selectedMediaIndex];
													const token = user?.token;
													if (!token) {
														toast.error('Authentication required to download file');
														return;
													}

													// Use getApiUrl for API endpoints, getStaticFileUrl for static files
													const fileUrl = file.filePath?.startsWith('/api/') 
														? getApiUrl(file.filePath) 
														: getStaticFileUrl(file.filePath);
													const response = await fetch(fileUrl, {
														headers: {
															'Authorization': `Bearer ${token}`,
														},
													});
														
														if (!response.ok) {
															throw new Error('Failed to download file');
														}
														
														const blob = await response.blob();
														const blobUrl = URL.createObjectURL(blob);
														const link = document.createElement('a');
														link.href = blobUrl;
														link.download = file.fileName;
														link.click();
														URL.revokeObjectURL(blobUrl);
													} catch (error) {
														console.error('Download error:', error);
														toast.error('Failed to download file');
													}
												}}
											>
												<Download className="h-4 w-4 mr-2" />
												Download
											</Button>
										</div>
									</div>
								</div>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ContractsPage;
