import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MailWarning, MailCheck, UserCheck, Edit, Users } from 'lucide-react';
import Pagination from '@/components/Pagination';

interface ClientWithEmailStatus {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    hasEmail: boolean;
    emailStatus: 'Missing' | 'Legacy' | 'Valid';
    emailCreatedBy: string | null;
    emailCreatedAt: string | null;
    createdAt: string;
    updatedAt: string | null;

    // Contact Person Information
    contactPerson: string | null;
    contactPersonEmail: string | null;
    contactPersonPhone: string | null;
    contactPersonPosition: string | null;
    lastContactDate: string | null;
    nextContactDate: string | null;
}

interface AdminDashboard {
    totalClients: number;
    clientsWithEmail: number;
    clientsWithoutEmail: number;
    legacyEmailClients: number;
    emailCoveragePercentage: number;
}

const AdminClientManagement: React.FC = () => {
    const { t } = useTranslation();
    const { user, hasAnyRole } = useAuthStore();
    const { success, errorNotification: showError } = useNotificationStore();

    // Check if user has admin access
    const hasAdminAccess = hasAnyRole(['Admin', 'SuperAdmin']);

    const [clients, setClients] = useState<ClientWithEmailStatus[]>([]);
    const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [emailStatusFilter, setEmailStatusFilter] = useState<string>('all');

    // Modal states
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientWithEmailStatus | null>(null);
    const [newEmail, setNewEmail] = useState('');
    const [emailNotes, setEmailNotes] = useState('');

    // Contact person form state
    const [contactPerson, setContactPerson] = useState('');
    const [contactPersonEmail, setContactPersonEmail] = useState('');
    const [contactPersonPhone, setContactPersonPhone] = useState('');
    const [contactPersonPosition, setContactPersonPosition] = useState('');
    const [nextContactDate, setNextContactDate] = useState('');
    const [contactNotes, setContactNotes] = useState('');

    // Fetch clients with email status
    const fetchClients = useCallback(async () => {
        if (!user?.token || !hasAdminAccess) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                pageSize: pageSize.toString(),
            });

            if (searchTerm) params.append('searchTerm', searchTerm);
            if (emailStatusFilter !== 'all') params.append('emailStatus', emailStatusFilter);

            const response = await fetch(`/api/AdminManagement/clients/with-email-status?${params}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setClients(result.data.items);
                setTotalCount(result.data.totalCount);
                setTotalPages(result.data.totalPages);
                setCurrentPage(result.data.pageNumber);
            } else {
                throw new Error(result.message || 'Failed to fetch clients');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            showError('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user?.token, hasAdminAccess, currentPage, pageSize, searchTerm, emailStatusFilter, showError]);

    // Fetch dashboard data
    const fetchDashboard = useCallback(async () => {
        if (!user?.token || !hasAdminAccess) return;

        try {
            const response = await fetch('/api/AdminManagement/dashboard', {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setDashboard(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard:', err);
        }
    }, [user?.token, hasAdminAccess]);

    // Set client email
    const handleSetClientEmail = async () => {
        if (!user?.token || !selectedClient) return;

        if (!newEmail.trim()) {
            showError('Error', 'Email address is required');
            return;
        }

        try {
            const response = await fetch(`/api/AdminManagement/clients/${selectedClient.id}/email`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: newEmail.trim(),
                    notes: emailNotes.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                success('Success', 'Client email updated successfully');
                setIsEmailModalOpen(false);
                setSelectedClient(null);
                setNewEmail('');
                setEmailNotes('');
                fetchClients();
                fetchDashboard();
            } else {
                throw new Error(result.message || 'Failed to update email');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            showError('Error', errorMessage);
        }
    };

    // Update contact person
    const handleUpdateContactPerson = async () => {
        if (!user?.token || !selectedClient) return;

        if (!contactPerson.trim()) {
            showError('Error', 'Contact person name is required');
            return;
        }

        try {
            const response = await fetch(`/api/AdminManagement/clients/${selectedClient.id}/contact-person`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contactPerson: contactPerson.trim(),
                    contactPersonEmail: contactPersonEmail.trim() || null,
                    contactPersonPhone: contactPersonPhone.trim() || null,
                    contactPersonPosition: contactPersonPosition.trim() || null,
                    nextContactDate: nextContactDate || null,
                    notes: contactNotes.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                success('Success', 'Contact person updated successfully');
                setIsContactModalOpen(false);
                setSelectedClient(null);
                setContactPerson('');
                setContactPersonEmail('');
                setContactPersonPhone('');
                setContactPersonPosition('');
                setNextContactDate('');
                setContactNotes('');
                fetchClients();
            } else {
                throw new Error(result.message || 'Failed to update contact person');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            showError('Error', errorMessage);
        }
    };

    // Get email status badge
    const getEmailStatusBadge = (status: string) => {
        switch (status) {
            case 'Valid':
                return (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <MailCheck className="w-3 h-3 mr-1" />
                        Valid Email
                    </Badge>
                );
            case 'Legacy':
                return (
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                        <MailWarning className="w-3 h-3 mr-1" />
                        Legacy Email
                    </Badge>
                );
            case 'Missing':
            default:
                return (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        <Mail className="w-3 h-3 mr-1" />
                        No Email
                    </Badge>
                );
        }
    };

    // Open email modal
    const openEmailModal = (client: ClientWithEmailStatus) => {
        setSelectedClient(client);
        setNewEmail(client.email || '');
        setEmailNotes('');
        setIsEmailModalOpen(true);
    };

    // Open contact person modal
    const openContactModal = (client: ClientWithEmailStatus) => {
        setSelectedClient(client);
        setContactPerson(client.contactPerson || '');
        setContactPersonEmail(client.contactPersonEmail || '');
        setContactPersonPhone(client.contactPersonPhone || '');
        setContactPersonPosition(client.contactPersonPosition || '');
        setNextContactDate(client.nextContactDate ? new Date(client.nextContactDate).toISOString().split('T')[0] : '');
        setContactNotes('');
        setIsContactModalOpen(true);
    };

    // Effects
    useEffect(() => {
        if (hasAdminAccess) {
            fetchClients();
            fetchDashboard();
        }
    }, [hasAdminAccess, fetchClients, fetchDashboard]);

    // Redirect if no admin access
    if (!hasAdminAccess) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
                    <p className="text-muted-foreground">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        {t('admin.clientManagement') || 'Client Email Management'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t('admin.clientManagementDescription') || 'Manage client emails and view email status'}
                    </p>
                </div>
            </div>

            {/* Dashboard Cards */}
            {dashboard && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                                    <p className="text-2xl font-bold">{dashboard.totalClients}</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">With Email</p>
                                    <p className="text-2xl font-bold text-green-600">{dashboard.clientsWithEmail}</p>
                                </div>
                                <MailCheck className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">No Email</p>
                                    <p className="text-2xl font-bold text-red-600">{dashboard.clientsWithoutEmail}</p>
                                </div>
                                <Mail className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Legacy Emails</p>
                                    <p className="text-2xl font-bold text-orange-600">{dashboard.legacyEmailClients}</p>
                                </div>
                                <MailWarning className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Coverage</p>
                                    <p className="text-2xl font-bold">{dashboard.emailCoveragePercentage}%</p>
                                </div>
                                <UserCheck className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="emailStatus">Email Status</Label>
                            <Select value={emailStatusFilter} onValueChange={setEmailStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by email status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Missing">No Email</SelectItem>
                                    <SelectItem value="Legacy">Legacy Email</SelectItem>
                                    <SelectItem value="Valid">Valid Email</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="pageSize">Page Size</Label>
                            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 per page</SelectItem>
                                    <SelectItem value="25">25 per page</SelectItem>
                                    <SelectItem value="50">50 per page</SelectItem>
                                    <SelectItem value="100">100 per page</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Clients Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Clients ({totalCount})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button onClick={fetchClients}>Retry</Button>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Client Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Contact Person</TableHead>
                                            <TableHead>Contact Phone</TableHead>
                                            <TableHead>Email Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clients.map((client) => (
                                            <TableRow key={client.id}>
                                                <TableCell className="font-medium">{client.name}</TableCell>
                                                <TableCell>
                                                    {client.email ? (
                                                        <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                                                            {client.email}
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{client.phone || '-'}</TableCell>
                                                <TableCell>{client.contactPerson || '-'}</TableCell>
                                                <TableCell>{client.contactPersonPhone || '-'}</TableCell>
                                                <TableCell>{getEmailStatusBadge(client.emailStatus)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openEmailModal(client)}
                                                        >
                                                            <Edit className="w-4 h-4 mr-1" />
                                                            Email
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openContactModal(client)}
                                                        >
                                                            <Edit className="w-4 h-4 mr-1" />
                                                            Contact
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        hasPreviousPage={currentPage > 1}
                                        hasNextPage={currentPage < totalPages}
                                        onPageChange={setCurrentPage}
                                        pageSize={pageSize}
                                        totalCount={totalCount}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Email Edit Modal */}
            <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set Client Email</DialogTitle>
                    </DialogHeader>
                    {selectedClient && (
                        <div className="space-y-4">
                            <div>
                                <Label>Client</Label>
                                <p className="font-medium">{selectedClient.name}</p>
                            </div>

                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="client@example.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any notes about this email update..."
                                    value={emailNotes}
                                    onChange={(e) => setEmailNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSetClientEmail}>
                                    Update Email
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Contact Person Edit Modal */}
            <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Update Contact Person</DialogTitle>
                    </DialogHeader>
                    {selectedClient && (
                        <div className="space-y-4">
                            <div>
                                <Label>Client</Label>
                                <p className="font-medium">{selectedClient.name}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="contactPerson">Contact Person Name *</Label>
                                    <Input
                                        id="contactPerson"
                                        placeholder="John Doe"
                                        value={contactPerson}
                                        onChange={(e) => setContactPerson(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="contactPersonEmail">Contact Email</Label>
                                    <Input
                                        id="contactPersonEmail"
                                        type="email"
                                        placeholder="contact@example.com"
                                        value={contactPersonEmail}
                                        onChange={(e) => setContactPersonEmail(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="contactPersonPhone">Contact Phone</Label>
                                    <Input
                                        id="contactPersonPhone"
                                        placeholder="+20 123 456 7890"
                                        value={contactPersonPhone}
                                        onChange={(e) => setContactPersonPhone(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="contactPersonPosition">Position</Label>
                                    <Input
                                        id="contactPersonPosition"
                                        placeholder="Manager, Director, etc."
                                        value={contactPersonPosition}
                                        onChange={(e) => setContactPersonPosition(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="nextContactDate">Next Contact Date</Label>
                                    <Input
                                        id="nextContactDate"
                                        type="date"
                                        value={nextContactDate}
                                        onChange={(e) => setNextContactDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="contactNotes">Notes (Optional)</Label>
                                <Textarea
                                    id="contactNotes"
                                    placeholder="Add any notes about this contact person..."
                                    value={contactNotes}
                                    onChange={(e) => setContactNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsContactModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateContactPerson}>
                                    Update Contact Person
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminClientManagement;
