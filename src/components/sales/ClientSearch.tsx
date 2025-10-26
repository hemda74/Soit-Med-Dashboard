import React, { useState, useEffect } from 'react';
import { Search, User, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
}

const ClientSearch: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);

    // Mock data - replace with actual API call
    useEffect(() => {
        const mockClients: Client[] = [
            {
                id: '1',
                name: 'John Doe',
                company: 'Acme Corp',
                email: 'john@acme.com',
                phone: '+1-555-0123',
                address: '123 Main St, City, State',
                status: 'active',
                lastContact: '2024-01-15',
                notes: 'Interested in premium package'
            },
            {
                id: '2',
                name: 'Jane Smith',
                company: 'Tech Solutions',
                email: 'jane@techsolutions.com',
                phone: '+1-555-0456',
                address: '456 Oak Ave, City, State',
                status: 'prospect',
                lastContact: '2024-01-10',
                notes: 'Follow up next week'
            },
            {
                id: '3',
                name: 'Bob Johnson',
                company: 'Global Industries',
                email: 'bob@global.com',
                phone: '+1-555-0789',
                address: '789 Pine Rd, City, State',
                status: 'inactive',
                lastContact: '2023-12-20',
                notes: 'Lost interest'
            }
        ];
        setClients(mockClients);
        setFilteredClients(mockClients);
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredClients(clients);
            return;
        }

        const filtered = clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.includes(searchTerm)
        );
        setFilteredClients(filtered);
    }, [searchTerm, clients]);

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

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-500" />
                <h1 className="text-2xl font-bold">Client Search</h1>
            </div>

            <div className="flex space-x-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search clients by name, company, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
                <Button onClick={() => setSearchTerm('')}>
                    Clear
                </Button>
            </div>

            <div className="grid gap-4">
                {filteredClients.length === 0 ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    {searchTerm ? 'No clients found matching your search.' : 'No clients available.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredClients.map((client) => (
                        <Card key={client.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center space-x-2">
                                            <User className="h-5 w-5" />
                                            <span>{client.name}</span>
                                        </CardTitle>
                                        <CardDescription className="flex items-center space-x-2 mt-1">
                                            <Building2 className="h-4 w-4" />
                                            <span>{client.company}</span>
                                        </CardDescription>
                                    </div>
                                    <Badge className={getStatusColor(client.status)}>
                                        {client.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Mail className="h-4 w-4" />
                                        <span>{client.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Phone className="h-4 w-4" />
                                        <span>{client.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <MapPin className="h-4 w-4" />
                                        <span>{client.address}</span>
                                    </div>
                                    {client.notes && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                            <p className="text-sm text-gray-700">
                                                <strong>Notes:</strong> {client.notes}
                                            </p>
                                        </div>
                                    )}
                                    <div className="mt-3 text-xs text-gray-500">
                                        Last contact: {client.lastContact}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClientSearch;


