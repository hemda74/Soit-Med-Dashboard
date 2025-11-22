import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { salesApi } from '@/services/sales/salesApi';
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
import { usePerformance } from '@/hooks/usePerformance';
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
import { Building, ClipboardList, CalendarClock, User, StickyNote } from 'lucide-react';
import toast from 'react-hot-toast';
import type { OfferRequest } from '@/types/sales.types';
import { useTranslation } from '@/hooks/useTranslation';

type OfferRequestStatus = 'Requested' | 'Assigned' | 'InProgress' | 'Ready' | 'Sent' | 'Cancelled';

export default function RequestsInboxPage() {
    usePerformance('RequestsInboxPage');
    const { t } = useTranslation();
    const translate = (key: string, fallback: string) => {
        const value = t(key);
        return value && value !== key ? value : fallback;
    };
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
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


    // Status update dialog
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState<OfferRequestStatus>('Requested');
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
            const fallback = translate('offerRequests.errors.loadFailed', 'Failed to load offer requests');
            setError(err.message || fallback);
            toast.error(err.message || fallback);
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
            const fallback = translate('offerRequests.errors.loadAssignedFailed', 'Failed to load assigned requests');
            setError(err.message || fallback);
            toast.error(err.message || fallback);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOfferRequests();
    }, [statusFilter]);

    // Handle URL parameter for direct navigation from notification
    useEffect(() => {
        const requestIdFromUrl = searchParams.get('requestId');
        if (requestIdFromUrl && offerRequests.length > 0) {
            const request = offerRequests.find(
                (req) => req.id.toString() === requestIdFromUrl
            );
            if (request) {
                setSelectedRequest(request);
                setShowDetailsDialog(true);
                // Clear the URL parameter after opening the dialog
                searchParams.delete('requestId');
                setSearchParams(searchParams);
                toast.success(translate('offerRequests.messages.openFromNotification', 'Opening request from notification'));
            }
        }
    }, [searchParams, offerRequests, setSearchParams]);

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

    // Assign to myself
    const handleAssignToMyself = async (request: OfferRequest) => {
        if (!user?.id) {
            toast.error(translate('common.errors.userIdMissing', 'User ID not found'));
            return;
        }

        try {
            await salesApi.assignOfferRequest(request.id, {
                assignedTo: user.id,
            });
            toast.success(translate('offerRequests.messages.assignedToYou', 'Request assigned to you successfully'));
            loadOfferRequests();
        } catch (err: any) {
            const fallback = translate('offerRequests.errors.assignFailed', 'Failed to assign request');
            toast.error(err.message || fallback);
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
            toast.success(translate('offerRequests.messages.statusUpdated', 'Status updated successfully'));
            setShowStatusDialog(false);
            setNewStatus('Requested');
            setStatusNotes('');
            loadOfferRequests();
            setSelectedRequest(null);
        } catch (err: any) {
            const fallback = translate('offerRequests.errors.statusUpdateFailed', 'Failed to update status');
            toast.error(err.message || fallback);
        }
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
            case 'Requested':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
            case 'Assigned':
                return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700';
            case 'InProgress':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
            case 'Ready':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
            case 'Sent':
                return 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-700';
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
        requested: offerRequests.filter((r) => r.status === 'Requested').length,
        assigned: offerRequests.filter((r) => r.status === 'Assigned').length,
        inProgress: offerRequests.filter((r) => r.status === 'InProgress').length,
        ready: offerRequests.filter((r) => r.status === 'Ready').length,
        sent: offerRequests.filter((r) => r.status === 'Sent').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl shadow-lg p-8 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-white">
                                {translate('offerRequests.headerTitle', 'Offer Requests Management')}
                            </h1>
                            <p className="text-blue-100 dark:text-blue-200 text-lg">
                                {translate('offerRequests.headerSubtitle', 'Manage and track offer requests from salesmen')}
                            </p>
                        </div>
                        <Button
                            onClick={loadOfferRequests}
                            variant="outline"
                            className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
                        >
                            <ArrowPathIcon className="h-5 w-5 mr-2" />
                            {translate('common.refresh', 'Refresh')}
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {translate('offerRequests.stats.total', 'Total')}
                                    </p>
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
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {translate('offerRequests.stats.requested', 'Requested')}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {stats.requested}
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
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {translate('offerRequests.stats.assigned', 'Assigned')}
                                    </p>
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
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {translate('offerRequests.stats.inProgress', 'In Progress')}
                                    </p>
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
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {translate('offerRequests.stats.ready', 'Ready')}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {stats.ready}
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
                                    placeholder={translate('offerRequests.searchPlaceholder', 'Search by client, salesman, products, or ID...')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <FunnelIcon className="h-5 w-5 text-gray-400" />
                                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder={translate('offerRequests.filters.statusPlaceholder', 'Filter by status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{translate('offerRequests.status.all', 'All Statuses')}</SelectItem>
                                        <SelectItem value="Requested">{translate('offerRequests.status.requested', 'Requested')}</SelectItem>
                                        <SelectItem value="Assigned">{translate('offerRequests.status.assigned', 'Assigned')}</SelectItem>
                                        <SelectItem value="InProgress">{translate('offerRequests.status.inProgress', 'In Progress')}</SelectItem>
                                        <SelectItem value="Ready">{translate('offerRequests.status.ready', 'Ready')}</SelectItem>
                                        <SelectItem value="Sent">{translate('offerRequests.status.sent', 'Sent')}</SelectItem>
                                        <SelectItem value="Cancelled">{translate('offerRequests.status.cancelled', 'Cancelled')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                variant="outline"
                                onClick={loadAssignedRequests}
                                className="whitespace-nowrap"
                            >
                                {translate('offerRequests.actions.myAssigned', 'My Assigned Requests')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Requests List */}
                <Card>
                    <CardHeader>
                        <CardTitle>{translate('offerRequests.list.title', 'Offer Requests')}</CardTitle>
                        <CardDescription>
                            {translate('offerRequests.list.count', '{{count}} requests found').replace('{{count}}', filteredRequests.length.toString())}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 dark:text-gray-400 mt-4">
                                    {translate('offerRequests.list.loading', 'Loading requests...')}
                                </p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-500 dark:text-red-400">
                                <XCircleIcon className="h-12 w-12 mx-auto mb-4" />
                                <p>{error}</p>
                                <Button onClick={loadOfferRequests} className="mt-4">
                                    {translate('common.retry', 'Retry')}
                                </Button>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <InboxIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    {translate('offerRequests.list.empty', 'No requests found')}
                                </p>
                                {searchQuery && (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                        {translate('offerRequests.list.adjustFilters', 'Try adjusting your search or filters')}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredRequests.map((request) => (
                                    <Card
                                        key={request.id}
                                        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.02] hover:shadow-xl transition-all duration-200"
                                    >
                                        <CardContent className="p-5 md:p-6 space-y-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                        {`${translate('offerRequests.card.requestLabel', 'Request #')}${request.id}`}
                                                    </p>
                                                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-primary" />
                                                        {request.clientName}
                                                    </h3>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                                                    {request.priority && (
                                                        <Badge className={getPriorityColor(request.priority)} variant="outline">
                                                            {request.priority}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 p-4 border border-slate-100 dark:border-slate-800">
                                                <p className="text-xs font-medium text-muted-foreground uppercase mb-1 flex items-center gap-2">
                                                    <ClipboardList className="h-4 w-4 text-primary" />
                                                    {translate('offerRequests.card.requestedProducts', 'Requested Products')}
                                                </p>
                                                <p className="text-sm text-foreground">{request.requestedProducts || 'N/A'}</p>
                                            </div>

                                            {request.specialNotes && (
                                                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 p-4 border border-amber-100 dark:border-amber-900/40">
                                                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300 uppercase mb-1 flex items-center gap-2">
                                                        <StickyNote className="h-4 w-4" />
                                                        {translate('offerRequests.card.notes', 'Notes')}
                                                    </p>
                                                    <p className="text-sm text-amber-900 dark:text-amber-100">{request.specialNotes}</p>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-3 text-xs">
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                                    <User className="h-4 w-4" />
                                                    <span>
                                                        {translate('offerRequests.card.requestedBy', 'Requested by')}{' '}
                                                        <strong>{request.requestedByName}</strong>
                                                    </span>
                                                </div>
                                                {request.requestDate && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                                        <CalendarClock className="h-4 w-4" />
                                                        <span>
                                                            {format(new Date(request.requestDate), 'MMM dd, yyyy HH:mm')}
                                                        </span>
                                                    </div>
                                                )}
                                                {request.assignedToName && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                                        <UserPlusIcon className="h-4 w-4" />
                                                        <span>
                                                            {translate('offerRequests.card.assignedTo', 'Assigned to')}{' '}
                                                            <strong>{request.assignedToName}</strong>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end gap-2 pt-4 border-t border-dashed dark:border-gray-800">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowDetailsDialog(true);
                                                    }}
                                                    className="text-primary hover:text-primary/80 gap-2"
                                                >
                                                    {translate('offerRequests.actions.viewDetails', 'View Details')}
                                                </Button>
                                                {request.status === 'Requested' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-purple-600 hover:bg-purple-700"
                                                        onClick={() => handleAssignToMyself(request)}
                                                    >
                                                        <UserPlusIcon className="h-4 w-4 mr-2" />
                                                        {translate('offerRequests.actions.assignToMe', 'Assign to Me')}
                                                    </Button>
                                                )}
                                                {!request.createdOfferId && 
                                                    request.status !== 'Cancelled' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        onClick={() => {
                                                            navigate(`/sales-support/offer?requestId=${request.id}`);
                                                        }}
                                                    >
                                                        <ClipboardList className="h-4 w-4 mr-2" />
                                                        {translate('offerRequests.actions.createOffer', 'Create Offer')}
                                                    </Button>
                                                )}
                                                {request.status !== 'Ready' &&
                                                    request.status !== 'Sent' &&
                                                    request.status !== 'Cancelled' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openStatusDialog(request)}
                                                            className="gap-2"
                                                        >
                                                            <ArrowPathIcon className="h-4 w-4" />
                                                            {translate('offerRequests.actions.updateStatus', 'Update Status')}
                                                        </Button>
                                                    )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Details Dialog */}
                <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {`${translate('offerRequests.details.title', 'Offer Request Details')} #${selectedRequest?.id ?? ''}`}
                            </DialogTitle>
                            <DialogDescription>
                                {translate('offerRequests.details.subtitle', 'Complete information about this offer request')}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                                        <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">
                                            {translate('offerRequests.details.status', 'Status')}
                                        </p>
                                        <Badge className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge>
                                    </div>
                                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                                        <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">
                                            {translate('offerRequests.details.priority', 'Priority')}
                                        </p>
                                        {selectedRequest.priority ? (
                                            <Badge className={getPriorityColor(selectedRequest.priority)}>
                                                {selectedRequest.priority}
                                            </Badge>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">N/A</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-muted-foreground">
                                        {translate('offerRequests.details.client', 'Client')}
                                    </p>
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-transparent">
                                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                            <Building className="h-4 w-4 text-primary" />
                                            {selectedRequest.clientName}
                                        </h3>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                        <ClipboardList className="h-4 w-4 text-primary" />
                                        {translate('offerRequests.card.requestedProducts', 'Requested Products')}
                                    </p>
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/40">
                                        <p className="text-sm text-foreground whitespace-pre-line">
                                            {selectedRequest.requestedProducts || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {(selectedRequest.specialNotes || selectedRequest.followUpNotes) && (
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                            <StickyNote className="h-4 w-4 text-amber-500" />
                                            {translate('offerRequests.card.notes', 'Notes')}
                                        </p>
                                        {selectedRequest.specialNotes && (
                                            <div className="rounded-xl border border-amber-100 dark:border-amber-900/40 p-4 bg-amber-50 dark:bg-amber-900/10">
                                                <p className="text-xs uppercase text-amber-700 dark:text-amber-200 font-semibold mb-1">
                                                    {translate('offerRequests.details.specialNotes', 'Special Notes')}
                                                </p>
                                                <p className="text-sm text-amber-900 dark:text-amber-100">
                                                    {selectedRequest.specialNotes}
                                                </p>
                                            </div>
                                        )}
                                        {selectedRequest.followUpNotes && (
                                            <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 p-4 bg-blue-50 dark:bg-blue-900/10">
                                                <p className="text-xs uppercase text-blue-700 dark:text-blue-200 font-semibold mb-1">
                                                    {translate('offerRequests.details.followUpNotes', 'Follow-up Notes')}
                                                </p>
                                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                                    {selectedRequest.followUpNotes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent">
                                        <p className="text-xs uppercase text-muted-foreground font-semibold">
                                            {translate('offerRequests.details.requestedBy', 'Requested By')}
                                        </p>
                                        <p className="text-base font-semibold text-foreground flex items-center gap-2 mt-1">
                                            <User className="h-4 w-4 text-primary" />
                                            {selectedRequest.requestedByName}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent">
                                        <p className="text-xs uppercase text-muted-foreground font-semibold">
                                            {translate('offerRequests.details.requestDate', 'Request Date')}
                                        </p>
                                        <p className="text-sm text-foreground mt-1 flex items-center gap-2">
                                            <CalendarClock className="h-4 w-4 text-primary" />
                                            {selectedRequest.requestDate
                                                ? format(new Date(selectedRequest.requestDate), 'MMM dd, yyyy HH:mm')
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {selectedRequest.assignedToName && (
                                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                                        <p className="text-xs uppercase text-muted-foreground font-semibold">
                                            {translate('offerRequests.details.assignedTo', 'Assigned To')}
                                        </p>
                                        <p className="text-sm text-foreground mt-1 flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary" />
                                            {selectedRequest.assignedToName}
                                        </p>
                                    </div>
                                )}

                                {selectedRequest.createdOfferId && (
                                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                                        <p className="text-xs uppercase text-muted-foreground font-semibold">
                                            {translate('offerRequests.details.createdOfferId', 'Created Offer ID')}
                                        </p>
                                        <p className="text-sm text-foreground mt-1">#{selectedRequest.createdOfferId}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                                {translate('common.close', 'Close')}
                            </Button>
                            {selectedRequest?.status === 'Requested' && (
                                <Button onClick={() => {
                                    setShowDetailsDialog(false);
                                    handleAssignToMyself(selectedRequest);
                                }}>
                                    {translate('offerRequests.actions.assignToMe', 'Assign to Me')}
                                </Button>
                            )}
                            {selectedRequest && 
                                !selectedRequest.createdOfferId && 
                                selectedRequest.status !== 'Cancelled' && (
                                <Button 
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => {
                                        setShowDetailsDialog(false);
                                        navigate(`/sales-support/offer?requestId=${selectedRequest.id}`);
                                    }}
                                >
                                    <ClipboardList className="h-4 w-4 mr-2" />
                                    {translate('offerRequests.actions.createOffer', 'Create Offer')}
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Status Update Dialog */}
                <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{translate('offerRequests.statusDialog.title', 'Update Request Status')}</DialogTitle>
                            <DialogDescription>
                                {`${translate('offerRequests.statusDialog.description', 'Update the status of request')} #${selectedRequest?.id ?? ''}`}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>{translate('offerRequests.statusDialog.newStatus', 'New Status')}</Label>
                                <Select
                                    value={newStatus}
                                    onValueChange={(value) => setNewStatus(value as OfferRequestStatus)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Requested">Requested</SelectItem>
                                        <SelectItem value="Assigned">Assigned</SelectItem>
                                        <SelectItem value="InProgress">In Progress</SelectItem>
                                        <SelectItem value="Ready">Ready</SelectItem>
                                        <SelectItem value="Sent">Sent</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{translate('offerRequests.statusDialog.notesLabel', 'Notes (Optional)')}</Label>
                                <Textarea
                                    value={statusNotes}
                                    onChange={(e) => setStatusNotes(e.target.value)}
                                    placeholder={translate('offerRequests.statusDialog.notesPlaceholder', 'Add notes about this status update...')}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                                {translate('common.cancel', 'Cancel')}
                            </Button>
                            <Button onClick={handleUpdateStatus}>
                                {translate('offerRequests.actions.updateStatus', 'Update Status')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
