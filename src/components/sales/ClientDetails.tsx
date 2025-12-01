// Client Details Component - Updated with new business logic

import React, { useEffect, useState } from 'react';
import { useSalesStore } from '@/stores/salesStore';
import { salesApi } from '@/services/sales/salesApi';
import { format } from 'date-fns';
import {
    PhoneIcon,
    BuildingOfficeIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { DollarSign, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/useTranslation';
import { getStaticFileUrl } from '@/utils/apiConfig';
import toast from 'react-hot-toast';

interface ClientDetailsProps {
    clientId: string;
    className?: string;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ clientId, className = '' }) => {
    const {
        getClient,
        getClientProfile,
        getClientVisits,
        getDeals,
        getOffersByClient,
        selectedClient,
        clientVisits,
        deals,
        offersByClient,
        clientsLoading,
        visitsLoading,
        dealsLoading,
        offersLoading,
        clientsError
    } = useSalesStore();

    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');

    // Detail modals state
    const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
    const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
    const [selectedVisit, setSelectedVisit] = useState<any | null>(null);
    const [loadingDealDetails, setLoadingDealDetails] = useState(false);
    const [loadingOfferDetails, setLoadingOfferDetails] = useState(false);
    const [loadingVisitDetails, setLoadingVisitDetails] = useState(false);
    const [offerEquipment, setOfferEquipment] = useState<any[]>([]);
    const [loadingEquipment, setLoadingEquipment] = useState(false);

    useEffect(() => {
        if (clientId) {
            // Get client basic info
            getClient(clientId);
            // Get client profile with statistics
            getClientProfile(clientId);
            getClientVisits(clientId);
            // Use direct client-specific endpoints (same as deals/offers pages)
            getDeals({ clientId });
            getOffersByClient(clientId);
        }
    }, [clientId, getClient, getClientProfile, getClientVisits, getDeals, getOffersByClient]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Potential':
                return 'bg-yellow-100 text-yellow-800';
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Inactive':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High':
                return 'bg-red-100 text-red-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'Low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDealStatusColor = (status: string) => {
        switch (status) {
            case 'PendingManagerApproval':
                return 'bg-yellow-100 text-yellow-800';
            case 'PendingSuperAdminApproval':
                return 'bg-blue-100 text-blue-800';
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Success':
                return 'bg-green-100 text-green-800';
            case 'Failed':
                return 'bg-red-100 text-red-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getOfferStatusColor = (status: string) => {
        switch (status) {
            case 'Requested':
                return 'bg-yellow-100 text-yellow-800';
            case 'InProgress':
                return 'bg-blue-100 text-blue-800';
            case 'Ready':
                return 'bg-green-100 text-green-800';
            case 'Sent':
                return 'bg-purple-100 text-purple-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDealClick = async (deal: any) => {
        setLoadingDealDetails(true);
        try {
            const response = await salesApi.getDeal(deal.id);
            if (response.success && response.data) {
                let dealData = response.data;
                // If deal has offerId, fetch offer details
                if (dealData.offerId) {
                    try {
                        const offerResponse = await salesApi.getOffer(dealData.offerId.toString());
                        if (offerResponse.success && offerResponse.data) {
                            dealData.offerDetails = offerResponse.data;
                        }
                    } catch (offerError) {
                        console.warn('Failed to load offer details for deal', deal.id, offerError);
                    }
                }
                setSelectedDeal(dealData);
            } else {
                toast.error('Failed to load deal details');
            }
        } catch (error: any) {
            console.error('Failed to load deal details:', error);
            toast.error(error.message || 'Failed to load deal details');
        } finally {
            setLoadingDealDetails(false);
        }
    };

    const handleOfferClick = async (offer: any) => {
        setLoadingOfferDetails(true);
        setLoadingEquipment(true);
        try {
            const response = await salesApi.getOffer(offer.id.toString());
            if (response.success && response.data) {
                setSelectedOffer(response.data);

                // Load equipment details
                try {
                    const equipmentResponse = await salesApi.getOfferEquipment(offer.id);
                    if (equipmentResponse.success && equipmentResponse.data) {
                        setOfferEquipment(Array.isArray(equipmentResponse.data) ? equipmentResponse.data : []);
                    }
                } catch (equipError) {
                    console.warn('Failed to load equipment details:', equipError);
                    setOfferEquipment([]);
                }
            } else {
                toast.error('Failed to load offer details');
            }
        } catch (error: any) {
            console.error('Failed to load offer details:', error);
            toast.error(error.message || 'Failed to load offer details');
        } finally {
            setLoadingOfferDetails(false);
            setLoadingEquipment(false);
        }
    };

    const handleVisitClick = async (visit: any) => {
        setLoadingVisitDetails(true);
        try {
            const response = await salesApi.getTaskProgressById(visit.id);
            if (response.success && response.data) {
                setSelectedVisit(response.data);
            } else {
                toast.error('Failed to load visit details');
            }
        } catch (error: any) {
            console.error('Failed to load visit details:', error);
            toast.error(error.message || 'Failed to load visit details');
        } finally {
            setLoadingVisitDetails(false);
        }
    };

    if (clientsLoading) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
                    {t('clientDetails.loading')}
                </div>
            </div>
        );
    }

    if (clientsError || !selectedClient) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <p className="text-red-600">
                    {t('clientDetails.errorMessage').replace(
                        '{{error}}',
                        clientsError || t('clientDetails.errorUnknown')
                    )}
                </p>
            </div>
        );
    }

    const client = selectedClient;

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Client Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
                                <div className="flex items-center space-x-4 mt-2">
                                    {client.classification && (
                                        <Badge className="bg-blue-100 text-blue-800">
                                            {`${t('classification')}: ${client.classification}`}
                                        </Badge>
                                    )}
                                    {client.organizationName && (
                                        <span className="text-sm text-gray-500">{client.organizationName}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">{t('assignedTo')}</p>
                            <p className="font-medium">
                                {client.assignedSalesmanName || t('clientDetails.notAssigned')}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {client.phone && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">{t('phone')}</span>
                                </div>
                                <p className="font-medium">{client.phone}</p>
                            </div>
                        )}
                        {client.organizationName && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">{t('organizationName')}</span>
                                </div>
                                <p className="font-medium">{client.organizationName}</p>
                            </div>
                        )}
                        {client.classification && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <ChartBarIcon className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">{t('classification')}</span>
                                </div>
                                <p className="font-medium">{client.classification}</p>
                            </div>
                        )}
                        {client.interestedEquipmentCategories && client.interestedEquipmentCategories.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <ChartBarIcon className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                        {t('clientDetails.interestedEquipmentCategories') || 'Interested Categories'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {client.interestedEquipmentCategories.map((category: string, index: number) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {category}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Client Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <ChartBarIcon className="h-5 w-5" />
                        <span>{t('clientDetails.stats.title')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(() => {
                        // Always calculate from loaded deals to ensure accuracy
                        // This ensures we count all deals correctly regardless of backend calculation
                        let totalVisits: number;
                        let totalOffers: number;
                        let successfulDeals: number;
                        let totalRevenue: number;

                        totalVisits = clientVisits.length;
                        totalOffers = offersByClient[clientId]?.length || 0;

                        // Filter successful deals and calculate count and revenue
                        // Both "SentToLegal" AND "Success" (which may be displayed as "Completed") should be counted
                        // Backend uses: "Success", "SentToLegal", "Approved"
                        // UI may display: "Success" as "Completed", "SentToLegal" as "Sent To Legal"
                        const successfulDealsList = deals.filter((d: any) => {
                            const status = String(d.status || d.Status || '').trim();
                            const statusLower = status.toLowerCase();

                            // Check if status matches any successful status (case-insensitive)
                            // Success (may be displayed as Completed in UI)
                            const isSuccess = statusLower === 'success' ||
                                statusLower === 'completed' ||
                                statusLower.includes('success');

                            // SentToLegal (may be displayed as "Sent To Legal" in UI)
                            const isSentToLegal = statusLower === 'senttolegal' ||
                                statusLower === 'sent to legal' ||
                                (statusLower.includes('sent') && statusLower.includes('legal'));

                            // Approved
                            const isApproved = statusLower === 'approved';

                            return isSuccess || isSentToLegal || isApproved;
                        });

                        successfulDeals = successfulDealsList.length;

                        // Calculate total revenue from successful deals
                        // This includes BOTH SentToLegal deals AND Success (Completed) deals
                        // Check multiple possible field names for deal value (DealValue, dealValue, totalValue)
                        totalRevenue = successfulDealsList.reduce((sum: number, d: any) => {
                            const dealValue = d.DealValue ?? d.dealValue ?? d.totalValue ?? 0;
                            const numValue = typeof dealValue === 'number' ? dealValue : (parseFloat(String(dealValue)) || 0);
                            return sum + numValue;
                        }, 0);

                        // Debug logging to help identify issues
                        console.log('[ClientDetails] Statistics Calculation:', {
                            totalDeals: deals.length,
                            successfulDeals,
                            successfulDealsList: successfulDealsList.map((d: any) => ({
                                id: d.id,
                                status: d.status || d.Status,
                                value: d.DealValue ?? d.dealValue ?? d.totalValue
                            })),
                            totalRevenue,
                            allDeals: deals.map((d: any) => ({
                                id: d.id,
                                status: d.status || d.Status,
                                value: d.DealValue ?? d.dealValue ?? d.totalValue
                            })),
                            breakdown: {
                                sentToLegal: successfulDealsList.filter((d: any) => {
                                    const s = String(d.status || d.Status || '').trim().toLowerCase();
                                    return s === 'senttolegal' || s === 'sent to legal';
                                }).length,
                                success: successfulDealsList.filter((d: any) => {
                                    const s = String(d.status || d.Status || '').trim().toLowerCase();
                                    return s === 'success' || s === 'completed';
                                }).length,
                                approved: successfulDealsList.filter((d: any) => {
                                    const s = String(d.status || d.Status || '').trim().toLowerCase();
                                    return s === 'approved';
                                }).length
                            }
                        });

                        return (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">{totalVisits}</p>
                                    <p className="text-sm text-gray-500">{t('clientDetails.stats.totalVisits')}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{totalOffers}</p>
                                    <p className="text-sm text-gray-500">{t('clientDetails.stats.totalOffers')}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-600">{successfulDeals}</p>
                                    <p className="text-sm text-gray-500">{t('clientDetails.stats.successfulDeals')}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-orange-600">EGP {totalRevenue.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">{t('clientDetails.stats.totalRevenue')}</p>
                                </div>
                            </div>
                        );
                    })()}
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">{t('clientDetails.tabs.overview')}</TabsTrigger>
                    <TabsTrigger value="visits">{t('clientDetails.tabs.visits')}</TabsTrigger>
                    <TabsTrigger value="deals">{t('clientDetails.tabs.deals')}</TabsTrigger>
                    <TabsTrigger value="offers">{t('clientDetails.tabs.offers')}</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('clientDetails.overview.title')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">{t('organizationName')}</label>
                                    <p className="text-sm">{client.organizationName || t('clientDetails.notSpecified')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">{t('phone')}</label>
                                    <p className="text-sm">{client.phone || t('clientDetails.notSpecified')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">{t('classification')}</label>
                                    <p className="text-sm">{client.classification || t('clientDetails.notSpecified')}</p>
                                </div>
                                {client.interestedEquipmentCategories && client.interestedEquipmentCategories.length > 0 && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            {t('clientDetails.interestedEquipmentCategories') || 'Interested Equipment Categories'}
                                        </label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {client.interestedEquipmentCategories.map((category: string, index: number) => (
                                                <Badge key={index} variant="secondary">
                                                    {category}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">{t('assignedTo')}</label>
                                    <p className="text-sm">
                                        {client.assignedSalesmanName ||
                                            client.assignedTo ||
                                            t('clientDetails.notAssigned')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('clientDetails.performance.title')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">{t('clientDetails.performance.averageSatisfaction')}</label>
                                    <p className="text-sm">
                                        {client.averageSatisfaction
                                            ? `${client.averageSatisfaction.toFixed(1)}/5`
                                            : t('clientDetails.performance.noRatings')}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">{t('clientDetails.performance.conversionRate')}</label>
                                    <p className="text-sm">
                                        {client.conversionRate
                                            ? `${(client.conversionRate * 100).toFixed(1)}%`
                                            : t('clientDetails.performance.notCalculated')}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">{t('clientDetails.performance.lastInteraction')}</label>
                                    <p className="text-sm">
                                        {client.lastInteractionDate
                                            ? format(new Date(client.lastInteractionDate), 'PPP')
                                            : t('clientDetails.performance.noInteractions')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Visits Tab */}
                <TabsContent value="visits" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('clientDetails.visits.title')}</h3>
                    </div>

                    {visitsLoading ? (
                        <div className="text-center py-4">{t('clientDetails.visits.loading')}</div>
                    ) : clientVisits.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">{t('clientDetails.visits.empty')}</div>
                    ) : (
                        <div className="space-y-4">
                            {clientVisits.map((visit) => (
                                <Card key={visit.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleVisitClick(visit)}>
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{visit.visitType} - {visit.purpose}</h4>
                                                <p className="text-sm text-gray-500">{visit.location}</p>
                                                <p className="text-sm text-gray-600 mt-2">{visit.notes}</p>
                                                {visit.visitResult && (
                                                    <Badge className="mt-2">
                                                        {`${t('clientDetails.visits.resultPrefix')} ${visit.visitResult}`}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-right text-sm text-gray-500">
                                                <p>{format(new Date(visit.visitDate), 'PPP')}</p>
                                                <p>{visit.createdByName}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Deals Tab */}
                <TabsContent value="deals" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('clientDetails.deals.title')}</h3>
                    </div>

                    {dealsLoading ? (
                        <div className="text-center py-4">{t('clientDetails.deals.loading')}</div>
                    ) : deals.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">{t('clientDetails.deals.empty')}</div>
                    ) : (
                        <div className="space-y-4">
                            {deals.map((deal) => {
                                const dealAny = deal as any;
                                return (
                                    <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDealClick(deal)}>
                                        <CardContent className="pt-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-lg">
                                                        EGP {(dealAny.totalValue || dealAny.dealValue || dealAny.DealValue || deal.dealValue || 0).toLocaleString()}
                                                    </h4>
                                                    {deal.clientName && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Client: {deal.clientName}
                                                        </p>
                                                    )}
                                                    {dealAny.salesmanName && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Salesman: {dealAny.salesmanName}
                                                        </p>
                                                    )}
                                                    {(deal.completionNotes || dealAny.failureNotes) && (
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            {deal.completionNotes || dealAny.failureNotes}
                                                        </p>
                                                    )}
                                                    {dealAny.expectedDeliveryDate && (
                                                        <p className="text-sm text-gray-500 mt-2">
                                                            Expected Delivery: {format(new Date(dealAny.expectedDeliveryDate), 'PPP')}
                                                        </p>
                                                    )}
                                                    {dealAny.closedDate && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Closed: {format(new Date(dealAny.closedDate), 'PPP')}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right ml-4">
                                                    <Badge className={getDealStatusColor(deal.status)}>
                                                        {deal.status.replace(/([A-Z])/g, ' $1').trim()}
                                                    </Badge>
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        {format(new Date(deal.createdAt), 'PPP')}
                                                    </p>
                                                    {deal.managerApprovedAt && (
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Manager: {format(new Date(deal.managerApprovedAt), 'MMM dd')}
                                                        </p>
                                                    )}
                                                    {deal.superAdminApprovedAt && (
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Admin: {format(new Date(deal.superAdminApprovedAt), 'MMM dd')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Offers Tab */}
                <TabsContent value="offers" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('clientDetails.offers.title')}</h3>
                    </div>

                    {offersLoading ? (
                        <div className="text-center py-4">{t('clientDetails.offers.loading')}</div>
                    ) : (!offersByClient[clientId] || offersByClient[clientId].length === 0) ? (
                        <div className="text-center py-8 text-gray-500">{t('clientDetails.offers.empty')}</div>
                    ) : (
                        <div className="space-y-4">
                            {(offersByClient[clientId] || []).map((offer: any) => (
                                <Card key={offer.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOfferClick(offer)}>
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">
                                                    {offer.products ||
                                                        offer.equipment?.map((e: any) => e.name).join(', ') ||
                                                        'N/A'}
                                                </h4>
                                                {offer.totalAmount && (
                                                    <p className="text-sm font-semibold text-gray-700 mt-1">
                                                        EGP {offer.totalAmount.toLocaleString()}
                                                    </p>
                                                )}
                                                {offer.assignedToName && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {t('clientDetails.offers.assignedTo')
                                                            .replace('{{name}}', offer.assignedToName)}
                                                    </p>
                                                )}
                                                {offer.createdByName && (
                                                    <p className="text-sm text-gray-500">
                                                        Created by: {offer.createdByName}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <Badge className={getOfferStatusColor(offer.status)}>
                                                    {offer.status}
                                                </Badge>
                                                {offer.validUntil && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Valid until: {Array.isArray(offer.validUntil)
                                                            ? offer.validUntil[0]
                                                            : offer.validUntil}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-500 mt-2">
                                                    {offer.createdAt ? format(new Date(offer.createdAt), 'PPP') : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

            </Tabs>

            {/* Deal Details Modal */}
            <Dialog open={!!selectedDeal} onOpenChange={(open) => !open && setSelectedDeal(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('clientDetails.deals.details') || 'Deal Details'}</DialogTitle>
                    </DialogHeader>
                    {loadingDealDetails ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">{t('clientDetails.deals.loading')}</p>
                        </div>
                    ) : selectedDeal && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('clientDetails.deals.dealId') || 'Deal ID'}</p>
                                        <p className="font-semibold text-lg">{selectedDeal.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('client') || 'Client'}</p>
                                        <p className="font-semibold">{selectedDeal.clientName || client.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('clientDetails.deals.dealValue') || 'Deal Value'}</p>
                                        <p className="font-semibold flex items-center gap-1 text-emerald-600 text-lg">
                                            <DollarSign className="h-4 w-4" />
                                            {(selectedDeal.totalValue || selectedDeal.dealValue || 0).toLocaleString('en-US', {
                                                maximumFractionDigits: 0,
                                            })} EGP
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('clientDetails.deals.createdAt') || 'Created At'}</p>
                                        <p className="font-semibold">
                                            {format(new Date(selectedDeal.createdAt), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('status') || 'Status'}</p>
                                        <div className="mt-1">
                                            <Badge className={getDealStatusColor(selectedDeal.status)}>
                                                {selectedDeal.status.replace(/([A-Z])/g, ' $1').trim()}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('clientDetails.deals.salesman') || 'Salesman'}</p>
                                        <p className="font-semibold">{selectedDeal.salesmanName || selectedDeal.createdByName || 'Unknown'}</p>
                                    </div>
                                    {selectedDeal.expectedDeliveryDate && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('clientDetails.deals.expectedDelivery') || 'Expected Delivery Date'}</p>
                                            <p className="font-semibold">
                                                {format(new Date(selectedDeal.expectedDeliveryDate), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    )}
                                    {selectedDeal.closedDate && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('clientDetails.deals.closedDate') || 'Closed Date'}</p>
                                            <p className="font-semibold">
                                                {format(new Date(selectedDeal.closedDate), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {(selectedDeal.completionNotes || selectedDeal.failureNotes) && (
                                <div className="rounded-lg border border-muted p-4 bg-muted/30">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {selectedDeal.failureNotes ? (t('clientDetails.deals.failureNotes') || 'Failure Notes') : (t('clientDetails.deals.completionNotes') || 'Completion Notes')}
                                    </p>
                                    <p className="text-sm">{selectedDeal.failureNotes || selectedDeal.completionNotes}</p>
                                </div>
                            )}

                            {selectedDeal.offerDetails && (
                                <div className="border rounded-xl p-4 space-y-3">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        {t('clientDetails.deals.linkedOffer') || 'Linked Offer'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">{t('clientDetails.deals.offerId') || 'Offer ID'}</p>
                                            <p className="font-semibold">#{selectedDeal.offerDetails.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">{t('clientDetails.deals.offerValue') || 'Offer Value'}</p>
                                            <p className="font-semibold">
                                                EGP {(selectedDeal.offerDetails.totalAmount || 0).toLocaleString('en-US', {
                                                    maximumFractionDigits: 0,
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">{t('status') || 'Status'}</p>
                                            <p className="font-semibold">{selectedDeal.offerDetails.status || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Offer Details Modal */}
            <Dialog open={!!selectedOffer} onOpenChange={(open) => !open && (setSelectedOffer(null), setOfferEquipment([]))}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('clientDetails.offers.details') || 'Offer Details'}</DialogTitle>
                    </DialogHeader>
                    {loadingOfferDetails ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">{t('clientDetails.offers.loading')}</p>
                        </div>
                    ) : selectedOffer && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('status') || 'Status'}
                                    </label>
                                    <Badge className={getOfferStatusColor(selectedOffer.status)}>
                                        {selectedOffer.status}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('clientDetails.offers.value') || 'Value'}
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

                            <Separator />

                            {/* Equipment Details */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    {t('clientDetails.offers.equipmentDetails') || 'Equipment Details'}
                                </label>

                                {loadingEquipment ? (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('clientDetails.offers.loadingEquipment') || 'Loading equipment...'}</p>
                                    </div>
                                ) : offerEquipment && offerEquipment.length > 0 ? (
                                    <div className="space-y-4">
                                        {offerEquipment.map((equipment, index) => (
                                            <div
                                                key={equipment.id || index}
                                                className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex gap-4 mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                                                            {equipment.name}
                                                        </h4>
                                                        {equipment.model && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {equipment.model}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-xl text-blue-600 dark:text-blue-400">
                                                            EGP {((equipment as any).price ?? (equipment as any).Price ?? 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                                            {t('price') || 'Price'}
                                                        </label>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            EGP {((equipment as any).price ?? (equipment as any).Price ?? 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {equipment.description && (
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                                                {t('description') || 'Description'}
                                                            </label>
                                                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                                                {equipment.description}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        {t('clientDetails.offers.noEquipment') || 'No equipment details available'}
                                    </p>
                                )}
                            </div>

                            {selectedOffer.products && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('clientDetails.offers.products') || 'Products'}
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line">
                                        {selectedOffer.products}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Visit Details Modal */}
            <Dialog open={!!selectedVisit} onOpenChange={(open) => !open && setSelectedVisit(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('clientDetails.visits.details') || 'Visit Details'}</DialogTitle>
                    </DialogHeader>
                    {loadingVisitDetails ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">{t('clientDetails.visits.loading')}</p>
                        </div>
                    ) : selectedVisit && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('clientDetails.visits.visitType') || 'Visit Type'}</p>
                                        <p className="font-semibold">{selectedVisit.progressType || selectedVisit.visitType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('clientDetails.visits.visitDate') || 'Visit Date'}</p>
                                        <p className="font-semibold">
                                            {format(new Date(selectedVisit.progressDate || selectedVisit.visitDate), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('clientDetails.visits.location') || 'Location'}</p>
                                        <p className="font-semibold">{selectedVisit.location || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('clientDetails.visits.createdBy') || 'Created By'}</p>
                                        <p className="font-semibold">{selectedVisit.createdByName || selectedVisit.employeeName || 'N/A'}</p>
                                    </div>
                                    {selectedVisit.visitResult && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('clientDetails.visits.result') || 'Visit Result'}</p>
                                            <Badge className="mt-1">
                                                {selectedVisit.visitResult}
                                            </Badge>
                                        </div>
                                    )}
                                    {selectedVisit.satisfactionRating && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('clientDetails.visits.satisfaction') || 'Satisfaction Rating'}</p>
                                            <p className="font-semibold">{selectedVisit.satisfactionRating}/5</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedVisit.description && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">{t('clientDetails.visits.description') || 'Description'}</p>
                                    <p className="text-sm">{selectedVisit.description}</p>
                                </div>
                            )}

                            {selectedVisit.notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">{t('clientDetails.visits.notes') || 'Notes'}</p>
                                    <p className="text-sm">{selectedVisit.notes}</p>
                                </div>
                            )}

                            {selectedVisit.purpose && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">{t('clientDetails.visits.purpose') || 'Purpose'}</p>
                                    <p className="text-sm">{selectedVisit.purpose}</p>
                                </div>
                            )}

                            {selectedVisit.voiceDescriptionUrl && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">{t('clientDetails.visits.voiceDescription') || 'Voice Description'}</p>
                                    <audio
                                        controls
                                        className="w-full max-w-md"
                                        preload="metadata"
                                    >
                                        <source src={getStaticFileUrl(selectedVisit.voiceDescriptionUrl)} type="audio/mp4" />
                                        <source src={getStaticFileUrl(selectedVisit.voiceDescriptionUrl)} type="audio/mpeg" />
                                        <source src={getStaticFileUrl(selectedVisit.voiceDescriptionUrl)} type="audio/wav" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            )}

                            {selectedVisit.nextFollowUpDate && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">{t('clientDetails.visits.nextFollowUp') || 'Next Follow-up Date'}</p>
                                    <p className="text-sm font-semibold">
                                        {format(new Date(selectedVisit.nextFollowUpDate), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            )}

                            {selectedVisit.followUpNotes && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">{t('clientDetails.visits.followUpNotes') || 'Follow-up Notes'}</p>
                                    <p className="text-sm">{selectedVisit.followUpNotes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ClientDetails;