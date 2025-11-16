// Sales Support Client Details - Simplified view with Contact Info and Offers only
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface SalesSupportClientDetailsProps {
    client: any;
    offers: any[];
    offersLoading: boolean;
}

const SalesSupportClientDetails: React.FC<SalesSupportClientDetailsProps> = ({
    client,
    offers = [],
    offersLoading
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Draft':
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
            case 'Sent':
                return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
            case 'Accepted':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'Rejected':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BuildingOfficeIcon className="h-5 w-5" />
                        Contact Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Client Name & Type */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {client.name}
                            </h3>
                            <div className="mt-1 flex items-center gap-2">
                                {client.classification && (
                                    <Badge variant="outline">Classification: {client.classification}</Badge>
                                )}
                                {client.organizationName && (
                                    <Badge variant="outline">{client.organizationName}</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        {/* Phone */}
                        {client.phone && (
                            <div className="flex items-center gap-3">
                                <PhoneIcon className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {client.phone}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Organization Name */}
                        {client.organizationName && (
                            <div className="flex items-center gap-3">
                                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Organization</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {client.organizationName}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Classification */}
                        {client.classification && (
                            <div className="flex items-center gap-3">
                                <MapPinIcon className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Classification</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {client.classification}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                </CardContent>
            </Card>

            {/* Offers History */}
            <Card>
                <CardHeader>
                    <CardTitle>Offer History</CardTitle>
                    <CardDescription>
                        {offersLoading ? 'Loading...' : `${offers.length} offer${offers.length !== 1 ? 's' : ''} found`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {offersLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : offers.length > 0 ? (
                        <div className="space-y-3">
                            {offers.map((offer) => (
                                <div
                                    key={offer.id}
                                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                Offer #{offer.id}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {offer.products}
                                            </p>
                                        </div>
                                        <Badge className={getStatusColor(offer.status)}>
                                            {offer.status}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                        {offer.totalAmount && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Amount: </span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'EGP',
                                                    }).format(offer.totalAmount)}
                                                </span>
                                            </div>
                                        )}
                                        {offer.createdAt && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Date: </span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {format(new Date(offer.createdAt), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {offer.validUntil && (
                                        <div className="mt-2 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Valid Until: </span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {format(new Date(offer.validUntil), 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>No offers found for this client</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SalesSupportClientDetails;

