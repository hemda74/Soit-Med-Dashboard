import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	Eye,
	ChevronLeft,
	ChevronRight,
	Filter,
	RefreshCw,
	Search,
	Download,
	Edit,
	Clock,
	CheckCircle,
	AlertCircle,
} from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorDisplay, PageHeader } from '@/components/shared';
import { useAuthStore } from '@/stores/authStore';
import { salesApi } from '@/services/sales/salesApi';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import type { OfferEquipment } from '@/types/sales.types';
import { getStaticFileUrl } from '@/utils/apiConfig';
import { downloadOfferPDF } from '@/utils/pdfGenerator';
import toast from 'react-hot-toast';
import { usePerformance } from '@/hooks/usePerformance';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Offer {
	id: number;
	clientName: string;
	assignedToName: string;
	createdByName: string;
	totalAmount: number;
	status: string;
	createdAt: string;
	validUntil?: string[];
	products?: string;
}

interface PaginatedOffersResponse {
	offers: Offer[];
	totalCount: number;
	page: number;
	pageSize: number;
	totalPages: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}

interface Salesman {
	id: string;
	firstName: string;
	lastName: string;
	userName: string;
}

const OffersManagementPage: React.FC = () => {
	usePerformance('OffersManagementPage');
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [offers, setOffers] = useState<Offer[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState({
		page: 1,
		pageSize: 10,
		totalCount: 0,
		totalPages: 0,
		hasPreviousPage: false,
		hasNextPage: false,
	});

	// Filters
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [salesmanFilter, setSalesmanFilter] = useState<string>('all');
	const [salesmen, setSalesmen] = useState<Salesman[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedOffer, setSelectedOffer] = useState<any>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [offerEquipment, setOfferEquipment] = useState<OfferEquipment[]>([]);
	const [loadingEquipment, setLoadingEquipment] = useState(false);
	const [equipmentImageUrls, setEquipmentImageUrls] = useState<Record<number, string>>({});

	// Needs Modification Modal
	const [showNeedsModificationModal, setShowNeedsModificationModal] = useState(false);
	const [needsModificationReason, setNeedsModificationReason] = useState('');
	const [processingAction, setProcessingAction] = useState<string | null>(null);

	const loadSalesmen = useCallback(async () => {
		if (!user?.token) return;

		try {
			const response = await salesApi.getOfferSalesmen();
			if (response.success && response.data) {
				const transformedSalesmen = response.data.map((salesman: any) => ({
					id: salesman.id,
					firstName: salesman.firstName,
					lastName: salesman.lastName,
					userName: salesman.userName,
				}));
				setSalesmen(transformedSalesmen);
			}
		} catch (err) {
			console.error('Failed to load salesmen:', err);
		}
	}, [user?.token]);

	const loadOffers = useCallback(async () => {
		if (!user?.token) return;

		try {
			setLoading(true);
			setError(null);

			const filters: any = {
				page: pagination.page,
				pageSize: pagination.pageSize,
			};

			if (statusFilter !== 'all') {
				filters.status = statusFilter;
			}

			if (salesmanFilter !== 'all') {
				filters.salesmanId = salesmanFilter;
			}

			let response;
			try {
				response = await salesApi.getAllOffersWithFilters(filters);
			} catch (apiError: any) {
				// If 403 error, try fallback to regular endpoint
				if (apiError.status === 403 || apiError.message?.includes('403')) {
					console.warn('Access denied to /all endpoint, trying fallback to regular endpoint');
					try {
						// Fallback: Use regular GetOffers endpoint
						const fallbackResponse = await salesApi.getOffers({
							status: statusFilter !== 'all' ? statusFilter : undefined,
							page: pagination.page,
							pageSize: pagination.pageSize,
						});

						if (fallbackResponse.success && fallbackResponse.data) {
							let offersData = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [];

							// Filter by salesman if selected
							if (salesmanFilter !== 'all') {
								offersData = offersData.filter((offer: any) =>
									offer.assignedTo === salesmanFilter ||
									offer.assignedToId === salesmanFilter
								);
							}

							// Filter by search query
							if (searchQuery.trim()) {
								const query = searchQuery.toLowerCase();
								offersData = offersData.filter(
									(offer: Offer) =>
										offer.clientName?.toLowerCase().includes(query) ||
										offer.assignedToName?.toLowerCase().includes(query) ||
										offer.createdByName?.toLowerCase().includes(query) ||
										offer.products?.toLowerCase().includes(query) ||
										offer.id?.toString().includes(query)
								);
							}

							setOffers(offersData);
							setPagination({
								page: pagination.page,
								pageSize: pagination.pageSize,
								totalCount: offersData.length,
								totalPages: Math.ceil(offersData.length / pagination.pageSize),
								hasPreviousPage: pagination.page > 1,
								hasNextPage: offersData.length === pagination.pageSize,
							});
							return;
						}
					} catch (fallbackError: any) {
						console.error('Fallback endpoint also failed:', fallbackError);
						setError('Access denied. Please ensure you have SalesManager role.');
						toast.error('Access denied. Please contact your administrator.');
						return;
					}
				}
				throw apiError;
			}

			if (response.success && response.data) {
				const data = response.data as any;
				let offersData = data.offers || data.Offers || [];

				// Filter by search query
				if (searchQuery.trim()) {
					const query = searchQuery.toLowerCase();
					offersData = offersData.filter(
						(offer: Offer) =>
							offer.clientName?.toLowerCase().includes(query) ||
							offer.assignedToName?.toLowerCase().includes(query) ||
							offer.createdByName?.toLowerCase().includes(query) ||
							offer.products?.toLowerCase().includes(query) ||
							offer.id?.toString().includes(query)
					);
				}

				setOffers(offersData);
				setPagination({
					page: data.page || data.Page || 1,
					pageSize: data.pageSize || data.PageSize || 10,
					totalCount: data.totalCount || data.TotalCount || offersData.length,
					totalPages: data.totalPages || data.TotalPages || 1,
					hasPreviousPage: data.hasPreviousPage || data.HasPreviousPage || false,
					hasNextPage: data.hasNextPage || data.HasNextPage || false,
				});
			} else {
				setError(response.message || 'Failed to load offers');
			}
		} catch (err: any) {
			console.error('Error loading offers:', err);
			const errorMessage = err.status === 403
				? 'Access denied. Please ensure you have SalesManager role.'
				: err.message || 'Failed to load offers';
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	}, [user?.token, pagination.page, pagination.pageSize, statusFilter, salesmanFilter, searchQuery]);

	useEffect(() => {
		loadSalesmen();
	}, [loadSalesmen]);

	useEffect(() => {
		loadOffers();
	}, [loadOffers]);

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'draft':
				return 'bg-gray-500';
			case 'sent':
				return 'bg-blue-500';
			case 'accepted':
				return 'bg-green-500';
			case 'rejected':
				return 'bg-red-500';
			case 'underreview':
				return 'bg-yellow-500';
			case 'needsmodification':
				return 'bg-purple-500';
			case 'expired':
				return 'bg-gray-400';
			default:
				return 'bg-gray-500';
		}
	};

	const getStatusLabel = (status: string) => {
		const statusMap: Record<string, string> = {
			'Draft': t('draft'),
			'Sent': t('sent'),
			'Accepted': t('accepted'),
			'Rejected': t('rejected'),
			'UnderReview': t('underReview'),
			'NeedsModification': t('needsModification'),
			'Expired': t('expired'),
		};
		return statusMap[status] || status || 'Unknown';
	};

	const handleViewOffer = async (offer: Offer) => {
		try {
			const response = await salesApi.getOffer(offer.id.toString());
			if (response.success && response.data) {
				setSelectedOffer(response.data);
				setShowDetailsModal(true);
			}
		} catch (err: any) {
			toast.error('Failed to load offer details');
		}
	};

	// Load offer equipment when an offer is selected
	useEffect(() => {
		const loadOfferEquipment = async () => {
			if (selectedOffer?.id) {
				setLoadingEquipment(true);
				try {
					const response = await salesApi.getOfferEquipment(selectedOffer.id);
					if (response.data && Array.isArray(response.data)) {
						setOfferEquipment(response.data);
					} else {
						setOfferEquipment([]);
					}
				} catch (error) {
					console.error('Error loading offer equipment:', error);
					setOfferEquipment([]);
				} finally {
					setLoadingEquipment(false);
				}
			} else {
				setOfferEquipment([]);
			}
		};

		loadOfferEquipment();
	}, [selectedOffer]);

	// Load equipment images
	useEffect(() => {
		const loadEquipmentImages = async () => {
			if (offerEquipment.length > 0 && selectedOffer?.id) {
				const imageUrls: Record<number, string> = {};

				for (const equipment of offerEquipment) {
					let imagePath = equipment.imagePath || (equipment as any).ImagePath || (equipment as any).imagePath;

					if (!imagePath || imagePath.trim() === '' || imagePath.includes('equipment-placeholder.png')) {
						try {
							const imageResponse = await salesApi.getEquipmentImage(selectedOffer.id, equipment.id);
							if (imageResponse.success && imageResponse.data?.imagePath) {
								imagePath = imageResponse.data.imagePath;
							}
						} catch (error) {
							// Silently handle image fetch errors
						}
					}

					if (imagePath && imagePath.trim() !== '' && !imagePath.includes('equipment-placeholder.png')) {
						const imageUrl = getStaticFileUrl(imagePath);
						imageUrls[equipment.id] = imageUrl;
					}
				}
				setEquipmentImageUrls(imageUrls);
			} else {
				setEquipmentImageUrls({});
			}
		};

		loadEquipmentImages();
	}, [offerEquipment, selectedOffer]);

	const handlePageChange = (newPage: number) => {
		setPagination((prev) => ({ ...prev, page: newPage }));
	};

	const handleSendToSalesman = async () => {
		if (!selectedOffer) return;
		if (selectedOffer.status !== 'Draft') {
			toast.error('Only draft offers can be sent to salesman');
			return;
		}

		try {
			setProcessingAction('send');
			const response = await salesApi.sendOfferToSalesman(selectedOffer.id.toString());
			if (response.success) {
				toast.success('Offer sent to salesman successfully');
				loadOffers();
				setSelectedOffer(null);
				setShowDetailsModal(false);
			} else {
				toast.error(response.message || 'Failed to send offer');
			}
		} catch (error: any) {
			console.error('Error sending offer:', error);
			toast.error(error.message || 'Failed to send offer to salesman');
		} finally {
			setProcessingAction(null);
		}
	};

	const handleMarkAsUnderReview = async () => {
		if (!selectedOffer) return;
		if (selectedOffer.status !== 'Sent') {
			toast.error('Only sent offers can be marked as under review');
			return;
		}

		try {
			setProcessingAction('underReview');
			const response = await salesApi.markAsUnderReview(selectedOffer.id.toString());
			if (response.success) {
				toast.success('Offer marked as under review successfully');
				loadOffers();
				setSelectedOffer(null);
				setShowDetailsModal(false);
			} else {
				toast.error(response.message || 'Failed to mark offer as under review');
			}
		} catch (error: any) {
			console.error('Error marking offer as under review:', error);
			toast.error(error.message || 'Failed to mark offer as under review');
		} finally {
			setProcessingAction(null);
		}
	};

	const handleOpenNeedsModificationModal = () => {
		if (!selectedOffer) return;
		if (selectedOffer.status !== 'Draft' && selectedOffer.status !== 'Sent') {
			toast.error('Only draft or sent offers can be marked as needing modification');
			return;
		}
		setNeedsModificationReason('');
		setShowNeedsModificationModal(true);
	};

	const handleMarkAsNeedsModification = async () => {
		if (!selectedOffer) return;

		try {
			setProcessingAction('needsModification');
			const response = await salesApi.markAsNeedsModification(
				selectedOffer.id.toString(),
				needsModificationReason.trim() || undefined
			);
			if (response.success) {
				toast.success('Offer marked as needing modification successfully');
				loadOffers();
				setSelectedOffer(null);
				setShowDetailsModal(false);
				setShowNeedsModificationModal(false);
				setNeedsModificationReason('');
			} else {
				toast.error(response.message || 'Failed to mark offer as needing modification');
			}
		} catch (error: any) {
			console.error('Error marking offer as needing modification:', error);
			toast.error(error.message || 'Failed to mark offer as needing modification');
		} finally {
			setProcessingAction(null);
		}
	};

	const handleRefresh = () => {
		loadOffers();
	};

	const handleDownloadPDF = async (offer: Offer) => {
		try {
			// Fetch full offer details if not already loaded
			let offerData = selectedOffer && selectedOffer.id === offer.id
				? selectedOffer
				: null;

			if (!offerData) {
				const response = await salesApi.getOffer(offer.id.toString());
				if (response.success && response.data) {
					offerData = response.data;
				} else {
					throw new Error('Failed to load offer details');
				}
			}

			// Handle arrays - convert to string for PDF display
			const formatArray = (arr: string[] | string | undefined): string => {
				if (!arr) return '';
				if (Array.isArray(arr)) {
					return arr.filter(item => item && item.trim()).join('; ');
				}
				if (typeof arr === 'string') {
					try {
						const parsed = JSON.parse(arr);
						if (Array.isArray(parsed)) {
							return parsed.filter(item => item && item.trim()).join('; ');
						}
					} catch {
						// Not JSON, return as is
					}
				}
				return String(arr);
			}

			// Fetch equipment data for PDF
			let equipmentData: any[] = [];
			try {
				const equipmentResponse = await salesApi.getOfferEquipment(offer.id);
				if (equipmentResponse.success && equipmentResponse.data) {
					// Normalize equipment data to match PDF generator interface
					equipmentData = equipmentResponse.data.map((eq: any) => ({
						id: eq.id,
						name: eq.name || 'N/A',
						model: eq.model,
						provider: eq.provider || eq.Provider || eq.manufacturer,
						country: eq.country || eq.Country,
						year: eq.year ?? eq.Year,
						price: eq.price ?? eq.Price ?? eq.totalPrice ?? eq.unitPrice ?? 0,
						description: eq.description || eq.Description || eq.specifications,
						inStock: eq.inStock !== undefined ? eq.inStock : (eq.InStock !== undefined ? eq.InStock : true),
						imagePath: eq.imagePath || eq.ImagePath,
					}));
				}
			} catch (e) {
				console.warn('Equipment data not available for PDF:', e);
			}

			// Generate PDF from frontend
			await downloadOfferPDF({
				id: offerData.id,
				clientName: offerData.clientName || offer.clientName || 'Client',
				clientType: undefined,
				clientLocation: undefined,
				products: offerData.products || offer.products || '',
				totalAmount: offerData.totalAmount ?? offer.totalAmount ?? 0,
				discountAmount: offerData.discountAmount ?? 0,
				validUntil: formatArray(offerData.validUntil || offer.validUntil),
				paymentTerms: formatArray(offerData.paymentTerms),
				deliveryTerms: formatArray(offerData.deliveryTerms),
				warrantyTerms: formatArray(offerData.warrantyTerms),
				createdAt: offerData.createdAt || offer.createdAt || new Date().toISOString(),
				status: offerData.status || offer.status,
				assignedToName: offerData.assignedToName || offer.assignedToName || '',
				equipment: equipmentData,
			}, {
				generateBothLanguages: true, // Generate both Arabic and English versions
				showProductHeaders: true,
			});
			toast.success('PDF downloaded successfully! Both Arabic and English versions downloaded.');
		} catch (error: any) {
			console.error('Error downloading PDF:', error);
			toast.error(error.message || 'Failed to download PDF');
		}
	};

	const handleUpdateExpiredOffers = async () => {
		if (!user?.roles.includes('SuperAdmin')) {
			toast.error('Only SuperAdmin can update expired offers');
			return;
		}

		try {
			const response = await salesApi.updateExpiredOffers();
			if (response.success) {
				toast.success(
					`Updated ${response.data?.expiredCount || 0} offers to expired status`
				);
				loadOffers();
			} else {
				toast.error(response.message || 'Failed to update expired offers');
			}
		} catch (error: any) {
			console.error('Error updating expired offers:', error);
			toast.error(error.message || 'Failed to update expired offers');
		}
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title="Offers Management"
				description="View and manage all offers created by salesmen"
				action={
					<div className="flex gap-2">
						{user?.roles.includes('SuperAdmin') && (
							<Button
								onClick={handleUpdateExpiredOffers}
								variant="outline"
								className="flex items-center gap-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900"
							>
								<AlertCircle className="h-4 w-4" />
								Update Expired Offers
							</Button>
						)}
						<Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
							<RefreshCw className="h-4 w-4" />
							Refresh
						</Button>
					</div>
				}
			/>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filters
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Search offers..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger>
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="Draft">Draft</SelectItem>
								<SelectItem value="Sent">Sent</SelectItem>
								<SelectItem value="Accepted">Accepted</SelectItem>
								<SelectItem value="Rejected">Rejected</SelectItem>
								<SelectItem value="UnderReview">Under Review</SelectItem>
								<SelectItem value="NeedsModification">Needs Modification</SelectItem>
								<SelectItem value="Expired">Expired</SelectItem>
							</SelectContent>
						</Select>
						<Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
							<SelectTrigger>
								<SelectValue placeholder="Filter by salesman" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Salesmen</SelectItem>
								{salesmen.map((salesman) => (
									<SelectItem key={salesman.id} value={salesman.id}>
										{salesman.firstName} {salesman.lastName}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button onClick={handleRefresh} variant="outline" className="w-full">
							<RefreshCw className="h-4 w-4 mr-2" />
							Refresh
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Offers List */}
			<Card>
				<CardHeader>
					<CardTitle>All Offers ({pagination.totalCount})</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<LoadingSpinner />
					) : error ? (
						<ErrorDisplay message={error} />
					) : offers.length === 0 ? (
						<EmptyState
							title="No offers found"
							description="There are no offers matching your filters."
						/>
					) : (
						<>
							<div className="space-y-4">
								{offers.map((offer) => (
									<Card key={offer.id} className="hover:shadow-md transition-shadow">
										<CardContent className="p-6">
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-3">
														<Badge className={getStatusColor(offer.status)}>
															{getStatusLabel(offer.status)}
														</Badge>
														<span className="text-sm text-muted-foreground">
															ID: {offer.id}
														</span>
													</div>
													<h3 className="text-lg font-semibold mb-2">{offer.clientName}</h3>
													<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
														{offer.products || 'No products specified'}
													</p>
													<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
														<div>
															<p className="text-muted-foreground">Total Amount</p>
															<p className="font-semibold">
																{offer.totalAmount?.toLocaleString() || 'N/A'} EGP
															</p>
														</div>
														<div>
															<p className="text-muted-foreground">Assigned To</p>
															<p className="font-semibold">{offer.assignedToName || 'N/A'}</p>
														</div>
														<div>
															<p className="text-muted-foreground">Created By</p>
															<p className="font-semibold">{offer.createdByName || 'Unknown'}</p>
														</div>
														<div>
															<p className="text-muted-foreground">Created At</p>
															<p className="font-semibold">
																{format(new Date(offer.createdAt), 'MMM dd, yyyy')}
															</p>
														</div>
													</div>
												</div>
												<div className="flex flex-col gap-2 ml-4">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleViewOffer(offer)}
													>
														<Eye className="h-4 w-4 mr-2" />
														View Details
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDownloadPDF(offer)}
													>
														<Download className="h-4 w-4 mr-2" />
														Download PDF
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>

							{/* Pagination */}
							{pagination.totalPages > 1 && (
								<div className="flex items-center justify-between mt-6 pt-4 border-t">
									<div className="text-sm text-muted-foreground">
										Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePageChange(pagination.page - 1)}
											disabled={!pagination.hasPreviousPage}
										>
											<ChevronLeft className="h-4 w-4" />
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePageChange(pagination.page + 1)}
											disabled={!pagination.hasNextPage}
										>
											Next
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* Offer Details Modal */}
			<Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Offer Details</DialogTitle>
					</DialogHeader>
					{selectedOffer && (
						<div className="space-y-6">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">Offer ID</p>
									<p className="font-semibold">{selectedOffer.id}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Status</p>
									<Badge className={getStatusColor(selectedOffer.status)}>
										{getStatusLabel(selectedOffer.status)}
									</Badge>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Client</p>
									<p className="font-semibold">{selectedOffer.clientName}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Total Amount</p>
									<p className="font-semibold">
										{selectedOffer.totalAmount?.toLocaleString() || 'N/A'} EGP
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Assigned To</p>
									<p className="font-semibold">{selectedOffer.assignedToName || 'N/A'}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Created By</p>
									<p className="font-semibold">{selectedOffer.createdByName || 'Unknown'}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Created At</p>
									<p className="font-semibold">
										{format(new Date(selectedOffer.createdAt), 'MMM dd, yyyy HH:mm')}
									</p>
								</div>
								{selectedOffer.validUntil && selectedOffer.validUntil.length > 0 && (
									<div>
										<p className="text-sm text-muted-foreground">Valid Until</p>
										<p className="font-semibold">
											{selectedOffer.validUntil.map((date: string) => format(new Date(date), 'MMM dd, yyyy')).join(', ')}
										</p>
									</div>
								)}
							</div>

							<div>
								<p className="text-sm text-muted-foreground mb-2">Products</p>
								<p className="text-sm">{selectedOffer.products || 'No products specified'}</p>
							</div>

							{offerEquipment.length > 0 && (
								<div>
									<p className="text-sm font-semibold mb-3">Equipment Items</p>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{offerEquipment.map((equipment) => (
											<Card key={equipment.id}>
												<CardContent className="p-4">
													{equipmentImageUrls[equipment.id] && (
														<img
															src={equipmentImageUrls[equipment.id]}
															alt={equipment.name}
															className="w-full h-48 object-cover rounded-lg mb-3"
														/>
													)}
													<h4 className="font-semibold mb-2">{equipment.name}</h4>
													{equipment.model && (
														<p className="text-sm text-muted-foreground">Model: {equipment.model}</p>
													)}
													{equipment.provider && (
														<p className="text-sm text-muted-foreground">Provider: {equipment.provider}</p>
													)}
													<p className="text-sm font-semibold mt-2">
														Price: {equipment.price?.toLocaleString() || 'N/A'} EGP
													</p>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							)}

							{/* Action Buttons */}
							{selectedOffer && (
								<div className="flex flex-wrap justify-end gap-3 pt-4 border-t">
									{/* Status-based action buttons */}
									{selectedOffer.status === 'Draft' && (
										<>
											<Button
												variant="default"
												onClick={handleSendToSalesman}
												disabled={processingAction !== null}
												className="bg-blue-600 hover:bg-blue-700 text-white"
											>
												<CheckCircle className="h-4 w-4 mr-2" />
												{processingAction === 'send' ? 'Sending...' : 'Send to Salesman'}
											</Button>
											<Button
												variant="outline"
												onClick={handleOpenNeedsModificationModal}
												disabled={processingAction !== null}
												className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900"
											>
												<Edit className="h-4 w-4 mr-2" />
												Mark as Needs Modification
											</Button>
										</>
									)}
									{selectedOffer.status === 'Sent' && (
										<>
											<Button
												variant="outline"
												onClick={handleMarkAsUnderReview}
												disabled={processingAction !== null}
												className="border-yellow-600 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900"
											>
												<Clock className="h-4 w-4 mr-2" />
												{processingAction === 'underReview' ? 'Processing...' : 'Mark as Under Review'}
											</Button>
											<Button
												variant="outline"
												onClick={handleOpenNeedsModificationModal}
												disabled={processingAction !== null}
												className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900"
											>
												<Edit className="h-4 w-4 mr-2" />
												Mark as Needs Modification
											</Button>
										</>
									)}
									<Button
										variant="outline"
										onClick={() => handleDownloadPDF(selectedOffer)}
										className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
									>
										<Download className="h-4 w-4 mr-2" />
										Download PDF
									</Button>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Needs Modification Modal */}
			{showNeedsModificationModal && selectedOffer && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl">
						<div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
							<div className="flex justify-between items-center">
								<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
									Mark as Needs Modification
								</h3>
								<Button
									onClick={() => {
										setShowNeedsModificationModal(false);
										setNeedsModificationReason('');
									}}
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
								>
									×
								</Button>
							</div>
						</div>
						<div className="p-6 space-y-4">
							<div>
								<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
									Reason (Optional)
								</label>
								<textarea
									value={needsModificationReason}
									onChange={(e) => setNeedsModificationReason(e.target.value)}
									placeholder="Enter reason why this offer needs modification..."
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
									rows={4}
									maxLength={1000}
								/>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									{needsModificationReason.length}/1000 characters
								</p>
							</div>
							<div className="flex justify-end gap-3 pt-4">
								<Button
									variant="outline"
									onClick={() => {
										setShowNeedsModificationModal(false);
										setNeedsModificationReason('');
									}}
									disabled={processingAction !== null}
								>
									Cancel
								</Button>
								<Button
									variant="default"
									onClick={handleMarkAsNeedsModification}
									disabled={processingAction !== null}
									className="bg-purple-600 hover:bg-purple-700 text-white"
								>
									{processingAction === 'needsModification' ? (
										<>
											<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
											Processing...
										</>
									) : (
										<>
											<Edit className="h-4 w-4 mr-2" />
											Mark as Needs Modification
										</>
									)}
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default OffersManagementPage;

