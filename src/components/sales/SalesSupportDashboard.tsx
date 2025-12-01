import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { salesApi } from '@/services/sales/salesApi';
import type { OfferEquipment } from '@/types/sales.types';
import ClientSearch from './ClientSearch';
import SalesSupportClientDetails from './SalesSupportClientDetails';
import OfferRequestForm from './OfferRequestForm';
import {
	UserGroupIcon,
	CalendarIcon,
	ExclamationTriangleIcon,
	CheckCircleIcon,
	ClockIcon,
	PlusIcon,
	ArchiveBoxIcon,
	CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
	HeadphonesIcon,
	Users,
	BarChart3,
	Activity as ActivityIcon,
	Clock as ClockOutlineIcon,
	CheckCircle2,
	XCircle,
	Send,
	User as UserIcon,
	Building2,
	FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { downloadOfferPDF } from '@/utils/pdfGenerator';
import toast from 'react-hot-toast';
import { getStaticFileUrl, getApiBaseUrl } from '@/utils/apiConfig';
import { usePerformance } from '@/hooks/usePerformance';

type SalesSupportTab = 'overview' | 'my-offers' | 'requests' | 'clients';
const SALES_SUPPORT_TABS: readonly SalesSupportTab[] = ['overview', 'my-offers', 'requests', 'clients'];

const SalesSupportDashboard: React.FC = () => {
	usePerformance('SalesSupportDashboard');
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();
	const {
		getAssignedRequests,
		updateRequestStatus,
		getMyOffers,
		searchClients,
		getOffersByClient,
		assignedRequests,
		offers,
		requestWorkflowsLoading,
		clientsLoading,
		offersLoading,
		clients,
		clientsError,
		requestWorkflowsError,
		offersError,
		pagination,
		offersByClient
	} = useSalesStore();

	const { user } = useAuthStore();
	const [selectedClient, setSelectedClient] = useState<any>(null);
	const [selectedRequest, setSelectedRequest] = useState<any>(null);
	const [selectedOffer, setSelectedOffer] = useState<any>(null);
	const [offerEquipment, setOfferEquipment] = useState<OfferEquipment[]>([]);
	const [loadingEquipment, setLoadingEquipment] = useState(false);
	const [equipmentImageUrls, setEquipmentImageUrls] = useState<Record<number, string>>({});
	const [showOfferForm, setShowOfferForm] = useState(false);
	const [activeTab, setActiveTab] = useState<SalesSupportTab>('overview');
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [recentActivity, setRecentActivity] = useState<any[]>([]);
	const [activityLoading, setActivityLoading] = useState(false);

	useEffect(() => {
		getAssignedRequests();
		getMyOffers();
	}, [getAssignedRequests, getMyOffers]);

	const loadRecentActivity = async () => {
		setActivityLoading(true);
		try {
			const response = await salesApi.getRecentActivity(20);
			if (response.success && response.data) {
				setRecentActivity(response.data);
			}
		} catch (error) {
			// Ignore activity load errors – non blocking
		} finally {
			setActivityLoading(false);
		}
	};

	useEffect(() => {
		loadRecentActivity();
	}, []);

	// Sync active tab with query parameter
	useEffect(() => {
		const tabFromUrl = searchParams.get('tab');
		const normalizedTab = tabFromUrl === 'sales-support' ? 'overview' : tabFromUrl;
		if (normalizedTab && SALES_SUPPORT_TABS.includes(normalizedTab as SalesSupportTab)) {
			setActiveTab(normalizedTab as SalesSupportTab);
		}
	}, [searchParams]);

	// Handle offerId from URL parameter (for navigation from notifications)
	useEffect(() => {
		const offerIdFromUrl = searchParams.get('offerId');
		if (offerIdFromUrl && offers.length > 0) {
			const offer = offers.find((o: any) => o.id.toString() === offerIdFromUrl);
			if (offer) {
				setSelectedOffer(offer);
				// Switch to offers tab to show the offer
				setActiveTab('my-offers');
				// Clear the URL parameter after opening the offer
				const params = new URLSearchParams(searchParams);
				params.delete('offerId');
				setSearchParams(params, { replace: true });
			}
		}
	}, [searchParams, offers, setSearchParams]);

	// Handle requestId from URL parameter
	useEffect(() => {
		const requestIdFromUrl = searchParams.get('requestId');
		if (requestIdFromUrl && assignedRequests.length > 0) {
			const request = assignedRequests.find((req: any) => req.id.toString() === requestIdFromUrl);
			if (request) {
				setSelectedRequest(request);
				setActiveTab('requests');
				const params = new URLSearchParams(searchParams);
				params.delete('requestId');
				setSearchParams(params, { replace: true });
			}
		}
	}, [searchParams, assignedRequests, setSearchParams]);

	// Handle clientId from URL parameter
	useEffect(() => {
		const clientIdFromUrl = searchParams.get('clientId');
		if (!clientIdFromUrl) return;

		const matchedClient = clients?.find((client: any) => client.id?.toString() === clientIdFromUrl);
		if (matchedClient) {
			setSelectedClient(matchedClient);
			setActiveTab('clients');
			const params = new URLSearchParams(searchParams);
			params.delete('clientId');
			setSearchParams(params, { replace: true });
			return;
		}

		if (!clientsLoading) {
			searchClients({ query: clientIdFromUrl, page: 1, pageSize: 1 });
		}
	}, [searchParams, clients, clientsLoading, searchClients, setSearchParams]);

	// Load all clients when clients tab is opened
	useEffect(() => {
		if (activeTab === 'clients') {
			searchClients({ page: currentPage, pageSize: 20 });
		}
	}, [activeTab, currentPage, searchClients]);

	// Load client offers when a client is selected
	useEffect(() => {
		if (selectedClient?.id) {
			getOffersByClient(selectedClient.id);
		}
	}, [selectedClient, getOffersByClient]);

	// Load equipment images - use direct URLs since static files should be public
	useEffect(() => {
		const loadEquipmentImages = async () => {
			if (offerEquipment.length > 0 && selectedOffer?.id) {
				const imageUrls: Record<number, string> = {};

				// Try to load images for each equipment
				for (const equipment of offerEquipment) {
					// Check all possible field names for imagePath
					let imagePath = equipment.imagePath ||
						(equipment as any).ImagePath ||
						(equipment as any).imagePath ||
						(equipment as any).ImagePath;

					// If no image path in equipment data, try to fetch it from API
					if (!imagePath || imagePath.trim() === '' || imagePath.includes('equipment-placeholder.png')) {
						try {
							const imageResponse = await salesApi.getEquipmentImage(selectedOffer.id, equipment.id);
							if (imageResponse.success && imageResponse.data) {
								imagePath = imageResponse.data.imagePath ||
									(imageResponse.data as any).ImagePath ||
									(imageResponse.data as any).imagePath;
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
	}, [offerEquipment, selectedOffer?.id]);

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

	const handleStatusUpdate = async (requestId: string, status: string, comment: string = '') => {
		try {
			await updateRequestStatus(requestId, status as any, comment);
			getAssignedRequests();
		} catch (error) {
			// Error updating request status
		}
	};

	const canSendSelectedOffer =
		selectedOffer?.canSendToSalesman ?? selectedOffer?.status === 'Sent';
	const awaitingSelectedOfferApproval =
		selectedOffer?.status === 'PendingSalesManagerApproval';

	const handleSendToSalesman = async () => {
		if (!selectedOffer) return;
		if (!canSendSelectedOffer) {
			toast.error(
				t('salesManagerApprovalRequired') ||
					'SalesManager must approve the offer before you can send it to the salesman.'
			);
			return;
		}
		try {
			await salesApi.sendOfferToSalesman(selectedOffer.id);
			// Refresh offer data
			const { data } = await salesApi.getOffer(selectedOffer.id);
			if (data) {
				setSelectedOffer(data);
			}
			toast.success('Offer sent to salesman successfully');
		} catch (error: any) {
			toast.error(error.message || 'Failed to send offer to salesman');
		}
	};

	const handleExportPdf = async () => {
		if (!selectedOffer) return;
		try {
			// Handle arrays - convert to string for PDF display
			const formatArray = (arr: string[] | string | undefined): string => {
				if (!arr) return '';
				if (Array.isArray(arr)) {
					return arr.filter(item => item && item.trim()).join('; ');
				}
				return String(arr);
			}

			// Fetch equipment data for PDF
			let equipmentData: any[] = [];
			try {
				const equipmentResponse = await salesApi.getOfferEquipment(selectedOffer.id);
				if (equipmentResponse.success && equipmentResponse.data) {
					// VERIFICATION: Log raw API response
					console.log('=== SALES SUPPORT DASHBOARD: Raw Equipment API Response ===');
					if (equipmentResponse.data.length > 0) {
						console.log('First equipment item:', equipmentResponse.data[0]);
						console.log('All keys:', Object.keys(equipmentResponse.data[0]));
						// Check specifically for providerImagePath
						const firstItem = equipmentResponse.data[0] as any;
						console.log('Provider Image Path Check:', {
							providerImagePath: firstItem.providerImagePath,
							ProviderImagePath: firstItem.ProviderImagePath,
							providerLogoPath: firstItem.providerLogoPath,
							ProviderLogoPath: firstItem.ProviderLogoPath,
							hasProviderImagePath: !!firstItem.providerImagePath,
						});
					}
					
					// Normalize equipment data to match PDF generator interface
					equipmentData = equipmentResponse.data.map((eq: any) => {
						const mapped = {
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
							providerImagePath: eq.providerImagePath || eq.ProviderImagePath || eq.providerLogoPath || eq.ProviderLogoPath,
						};
						
						// Log providerImagePath status for each item
						console.log(`[SALES SUPPORT DASHBOARD] Equipment: ${mapped.name}`, {
							hasProviderImagePath: !!mapped.providerImagePath,
							providerImagePath: mapped.providerImagePath || 'NOT SET',
							rawProviderImagePath: eq.providerImagePath,
							rawProviderImagePathPascal: eq.ProviderImagePath,
						});
						
						return mapped;
					});
				}
			} catch (e) {
				// Equipment data not available for PDF
			}

			// Generate PDF from frontend
			await downloadOfferPDF({
				id: selectedOffer.id,
				clientName: selectedOffer.clientName || 'Client',
				clientType: undefined,
				clientLocation: undefined,
				products: selectedOffer.products,
				totalAmount: selectedOffer.totalAmount,
				discountAmount: selectedOffer.discountAmount,
				validUntil: formatArray(selectedOffer.validUntil),
				paymentTerms: formatArray(selectedOffer.paymentTerms),
				deliveryTerms: formatArray(selectedOffer.deliveryTerms),
				warrantyTerms: formatArray(selectedOffer.warrantyTerms),
				createdAt: selectedOffer.createdAt,
				status: selectedOffer.status,
				assignedToName: selectedOffer.assignedToName,
				equipment: equipmentData,
			}, {
				generateBothLanguages: true, // Generate both Arabic and English versions
				showProductHeaders: true,
			});
			toast.success('PDF exported successfully! Both Arabic and English versions downloaded.');
		} catch (error: any) {
			toast.error(error.message || 'Failed to export PDF');
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Completed':
				return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
			case 'InProgress':
				return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
			case 'Pending':
				return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
			case 'Assigned':
				return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700';
			case 'Cancelled':
				return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
			default:
				return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'High':
				return 'bg-red-500 text-white';
			case 'Medium':
				return 'bg-yellow-500 text-white';
			case 'Low':
				return 'bg-green-500 text-white';
			default:
				return 'bg-gray-500 text-white';
		}
	};

	const getOfferStatusColor = (status: string) => {
		switch (status) {
			case 'Draft':
				return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700';
			case 'Sent':
				return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700';
			case 'Accepted':
				return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700';
			case 'Rejected':
				return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700';
			default:
				return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700';
		}
	};

	const getRequestTypeIcon = (requestType: string) => {
		const iconClasses = "h-5 w-5 text-gray-600 dark:text-gray-400";
		switch (requestType) {
			case 'ClientVisit':
				return <CalendarIcon className={iconClasses} />;
			case 'ProductDemo':
				return <UserGroupIcon className={iconClasses} />;
			case 'SupportRequest':
				return <ExclamationTriangleIcon className={iconClasses} />;
			case 'QuoteRequest':
				return <CurrencyDollarIcon className={iconClasses} />;
			default:
				return <ClockIcon className={iconClasses} />;
		}
	};

	// Filter offers based on search query
	const filteredOffers = offers?.filter(offer =>
		offer.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		offer.products?.toLowerCase().includes(searchQuery.toLowerCase())
	) || [];

	const totalOffersCount = offers?.length || 0;
	const offersSentCount = offers?.filter((offer) => offer.status === 'Sent')?.length || 0;
	const offersAcceptedCount = offers?.filter((offer) => offer.status === 'Accepted')?.length || 0;
	const offersDraftCount = offers?.filter((offer) => offer.status === 'Draft')?.length || 0;
	const activeRequestsCount = assignedRequests?.filter(request => request.status !== 'Completed')?.length || 0;
	const assignedRequestsTotal = assignedRequests?.length || 0;
	const totalClientsTracked = clients?.length || 0;

	const getActivityIcon = (type: string) => {
		switch (type) {
			case 'Accepted':
			case 'Completed':
				return <CheckCircle2 className="h-4 w-4 text-primary" />;
			case 'Rejected':
				return <XCircle className="h-4 w-4 text-destructive" />;
			case 'Sent':
				return <Send className="h-4 w-4 text-primary" />;
			default:
				return <ActivityIcon className="h-4 w-4 text-muted-foreground" />;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Enhanced Header */}
				<div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl shadow-lg p-8 text-white">
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-3xl font-bold mb-2 text-white">{t('salesSupport')} Dashboard</h1>
							<p className="text-blue-100 dark:text-blue-200 text-lg">
								{t('welcomeBack')}, {user?.firstName} {user?.lastName}
							</p>
							<p className="text-blue-200 dark:text-blue-300 text-sm mt-2">
								{t('manageOffersAndRequests')}
							</p>
						</div>
						<div className="flex space-x-3">
							<Button
								onClick={() => setShowOfferForm(true)}
								className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 shadow-md"
								size="lg"
							>
								<PlusIcon className="h-5 w-5 mr-2" />
								{t('createNewOffer')}
							</Button>
						</div>
					</div>
				</div>

				{/* Unified Quick Actions */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<button
						type="button"
						onClick={() => setActiveTab('requests')}
						className="text-left bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-blue-100 dark:border-blue-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
					>
						<div className="flex items-center justify-between mb-4">
							<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center shadow-md">
								<HeadphonesIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
							</div>
							<div className="text-right">
								<p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeRequestsCount}</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">{t('activeRequests') || 'Active Requests'}</p>
							</div>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
							{t('salesSupportDashboard')}
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{t('salesSupportDashboardDescription')}
						</p>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab('my-offers')}
						className="text-left bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-purple-100 dark:border-purple-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
					>
						<div className="flex items-center justify-between mb-4">
							<div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center shadow-md">
								<BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-300" />
							</div>
							<div className="text-right">
								<p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalOffersCount}</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">{t('myOffers')}</p>
							</div>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
							{t('salesSupportManagement')}
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{t('salesSupportManagementDescription')}
						</p>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab('clients')}
						className="text-left bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-green-100 dark:border-green-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
					>
						<div className="flex items-center justify-between mb-4">
							<div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center shadow-md">
								<Users className="w-6 h-6 text-green-600 dark:text-green-300" />
							</div>
							<div className="text-right">
								<p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalClientsTracked}</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">{t('clients')}</p>
							</div>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
							{t('clientSearchTitle')}
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{t('findAndManageClients')}
						</p>
					</button>
				</div>

				{/* Quick Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 dark:border-l-blue-400">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('myOffers')}</p>
									<p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
										{offers?.length || 0}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										{offers?.filter(o => o.status === 'Sent').length || 0} {t('sent')}
									</p>
								</div>
								<div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
									<ArchiveBoxIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500 dark:border-l-green-400">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('completed') || 'Completed'}</p>
									<p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
										{offers?.filter(o => o.status === 'Accepted').length || 0}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('accepted') || 'Accepted'}</p>
								</div>
								<div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
									<CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500 dark:border-l-yellow-400">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('inProgress')}</p>
									<p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
										{offers?.filter(o => o.status === 'Draft').length || 0}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('draft')}</p>
								</div>
								<div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-full">
									<ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 dark:border-l-purple-400">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('assignedRequests')}</p>
									<p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
										{assignedRequests?.length || 0}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('requests')}</p>
								</div>
								<div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full">
									<ExclamationTriangleIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 gap-2 bg-white dark:bg-gray-800 shadow-sm">
						<TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
							{t('overview')}
						</TabsTrigger>
						<TabsTrigger value="my-offers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
							{t('myOffers')}
						</TabsTrigger>
						<TabsTrigger value="requests" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
							{t('requests')}
						</TabsTrigger>
						<TabsTrigger value="clients" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
							{t('clients')}
						</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value="overview" className="space-y-6">
						<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
							{/* Recent Activity */}
							<Card className="shadow-lg border-2 border-border">
								<CardHeader>
									<div className="flex items-center gap-3">
										<BarChart3 className="w-6 h-6 text-primary" />
										<div>
											<CardTitle>{t('recentActivity') || 'Recent Activity'}</CardTitle>
											<CardDescription>{t('latestOfferEvents') || 'Latest offer lifecycle events'}</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									{activityLoading ? (
										<div className="flex flex-col items-center justify-center py-10">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
											<p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
												{t('loadingActivity') || 'Loading recent activity...'}
											</p>
										</div>
									) : recentActivity && recentActivity.length > 0 ? (
										<div className="space-y-3">
											{recentActivity.slice(0, 5).map((activity, index) => (
												<div
													key={`${activity.id || activity.offerId || index}-${index}`}
													className="group border border-border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
												>
													<div className="flex items-start gap-3">
														<div className="flex-shrink-0 mt-0.5">
															<div className="p-2 bg-muted rounded-md">
																{getActivityIcon(activity.type || activity.status)}
															</div>
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-start justify-between gap-3 mb-2">
																<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
																	{activity.description || activity.message}
																</p>
																<Badge variant="outline" className="text-xs">
																	{activity.type || activity.status}
																</Badge>
															</div>
															<div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
																{activity.clientName && (
																	<div className="flex items-center gap-1.5">
																		<Building2 className="h-3 w-3" />
																		<span>{activity.clientName}</span>
																	</div>
																)}
																{activity.salesmanName && (
																	<div className="flex items-center gap-1.5">
																		<UserIcon className="h-3 w-3" />
																		<span>{activity.salesmanName}</span>
																	</div>
																)}
																{activity.offerId && (
																	<div className="flex items-center gap-1.5">
																		<FileText className="h-3 w-3" />
																		<span>{t('offer') || 'Offer'} #{activity.offerId}</span>
																	</div>
																)}
																{activity.timestamp && (
																	<div className="flex items-center gap-1.5 ml-auto">
																		<ClockOutlineIcon className="h-3 w-3" />
																		<span>{format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}</span>
																	</div>
																)}
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
									) : (
										<div className="flex flex-col items-center justify-center py-10">
											<ActivityIcon className="h-8 w-8 text-muted-foreground mb-3" />
											<p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
												{t('noRecentActivity') || 'No recent activity'}
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
												{t('activityEmptyState') || 'Activity will appear as offers and requests are processed'}
											</p>
										</div>
									)}
								</CardContent>
							</Card>

							{/* My Offers Snapshot */}
							<Card className="shadow-lg border-2 border-border">
								<CardHeader>
									<CardTitle>{t('myOffersSnapshot') || 'My Offers'}</CardTitle>
									<CardDescription>{t('myOffersSnapshotDescription') || 'Monitor your pipeline at a glance'}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-4">
											<p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">
												{t('totalOffers') || 'Total Offers'}
											</p>
											<p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalOffersCount}</p>
										</div>
										<div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-gray-900 p-4">
											<p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
												{t('sent')}
											</p>
											<p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{offersSentCount}</p>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-4">
											<p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-200">
												{t('completed') || 'Completed'}
											</p>
											<p className="text-2xl font-semibold text-green-900 dark:text-green-100">{offersAcceptedCount}</p>
											<p className="text-xs text-green-700 dark:text-green-300">{t('accepted') || 'Accepted'}</p>
										</div>
										<div className="rounded-2xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/30 p-4">
											<p className="text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-200">
												{t('inProgress') || 'In Progress'}
											</p>
											<p className="text-2xl font-semibold text-yellow-900 dark:text-yellow-100">{offersDraftCount}</p>
											<p className="text-xs text-yellow-700 dark:text-yellow-300">{t('draft')}</p>
										</div>
									</div>
									<Separator />
									<div className="rounded-2xl border border-purple-200 dark.border-purple-900 bg-purple-50 dark:bg-purple-950/30 p-4 flex items-center justify-between gap-4">
										<div>
											<p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-200">
												{t('assignedRequests')}
											</p>
											<p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{assignedRequestsTotal}</p>
											<p className="text-xs text-purple-700 dark:text-purple-300">
												{t('requests')} • {activeRequestsCount} {t('active') || 'Active'}
											</p>
										</div>
										<Button
											variant="outline"
											className="border-purple-500 text-purple-600 dark:border-purple-700 dark:text-purple-200"
											onClick={() => setActiveTab('requests')}
										>
											{t('viewDetails') || 'View'}
										</Button>
									</div>
									<Button
										variant="secondary"
										className="w-full"
										onClick={() => setActiveTab('my-offers')}
									>
										{t('viewMyOffers') || 'Go to My Offers'}
									</Button>
								</CardContent>
							</Card>

							{/* Recent Offers */}
							<Card className="shadow-md">
								<CardHeader>
									<CardTitle>{t('recentOffers')}</CardTitle>
									<CardDescription>{t('yourLatestCreatedOffers')}</CardDescription>
								</CardHeader>
								<CardContent>
									{offersLoading ? (
										<div className="text-center py-8">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
										</div>
									) : offers && offers.length > 0 ? (
										<div className="space-y-3">
											{offers.slice(0, 5).map((offer) => (
												<div
													key={offer.id}
													className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
													onClick={() => setSelectedOffer(offer)}
												>
													<div className="flex justify-between items-start mb-2">
														<h4 className="font-medium text-gray-900 dark:text-gray-100">
															{offer.clientName || `Client ${offer.clientId}`}
														</h4>
														<Badge className={getOfferStatusColor(offer.status)}>
															{offer.status}
														</Badge>
													</div>
													<p className="text-sm text-gray-600 dark:text-gray-400 truncate">
														{offer.products || 'N/A'}
													</p>
													<p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
														{offer.totalAmount ? `EGP ${offer.totalAmount.toLocaleString()}` : 'N/A'}
													</p>
												</div>
											))}
										</div>
									) : (
										<div className="text-center py-8 text-gray-500 dark:text-gray-400">
											{t('noOffersFound')}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Pending Requests */}
							<Card className="shadow-md">
								<CardHeader>
									<CardTitle>{t('pending')} {t('requests')}</CardTitle>
									<CardDescription>{t('assignedRequests')} waiting for action</CardDescription>
								</CardHeader>
								<CardContent>
									{requestWorkflowsLoading ? (
										<div className="text-center py-8">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
										</div>
									) : assignedRequests && assignedRequests.length > 0 ? (
										<div className="space-y-3">
											{assignedRequests.slice(0, 5).map((request) => (
												<div
													key={request.id}
													className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
													onClick={() => setSelectedRequest(request)}
												>
													<div className="flex justify-between items-start mb-2">
														<div className="flex items-center space-x-2">
															{getRequestTypeIcon(request.requestType)}
															<h4 className="font-medium text-gray-900 dark:text-gray-100">
																{request.title || request.clientName}
															</h4>
														</div>
														<Badge className={getStatusColor(request.status)}>
															{request.status}
														</Badge>
													</div>
													<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
														{request.description}
													</p>
													<div className="flex items-center justify-between mt-2">
														<span className="text-xs text-gray-500 dark:text-gray-400">
															{request.clientName}
														</span>
														<Badge variant="outline" className={getPriorityColor(request.priority)}>
															{request.priority}
														</Badge>
													</div>
												</div>
											))}
										</div>
									) : (
										<div className="text-center py-8 text-gray-500 dark:text-gray-400">
											{t('noPendingRequests')}
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* My Offers Tab */}
					<TabsContent value="my-offers" className="space-y-6">
						<Card className="shadow-md">
							<CardHeader>
								<div className="flex justify-between items-center">
									<div>
										<CardTitle>{t('myCreatedOffers')}</CardTitle>
										<CardDescription>{t('allOffersYouveCreated')}</CardDescription>
									</div>
									<div className="w-64">
										<Input
											placeholder="Search offers..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								{offersLoading ? (
									<div className="text-center py-12">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
										<p className="text-gray-500 dark:text-gray-400 mt-4">{t('loadingOffers')}</p>
									</div>
								) : offersError ? (
									<div className="text-center py-12 text-red-500 dark:text-red-400">
										{offersError}
									</div>
								) : filteredOffers.length > 0 ? (
									<div className="space-y-4">
										{filteredOffers.map((offer) => (
											<div
												key={offer.id}
												className="border-2 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-gray-800"
												onClick={() => setSelectedOffer(offer)}
											>
												<div className="flex justify-between items-start mb-4">
													<div className="flex-1">
														<h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
															{offer.clientName || `Client ${offer.clientId}`}
														</h3>
														<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
															{offer.products || 'N/A'}
														</p>
														<div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
															<span>{t('created') || 'Created'}: {offer.createdAt ? format(new Date(offer.createdAt), 'MMM dd, yyyy') : 'N/A'}</span>
															{offer.validUntil && (
																<span>
																	{t('validUntil') || 'Valid Until'}: {Array.isArray(offer.validUntil)
																		? offer.validUntil.map((d: string) => format(new Date(d), 'MMM dd, yyyy')).join(', ')
																		: format(new Date(offer.validUntil), 'MMM dd, yyyy')
																	}
																</span>
															)}
														</div>
													</div>
													<Badge className={`${getOfferStatusColor(offer.status)} px-3 py-1`}>
														{offer.status}
													</Badge>
												</div>

												<Separator className="my-3" />

												<div className="flex justify-between items-center">
													<div className="flex items-center space-x-6">
														{offer.totalAmount && (
															<div className="flex items-center space-x-2">
																<CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
																<span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
																	EGP {offer.totalAmount.toLocaleString()}
																</span>
															</div>
														)}
													</div>
													<Button variant="outline" size="sm" onClick={(e) => {
														e.stopPropagation();
														setSelectedOffer(offer);
													}}>
														{t('viewDetails') || 'View Details'}
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-16">
										<ArchiveBoxIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
										<p className="text-gray-500 dark:text-gray-400 text-lg">{t('noOffersFound') || 'No offers found'}</p>
										{searchQuery && (
											<p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{t('tryAdjustingYourSearch')}</p>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Assigned Requests Tab */}
					<TabsContent value="requests" className="space-y-6">
						<Card className="shadow-md">
							<CardHeader>
								<CardTitle>{t('assignedRequests')}</CardTitle>
								<CardDescription>{t('requestsAssignedToYou')}</CardDescription>
							</CardHeader>
							<CardContent>
								{requestWorkflowsLoading ? (
									<div className="text-center py-12">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
										<p className="text-gray-500 dark:text-gray-400 mt-4">{t('loadingRequests')}</p>
									</div>
								) : requestWorkflowsError ? (
									<div className="text-center py-12 text-red-500 dark:text-red-400">
										{requestWorkflowsError}
									</div>
								) : assignedRequests && assignedRequests.length > 0 ? (
									<div className="space-y-4">
										{assignedRequests.map((request) => (
											<div
												key={request.id}
												className="border-2 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
											>
												<div className="flex justify-between items-start mb-4">
													<div className="flex items-start space-x-3 flex-1">
														<div className="mt-1">
															{getRequestTypeIcon(request.requestType)}
														</div>
														<div className="flex-1">
															<h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
																{request.title || request.clientName}
															</h3>
															<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
																{request.description}
															</p>
															<div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
																<span>{t('client') || 'Client'}: {request.clientName}</span>
																<span>{t('requestedBy') || 'Requested by'}: {request.requestedByName}</span>
																<span>{request.createdAt ? format(new Date(request.createdAt), 'MMM dd, yyyy') : 'N/A'}</span>
															</div>
														</div>
													</div>
													<div className="flex items-center space-x-2">
														<Badge className={getPriorityColor(request.priority)} variant="outline">
															{request.priority}
														</Badge>
														<Badge className={getStatusColor(request.status)}>
															{request.status}
														</Badge>
													</div>
												</div>

												{request.dueDate && (
													<div className="mb-3 text-xs text-gray-500 dark:text-gray-500">
														Due: {request.dueDate ? format(new Date(request.dueDate), 'MMM dd, yyyy') : 'N/A'}
													</div>
												)}

												<Separator className="my-3" />

												<div className="flex justify-end space-x-2">
													{request.status === 'Pending' && (
														<Button
															onClick={() => handleStatusUpdate(request.id, 'InProgress', 'Started working on request')}
															size="sm"
															className="bg-blue-600 hover:bg-blue-700"
														>
															Start Work
														</Button>
													)}
													{request.status === 'InProgress' && (
														<Button
															onClick={() => handleStatusUpdate(request.id, 'Completed', 'Request completed')}
															size="sm"
															className="bg-green-600 hover:bg-green-700"
														>
															{t('complete') || 'Complete'}
														</Button>
													)}
													<Button
														variant="outline"
														size="sm"
														onClick={() => setSelectedRequest(request)}
													>
														{t('viewDetails') || 'View Details'}
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-16">
										<CheckCircleIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
										<p className="text-gray-500 dark:text-gray-400 text-lg">{t('noRequestsAssigned')}</p>
										<p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{t('allCaughtUp')}</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Clients Tab */}
					<TabsContent value="clients" className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<Card className="lg:col-span-1 shadow-md">
								<CardHeader>
									<CardTitle>{t('clientSearchTitle')}</CardTitle>
									<CardDescription>{t('findAndManageClients')}</CardDescription>
								</CardHeader>
								<CardContent>
									<ClientSearch
										onClientSelect={setSelectedClient}
										placeholder="Search by name, phone, or organization..."
										className="mb-4"
										showClassificationFilter={true}
									/>
									<Separator />
									<div className="mt-4">
										<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('recentClients')}</h3>
										{clientsLoading ? (
											<div className="text-center py-4">
												<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
											</div>
										) : clientsError ? (
											<div className="text-center py-4 text-red-500 dark:text-red-400 text-sm">
												{clientsError}
											</div>
										) : clients && clients.length > 0 ? (
											<>
												<div className="space-y-2 max-h-96 overflow-y-auto">
													{clients.slice(0, 10).map((client) => (
														<div
															key={client.id}
															onClick={() => setSelectedClient(client)}
															className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedClient?.id === client.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'
																}`}
														>
															<div className="font-medium text-gray-900 dark:text-gray-100">{client.name}</div>
															<div className="text-sm text-gray-500 dark:text-gray-400">
																{client.organizationName || 'N/A'} {client.classification ? `• ${client.classification}` : ''}
															</div>
															{client.phone && (
																<div className="text-xs text-gray-400 dark:text-gray-500">{client.phone}</div>
															)}
														</div>
													))}
												</div>
												{/* Pagination */}
												{pagination && pagination.totalPages > 1 && (
													<div className="mt-4 flex items-center justify-between border-t pt-4">
														<Button
															variant="outline"
															size="sm"
															onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
															disabled={!pagination.hasPreviousPage || clientsLoading}
														>
															{t('previous') || 'Previous'}
														</Button>
														<span className="text-sm text-gray-600 dark:text-gray-400">
															{t('page') || 'Page'} {pagination.page} {t('of') || 'of'} {pagination.totalPages}
														</span>
														<Button
															variant="outline"
															size="sm"
															onClick={() => setCurrentPage(p => p + 1)}
															disabled={!pagination.hasNextPage || clientsLoading}
														>
															{t('next') || 'Next'}
														</Button>
													</div>
												)}
											</>
										) : (
											<div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
												No clients found
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Client Details - Simplified for Sales Support */}
							<div className="lg:col-span-2">
								{selectedClient ? (
									<SalesSupportClientDetails
										client={selectedClient}
										offers={offersByClient[selectedClient.id] || []}
										offersLoading={offersLoading}
									/>
								) : (
									<Card className="shadow-md">
										<CardContent className="flex items-center justify-center h-96">
											<div className="text-center">
												<UserGroupIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
												<p className="text-gray-500 dark:text-gray-400">{t('selectAClientToViewDetails')}</p>
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						</div>
					</TabsContent>
				</Tabs>

				{/* Offer Request Form Modal */}
				{showOfferForm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
							<OfferRequestForm
								clientId={selectedClient?.id || ''}
								onSuccess={() => {
									setShowOfferForm(false);
									getMyOffers();
								}}
								onCancel={() => setShowOfferForm(false)}
							/>
						</div>
					</div>
				)}

				{/* Offer Details Modal */}
				{selectedOffer && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
						<div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl shadow-2xl my-8">
							<div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
								<div className="flex justify-between items-start">
									<div>
										<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
											{t('offerDetails') || 'Offer Details'}
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
											{selectedOffer.clientName}
										</p>
									</div>
									<Button
										onClick={() => {
											setSelectedOffer(null);
											setOfferEquipment([]);
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
									<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
										{t('status') || 'Status'}
									</label>
									<Badge className={`${getOfferStatusColor(selectedOffer.status)}`}>
										{selectedOffer.status}
									</Badge>
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
										Value
									</label>
									<p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
										{selectedOffer.totalAmount !== undefined ? `EGP ${selectedOffer.totalAmount.toLocaleString()}` : 'N/A'}
									</p>
									{selectedOffer.discountAmount && selectedOffer.discountAmount > 0 && (
										<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
											{t('discount') || 'Discount'}: EGP {selectedOffer.discountAmount.toLocaleString()}
										</p>
									)}
								</div>
							</div>

							{/* Rejection Reason Section */}
							{selectedOffer.status === 'Rejected' && (selectedOffer.salesManagerRejectionReason || selectedOffer.clientResponse) && (
								<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
									<label className="block text-sm font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
										<ExclamationTriangleIcon className="h-4 w-4" />
										{t('rejectionReason') || 'Rejection Reason'}
									</label>
									<p className="text-sm text-red-900 dark:text-red-100 whitespace-pre-wrap">
										{selectedOffer.salesManagerRejectionReason || selectedOffer.clientResponse || 'No reason provided'}
									</p>
									{selectedOffer.salesManagerComments && (
										<div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
											<label className="block text-xs font-medium text-red-600 dark:text-red-400 mb-1">
												{t('comments') || 'Comments'}
											</label>
											<p className="text-sm text-red-800 dark:text-red-200">
												{selectedOffer.salesManagerComments}
											</p>
										</div>
									)}
									{selectedOffer.salesManagerApprovedAt && (
										<p className="text-xs text-red-600 dark:text-red-400 mt-2">
											{t('rejectedAt') || 'Rejected at'}: {format(new Date(selectedOffer.salesManagerApprovedAt), 'MMM dd, yyyy HH:mm')}
										</p>
									)}
								</div>
							)}

							<Separator />

								{/* Products Section */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
										Equipment Details
									</label>

									{loadingEquipment ? (
										<div className="text-center py-4">
											<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
											<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('loadingEquipmentDetails')}</p>
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
														{/* Equipment Image - Always show container */}
														<div className="flex-shrink-0">
															{(() => {
																const imagePath = equipment.imagePath || (equipment as any).ImagePath || (equipment as any).imagePath;
																const imageUrlFromState = equipmentImageUrls[equipment.id];

																// Get image URL - prefer state, fallback to constructing from path
																let imageUrl: string | null = null;
																if (imageUrlFromState) {
																	imageUrl = imageUrlFromState;
																} else if (imagePath && imagePath.trim() !== '') {
																	imageUrl = getStaticFileUrl(imagePath);
																}

																// Skip placeholder images
																if (imageUrl &&
																	imagePath &&
																	!imagePath.includes('equipment-placeholder.png') &&
																	!imageUrl.includes('No Image') &&
																	!imageUrl.startsWith('data:image/svg+xml')) {
																	// Try to use direct API endpoint as fallback if static URL fails
																	const apiImageUrl = `${getApiBaseUrl()}/api/Offer/${selectedOffer.id}/equipment/${equipment.id}/image-file`;

																	return (
																		<img
																			src={imageUrl}
																			alt={equipment.name || 'Equipment image'}
																			className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
																			loading="lazy"
																			onError={(e) => {
																				// Try API endpoint as fallback
																				const target = e.target as HTMLImageElement;
																				target.src = apiImageUrl;
																				target.onerror = () => {
																					// If API endpoint also fails, show placeholder
																					target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"%3E%3Crect fill="%23e5e7eb" width="96" height="96"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="12" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
																					target.onerror = null; // Prevent infinite loop
																				};
																			}}
																		/>
																	);
																} else {
																	// Show placeholder if no image path or is placeholder
																	return (
																		<div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-500 flex items-center justify-center">
																			<span className="text-xs text-gray-500 dark:text-gray-400">{t('noImage')}</span>
																		</div>
																	);
																}
															})()}
														</div>
														<div className="flex-1">
															<h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
																{equipment.name}
															</h4>
															{(equipment.model || (equipment as any).provider || (equipment as any).Provider) && (
																<p className="text-sm text-gray-600 dark:text-gray-400">
																	{((equipment as any).provider || (equipment as any).Provider) && (
																		<span className="font-medium">{(equipment as any).provider || (equipment as any).Provider}</span>
																	)}
																	{((equipment as any).provider || (equipment as any).Provider) && equipment.model && ' - '}
																	{equipment.model && <span>{equipment.model}</span>}
																</p>
															)}
														</div>
														<div className="text-right ml-4">
															<p className="font-bold text-xl text-blue-600 dark:text-blue-400">
																EGP {((equipment as any).price ?? (equipment as any).Price ?? (equipment as any).totalPrice ?? (equipment as any).TotalPrice ?? 0).toLocaleString()}
															</p>
														</div>
													</div>

													{/* Equipment Details Grid - Show ALL fields */}
													<div className="grid grid-cols-2 gap-4 mb-3">
														{/* Price - Always show */}
														<div>
															<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
																{t('price') || 'Price'}
															</label>
															<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
																EGP {((equipment as any).price ?? (equipment as any).Price ?? (equipment as any).totalPrice ?? (equipment as any).TotalPrice ?? 0).toLocaleString()}
															</p>
														</div>

														{/* Quantity - show if available */}
														{((equipment as any).quantity !== undefined || (equipment as any).Quantity !== undefined) && (
															<div>
																<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
																	{t('quantity') || 'Quantity'}
																</label>
																<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
																	{(equipment as any).quantity ?? (equipment as any).Quantity ?? 1}
																</p>
															</div>
														)}

														{/* Unit Price - show if available */}
														{((equipment as any).unitPrice !== undefined || (equipment as any).UnitPrice !== undefined) && (
															<div>
																<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
																	Unit Price
																</label>
																<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
																	EGP {((equipment as any).unitPrice ?? (equipment as any).UnitPrice ?? 0).toLocaleString()}
																</p>
															</div>
														)}

														{/* Provider (Manufacturer) - Always show field */}
														<div>
															<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
																{t('provider') || 'Provider'}
															</label>
															<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
																{(equipment as any).provider || (equipment as any).Provider || (equipment as any).manufacturer || (equipment as any).Manufacturer || 'N/A'}
															</p>
														</div>

														{/* Model - Always show field */}
														<div>
															<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
																{t('model') || 'Model'}
															</label>
															<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
																{equipment.model || (equipment as any).Model || 'N/A'}
															</p>
														</div>

														{/* Country - Always show field */}
														<div>
															<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
																{t('country') || 'Country'}
															</label>
															<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
																{(equipment as any).country || (equipment as any).Country || 'N/A'}
															</p>
														</div>

														{/* Year - Always show field */}
														<div>
															<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
																Year
															</label>
															<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
																{(equipment as any).year ?? (equipment as any).Year ?? 'N/A'}
															</p>
														</div>

														{/* In Stock - Always show */}
														<div>
															<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
																Stock Status
															</label>
															<Badge className={((equipment as any).inStock ?? (equipment as any).InStock ?? true) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}>
																{((equipment as any).inStock ?? (equipment as any).InStock ?? true) ? 'In Stock' : 'Out of Stock'}
															</Badge>
														</div>

														{/* Warranty Period - Always show field */}
														<div>
															<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
																{t('warrantyPeriod') || 'Warranty Period'}
															</label>
															<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
																{(equipment as any).warrantyPeriod || (equipment as any).WarrantyPeriod || 'N/A'}
															</p>
														</div>
													</div>

													{/* Description (Specifications) - Always show */}
													<div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
														<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
															{((equipment as any).specifications || (equipment as any).Specifications) ? (t('specifications') || 'Specifications') : (t('description') || 'Description')}
														</label>
														<p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
															{(equipment as any).specifications || (equipment as any).Specifications || (equipment as any).description || (equipment as any).Description || 'No description available'}
														</p>
													</div>

													{/* Price Breakdown (if quantity > 1) */}
													{(equipment as any).quantity > 1 && (equipment as any).unitPrice !== undefined && (
														<div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
															<div className="flex justify-between items-center text-sm">
																<span className="text-gray-600 dark:text-gray-400">
																	{(equipment as any).quantity ?? 1} × EGP {((equipment as any).unitPrice ?? 0).toLocaleString()}
																</span>
																<span className="font-semibold text-gray-900 dark:text-gray-100">
																	= EGP {((equipment as any).totalPrice ?? (equipment as any).price ?? 0).toLocaleString()}
																</span>
															</div>
														</div>
													)}
												</div>
											))}
										</div>
									) : (
										<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
											<p className="text-base text-gray-900 dark:text-gray-100">
												{selectedOffer.products || 'No equipment details available'}
											</p>
											<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
												Equipment details will be displayed here when available.
											</p>
										</div>
									)}
								</div>

								{/* Additional Details */}
								{(selectedOffer.paymentTerms || selectedOffer.deliveryTerms || selectedOffer.warrantyTerms || selectedOffer.notes) && (
									<>
										<Separator />
										<div className="space-y-3">
											{selectedOffer.paymentTerms && (
												<div>
													<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
														{t('paymentTerms') || 'Payment Terms'}
													</label>
													{Array.isArray(selectedOffer.paymentTerms) ? (
														<ul className="list-disc list-inside space-y-1 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
															{selectedOffer.paymentTerms.map((term: string, idx: number) => (
																<li key={idx}>{term}</li>
															))}
														</ul>
													) : (
														<p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
															{selectedOffer.paymentTerms}
														</p>
													)}
												</div>
											)}
											{selectedOffer.deliveryTerms && (
												<div>
													<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
														{t('deliveryTerms') || 'Delivery Terms'}
													</label>
													{Array.isArray(selectedOffer.deliveryTerms) ? (
														<ul className="list-disc list-inside space-y-1 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
															{selectedOffer.deliveryTerms.map((term: string, idx: number) => (
																<li key={idx}>{term}</li>
															))}
														</ul>
													) : (
														<p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
															{selectedOffer.deliveryTerms}
														</p>
													)}
												</div>
											)}
											{selectedOffer.warrantyTerms && (
												<div>
													<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
														Warranty Terms
													</label>
													{Array.isArray(selectedOffer.warrantyTerms) ? (
														<ul className="list-disc list-inside space-y-1 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
															{selectedOffer.warrantyTerms.map((term: string, idx: number) => (
																<li key={idx}>{term}</li>
															))}
														</ul>
													) : (
														<p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
															{selectedOffer.warrantyTerms}
														</p>
													)}
												</div>
											)}
											{selectedOffer.notes && (
												<div>
													<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
														{t('notes') || 'Notes'}
													</label>
													<p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
														{selectedOffer.notes}
													</p>
												</div>
											)}
										</div>
									</>
								)}

								<Separator />

								{/* Footer Info */}
								<div className="text-sm text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700 space-y-1">
									<div className="flex justify-between">
										<span>
											<strong>{t('created') || 'Created'}:</strong> {selectedOffer.createdAt ? format(new Date(selectedOffer.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
										</span>
										{selectedOffer.validUntil && (
											<span>
												<strong>{t('validUntil') || 'Valid Until'}:</strong> {Array.isArray(selectedOffer.validUntil)
													? selectedOffer.validUntil.map((d: string) => format(new Date(d), 'MMM dd, yyyy')).join(', ')
													: format(new Date(selectedOffer.validUntil), 'MMM dd, yyyy')
												}
											</span>
										)}
									</div>
									{selectedOffer.assignedToName && (
										<div>
											<strong>{t('assignedTo') || 'Assigned To'}:</strong> {selectedOffer.assignedToName}
										</div>
									)}
									{selectedOffer.createdByName && (
										<div>
											<strong>{t('createdBy') || 'Created By'}:</strong> {selectedOffer.createdByName}
										</div>
									)}
								</div>

								{/* Action Buttons */}
								<Separator className="my-4" />
								<div className="flex justify-end gap-3 pt-4">
									<Button
										onClick={handleSendToSalesman}
										disabled={!canSendSelectedOffer}
										className="bg-blue-600 hover:bg-blue-700 text-white"
										title={
											!canSendSelectedOffer
												? t('awaitingSalesManagerApproval') ||
												  'Awaiting SalesManager approval'
												: undefined
										}
									>
										{t('sendToSalesman') || 'Send to Salesman'}
									</Button>
									<Button
										variant="outline"
										onClick={handleExportPdf}
										className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
									>
										{t('exportPdf')}
									</Button>
								</div>
								{!canSendSelectedOffer && (
									<p className="text-sm text-yellow-600 dark:text-yellow-400 text-right mt-2">
										{awaitingSelectedOfferApproval
											? t('offerAwaitingApproval') ||
											  'SalesManager has not approved this offer yet.'
											: t('offerCannotBeSentYet') ||
											  'You can send the offer once SalesManager approval is completed.'}
									</p>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Request Details Modal */}
				{selectedRequest && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl shadow-2xl">
							<div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
								<div className="flex justify-between items-start">
									<div>
										<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
											{selectedRequest.title || selectedRequest.clientName}
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
											{selectedRequest.requestType} • {selectedRequest.clientName}
										</p>
									</div>
									<Button
										onClick={() => setSelectedRequest(null)}
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
										{t('description') || 'Description'}
									</label>
									<p className="text-base text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
										{selectedRequest.description}
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
											{t('status') || 'Status'}
										</label>
										<Badge className={getStatusColor(selectedRequest.status)}>
											{selectedRequest.status}
										</Badge>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
											Priority
										</label>
										<Badge className={getPriorityColor(selectedRequest.priority)}>
											{selectedRequest.priority}
										</Badge>
									</div>
								</div>

								{selectedRequest.notes && (
									<div>
										<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
											Notes
										</label>
										<p className="text-base text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
											{selectedRequest.notes}
										</p>
									</div>
								)}

								{selectedRequest?.comments && selectedRequest.comments.length > 0 && (
									<div>
										<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
											{t('notes') || 'Comments'}
										</label>
										<div className="space-y-2 max-h-48 overflow-y-auto">
											{selectedRequest.comments.map((comment: any, index: number) => (
												<div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
													<p className="text-sm text-gray-900 dark:text-gray-100">{comment.comment}</p>
													<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
														{comment.commentedByName} • {comment.createdAt ? format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
													</p>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SalesSupportDashboard;
