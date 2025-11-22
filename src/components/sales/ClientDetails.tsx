// Client Details Component - Updated with new business logic

import React, { useEffect, useState } from 'react';
import { useSalesStore } from '@/stores/salesStore';
import { format } from 'date-fns';
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    PlusIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DealForm from './DealForm';
import TaskProgressForm from './TaskProgressForm';
import OfferRequestForm from './OfferRequestForm';
import { useTranslation } from '@/hooks/useTranslation';

interface ClientDetailsProps {
    clientId: string;
    className?: string;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ clientId, className = '' }) => {
    const {
        getClient,
        getClientVisits,
        getClientTaskProgress,
        getDeals,
        getOffersByClient,
        selectedClient,
        clientVisits,
        taskProgress,
        deals,
        offersByClient,
        clientsLoading,
        visitsLoading,
        taskProgressLoading,
        dealsLoading,
        offersLoading,
        clientsError
    } = useSalesStore();

	const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [showDealForm, setShowDealForm] = useState(false);
    const [showTaskProgressForm, setShowTaskProgressForm] = useState(false);
    const [showOfferRequestForm, setShowOfferRequestForm] = useState(false);

    useEffect(() => {
        if (clientId) {
            getClient(clientId);
            getClientVisits(clientId);
            getClientTaskProgress(clientId);
            // Use direct client-specific endpoints (same as deals/offers pages)
            getDeals({ clientId });
            getOffersByClient(clientId);
        }
    }, [clientId, getClient, getClientVisits, getClientTaskProgress, getDeals, getOffersByClient]);

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
                                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{client.totalVisits}</p>
							<p className="text-sm text-gray-500">{t('clientDetails.stats.totalVisits')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{client.totalOffers}</p>
							<p className="text-sm text-gray-500">{t('clientDetails.stats.totalOffers')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{client.successfulDeals}</p>
							<p className="text-sm text-gray-500">{t('clientDetails.stats.successfulDeals')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">EGP {client.totalRevenue?.toLocaleString() || 0}</p>
							<p className="text-sm text-gray-500">{t('clientDetails.stats.totalRevenue')}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="overview">{t('clientDetails.tabs.overview')}</TabsTrigger>
					<TabsTrigger value="visits">{t('clientDetails.tabs.visits')}</TabsTrigger>
					<TabsTrigger value="deals">{t('clientDetails.tabs.deals')}</TabsTrigger>
					<TabsTrigger value="offers">{t('clientDetails.tabs.offers')}</TabsTrigger>
					<TabsTrigger value="progress">{t('clientDetails.tabs.progress')}</TabsTrigger>
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
                        <Button onClick={() => setShowTaskProgressForm(true)}>
                            <PlusIcon className="h-4 w-4 mr-2" />
							{t('clientDetails.visits.addProgress')}
                        </Button>
                    </div>

                    {visitsLoading ? (
						<div className="text-center py-4">{t('clientDetails.visits.loading')}</div>
                    ) : clientVisits.length === 0 ? (
						<div className="text-center py-8 text-gray-500">{t('clientDetails.visits.empty')}</div>
                    ) : (
                        <div className="space-y-4">
                            {clientVisits.map((visit) => (
                                <Card key={visit.id}>
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
                        <Button onClick={() => setShowDealForm(true)}>
                            <PlusIcon className="h-4 w-4 mr-2" />
							{t('clientDetails.deals.createButton')}
                        </Button>
                    </div>

                    {dealsLoading ? (
						<div className="text-center py-4">{t('clientDetails.deals.loading')}</div>
                    ) : deals.length === 0 ? (
						<div className="text-center py-8 text-gray-500">{t('clientDetails.deals.empty')}</div>
                    ) : (
                        <div className="space-y-4">
                            {deals.map((deal) => (
                                <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-lg">
                                                    EGP {(deal.totalValue || deal.dealValue || 0).toLocaleString()}
                                                </h4>
                                                {deal.clientName && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Client: {deal.clientName}
                                                    </p>
                                                )}
                                                {deal.salesmanName && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Salesman: {deal.salesmanName}
                                                    </p>
                                                )}
                                                {(deal.completionNotes || deal.failureNotes) && (
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        {deal.completionNotes || deal.failureNotes}
                                                    </p>
                                                )}
                                                {deal.expectedDeliveryDate && (
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        Expected Delivery: {format(new Date(deal.expectedDeliveryDate), 'PPP')}
                                                    </p>
                                                )}
                                                {deal.closedDate && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Closed: {format(new Date(deal.closedDate), 'PPP')}
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
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Offers Tab */}
                <TabsContent value="offers" className="space-y-4">
                    <div className="flex justify-between items-center">
						<h3 className="text-lg font-semibold">{t('clientDetails.offers.title')}</h3>
                        <Button onClick={() => setShowOfferRequestForm(true)}>
                            <PlusIcon className="h-4 w-4 mr-2" />
							{t('clientDetails.offers.createButton')}
                        </Button>
                    </div>

                    {offersLoading ? (
						<div className="text-center py-4">{t('clientDetails.offers.loading')}</div>
                    ) : (!offersByClient[clientId] || offersByClient[clientId].length === 0) ? (
						<div className="text-center py-8 text-gray-500">{t('clientDetails.offers.empty')}</div>
                    ) : (
                        <div className="space-y-4">
                            {(offersByClient[clientId] || []).map((offer: any) => (
                                <Card key={offer.id} className="cursor-pointer hover:shadow-md transition-shadow">
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

                {/* Progress Tab */}
                <TabsContent value="progress" className="space-y-4">
                    <div className="flex justify-between items-center">
						<h3 className="text-lg font-semibold">{t('clientDetails.progress.title')}</h3>
                        <Button onClick={() => setShowTaskProgressForm(true)}>
                            <PlusIcon className="h-4 w-4 mr-2" />
							{t('clientDetails.progress.addButton')}
                        </Button>
                    </div>

                    {taskProgressLoading ? (
						<div className="text-center py-4">{t('clientDetails.progress.loading')}</div>
                    ) : taskProgress.length === 0 ? (
						<div className="text-center py-8 text-gray-500">{t('clientDetails.progress.empty')}</div>
                    ) : (
                        <div className="space-y-4">
                            {taskProgress.map((progress) => (
                                <Card key={progress.id}>
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{progress.progressType} - {progress.description}</h4>
                                                {progress.visitResult && (
                                                    <Badge className="mt-2">
														{`${t('clientDetails.progress.resultPrefix')} ${progress.visitResult}`}
                                                    </Badge>
                                                )}
                                                {progress.nextStep && (
                                                    <Badge className="mt-2 ml-2">
														{`${t('clientDetails.progress.nextPrefix')} ${progress.nextStep}`}
                                                    </Badge>
                                                )}
                                                {progress.satisfactionRating && (
                                                    <p className="text-sm text-gray-500 mt-2">
														{t('clientDetails.progress.satisfactionPrefix').replace(
															'{{value}}',
															progress.satisfactionRating.toString()
														)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right text-sm text-gray-500">
                                                <p>{format(new Date(progress.progressDate), 'PPP')}</p>
                                                <p>{progress.createdByName}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Modals */}
            {showDealForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <DealForm
                            clientId={clientId}
                            onSuccess={() => {
                                setShowDealForm(false);
                                getDeals({ clientId });
                            }}
                            onCancel={() => setShowDealForm(false)}
                        />
                    </div>
                </div>
            )}

            {showTaskProgressForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <TaskProgressForm
                            clientId={clientId}
                            onSuccess={() => {
                                setShowTaskProgressForm(false);
                                getClientTaskProgress(clientId);
                            }}
                            onCancel={() => setShowTaskProgressForm(false)}
                        />
                    </div>
                </div>
            )}

            {showOfferRequestForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <OfferRequestForm
                            clientId={clientId}
                            onSuccess={() => {
                                setShowOfferRequestForm(false);
                                getOfferRequests({ clientId });
                            }}
                            onCancel={() => setShowOfferRequestForm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDetails;