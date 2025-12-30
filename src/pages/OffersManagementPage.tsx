import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
	Eye,
	ChevronLeft,
	ChevronRight,
	Filter,
	Download,
	RefreshCw,
	Edit,
	Clock,
	AlertCircle,
	CheckCircle,
	FileText,
	DollarSign,
	Play,
	Info,
} from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorDisplay } from '@/components/shared';
import { useAuthStore } from '@/stores/authStore';
import { salesApi } from '@/services/sales/salesApi';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import type { OfferEquipment } from '@/types/sales.types';
import { getStaticFileUrl, getApiBaseUrl } from '@/utils/apiConfig';
import toast from 'react-hot-toast';
import { usePerformance } from '@/hooks/usePerformance';
import ProviderLogo from '@/components/sales/ProviderLogo';

interface Offer {
	id: number;
	clientName: string;
	assignedToName: string;
	createdByName: string;
	products?: string;
	totalAmount: number;
	status: string;
	createdAt: string;
	validUntil?: string[];
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

interface SalesMan {
	id: string;
	firstName: string;
	lastName: string;
	userName: string;
}

const OffersManagementPage: React.FC = () => {
	usePerformance('OffersManagementPage');
	const navigate = useNavigate();
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
	const [salesmanFilter, setSalesManFilter] = useState<string>('all');
	const [salesmen, setSalesmen] = useState<SalesMan[]>([]);
	const [loadingSalesmen, setLoadingSalesmen] = useState(false);

	// Offer Details Modal
	const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
	const [offerEquipment, setOfferEquipment] = useState<OfferEquipment[]>([]);
	const [loadingEquipment, setLoadingEquipment] = useState(false);
	const [equipmentImageUrls, setEquipmentImageUrls] = useState<Record<number, string>>({});

	// Needs Modification Modal
	const [showNeedsModificationModal, setShowNeedsModificationModal] = useState(false);
	const [needsModificationReason, setNeedsModificationReason] = useState('');
	const [processingAction, setProcessingAction] = useState<string | null>(null);

	// Role checks
	const userRoles = user?.roles || [];
	const isSuperAdmin = userRoles.includes('SuperAdmin');
	const isSalesManager = userRoles.includes('SalesManager');
	const canAccessPage = isSuperAdmin || isSalesManager;

	// Helper function to check if error is a connection error
	const isConnectionError = (error: any): boolean => {
		if (!error) return false;
		const errorMessage = error?.message || error?.toString() || '';
		return (
			errorMessage.includes('Failed to fetch') ||
			errorMessage.includes('ERR_CONNECTION_REFUSED') ||
			errorMessage.includes('NetworkError') ||
			errorMessage.includes('Network request failed')
		);
	};

	const loadSalesmen = useCallback(async () => {
		if (!user?.token || !canAccessPage) return;

		try {
			setLoadingSalesmen(true);
			const response = isSuperAdmin
				? await salesApi.getAllSalesmen()
				: await salesApi.getOfferSalesmen();

			if (response.success && response.data) {
				const data: any = response.data;
				let rawSalesmen: any[] = [];
				if (Array.isArray(data)) {
					rawSalesmen = data;
				} else if (data && typeof data === 'object') {
					rawSalesmen = data.items || data.salesmen || [];
				}

				const normalizedSalesmen = (rawSalesmen || [])
					.map((salesman: any) => ({
						id: salesman.id || salesman.userId || salesman?.user?.id,
						firstName: salesman.firstName || salesman?.user?.firstName || '',
						lastName: salesman.lastName || salesman?.user?.lastName || '',
						userName: salesman.userName || salesman?.user?.userName || '',
					}))
					.filter((salesman: SalesMan) => salesman.id);

				setSalesmen(normalizedSalesmen);
			}
		} catch (err) {
			console.error('Failed to load salesmen:', err);
		} finally {
			setLoadingSalesmen(false);
		}
	}, [user?.token, canAccessPage, isSuperAdmin]);

	const loadOffers = useCallback(async () => {
		if (!user?.token || !canAccessPage) {
			setError('Access denied');
			setLoading(false);
			return;
		}

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
				const isForbidden =
					apiError?.status === 403 ||
					apiError?.message?.includes('403');

				if (!isSuperAdmin && isSalesManager && isForbidden) {
					try {
						const fallbackResponse = await salesApi.getOffers({
							status: statusFilter !== 'all' ? statusFilter : undefined,
							page: pagination.page,
							pageSize: pagination.pageSize,
						});

						if (fallbackResponse.success && fallbackResponse.data) {
							let offersData = Array.isArray(fallbackResponse.data)
								? fallbackResponse.data
								: [];

							if (salesmanFilter !== 'all') {
								offersData = offersData.filter((offer: any) =>
									offer.assignedTo === salesmanFilter ||
									offer.assignedToId === salesmanFilter
								);
							}

							setOffers(offersData);
							setPagination({
								page: pagination.page,
								pageSize: pagination.pageSize,
								totalCount: offersData.length,
								totalPages: Math.max(1, Math.ceil(offersData.length / pagination.pageSize)),
								hasPreviousPage: pagination.page > 1,
								hasNextPage: offersData.length === pagination.pageSize,
							});
							return;
						}
					} catch (fallbackError: any) {
						console.error('Fallback endpoint also failed:', fallbackError);
						setError('Access denied. Please ensure you have the correct role.');
						return;
					}
				}

				throw apiError;
			}

			if (response?.success && response.data) {
				// Backend returns { offers: [], totalCount, page, pageSize, ... }
				const data = response.data as any;
				const offersData = data.offers || data.Offers || [];
				setOffers(offersData);
				setPagination({
					page: data.page || data.Page || 1,
					pageSize: data.pageSize || data.PageSize || 10,
					totalCount: data.totalCount || data.TotalCount || offersData.length || 0,
					totalPages: data.totalPages || data.TotalPages || 0,
					hasPreviousPage: data.hasPreviousPage || data.HasPreviousPage || false,
					hasNextPage: data.hasNextPage || data.HasNextPage || false,
				});
			} else {
				setError(response.message || 'Failed to load offers');
			}
		} catch (err: any) {
			console.error('Error loading offers:', err);
			if (isConnectionError(err)) {
				setError(t('connectionError') || 'Cannot connect to server. Please check your connection and try again.');
				toast.error(t('connectionError') || 'Cannot connect to server. Please check your connection.');
			} else {
				setError(err instanceof Error ? err.message : 'Failed to load offers');
			}
		} finally {
			setLoading(false);
		}
	}, [
		user?.token,
		canAccessPage,
		isSuperAdmin,
		isSalesManager,
		pagination.page,
		pagination.pageSize,
		statusFilter,
		salesmanFilter,
	]);

	useEffect(() => {
		if (canAccessPage) {
			loadSalesmen();
		}
	}, [canAccessPage, loadSalesmen]);

	useEffect(() => {
		if (canAccessPage) {
			loadOffers();
		}
	}, [canAccessPage, pagination.page, pagination.pageSize, statusFilter, salesmanFilter, loadOffers]);

	const handleFilterChange = (newStatus: string, newSalesMan: string) => {
		setStatusFilter(newStatus);
		setSalesManFilter(newSalesMan);
		setPagination(prev => ({ ...prev, page: 1 }));
	};

	const handlePageChange = (newPage: number) => {
		setPagination(prev => ({ ...prev, page: newPage }));
	};

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

	const getOfferStatusColor = (status: string) => {
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

	// Load offer details when selected
	const handleViewOffer = async (offer: Offer) => {
		try {
			// Reset equipment state and ref when opening a new offer
			setOfferEquipment([]);
			setEquipmentImageUrls({});
			lastLoadedOfferIdRef.current = null;
			
			// Set basic offer info immediately for better UX
			setSelectedOffer(offer);

			console.log(`[OffersManagementPage] Loading full details for offer ${offer.id}`, {
				userRole: user?.roles?.join(', '),
				offerId: offer.id,
				offerStatus: offer.status
			});

			// Load full offer details
			const response = await salesApi.getOffer(offer.id.toString());
			
			if (response.success && response.data) {
				console.log(`[OffersManagementPage] Successfully loaded offer details`, {
					offerId: response.data.id,
					hasEquipment: !!response.data.equipment,
					hasTerms: !!response.data.terms
				});
				
				// Merge the full details with basic offer info - use a single setState to prevent double useEffect trigger
				const mergedOffer = {
					...offer,
					...response.data,
					// Ensure required fields are preserved
					id: response.data.id || offer.id,
					clientName: response.data.clientName || offer.clientName,
					assignedToName: response.data.assignedToName || offer.assignedToName,
					createdByName: response.data.createdByName || offer.createdByName,
					totalAmount: response.data.totalAmount ?? offer.totalAmount,
					status: response.data.status || offer.status,
					createdAt: response.data.createdAt || offer.createdAt,
				};
				
				// Single setState to prevent multiple useEffect triggers
				setSelectedOffer(mergedOffer);
			} else {
				// If API call succeeded but no data, keep the basic offer info
				console.warn('[OffersManagementPage] Offer details not available, using basic offer info', response);
				// Keep the basic offer info - already set above
			}
		} catch (error: any) {
			console.error('[OffersManagementPage] Error loading offer details:', {
				error,
				message: error?.message,
				status: error?.status,
				statusText: error?.statusText,
				offerId: offer.id,
				userRole: user?.roles?.join(', ')
			});

			if (error?.status === 403) {
				toast.error('You do not have permission to view this offer');
				setSelectedOffer(null);
				setOfferEquipment([]);
				setEquipmentImageUrls({});
				lastLoadedOfferIdRef.current = null;
			} else if (error?.status === 401) {
				toast.error('Your session has expired. Please login again.');
				setSelectedOffer(null);
				setOfferEquipment([]);
				setEquipmentImageUrls({});
				lastLoadedOfferIdRef.current = null;
			} else if (error?.status === 404) {
				toast.error('Offer not found');
				setSelectedOffer(null);
				setOfferEquipment([]);
				setEquipmentImageUrls({});
				lastLoadedOfferIdRef.current = null;
			} else if (isConnectionError(error)) {
				toast.error(t('connectionError') || 'Cannot connect to server. Please check your connection and try again.');
				// Keep the basic offer info so user can still see something
			} else {
				toast.error(error?.message || t('failedToLoadOfferDetails') || 'Failed to load offer details');
				// Keep the basic offer info so user can still see something
			}
		}
	};

	// Track the last loaded offer ID to prevent duplicate calls
	const lastLoadedOfferIdRef = useRef<number | null>(null);

	// Load offer equipment when an offer is selected
	useEffect(() => {
		const loadOfferEquipment = async () => {
			const offerId = selectedOffer?.id;
			
			// Prevent duplicate calls for the same offer
			if (!offerId) {
				setOfferEquipment([]);
				lastLoadedOfferIdRef.current = null;
				return;
			}

			// Skip if already loaded for this offer (don't check loadingEquipment to allow retry on error)
			if (lastLoadedOfferIdRef.current === offerId) {
				console.log(`[OffersManagementPage] Skipping duplicate equipment load for offer ${offerId}`);
				return;
			}

			// Mark as loading for this offer
			lastLoadedOfferIdRef.current = offerId;
			setLoadingEquipment(true);
			
			try {
				console.log(`[OffersManagementPage] Loading equipment for offer ${offerId}`);

				const response = await salesApi.getOfferEquipment(offerId);
				
				if (response.success && response.data && Array.isArray(response.data)) {
					console.log(`[OffersManagementPage] Successfully loaded ${response.data.length} equipment items`);
					setOfferEquipment(response.data);
				} else {
					console.warn('[OffersManagementPage] Equipment response missing data or not an array:', response);
					setOfferEquipment([]);
				}
			} catch (error: any) {
				console.error('[OffersManagementPage] Error loading offer equipment:', {
					error,
					message: error?.message,
					status: error?.status,
					statusText: error?.statusText,
					offerId: offerId,
				});
				
				setOfferEquipment([]);
				
				// Show appropriate error message
				if (error?.status === 403) {
					toast.error('You do not have permission to view equipment for this offer');
				} else if (error?.status === 401) {
					toast.error('Your session has expired. Please login again.');
				} else if (error?.status === 404) {
					toast.error('Offer not found');
				} else if (isConnectionError(error)) {
					toast.error(t('connectionError') || 'Cannot connect to server. Equipment details may be unavailable.');
				} else if (error?.message) {
					// Only show error toast for non-connection errors if it's a clear permission issue
					if (error.message.includes('permission') || error.message.includes('403') || error.message.includes('Forbidden')) {
						toast.error('You do not have permission to view equipment for this offer');
					}
				}
			} finally {
				setLoadingEquipment(false);
			}
		};

		loadOfferEquipment();
		// Only depend on selectedOffer.id, not the whole object to prevent unnecessary re-renders
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedOffer?.id, t]);

	// Load equipment images
	useEffect(() => {
		const loadEquipmentImages = async () => {
			if (offerEquipment.length > 0 && selectedOffer?.id) {
				const imageUrls: Record<number, string> = {};

				// Try to load images for each equipment
				for (const equipment of offerEquipment) {
					try {
						let imagePath = equipment.imagePath || (equipment as any).ImagePath || (equipment as any).imagePath;

						// If no image path in equipment data, try to fetch it from API
						if (!imagePath || imagePath.trim() === '' || imagePath.includes('equipment-placeholder.png')) {
							try {
								const imageResponse = await salesApi.getEquipmentImage(selectedOffer.id, equipment.id);
								if (imageResponse.success && imageResponse.data?.imagePath) {
									imagePath = imageResponse.data.imagePath;
								}
							} catch (error) {
								// Silently handle image fetch errors - not critical
								console.debug(`[OffersManagementPage] Could not load image for equipment ${equipment.id}:`, error);
							}
						}

						if (imagePath && imagePath.trim() !== '' && !imagePath.includes('equipment-placeholder.png')) {
							const imageUrl = getStaticFileUrl(imagePath);
							imageUrls[equipment.id] = imageUrl;
						}
					} catch (error) {
						// Silently handle individual equipment image errors
						console.debug(`[OffersManagementPage] Error processing image for equipment ${equipment.id}:`, error);
					}
				}
				setEquipmentImageUrls(imageUrls);
			} else {
				setEquipmentImageUrls({});
			}
		};

		loadEquipmentImages();
	}, [offerEquipment, selectedOffer?.id]);

	const handleSendToSalesMan = async () => {
		if (!selectedOffer) return;
		if (selectedOffer.status !== 'Draft') {
			toast.error(t('onlyDraftOffersCanBeSent') || 'Only draft offers can be sent to salesman');
			return;
		}

		try {
			setProcessingAction('send');
			const response = await salesApi.sendOfferToSalesMan(selectedOffer.id.toString());
			if (response.success) {
				toast.success(t('offerSentSuccessfully') || 'Offer sent to salesman successfully');
				loadOffers();
				setSelectedOffer(null);
				setOfferEquipment([]);
				setEquipmentImageUrls({});
				lastLoadedOfferIdRef.current = null;
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
			toast.error(t('onlySentOffersCanBeMarkedUnderReview') || 'Only sent offers can be marked as under review');
			return;
		}

		try {
			setProcessingAction('underReview');
			const response = await salesApi.markAsUnderReview(selectedOffer.id.toString());
			if (response.success) {
				toast.success(t('offerMarkedAsUnderReview') || 'Offer marked as under review successfully');
				loadOffers();
				setSelectedOffer(null);
				setOfferEquipment([]);
				setEquipmentImageUrls({});
				lastLoadedOfferIdRef.current = null;
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

	const handleResumeFromUnderReview = async () => {
		if (!selectedOffer) return;
		if (selectedOffer.status !== 'UnderReview') {
			toast.error(t('onlyUnderReviewOffersCanBeResumed') || 'Only offers under review can be resumed');
			return;
		}

		try {
			setProcessingAction('resumeFromReview');
			const response = await salesApi.resumeFromUnderReview(selectedOffer.id.toString());
			if (response.success) {
				toast.success(t('offerResumedFromUnderReview') || 'Offer resumed from under review successfully');
				loadOffers();
				setSelectedOffer(null);
				setOfferEquipment([]);
				setEquipmentImageUrls({});
				lastLoadedOfferIdRef.current = null;
			} else {
				toast.error(response.message || 'Failed to resume offer from under review');
			}
		} catch (error: any) {
			console.error('Error resuming offer from under review:', error);
			toast.error(error.message || 'Failed to resume offer from under review');
		} finally {
			setProcessingAction(null);
		}
	};

	const handleOpenNeedsModificationModal = () => {
		if (!selectedOffer) return;
		if (selectedOffer.status !== 'Draft' && selectedOffer.status !== 'Sent') {
			toast.error(t('onlyDraftOrSentOffersCanBeMarkedNeedsModification') || 'Only draft or sent offers can be marked as needing modification');
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
				toast.success(t('offerMarkedAsNeedsModification') || 'Offer marked as needing modification successfully');
				loadOffers();
				setSelectedOffer(null);
				setOfferEquipment([]);
				setEquipmentImageUrls({});
				lastLoadedOfferIdRef.current = null;
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

	const handleExportPdf = async () => {
		if (!selectedOffer) return;
		
		const authState = useAuthStore.getState();
		const token = authState.user?.token;

		if (!token) {
			toast.error(t('authenticationRequiredForBackendPdfs') || 'Authentication required for PDF export');
			return;
		}

		const loadingToast = toast.loading('Generating PDFs...');

		try {
			const { exportOfferPdfs } = await import('@/services/sales/pdfExportService');
			const result = await exportOfferPdfs({
				offerId: selectedOffer.id,
				token,
				languages: ['en', 'ar'],
				timeout: 60000, // 60 seconds timeout
			});

			toast.dismiss(loadingToast);

			if (result.success && result.downloaded.length > 0) {
				const successMessage = result.downloaded.length === 2
					? t('pdfsExportedSuccessfully') || 'PDFs exported successfully!'
					: `PDF exported successfully (${result.downloaded[0].toUpperCase()})`;
				toast.success(successMessage);
			}

			if (result.failed.length > 0) {
				const failedLanguages = result.failed.map(f => f.language.toUpperCase()).join(', ');
				const errorMessage = result.downloaded.length > 0
					? `Some PDFs failed to export: ${failedLanguages}`
					: `Failed to export PDFs: ${result.failed[0].error}`;
				toast.error(errorMessage);
			}

			if (result.downloaded.length === 0 && result.failed.length > 0) {
				toast.error(result.failed[0].error || 'Failed to export PDFs');
			}
		} catch (error: any) {
			toast.dismiss(loadingToast);
			console.error('Error exporting PDF:', error);
			toast.error(error.message || 'Failed to export PDF');
		}
	};

	if (!canAccessPage) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
						{t('accessDenied')}
					</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						{t('accessDeniedMessage')}
					</p>
				</div>
			</div>
		);
	}

	// Calculate statistics
	const totalOffers = pagination.totalCount;
	const draftOffers = offers.filter(o => o.status === 'Draft').length;
	const sentOffers = offers.filter(o => o.status === 'Sent').length;
	const acceptedOffers = offers.filter(o => o.status === 'Accepted').length;
	const totalAmount = offers.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-2 flex items-center gap-2">
						<FileText className="h-6 w-6 text-primary" />
						{t('allOffersManagement') || 'All Offers Management'}
					</h1>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						{t('allOffersDescription') || 'View and manage all offers in the system'}
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={async () => {
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
						}}
						variant="outline"
						className="flex items-center gap-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900"
					>
						<AlertCircle className="h-4 w-4" />
						{t('updateExpired') || 'Update Expired'}
					</Button>
					<Button
						onClick={loadOffers}
						variant="outline"
						className="flex items-center gap-2"
					>
						<RefreshCw className="h-4 w-4" />
						{t('refresh')}
					</Button>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
					<CardContent className="p-5 md:p-6">
						<div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30 mb-5">
							<FileText className="text-blue-600 h-6 w-6 dark:text-blue-400" />
						</div>
						<div className="flex items-end justify-between">
							<div>
								<span className="text-xs text-gray-500 dark:text-gray-400">Total Offers</span>
								<h4 className="mt-2 text-lg font-bold text-gray-800 dark:text-white/90">
									{totalOffers}
								</h4>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
					<CardContent className="p-5 md:p-6">
						<div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30 mb-5">
							<CheckCircle className="text-green-600 h-6 w-6 dark:text-green-400" />
						</div>
						<div className="flex items-end justify-between">
							<div>
								<span className="text-xs text-gray-500 dark:text-gray-400">Accepted</span>
								<h4 className="mt-2 text-lg font-bold text-gray-800 dark:text-white/90">
									{acceptedOffers}
								</h4>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
					<CardContent className="p-5 md:p-6">
						<div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl dark:bg-yellow-900/30 mb-5">
							<Clock className="text-yellow-600 h-6 w-6 dark:text-yellow-400" />
						</div>
						<div className="flex items-end justify-between">
							<div>
								<span className="text-xs text-gray-500 dark:text-gray-400">Pending</span>
								<h4 className="mt-2 text-lg font-bold text-gray-800 dark:text-white/90">
									{draftOffers + sentOffers}
								</h4>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
					<CardContent className="p-5 md:p-6">
						<div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/30 mb-5">
							<DollarSign className="text-purple-600 h-6 w-6 dark:text-purple-400" />
						</div>
						<div className="flex items-end justify-between">
							<div>
								<span className="text-xs text-gray-500 dark:text-gray-400">Total Amount</span>
								<h4 className="mt-2 text-lg font-bold text-gray-800 dark:text-white/90">
									{new Intl.NumberFormat('en-US', {
										style: 'currency',
										currency: 'EGP',
										maximumFractionDigits: 0,
									}).format(totalAmount)}
								</h4>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters Section */}
			<Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
				<CardHeader className="pb-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<CardTitle className="text-sm font-semibold text-gray-800 dark:text-white/90">Filters</CardTitle>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Filter offers by status and salesman</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div className="space-y-2">
							<label className="text-xs font-medium text-gray-700 dark:text-gray-300">
								{t('status')}
							</label>
							<Select
								value={statusFilter}
								onValueChange={(value) => handleFilterChange(value, salesmanFilter)}
							>
								<SelectTrigger>
									<SelectValue placeholder={t('allStatuses')} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t('allStatuses')}</SelectItem>
									<SelectItem value="Draft">{t('draft')}</SelectItem>
									<SelectItem value="Sent">{t('sent')}</SelectItem>
									<SelectItem value="Accepted">{t('accepted')}</SelectItem>
									<SelectItem value="Rejected">{t('rejected')}</SelectItem>
									<SelectItem value="UnderReview">{t('underReview')}</SelectItem>
									<SelectItem value="NeedsModification">{t('needsModification')}</SelectItem>
									<SelectItem value="Expired">{t('expired')}</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label className="text-xs font-medium text-gray-700 dark:text-gray-300">
								{t('salesman')}
							</label>
							<Select
								value={salesmanFilter}
								onValueChange={(value) => handleFilterChange(statusFilter, value)}
								disabled={loadingSalesmen}
							>
								<SelectTrigger>
									<SelectValue
										placeholder={loadingSalesmen ? t('loading') : t('allSalesmen')}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t('allSalesmen')}</SelectItem>
									{salesmen.map((salesman) => (
										<SelectItem key={salesman.id} value={salesman.id}>
											{salesman.firstName} {salesman.lastName} ({salesman.userName})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2 flex items-end">
							<Button
								onClick={() => {
									setStatusFilter('all');
									setSalesManFilter('all');
									setPagination(prev => ({ ...prev, page: 1 }));
								}}
								variant="outline"
								className="w-full"
							>
								{t('clearFilters')}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{loading ? (
				<LoadingSpinner />
			) : error ? (
				<ErrorDisplay message={error} onRetry={loadOffers} />
			) : offers.length === 0 ? (
				<EmptyState
					title={t('noOffersFound')}
					description={t('noOffersMatchFilters')}
				/>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{offers.map((offer) => (
							<Card key={offer.id} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all duration-200">
								<CardContent className="p-5 md:p-6">
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-4">
												<h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
													{t('offer')} #{offer.id}
												</h3>
												<Badge className={`${getStatusColor(offer.status)} text-white border-0`}>
													{getStatusLabel(offer.status)}
												</Badge>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
												<div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
													<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
														{t('client')}
													</p>
													<p className="font-semibold text-gray-800 dark:text-white/90">
														{offer.clientName || 'N/A'}
													</p>
												</div>
												<div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
													<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
														{t('assignedTo')}
													</p>
													<p className="font-semibold text-gray-800 dark:text-white/90">
														{offer.assignedToName || 'N/A'}
													</p>
												</div>
												<div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
													<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
														{t('createdBy')}
													</p>
													<p className="font-semibold text-gray-800 dark:text-white/90">
														{offer.createdByName || 'N/A'}
													</p>
												</div>
												<div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 md:col-span-2 lg:col-span-2">
													<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
														{t('totalAmount')}
													</p>
													<p className="text-sm font-bold text-blue-600 dark:text-blue-400 break-words">
														{new Intl.NumberFormat('en-US', {
															style: 'currency',
															currency: 'EGP',
														}).format(offer.totalAmount)}
													</p>
												</div>
												<div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
													<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
														{t('createdAt')}
													</p>
													<p className="font-semibold text-gray-800 dark:text-white/90">
														{format(new Date(offer.createdAt), 'MMM dd, yyyy')}
													</p>
												</div>
											</div>
										</div>
										<div className="flex flex-col gap-2 flex-shrink-0">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleViewOffer(offer)}
											>
												<Eye className="h-4 w-4 mr-2" />
												{t('view')}
											</Button>
											{/* Edit button for Sales Manager - can edit any offer regardless of status */}
											{(isSalesManager || isSuperAdmin) && (
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														navigate(`/SalesManager/offers/${offer.id}/edit`);
													}}
													className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900"
												>
													<Edit className="h-4 w-4 mr-2" />
													{t('edit') || 'Edit'}
												</Button>
											)}
											{/* Quick action buttons based on status */}
											{offer.status === 'Draft' && (
												<Button
													variant="default"
													size="sm"
													onClick={async () => {
														const response = await salesApi.getOffer(offer.id.toString());
														if (response.success && response.data) {
															setSelectedOffer(response.data);
															setTimeout(() => {
																handleSendToSalesMan();
															}, 100);
														}
													}}
													className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
												>
													<CheckCircle className="h-3 w-3 mr-1" />
													{t('send') || 'Send'}
												</Button>
											)}
											{(offer.status === 'Draft' || offer.status === 'Sent') && (
												<Button
													variant="outline"
													size="sm"
													onClick={async () => {
														const response = await salesApi.getOffer(offer.id.toString());
														if (response.success && response.data) {
															setSelectedOffer(response.data);
															setTimeout(() => {
																handleOpenNeedsModificationModal();
															}, 100);
														}
													}}
													className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900 text-xs"
												>
													<Edit className="h-3 w-3 mr-1" />
													{t('needsModification') || 'Needs Mod'}
												</Button>
											)}
											{offer.status === 'Sent' && (
												<Button
													variant="outline"
													size="sm"
													onClick={async () => {
														const response = await salesApi.getOffer(offer.id.toString());
														if (response.success && response.data) {
															setSelectedOffer(response.data);
															setTimeout(() => {
																handleMarkAsUnderReview();
															}, 100);
														}
													}}
													className="border-yellow-600 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900 text-xs"
												>
													<Clock className="h-3 w-3 mr-1" />
													{t('underReview') || 'Review'}
												</Button>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Pagination */}
					{pagination.totalPages > 1 && (
						<div className="flex items-center justify-between">
							<div className="text-xs text-gray-600 dark:text-gray-400">
								{t('showing')} {((pagination.page - 1) * pagination.pageSize) + 1} {t('to')}{' '}
								{Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} {t('of')}{' '}
								{pagination.totalCount} {t('offers')}
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handlePageChange(pagination.page - 1)}
									disabled={!pagination.hasPreviousPage}
								>
									<ChevronLeft className="h-4 w-4" />
									{t('previous')}
								</Button>
								<span className="text-xs text-gray-600 dark:text-gray-400">
									{t('page')} {pagination.page} {t('of')} {pagination.totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handlePageChange(pagination.page + 1)}
									disabled={!pagination.hasNextPage}
								>
									{t('next')}
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</>
			)}

			{/* Offer Details Modal */}
			{selectedOffer && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
					<div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl shadow-2xl my-8">
						<div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
										{t('offerDetails') || 'Offer Details'}
									</h3>
									<p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
										{selectedOffer.clientName}
									</p>
								</div>
								<Button
									onClick={() => {
										setSelectedOffer(null);
										setOfferEquipment([]);
										setEquipmentImageUrls({});
										setLoadingEquipment(false);
										lastLoadedOfferIdRef.current = null;
										lastLoadedOfferIdRef.current = null;
									}}
									variant="destructive"
									size="sm"
									className="h-8 w-8 p-0"
								>
									×
								</Button>
							</div>
						</div>

						<div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
							{/* Offer Info Section */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
										{t('status')}
									</label>
									<Badge className={`${getOfferStatusColor(selectedOffer.status)}`}>
										{getStatusLabel(selectedOffer.status)}
									</Badge>
								</div>
								<div>
									<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
										{t('totalAmount')}
									</label>
									<p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
										{selectedOffer.totalAmount !== undefined && selectedOffer.totalAmount !== null 
											? `EGP ${Number(selectedOffer.totalAmount).toLocaleString()}` 
											: 'N/A'}
									</p>
									{(selectedOffer as any).discountAmount && (selectedOffer as any).discountAmount > 0 && (
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
											{t('discount') || 'Discount'}: EGP {(selectedOffer as any).discountAmount.toLocaleString()}
										</p>
									)}
								</div>
							</div>

							{/* Rejection Reason Section */}
							{selectedOffer.status === 'Rejected' && ((selectedOffer as any).salesManagerRejectionReason || (selectedOffer as any).clientResponse) && (
								<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
									<label className="block text-xs font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
										<AlertCircle className="h-3 w-3" />
										{t('rejectionReason') || 'Rejection Reason'}
									</label>
									<p className="text-xs text-red-900 dark:text-red-100 whitespace-pre-wrap">
										{(selectedOffer as any).salesManagerRejectionReason || (selectedOffer as any).clientResponse || 'No reason provided'}
									</p>
									{(selectedOffer as any).salesManagerComments && (
										<div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
											<label className="block text-xs font-medium text-red-600 dark:text-red-400 mb-1">
												{t('comments') || 'Comments'}
											</label>
											<p className="text-xs text-red-800 dark:text-red-200">
												{(selectedOffer as any).salesManagerComments}
											</p>
										</div>
									)}
									{(selectedOffer as any).salesManagerApprovedAt && (
										<p className="text-xs text-red-600 dark:text-red-400 mt-2">
											{t('rejectedAt') || 'Rejected at'}: {(() => {
												try {
													const date = new Date((selectedOffer as any).salesManagerApprovedAt);
													return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM dd, yyyy HH:mm');
												} catch {
													return 'N/A';
												}
											})()}
										</p>
									)}
								</div>
							)}

							<Separator />

							{/* Products Section */}
							<div>
								<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
									{t('equipment')} {t('details')}
								</label>

								{loadingEquipment ? (
									<div className="text-center py-4">
										<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('loading')}</p>
									</div>
								) : offerEquipment && offerEquipment.length > 0 ? (
									<div className="space-y-4">
										{offerEquipment.map((equipment, index) => (
											<div
												key={equipment.id || index}
												className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
											>
												{/* Header with Image, Name and Price */}
												<div className="flex gap-4 mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
													<div className="flex-shrink-0">
														{(() => {
															const imagePath = equipment.imagePath || (equipment as any).ImagePath;
															let imageUrl: string | null = null;
															if (imagePath) {
																imageUrl = equipmentImageUrls[equipment.id] || getStaticFileUrl(imagePath);
															}

															if (imageUrl && !imagePath?.includes('equipment-placeholder.png')) {
																return (
																	<img
																		src={imageUrl}
																		alt={equipment.name || 'Equipment image'}
																		className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
																		onError={(e) => {
																			(e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"%3E%3Crect fill="%23e5e7eb" width="96" height="96"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="12" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
																		}}
																		crossOrigin="anonymous"
																	/>
																);
															} else {
																return (
																	<div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-500 flex items-center justify-center">
																		<span className="text-xs text-gray-500 dark:text-gray-400">No Image</span>
																	</div>
																);
															}
														})()}
													</div>
													<div className="flex-1">
														<h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1">
															{equipment.name}
														</h4>
														{(equipment.model || (equipment as any).provider || (equipment as any).Provider) && (
															<div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
																<ProviderLogo
																	providerName={(equipment as any).provider || (equipment as any).Provider || (equipment as any).manufacturer || (equipment as any).Manufacturer || null}
																	logoPath={
																		(equipment as any).providerImagePath ||
																		(equipment as any).ProviderImagePath ||
																		null
																	}
																	size="sm"
																	showName={true}
																/>
																{equipment.model && <span className="text-gray-500">- {equipment.model}</span>}
															</div>
														)}
													</div>
													<div className="text-right ml-4">
														<p className="font-bold text-base text-blue-600 dark:text-blue-400">
															EGP {((equipment as any).price ?? (equipment as any).Price ?? (equipment as any).totalPrice ?? (equipment as any).TotalPrice ?? 0).toLocaleString()}
														</p>
													</div>
												</div>

												{/* Equipment Details Grid */}
												<div className="grid grid-cols-2 gap-4 mb-3">
													<div>
														<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
															{t('price')}
														</label>
														<p className="text-xs font-medium text-gray-900 dark:text-gray-100">
															EGP {((equipment as any).price ?? (equipment as any).Price ?? (equipment as any).totalPrice ?? (equipment as any).TotalPrice ?? 0).toLocaleString()}
														</p>
													</div>
													{((equipment as any).quantity !== undefined || (equipment as any).Quantity !== undefined) && (
														<div>
															<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
																{t('quantity') || 'Quantity'}
															</label>
															<p className="text-xs font-medium text-gray-900 dark:text-gray-100">
																{(equipment as any).quantity ?? (equipment as any).Quantity ?? 1}
															</p>
														</div>
													)}
													<div>
														<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
															{t('provider')}
														</label>
														<ProviderLogo
															providerName={(equipment as any).provider || (equipment as any).Provider || (equipment as any).manufacturer || (equipment as any).Manufacturer || null}
															logoPath={
																(equipment as any).providerImagePath ||
																(equipment as any).ProviderImagePath ||
																null
															}
															size="sm"
															showName={true}
														/>
													</div>
													<div>
														<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
															{t('model')}
														</label>
														<p className="text-xs font-medium text-gray-900 dark:text-gray-100">
															{equipment.model || (equipment as any).Model || 'N/A'}
														</p>
													</div>
													<div>
														<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
															{t('country')}
														</label>
														<p className="text-xs font-medium text-gray-900 dark:text-gray-100">
															{(equipment as any).country || (equipment as any).Country || 'N/A'}
														</p>
													</div>
													<div>
														<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
															{t('warrantyPeriod')}
														</label>
														<p className="text-xs font-medium text-gray-900 dark:text-gray-100">
															{(equipment as any).warrantyPeriod || (equipment as any).WarrantyPeriod || 'N/A'}
														</p>
													</div>
												</div>

												{/* Description */}
												<div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
													<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
														{((equipment as any).specifications || (equipment as any).Specifications) ? (t('specifications') || 'Specifications') : (t('description') || 'Description')}
													</label>
													<p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
														{(equipment as any).specifications || (equipment as any).Specifications || (equipment as any).description || (equipment as any).Description || 'No description available'}
													</p>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
										{loadingEquipment ? (
											<div className="text-center py-4">
												<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
												<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('loading') || 'Loading...'}</p>
											</div>
										) : (
											<p className="text-sm text-gray-900 dark:text-gray-100">
												{(selectedOffer as any).products || 'No equipment details available'}
											</p>
										)}
									</div>
								)}
							</div>

							{/* Additional Details */}
							{((selectedOffer as any).paymentTerms || (selectedOffer as any).deliveryTerms || (selectedOffer as any).warrantyTerms || (selectedOffer as any).notes) && (
								<>
									<Separator />
									<div className="space-y-3">
										{(selectedOffer as any).paymentTerms && (
											<div>
												<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
													{t('paymentTerms')}
												</label>
												{Array.isArray((selectedOffer as any).paymentTerms) ? (
													<ul className="list-disc list-inside space-y-1 text-xs text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
														{(selectedOffer as any).paymentTerms.map((term: string, idx: number) => (
															<li key={idx}>{term}</li>
														))}
													</ul>
												) : (
													<p className="text-xs text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
														{(selectedOffer as any).paymentTerms}
													</p>
												)}
											</div>
										)}
										{(selectedOffer as any).deliveryTerms && (
											<div>
												<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
													{t('deliveryTerms')}
												</label>
												{Array.isArray((selectedOffer as any).deliveryTerms) ? (
													<ul className="list-disc list-inside space-y-1 text-xs text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
														{(selectedOffer as any).deliveryTerms.map((term: string, idx: number) => (
															<li key={idx}>{term}</li>
														))}
													</ul>
												) : (
													<p className="text-xs text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
														{(selectedOffer as any).deliveryTerms}
													</p>
												)}
											</div>
										)}
										{(selectedOffer as any).warrantyTerms && (
											<div>
												<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
													{t('warrantyPeriod')}
												</label>
												{Array.isArray((selectedOffer as any).warrantyTerms) ? (
													<ul className="list-disc list-inside space-y-1 text-xs text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
														{(selectedOffer as any).warrantyTerms.map((term: string, idx: number) => (
															<li key={idx}>{term}</li>
														))}
													</ul>
												) : (
													<p className="text-xs text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
														{(selectedOffer as any).warrantyTerms}
													</p>
												)}
											</div>
										)}
										{(selectedOffer as any).notes && (
											<div>
												<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
													{t('notes')}
												</label>
												<p className="text-xs text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
													{(selectedOffer as any).notes}
												</p>
											</div>
										)}
									</div>
								</>
							)}

							<Separator />

							{/* Footer Info */}
							<div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700 space-y-1">
								<div className="flex justify-between">
									<span>
										<strong>{t('createdAt')}:</strong> {(selectedOffer as any).createdAt 
											? (() => {
												try {
													const date = new Date((selectedOffer as any).createdAt);
													return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM dd, yyyy HH:mm');
												} catch {
													return 'N/A';
												}
											})()
											: 'N/A'}
									</span>
									{(selectedOffer as any).validUntil && (
										<span>
											<strong>{t('validUntil')}:</strong> {Array.isArray((selectedOffer as any).validUntil)
												? (selectedOffer as any).validUntil.map((d: string) => {
													try {
														const date = new Date(d);
														return isNaN(date.getTime()) ? d : format(date, 'MMM dd, yyyy');
													} catch {
														return d;
													}
												}).join(', ')
												: (() => {
													try {
														const date = new Date((selectedOffer as any).validUntil);
														return isNaN(date.getTime()) ? (selectedOffer as any).validUntil : format(date, 'MMM dd, yyyy');
													} catch {
														return (selectedOffer as any).validUntil;
													}
												})()
											}
										</span>
									)}
								</div>
								{selectedOffer.assignedToName && (
									<div>
										<strong>{t('assignedTo')}:</strong> {selectedOffer.assignedToName}
									</div>
								)}
								{(selectedOffer as any).createdByName && (
									<div>
										<strong>{t('createdBy')}:</strong> {(selectedOffer as any).createdByName}
									</div>
								)}
							</div>

							{/* Action Buttons */}
							<Separator className="my-4" />
							<div className="flex flex-wrap justify-end gap-3 pt-4">
								{/* Edit button for Sales Manager - can edit any offer regardless of status */}
								{(isSalesManager || isSuperAdmin) && (
									<Button
										variant="outline"
										onClick={() => {
											navigate(`/SalesManager/offers/${selectedOffer.id}/edit`);
										}}
										className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900"
									>
										<Edit className="h-4 w-4 mr-2" />
										{t('edit') || 'Edit Offer'}
									</Button>
								)}
								{/* Status-based action buttons */}
								{selectedOffer.status === 'Draft' && (
									<>
										<Button
											variant="default"
											onClick={handleSendToSalesMan}
											disabled={processingAction !== null}
											className="bg-blue-600 hover:bg-blue-700 text-white"
										>
											<CheckCircle className="h-4 w-4 mr-2" />
											{processingAction === 'send' ? t('sending') || 'Sending...' : t('sendToSalesMan') || 'Send to SalesMan'}
										</Button>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="outline"
														onClick={handleOpenNeedsModificationModal}
														disabled={processingAction !== null}
														className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900"
													>
														<Edit className="h-4 w-4 mr-2" />
														{t('markAsNeedsModification') || 'Mark as Needs Modification'}
													</Button>
												</TooltipTrigger>
												<TooltipContent className="max-w-xs">
													<p className="font-semibold mb-1">{t('needsModificationTooltipTitle') || 'Needs Modification'}</p>
													<p className="text-sm">{t('needsModificationTooltipDescription') || 'Request changes to the offer. Returns to SalesSupport for editing. After edit, offer goes to Draft status.'}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</>
								)}
								{selectedOffer.status === 'Sent' && (
									<>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="outline"
														onClick={handleMarkAsUnderReview}
														disabled={processingAction !== null}
														className="border-yellow-600 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900"
													>
														<Clock className="h-4 w-4 mr-2" />
														{processingAction === 'underReview' ? t('processing') || 'Processing...' : t('markAsUnderReview') || 'Mark as Under Review'}
													</Button>
												</TooltipTrigger>
												<TooltipContent className="max-w-xs">
													<p className="font-semibold mb-1 text-xs">{t('underReviewTooltipTitle') || 'Under Review'}</p>
													<p className="text-xs">{t('underReviewTooltipDescription') || 'Pause the offer for internal review. Does not return to SalesSupport. You can resume it later.'}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="outline"
														onClick={handleOpenNeedsModificationModal}
														disabled={processingAction !== null}
														className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900"
													>
														<Edit className="h-4 w-4 mr-2" />
														{t('markAsNeedsModification') || 'Mark as Needs Modification'}
													</Button>
												</TooltipTrigger>
												<TooltipContent className="max-w-xs">
													<p className="font-semibold mb-1">{t('needsModificationTooltipTitle') || 'Needs Modification'}</p>
													<p className="text-sm">{t('needsModificationTooltipDescription') || 'Request changes to the offer. Returns to SalesSupport for editing. After edit, offer goes to Draft status.'}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</>
								)}
								{selectedOffer.status === 'UnderReview' && (
									<>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="outline"
														onClick={handleResumeFromUnderReview}
														disabled={processingAction !== null}
														className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900"
													>
														<Play className="h-4 w-4 mr-2" />
														{processingAction === 'resumeFromReview' ? t('processing') || 'Processing...' : t('resumeFromUnderReview') || 'Resume to Sent'}
													</Button>
												</TooltipTrigger>
												<TooltipContent className="max-w-xs">
													<p className="font-semibold mb-1">{t('resumeFromReviewTooltipTitle') || 'Resume from Review'}</p>
													<p className="text-sm">{t('resumeFromReviewTooltipDescription') || 'Resume the offer from under review back to Sent status. The offer will be available for client response again.'}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="outline"
														onClick={handleOpenNeedsModificationModal}
														disabled={processingAction !== null}
														className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900"
													>
														<Edit className="h-4 w-4 mr-2" />
														{t('markAsNeedsModification') || 'Mark as Needs Modification'}
													</Button>
												</TooltipTrigger>
												<TooltipContent className="max-w-xs">
													<p className="font-semibold mb-1">{t('needsModificationTooltipTitle') || 'Needs Modification'}</p>
													<p className="text-sm">{t('needsModificationTooltipDescription') || 'Request changes to the offer. Returns to SalesSupport for editing. After edit, offer goes to Draft status.'}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</>
								)}
								{selectedOffer.status === 'UnderReview' && (
									<>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="outline"
														onClick={handleResumeFromUnderReview}
														disabled={processingAction !== null}
														className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900"
													>
														<Play className="h-4 w-4 mr-2" />
														{processingAction === 'resumeFromReview' ? t('processing') || 'Processing...' : t('resumeFromUnderReview') || 'Resume to Sent'}
													</Button>
												</TooltipTrigger>
												<TooltipContent className="max-w-xs">
													<p className="font-semibold mb-1">{t('resumeFromReviewTooltipTitle') || 'Resume from Review'}</p>
													<p className="text-sm">{t('resumeFromReviewTooltipDescription') || 'Resume the offer from under review back to Sent status. The offer will be available for client response again.'}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="outline"
														onClick={handleOpenNeedsModificationModal}
														disabled={processingAction !== null}
														className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900"
													>
														<Edit className="h-4 w-4 mr-2" />
														{t('markAsNeedsModification') || 'Mark as Needs Modification'}
													</Button>
												</TooltipTrigger>
												<TooltipContent className="max-w-xs">
													<p className="font-semibold mb-1">{t('needsModificationTooltipTitle') || 'Needs Modification'}</p>
													<p className="text-sm">{t('needsModificationTooltipDescription') || 'Request changes to the offer. Returns to SalesSupport for editing. After edit, offer goes to Draft status.'}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</>
								)}
								<Button
									variant="outline"
									onClick={handleExportPdf}
									className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
								>
									<Download className="h-4 w-4 mr-2" />
									{t('exportPdf')}
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Needs Modification Modal */}
			{showNeedsModificationModal && selectedOffer && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl">
						<div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
							<div className="flex justify-between items-center">
								<h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
									{t('markAsNeedsModification') || 'Mark as Needs Modification'}
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
								<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
									{t('reason') || 'Reason'} ({t('optional') || 'Optional'})
								</label>
								<textarea
									value={needsModificationReason}
									onChange={(e) => setNeedsModificationReason(e.target.value)}
									placeholder={t('enterReasonForModification') || 'Enter reason why this offer needs modification...'}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
									rows={4}
									maxLength={1000}
								/>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									{needsModificationReason.length}/1000 {t('characters') || 'characters'}
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
									{t('cancel') || 'Cancel'}
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
											{t('processing') || 'Processing...'}
										</>
									) : (
										<>
											<Edit className="h-4 w-4 mr-2" />
											{t('markAsNeedsModification') || 'Mark as Needs Modification'}
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

