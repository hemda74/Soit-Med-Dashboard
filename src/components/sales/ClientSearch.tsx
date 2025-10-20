// Client Search Component - Advanced client search with filters

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, User, MapPin, Phone, Mail, Calendar, Star } from 'lucide-react';
import { useSalesStore } from '@/stores/salesStore';
import type { Client, ClientSearchFilters } from '@/types/sales.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ClientSearchProps {
    onClientSelect?: (client: Client) => void;
    placeholder?: string;
    showFilters?: boolean;
    className?: string;
}

export default function ClientSearch({
    onClientSelect,
    placeholder = 'Search clients...',
    showFilters = true,
    className = '',
}: ClientSearchProps) {
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [filters, setFilters] = useState<ClientSearchFilters>({});

    const {
        clients,
        clientsLoading,
        clientsError,
        searchClients,
        clearClientSearch,
        setSelectedClient,
    } = useSalesStore();

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.length >= 2) {
                searchClients({ ...filters, query });
                setShowResults(true);
            } else if (query.length === 0) {
                clearClientSearch();
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, filters, searchClients, clearClientSearch]);

    const handleClientSelect = useCallback((client: Client) => {
        setQuery(client.name);
        setShowResults(false);
        setSelectedClient(client);
        onClientSelect?.(client);
    }, [onClientSelect, setSelectedClient]);

    const handleFilterChange = useCallback((key: keyof ClientSearchFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({});
        setQuery('');
        clearClientSearch();
        setShowResults(false);
    }, [clearClientSearch]);

    const getClientTypeColor = (type: string) => {
        const colors = {
            Doctor: 'bg-blue-100 text-blue-800',
            Hospital: 'bg-green-100 text-green-800',
            Clinic: 'bg-purple-100 text-purple-800',
            Pharmacy: 'bg-orange-100 text-orange-800',
            Other: 'bg-gray-100 text-gray-800',
        };
        return colors[type as keyof typeof colors] || colors.Other;
    };

    const getStatusColor = (status: string) => {
        const colors = {
            Active: 'bg-green-100 text-green-800',
            Inactive: 'bg-gray-100 text-gray-800',
            Prospect: 'bg-yellow-100 text-yellow-800',
            Lost: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || colors.Inactive;
    };

    return (
        <div className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10 pr-20"
                />
                {query && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setQuery('');
                            clearClientSearch();
                            setShowResults(false);
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
                {showFilters && (
                    <Dialog open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            >
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Advanced Filters</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Client Type</label>
                                    <Select
                                        value={filters.type || ''}
                                        onValueChange={(value) => handleFilterChange('type', value || undefined)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All types</SelectItem>
                                            <SelectItem value="Doctor">Doctor</SelectItem>
                                            <SelectItem value="Hospital">Hospital</SelectItem>
                                            <SelectItem value="Clinic">Clinic</SelectItem>
                                            <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Select
                                        value={filters.status || ''}
                                        onValueChange={(value) => handleFilterChange('status', value || undefined)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All statuses</SelectItem>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                            <SelectItem value="Prospect">Prospect</SelectItem>
                                            <SelectItem value="Lost">Lost</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Location</label>
                                    <Input
                                        value={filters.location || ''}
                                        onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                                        placeholder="Enter location"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={clearFilters} variant="outline" className="flex-1">
                                        Clear Filters
                                    </Button>
                                    <Button onClick={() => setShowAdvancedFilters(false)} className="flex-1">
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Search Results */}
            {showResults && (
                <Card className="absolute z-50 w-full mt-2 max-h-96 overflow-y-auto">
                    <CardContent className="p-0">
                        {clientsLoading ? (
                            <div className="p-4 text-center text-muted-foreground">
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                    <span>Searching...</span>
                                </div>
                            </div>
                        ) : clientsError ? (
                            <div className="p-4 text-center text-destructive">
                                <p>{clientsError}</p>
                            </div>
                        ) : clients.length > 0 ? (
                            <div className="divide-y">
                                {clients.map((client) => (
                                    <div
                                        key={client.id}
                                        onClick={() => handleClientSelect(client)}
                                        className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                    <h3 className="font-medium text-sm truncate">{client.name}</h3>
                                                    <Badge className={`text-xs ${getClientTypeColor(client.type)}`}>
                                                        {client.type}
                                                    </Badge>
                                                    <Badge className={`text-xs ${getStatusColor(client.status)}`}>
                                                        {client.status}
                                                    </Badge>
                                                </div>
                                                {client.specialization && (
                                                    <p className="text-xs text-muted-foreground mb-1">
                                                        {client.specialization}
                                                    </p>
                                                )}
                                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                    {client.location && (
                                                        <div className="flex items-center space-x-1">
                                                            <MapPin className="h-3 w-3" />
                                                            <span className="truncate">{client.location}</span>
                                                        </div>
                                                    )}
                                                    {client.phone && (
                                                        <div className="flex items-center space-x-1">
                                                            <Phone className="h-3 w-3" />
                                                            <span>{client.phone}</span>
                                                        </div>
                                                    )}
                                                    {client.email && (
                                                        <div className="flex items-center space-x-1">
                                                            <Mail className="h-3 w-3" />
                                                            <span className="truncate">{client.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {client.lastVisitDate && (
                                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>Last visit: {new Date(client.lastVisitDate).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {client.totalVisits > 0 && (
                                                <div className="flex items-center space-x-1 text-xs text-muted-foreground ml-2">
                                                    <Star className="h-3 w-3" />
                                                    <span>{client.totalVisits} visits</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-muted-foreground">
                                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No clients found</p>
                                {query && (
                                    <p className="text-xs">Try adjusting your search terms or filters</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

