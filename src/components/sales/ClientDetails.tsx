// Client Details Component - Comprehensive client information and management

import React, { useState, useEffect } from 'react';
import {
    User,
    MapPin,
    Phone,
    Mail,
    Globe,
    Calendar,
    Edit,
    Trash2,
    Plus,
    Building,
    Star,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { useSalesStore } from '@/stores/salesStore';
import type { Client, CreateClientVisitDto, CreateClientInteractionDto } from '@/types/sales.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface ClientDetailsProps {
    clientId: string;
    onEdit?: (client: Client) => void;
    onDelete?: (clientId: string) => void;
    className?: string;
}

export default function ClientDetails({
    clientId,
    onEdit,
    onDelete,
    className = ''
}: ClientDetailsProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [showInteractionModal, setShowInteractionModal] = useState(false);
    const [visitForm, setVisitForm] = useState<CreateClientVisitDto>({
        clientId,
        visitDate: new Date().toISOString().slice(0, 16),
        visitType: 'Initial',
        location: '',
        purpose: '',
        notes: '',
        results: '',
    });
    const [interactionForm, setInteractionForm] = useState<CreateClientInteractionDto>({
        clientId,
        interactionType: 'Call',
        subject: '',
        description: '',
        interactionDate: new Date().toISOString().slice(0, 16),
    });

    const {
        selectedClient,
        clientVisits,
        clientInteractions,
        clientsLoading,
        visitsLoading,
        interactionsLoading,
        getClient,
        getClientVisits,
        getClientInteractions,
        createClientVisit,
        createClientInteraction,
        deleteClient,
    } = useSalesStore();

    useEffect(() => {
        if (clientId) {
            getClient(clientId);
            getClientVisits(clientId);
            getClientInteractions(clientId);
        }
    }, [clientId, getClient, getClientVisits, getClientInteractions]);

    const handleEditClient = () => {
        if (selectedClient) {
            onEdit?.(selectedClient);
        }
    };

    const handleDeleteClient = () => {
        if (selectedClient && window.confirm('Are you sure you want to delete this client?')) {
            deleteClient(selectedClient.id);
            onDelete?.(selectedClient.id);
        }
    };

    const handleVisitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createClientVisit(visitForm);
            setShowVisitModal(false);
            setVisitForm({
                clientId,
                visitDate: new Date().toISOString().slice(0, 16),
                visitType: 'Initial',
                location: '',
                purpose: '',
                notes: '',
                results: '',
            });
        } catch (error) {
            console.error('Failed to create visit:', error);
        }
    };

    const handleInteractionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createClientInteraction(interactionForm);
            setShowInteractionModal(false);
            setInteractionForm({
                clientId,
                interactionType: 'Call',
                subject: '',
                description: '',
                interactionDate: new Date().toISOString().slice(0, 16),
            });
        } catch (error) {
            console.error('Failed to create interaction:', error);
        }
    };

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

    const getVisitTypeColor = (type: string) => {
        const colors = {
            Initial: 'bg-blue-100 text-blue-800',
            'Follow-up': 'bg-green-100 text-green-800',
            Maintenance: 'bg-purple-100 text-purple-800',
            Support: 'bg-orange-100 text-orange-800',
            Presentation: 'bg-pink-100 text-pink-800',
            Negotiation: 'bg-yellow-100 text-yellow-800',
            Closing: 'bg-red-100 text-red-800',
        };
        return colors[type as keyof typeof colors] || colors.Initial;
    };

    const getInteractionTypeColor = (type: string) => {
        const colors = {
            Call: 'bg-blue-100 text-blue-800',
            Email: 'bg-green-100 text-green-800',
            Meeting: 'bg-purple-100 text-purple-800',
            'Video Call': 'bg-orange-100 text-orange-800',
            WhatsApp: 'bg-green-100 text-green-800',
            Other: 'bg-gray-100 text-gray-800',
        };
        return colors[type as keyof typeof colors] || colors.Other;
    };

    if (clientsLoading) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!selectedClient) {
        return (
            <Card className={className}>
                <CardContent className="p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Client not found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Client Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h1 className="text-2xl font-bold">{selectedClient.name}</h1>
                                    <Badge className={getClientTypeColor(selectedClient.type)}>
                                        {selectedClient.type}
                                    </Badge>
                                    <Badge className={getStatusColor(selectedClient.status)}>
                                        {selectedClient.status}
                                    </Badge>
                                </div>
                                {selectedClient.specialization && (
                                    <p className="text-muted-foreground mb-2">{selectedClient.specialization}</p>
                                )}
                                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                    {selectedClient.location && (
                                        <div className="flex items-center space-x-1">
                                            <MapPin className="h-4 w-4" />
                                            <span>{selectedClient.location}</span>
                                        </div>
                                    )}
                                    {selectedClient.phone && (
                                        <div className="flex items-center space-x-1">
                                            <Phone className="h-4 w-4" />
                                            <span>{selectedClient.phone}</span>
                                        </div>
                                    )}
                                    {selectedClient.email && (
                                        <div className="flex items-center space-x-1">
                                            <Mail className="h-4 w-4" />
                                            <span>{selectedClient.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={handleEditClient}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDeleteClient}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Client Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="visits">Visits ({clientVisits.length})</TabsTrigger>
                    <TabsTrigger value="interactions">Interactions ({clientInteractions.length})</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Phone className="h-5 w-5" />
                                    <span>Contact Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedClient.phone && (
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedClient.phone}</span>
                                    </div>
                                )}
                                {selectedClient.email && (
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedClient.email}</span>
                                    </div>
                                )}
                                {selectedClient.website && (
                                    <div className="flex items-center space-x-3">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <a href={selectedClient.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            {selectedClient.website}
                                        </a>
                                    </div>
                                )}
                                {selectedClient.address && (
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span>{selectedClient.address}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Business Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Building className="h-5 w-5" />
                                    <span>Business Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedClient.contactPerson && (
                                    <div>
                                        <Label className="text-sm font-medium">Contact Person</Label>
                                        <p className="text-sm text-muted-foreground">{selectedClient.contactPerson}</p>
                                        {selectedClient.contactPersonTitle && (
                                            <p className="text-xs text-muted-foreground">{selectedClient.contactPersonTitle}</p>
                                        )}
                                    </div>
                                )}
                                {selectedClient.employeeCount && (
                                    <div>
                                        <Label className="text-sm font-medium">Employee Count</Label>
                                        <p className="text-sm text-muted-foreground">{selectedClient.employeeCount}</p>
                                    </div>
                                )}
                                {selectedClient.annualRevenue && (
                                    <div>
                                        <Label className="text-sm font-medium">Annual Revenue</Label>
                                        <p className="text-sm text-muted-foreground">${selectedClient.annualRevenue.toLocaleString()}</p>
                                    </div>
                                )}
                                {selectedClient.establishedYear && (
                                    <div>
                                        <Label className="text-sm font-medium">Established</Label>
                                        <p className="text-sm text-muted-foreground">{selectedClient.establishedYear}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notes */}
                    {selectedClient.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedClient.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Visits Tab */}
                <TabsContent value="visits" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Client Visits</h3>
                        <Dialog open={showVisitModal} onOpenChange={setShowVisitModal}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Visit
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Add Client Visit</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleVisitSubmit} className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="visitDate">Visit Date</Label>
                                            <Input
                                                id="visitDate"
                                                type="datetime-local"
                                                value={visitForm.visitDate}
                                                onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="visitType">Visit Type</Label>
                                            <Select
                                                value={visitForm.visitType}
                                                onValueChange={(value) => setVisitForm({ ...visitForm, visitType: value as any })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Initial">Initial</SelectItem>
                                                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                                    <SelectItem value="Support">Support</SelectItem>
                                                    <SelectItem value="Presentation">Presentation</SelectItem>
                                                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                                                    <SelectItem value="Closing">Closing</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={visitForm.location}
                                            onChange={(e) => setVisitForm({ ...visitForm, location: e.target.value })}
                                            placeholder="Visit location"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="purpose">Purpose</Label>
                                        <Input
                                            id="purpose"
                                            value={visitForm.purpose}
                                            onChange={(e) => setVisitForm({ ...visitForm, purpose: e.target.value })}
                                            placeholder="Visit purpose"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={visitForm.notes}
                                            onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                                            placeholder="Visit notes"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="results">Results</Label>
                                        <Textarea
                                            id="results"
                                            value={visitForm.results}
                                            onChange={(e) => setVisitForm({ ...visitForm, results: e.target.value })}
                                            placeholder="Visit results"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button type="button" variant="outline" onClick={() => setShowVisitModal(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={visitsLoading}>
                                            {visitsLoading ? 'Adding...' : 'Add Visit'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {visitsLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : clientVisits.length > 0 ? (
                        <div className="space-y-4">
                            {clientVisits.map((visit) => (
                                <Card key={visit.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Badge className={getVisitTypeColor(visit.visitType)}>
                                                        {visit.visitType}
                                                    </Badge>
                                                    <Badge variant={visit.status === 'Completed' ? 'default' : 'secondary'}>
                                                        {visit.status}
                                                    </Badge>
                                                </div>
                                                <h4 className="font-medium">{visit.purpose}</h4>
                                                <p className="text-sm text-muted-foreground mb-2">{visit.location}</p>
                                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{format(new Date(visit.visitDate), 'MMM dd, yyyy HH:mm')}</span>
                                                    </div>
                                                    {visit.duration && (
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{visit.duration} min</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {visit.notes && (
                                                    <p className="text-sm text-muted-foreground mt-2">{visit.notes}</p>
                                                )}
                                                {visit.results && (
                                                    <p className="text-sm text-muted-foreground mt-2">{visit.results}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No visits recorded yet</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Interactions Tab */}
                <TabsContent value="interactions" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Client Interactions</h3>
                        <Dialog open={showInteractionModal} onOpenChange={setShowInteractionModal}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Interaction
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Add Client Interaction</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleInteractionSubmit} className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="interactionType">Interaction Type</Label>
                                            <Select
                                                value={interactionForm.interactionType}
                                                onValueChange={(value) => setInteractionForm({ ...interactionForm, interactionType: value as any })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Call">Call</SelectItem>
                                                    <SelectItem value="Email">Email</SelectItem>
                                                    <SelectItem value="Meeting">Meeting</SelectItem>
                                                    <SelectItem value="Video Call">Video Call</SelectItem>
                                                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="interactionDate">Date</Label>
                                            <Input
                                                id="interactionDate"
                                                type="datetime-local"
                                                value={interactionForm.interactionDate}
                                                onChange={(e) => setInteractionForm({ ...interactionForm, interactionDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            value={interactionForm.subject}
                                            onChange={(e) => setInteractionForm({ ...interactionForm, subject: e.target.value })}
                                            placeholder="Interaction subject"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={interactionForm.description}
                                            onChange={(e) => setInteractionForm({ ...interactionForm, description: e.target.value })}
                                            placeholder="Interaction description"
                                            rows={4}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button type="button" variant="outline" onClick={() => setShowInteractionModal(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={interactionsLoading}>
                                            {interactionsLoading ? 'Adding...' : 'Add Interaction'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {interactionsLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : clientInteractions.length > 0 ? (
                        <div className="space-y-4">
                            {clientInteractions.map((interaction) => (
                                <Card key={interaction.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Badge className={getInteractionTypeColor(interaction.interactionType)}>
                                                        {interaction.interactionType}
                                                    </Badge>
                                                    <Badge variant={interaction.status === 'Completed' ? 'default' : 'secondary'}>
                                                        {interaction.status}
                                                    </Badge>
                                                </div>
                                                <h4 className="font-medium">{interaction.subject}</h4>
                                                <p className="text-sm text-muted-foreground mb-2">{interaction.description}</p>
                                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{format(new Date(interaction.interactionDate), 'MMM dd, yyyy HH:mm')}</span>
                                                    </div>
                                                    {interaction.duration && (
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{interaction.duration} min</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No interactions recorded yet</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Star className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">Total Visits</span>
                                </div>
                                <p className="text-2xl font-bold">{selectedClient.totalVisits}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-2 mb-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">Conversion Rate</span>
                                </div>
                                <p className="text-2xl font-bold">{selectedClient.conversionRate || 0}%</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">Potential Value</span>
                                </div>
                                <p className="text-2xl font-bold">${selectedClient.potentialValue?.toLocaleString() || 0}</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

