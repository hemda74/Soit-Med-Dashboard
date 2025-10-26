import React, { useState, useEffect } from 'react';
import { User, Building2, Phone, Mail, MapPin, Calendar, FileText, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ClientDetailsProps {
    clientId?: string;
}

interface Client {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive' | 'prospect';
    lastContact: string;
    notes?: string;
    industry: string;
    revenue: string;
    employees: number;
    website?: string;
    contactPerson: string;
    createdAt: string;
    updatedAt: string;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ clientId = '1' }) => {
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data - replace with actual API call
        const mockClient: Client = {
            id: clientId,
            name: 'John Doe',
            company: 'Acme Corporation',
            email: 'john.doe@acme.com',
            phone: '+1-555-0123',
            address: '123 Main Street, Suite 100, New York, NY 10001',
            status: 'active',
            lastContact: '2024-01-15',
            notes: 'Very interested in our premium package. Follow up scheduled for next week.',
            industry: 'Technology',
            revenue: '$10M - $50M',
            employees: 150,
            website: 'https://www.acme.com',
            contactPerson: 'John Doe',
            createdAt: '2023-06-15',
            updatedAt: '2024-01-15'
        };

        setTimeout(() => {
            setClient(mockClient);
            setLoading(false);
        }, 1000);
    }, [clientId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'prospect':
                return 'bg-yellow-100 text-yellow-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-4">
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Client not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <User className="h-6 w-6" />
                    <h1 className="text-2xl font-bold">Client Details</h1>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>Basic Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Name</label>
                            <p className="text-lg font-semibold">{client.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Company</label>
                            <p className="text-lg">{client.company}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <Badge className={getStatusColor(client.status)}>
                                {client.status}
                            </Badge>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Industry</label>
                            <p>{client.industry}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Phone className="h-5 w-5" />
                            <span>Contact Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{client.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{client.phone}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <span className="text-sm">{client.address}</span>
                        </div>
                        {client.website && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Website</label>
                                <p>
                                    <a
                                        href={client.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        {client.website}
                                    </a>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Business Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Building2 className="h-5 w-5" />
                            <span>Business Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Revenue</label>
                            <p>{client.revenue}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Employees</label>
                            <p>{client.employees}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Contact Person</label>
                            <p>{client.contactPerson}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity & Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <span>Activity & Notes</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Last Contact</label>
                            <p className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>{client.lastContact}</span>
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <label className="text-sm font-medium text-gray-500">Notes</label>
                            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-700">{client.notes}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>Created: {client.createdAt}</p>
                            <p>Updated: {client.updatedAt}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ClientDetails;


