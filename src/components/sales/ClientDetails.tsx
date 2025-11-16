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
        getOfferRequests,
        selectedClient,
        clientVisits,
        taskProgress,
        deals,
        offerRequests,
        clientsLoading,
        visitsLoading,
        taskProgressLoading,
        dealsLoading,
        offerRequestsLoading,
        clientsError
    } = useSalesStore();

    const [activeTab, setActiveTab] = useState('overview');
    const [showDealForm, setShowDealForm] = useState(false);
    const [showTaskProgressForm, setShowTaskProgressForm] = useState(false);
    const [showOfferRequestForm, setShowOfferRequestForm] = useState(false);

    useEffect(() => {
        if (clientId) {
            getClient(clientId);
            getClientVisits(clientId);
            getClientTaskProgress(clientId);
            getDeals({ clientId });
            getOfferRequests({ clientId });
        }
    }, [clientId, getClient, getClientVisits, getClientTaskProgress, getDeals, getOfferRequests]);

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
                    Loading client details...
                </div>
            </div>
        );
    }

    if (clientsError || !selectedClient) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <p className="text-red-600">Error loading client details: {clientsError}</p>
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
                                            Classification: {client.classification}
                                        </Badge>
                                    )}
                                    {client.organizationName && (
                                        <span className="text-sm text-gray-500">{client.organizationName}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Assigned to</p>
                            <p className="font-medium">{client.assignedSalesmanName}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {client.phone && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">Phone</span>
                                </div>
                                <p className="font-medium">{client.phone}</p>
                            </div>
                        )}
                        {client.organizationName && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">Organization</span>
                                </div>
                                <p className="font-medium">{client.organizationName}</p>
                            </div>
                        )}
                        {client.classification && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <ChartBarIcon className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">Classification</span>
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
                        <span>Client Statistics</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{client.totalVisits}</p>
                            <p className="text-sm text-gray-500">Total Visits</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{client.totalOffers}</p>
                            <p className="text-sm text-gray-500">Total Offers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{client.successfulDeals}</p>
                            <p className="text-sm text-gray-500">Successful Deals</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">EGP {client.totalRevenue?.toLocaleString() || 0}</p>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="visits">Visits</TabsTrigger>
                    <TabsTrigger value="deals">Deals</TabsTrigger>
                    <TabsTrigger value="offers">Offers</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Client Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Organization Name</label>
                                    <p className="text-sm">{client.organizationName || 'Not specified'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p className="text-sm">{client.phone || 'Not specified'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Classification</label>
                                    <p className="text-sm">{client.classification || 'Not specified'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Assigned To</label>
                                    <p className="text-sm">{client.assignedSalesmanName || client.assignedTo || 'Not assigned'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Average Satisfaction</label>
                                    <p className="text-sm">{client.averageSatisfaction ? `${client.averageSatisfaction.toFixed(1)}/5` : 'No ratings yet'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Conversion Rate</label>
                                    <p className="text-sm">{client.conversionRate ? `${(client.conversionRate * 100).toFixed(1)}%` : 'Not calculated'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Last Interaction</label>
                                    <p className="text-sm">{client.lastInteractionDate ? format(new Date(client.lastInteractionDate), 'PPP') : 'No interactions'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Visits Tab */}
                <TabsContent value="visits" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Client Visits</h3>
                        <Button onClick={() => setShowTaskProgressForm(true)}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Progress
                        </Button>
                    </div>

                    {visitsLoading ? (
                        <div className="text-center py-4">Loading visits...</div>
                    ) : clientVisits.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No visits recorded yet</div>
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
                                                        Result: {visit.visitResult}
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
                        <h3 className="text-lg font-semibold">Deals</h3>
                        <Button onClick={() => setShowDealForm(true)}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create Deal
                        </Button>
                    </div>

                    {dealsLoading ? (
                        <div className="text-center py-4">Loading deals...</div>
                    ) : deals.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No deals created yet</div>
                    ) : (
                        <div className="space-y-4">
                            {deals.map((deal) => (
                                <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">EGP {deal.dealValue.toLocaleString()}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{deal.dealDescription}</p>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Expected close: {format(new Date(deal.expectedCloseDate), 'PPP')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={getDealStatusColor(deal.status)}>
                                                    {deal.status.replace(/([A-Z])/g, ' $1').trim()}
                                                </Badge>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    {format(new Date(deal.createdAt), 'PPP')}
                                                </p>
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
                        <h3 className="text-lg font-semibold">Offer Requests</h3>
                        <Button onClick={() => setShowOfferRequestForm(true)}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create Request
                        </Button>
                    </div>

                    {offerRequestsLoading ? (
                        <div className="text-center py-4">Loading offers...</div>
                    ) : offerRequests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No offer requests yet</div>
                    ) : (
                        <div className="space-y-4">
                            {offerRequests.map((offer) => (
                                <Card key={offer.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{offer.requestedProducts}</h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Requested by: {offer.requestedByName}
                                                </p>
                                                {offer.assignedToName && (
                                                    <p className="text-sm text-gray-500">
                                                        Assigned to: {offer.assignedToName}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <Badge className={getOfferStatusColor(offer.status)}>
                                                    {offer.status}
                                                </Badge>
                                                <Badge className={getPriorityColor(offer.priority || 'Medium')}>
                                                    {offer.priority || 'Medium'}
                                                </Badge>
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
                        <h3 className="text-lg font-semibold">Task Progress</h3>
                        <Button onClick={() => setShowTaskProgressForm(true)}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Progress
                        </Button>
                    </div>

                    {taskProgressLoading ? (
                        <div className="text-center py-4">Loading progress...</div>
                    ) : taskProgress.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No progress recorded yet</div>
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
                                                        Result: {progress.visitResult}
                                                    </Badge>
                                                )}
                                                {progress.nextStep && (
                                                    <Badge className="mt-2 ml-2">
                                                        Next: {progress.nextStep}
                                                    </Badge>
                                                )}
                                                {progress.satisfactionRating && (
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        Satisfaction: {progress.satisfactionRating}/5
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