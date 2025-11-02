import React, { useEffect, useState } from 'react';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import { salesApi } from '@/services/sales/salesApi';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    InboxIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    UserPlusIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { OfferRequest } from '@/types/sales.types';

type OfferRequestStatus = 'Pending' | 'Assigned' | 'InProgress' | 'Completed' | 'Cancelled';

export default function RequestsInboxPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [offerRequests, setOfferRequests] = useState<OfferRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<OfferRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<OfferRequestStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Selected request for details
    const [selectedRequest, setSelectedRequest] = useState<OfferRequest | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    // Assign dialog
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [assigningTo, setAssigningTo] = useState('');

    // Status update dialog
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState<OfferRequestStatus>('Pending');
    const [statusNotes, setStatusNotes] = useState('');

    // Load offer requests
    const loadOfferRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await salesApi.getOfferRequests({
                status: statusFilter !== 'all' ? statusFilter : undefined,
            });
            setOfferRequests(response.data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load offer requests');
            toast.error(err.message || 'Failed to load offer requests');
        } finally {
            setLoading(false);
        }
    };

    // Load assigned requests (for current user)
    const loadAssignedRequests = async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const response = await salesApi.getAssignedOfferRequests(user.id, {
                status: statusFilter !== 'all' ? statusFilter : undefined,
            });
            setOfferRequests(response.data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load assigned requests');
            toast.error(err.message || 'Failed to load assigned requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOfferRequests();
    }, [statusFilter]);

    // Filter by search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredRequests(offerRequests);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = offerRequests.filter(
            (req) =>
                req.clientName?.toLowerCase().includes(query) ||
                req.requestedByName?.toLowerCase().includes(query) ||
                req.requestedProducts?.toLowerCase().includes(query) ||
                req.id.toString().includes(query)
        );
        setFilteredRequests(filtered);
    }, [searchQuery, offerRequests]);

    // Assign request
    const handleAssign = async () => {
        if (!selectedRequest || !assigningTo.trim()) {
            toast.error('Please enter a support user ID');
            return;
        }

        try {
            await salesApi.assignOfferRequest(selectedRequest.id, {
                assignedTo: assigningTo.trim(),
            });
            toast.success('Request assigned successfully');
            setShowAssignDialog(false);
            setAssigningTo('');
            loadOfferRequests();
            setSelectedRequest(null);
        } catch (err: any) {
            toast.error(err.message || 'Failed to assign request');
        }
    };

    // Assign to myself
    const handleAssignToMyself = async (request: OfferRequest) => {
        if (!user?.id) {
            toast.error('User ID not found');
            return;
        }

        try {
            await salesApi.assignOfferRequest(request.id, {
                assignedTo: user.id,
            });
            toast.success('Request assigned to you successfully');
            loadOfferRequests();
        } catch (err: any) {
            toast.error(err.message || 'Failed to assign request');
        }
    };

    // Update status
    const handleUpdateStatus = async () => {
        if (!selectedRequest) return;

        try {
            await salesApi.updateOfferRequestStatus(selectedRequest.id, {
                status: newStatus,
                notes: statusNotes || undefined,
            });
            toast.success('Status updated successfully');
            setShowStatusDialog(false);
            setNewStatus('Pending');
            setStatusNotes('');
            loadOfferRequests();
            setSelectedRequest(null);
        } catch (err: any) {
            toast.error(err.message || 'Failed to update status');
        }
    };

    // Open assign dialog
    const openAssignDialog = (request: OfferRequest) => {
        setSelectedRequest(request);
        setAssigningTo(user?.id || '');
        setShowAssignDialog(true);
    };

    // Open status dialog
    const openStatusDialog = (request: OfferRequest) => {
        setSelectedRequest(request);
        setNewStatus(request.status as OfferRequestStatus);
        setStatusNotes('');
        setShowStatusDialog(true);
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
            case 'Assigned':
                return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700';
            case 'InProgress':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
            case 'Completed':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
            case 'Cancelled':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
        }
    };

    // Get priority color
    const getPriorityColor = (priority?: string) => {
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

    // Stats
    const stats = {
        total: offerRequests.length,
        pending: offerRequests.filter((r) => r.status === 'Pending').length,
        assigned: offerRequests.filter((r) => r.status === 'Assigned').length,
        inProgress: offerRequests.filter((r) => r.status === 'InProgress').length,
        completed: offerRequests.filter((r) => r.status === 'Completed').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl shadow-lg p-8 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-white">Offer Requests Management</h1>
                            <p className="text-blue-100 dark:text-blue-200 text-lg">
                                Manage and track offer requests from salesmen
                            </p>
                        </div>
                        <Button
                            onClick={loadOfferRequests}
                            variant="outline"
                            className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
                        >
                            <ArrowPathIcon className="h-5 w-5 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {stats.total}
                                    </p>
                                </div>
                                <InboxIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {stats.pending}
                                    </p>
                                </div>
                                <ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {stats.assigned}
                                    </p>
                                </div>
                                <UserPlusIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {stats.inProgress}
                                    </p>
                                </div>
                                <ArrowPathIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {stats.completed}
                                    </p>
                                </div>
                                <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    placeholder="Search by client, salesman, products, or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <FunnelIcon className="h-5 w-5 text-gray-400" />
                                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Assigned">Assigned</SelectItem>
                                        <SelectItem value="InProgress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                variant="outline"
                                onClick={loadAssignedRequests}
                                className="whitespace-nowrap"
                            >
                                My Assigned Requests
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Requests List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Offer Requests</CardTitle>
                        <CardDescription>
                            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 dark:text-gray-400 mt-4">Loading requests...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-500 dark:text-red-400">
                                <XCircleIcon className="h-12 w-12 mx-auto mb-4" />
                                <p>{error}</p>
                                <Button onClick={loadOfferRequests} className="mt-4">
                                    Retry
                                </Button>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <InboxIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg">No requests found</p>
                                {searchQuery && (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                        Try adjusting your search or filters
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="border-2 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                                        Request #{request.id}
                                                    </h3>
                                                    <Badge className={getStatusColor(request.status)}>
                                                        {request.status}
                                                    </Badge>
                                                    {request.priority && (
                                                        <Badge className={getPriorityColor(request.priority)} variant="outline">
                                                            {request.priority}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    <strong>Client:</strong> {request.clientName}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    <strong>Requested Products:</strong> {request.requestedProducts}
                                                </p>
                                                {request.specialNotes && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 italic">
                                                        <strong>Notes:</strong> {request.specialNotes}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mt-3">
                                                    <span>
                                                        <strong>Requested by:</strong> {request.requestedByName}
                                                    </span>
                                                    {request.requestDate && (
                                                        <span>
                                                            <strong>Date:</strong>{' '}
                                                            {format(new Date(request.requestDate), 'MMM dd, yyyy HH:mm')}
                                                        </span>
                                                    )}
                                                    {request.assignedToName && (
                                                        <span>
                                                            <strong>Assigned to:</strong> {request.assignedToName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowDetailsDialog(true);
                                                }}
                                            >
                                                View Details
                                            </Button>
                                            {request.status === 'Pending' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-purple-600 hover:bg-purple-700"
                                                    onClick={() => handleAssignToMyself(request)}
                                                >
                                                    <UserPlusIcon className="h-4 w-4 mr-2" />
                                                    Assign to Me
                                                </Button>
                                            )}
                                            {request.status !== 'Pending' && request.status !== 'Cancelled' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openAssignDialog(request)}
                                                >
                                                    <UserPlusIcon className="h-4 w-4 mr-2" />
                                                    Reassign
                                                </Button>
                                            )}
                                            {request.status !== 'Completed' && request.status !== 'Cancelled' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openStatusDialog(request)}
                                                >
                                                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                                                    Update Status
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Details Dialog */}
                <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Offer Request Details #{selectedRequest?.id}</DialogTitle>
                            <DialogDescription>Complete information about this offer request</DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Status</Label>
                                        <Badge className={getStatusColor(selectedRequest.status)}>
                                            {selectedRequest.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label>Priority</Label>
                                        {selectedRequest.priority ? (
                                            <Badge className={getPriorityColor(selectedRequest.priority)}>
                                                {selectedRequest.priority}
                                            </Badge>
                                        ) : (
                                            <span className="text-sm text-gray-500">N/A</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label>Client</Label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedRequest.clientName}</p>
                                </div>
                                <div>
                                    <Label>Requested Products</Label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {selectedRequest.requestedProducts}
                                    </p>
                                </div>
                                {selectedRequest.specialNotes && (
                                    <div>
                                        <Label>Special Notes</Label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                            {selectedRequest.specialNotes}
                                        </p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Requested By</Label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                            {selectedRequest.requestedByName}
                                        </p>
                                    </div>
                                    <div>
                                        <Label>Request Date</Label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                            {selectedRequest.requestDate
                                                ? format(new Date(selectedRequest.requestDate), 'MMM dd, yyyy HH:mm')
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                {selectedRequest.assignedToName && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Assigned To</Label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {selectedRequest.assignedToName}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {selectedRequest.createdOfferId && (
                                    <div>
                                        <Label>Created Offer ID</Label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                            {selectedRequest.createdOfferId}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                                Close
                            </Button>
                            {selectedRequest?.status === 'Pending' && (
                                <Button onClick={() => {
                                    setShowDetailsDialog(false);
                                    handleAssignToMyself(selectedRequest);
                                }}>
                                    Assign to Me
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Assign Dialog */}
                <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Assign Offer Request</DialogTitle>
                            <DialogDescription>
                                Assign request #{selectedRequest?.id} to a SalesSupport member
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Support User ID</Label>
                                <Input
                                    value={assigningTo}
                                    onChange={(e) => setAssigningTo(e.target.value)}
                                    placeholder="Enter SalesSupport user ID"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter the user ID of the SalesSupport member to assign this request to
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAssign}>Assign</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Status Update Dialog */}
                <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Request Status</DialogTitle>
                            <DialogDescription>
                                Update the status of request #{selectedRequest?.id}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>New Status</Label>
                                <Select
                                    value={newStatus}
                                    onValueChange={(value) => setNewStatus(value as OfferRequestStatus)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Assigned">Assigned</SelectItem>
                                        <SelectItem value="InProgress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Notes (Optional)</Label>
                                <Textarea
                                    value={statusNotes}
                                    onChange={(e) => setStatusNotes(e.target.value)}
                                    placeholder="Add notes about this status update..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateStatus}>Update Status</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
