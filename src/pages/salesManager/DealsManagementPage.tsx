import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	Eye,
	ChevronLeft,
	ChevronRight,
	Filter,
	RefreshCw,
	Search,
	CheckCircle2,
	XCircle,
	Clock,
	DollarSign,
} from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorDisplay, PageHeader } from '@/components/shared';
import { useAuthStore } from '@/stores/authStore';
import { salesApi } from '@/services/sales/salesApi';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';
import { usePerformance } from '@/hooks/usePerformance';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Deal {
	id: string;
	offerId?: string;
	clientId: string;
	clientName: string;
	dealValue: number;
	totalValue?: number;
	salesmanId: string;
	salesmanName: string;
	status: 'PendingManagerApproval' | 'PendingSuperAdminApproval' | 'Approved' | 'Success' | 'Failed' | 'Rejected' | 'RejectedByManager' | 'RejectedBySuperAdmin' | 'SentToLegal';
	createdAt: string;
	closedDate?: string;
	managerApprovedAt?: string;
	managerApprovedBy?: string;
	managerApprovedByName?: string;
	managerRejectionReason?: string;
	managerComments?: string;
	superAdminApprovedAt?: string;
	superAdminApprovedBy?: string;
	superAdminApprovedByName?: string;
	superAdminRejectionReason?: string;
	superAdminComments?: string;
	completionNotes?: string;
	failureNotes?: string;
	expectedDeliveryDate?: string;
	// Legacy fields for backward compatibility
	createdByName?: string;
	dealDescription?: string;
	expectedCloseDate?: string;
}

interface Salesman {
	id: string;
	firstName: string;
	lastName: string;
	userName: string;
}

const DealsManagementPage: React.FC = () => {
	usePerformance('DealsManagementPage');
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [deals, setDeals] = useState<Deal[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState({
		page: 1,
		pageSize: 10,
		totalCount: 0,
		totalPages: 0,
		hasPreviousPage: false,
		hasNextPage: false,
	});

	// Filters
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [salesmanFilter, setSalesmanFilter] = useState<string>('all');
	const [salesmen, setSalesmen] = useState<Salesman[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);

	const loadSalesmen = useCallback(async () => {
		if (!user?.token) return;

		try {
			const response = await salesApi.getOfferSalesmen();
			if (response.success && response.data) {
				const transformedSalesmen = response.data.map((salesman: any) => ({
					id: salesman.id,
					firstName: salesman.firstName,
					lastName: salesman.lastName,
					userName: salesman.userName,
				}));
				setSalesmen(transformedSalesmen);
			}
		} catch (err) {
			console.error('Failed to load salesmen:', err);
		}
	}, [user?.token]);

	const loadDeals = useCallback(async () => {
		if (!user?.token) return;

		try {
			setLoading(true);
			setError(null);

			const filters: any = {
				page: pagination.page,
				pageSize: pagination.pageSize,
			};

			if (statusFilter !== 'all') {
				filters.status = statusFilter;
			}

			const response = await salesApi.getDeals(filters);
			if (response.success && response.data) {
				let dealsData = response.data;

				// Filter by salesman if selected
				if (salesmanFilter !== 'all') {
					dealsData = dealsData.filter((deal: Deal) => deal.salesmanId === salesmanFilter);
				}

				// Filter by search query
				if (searchQuery.trim()) {
					const query = searchQuery.toLowerCase();
					dealsData = dealsData.filter(
						(deal: Deal) =>
							deal.clientName?.toLowerCase().includes(query) ||
							deal.salesmanName?.toLowerCase().includes(query) ||
							deal.completionNotes?.toLowerCase().includes(query) ||
							deal.failureNotes?.toLowerCase().includes(query) ||
							deal.id?.toString().toLowerCase().includes(query)
					);
				}

				setDeals(dealsData);
				if (response.meta) {
					setPagination((prev) => ({
						...prev,
						totalCount: response.meta.totalCount || dealsData.length,
						totalPages: response.meta.totalPages || 1,
						hasPreviousPage: response.meta.hasPreviousPage || false,
						hasNextPage: response.meta.hasNextPage || false,
					}));
				}
			} else {
				setError(response.message || 'Failed to load deals');
			}
		} catch (err: any) {
			console.error('Failed to load deals:', err);
			setError(err.message || 'Failed to load deals');
			toast.error('Failed to load deals');
		} finally {
			setLoading(false);
		}
	}, [user?.token, pagination.page, pagination.pageSize, statusFilter, salesmanFilter, searchQuery]);

	useEffect(() => {
		loadSalesmen();
	}, [loadSalesmen]);

	useEffect(() => {
		loadDeals();
	}, [loadDeals]);

	const getStatusBadge = (status: string) => {
		const statusConfig: Record<string, { label: string; className: string }> = {
			PendingManagerApproval: { label: 'Pending Approval', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
			PendingSuperAdminApproval: { label: 'Pending Super Admin', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
			Approved: { label: 'Approved', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
			Success: { label: 'Success', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
			Failed: { label: 'Failed', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
			Rejected: { label: 'Rejected', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
		};

		const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
		return <Badge className={config.className}>{config.label}</Badge>;
	};

	const handleViewDetails = async (deal: Deal) => {
		try {
			const response = await salesApi.getDeal(deal.id);
			if (response.success && response.data) {
				setSelectedDeal(response.data);
				setShowDetailsModal(true);
			}
		} catch (err: any) {
			toast.error('Failed to load deal details');
		}
	};

	const handlePageChange = (newPage: number) => {
		setPagination((prev) => ({ ...prev, page: newPage }));
	};

	const handleRefresh = () => {
		loadDeals();
	};

	const filteredDeals = deals;

	return (
		<div className="space-y-6">
			<PageHeader
				title="Deals Management"
				description="View and manage all deals created by salesmen"
			/>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filters
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Search deals..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger>
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="PendingManagerApproval">Pending Approval</SelectItem>
								<SelectItem value="PendingSuperAdminApproval">Pending Super Admin</SelectItem>
								<SelectItem value="Approved">Approved</SelectItem>
								<SelectItem value="Success">Success</SelectItem>
								<SelectItem value="Failed">Failed</SelectItem>
								<SelectItem value="Rejected">Rejected</SelectItem>
							</SelectContent>
						</Select>
						<Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
							<SelectTrigger>
								<SelectValue placeholder="Filter by salesman" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Salesmen</SelectItem>
								{salesmen.map((salesman) => (
									<SelectItem key={salesman.id} value={salesman.id}>
										{salesman.firstName} {salesman.lastName}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button onClick={handleRefresh} variant="outline" className="w-full">
							<RefreshCw className="h-4 w-4 mr-2" />
							Refresh
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Deals List */}
			<Card>
				<CardHeader>
					<CardTitle>All Deals ({pagination.totalCount})</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<LoadingSpinner />
					) : error ? (
						<ErrorDisplay message={error} />
					) : filteredDeals.length === 0 ? (
						<EmptyState
							title="No deals found"
							description="There are no deals matching your filters."
						/>
					) : (
						<>
							<div className="space-y-4">
								{filteredDeals.map((deal) => (
									<Card key={deal.id} className="hover:shadow-md transition-shadow">
										<CardContent className="p-6">
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-3">
														{getStatusBadge(deal.status)}
														<span className="text-sm text-muted-foreground">
															ID: {deal.id}
														</span>
													</div>
													<h3 className="text-lg font-semibold mb-2">{deal.salesmanName || deal.createdByName || 'Unknown Salesman'}</h3>
													{(deal.completionNotes || deal.failureNotes) && (
														<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
															{deal.failureNotes || deal.completionNotes}
														</p>
													)}
													<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
														<div>
															<p className="text-muted-foreground">Deal Value</p>
															<p className="font-semibold flex items-center gap-1">
																<DollarSign className="h-4 w-4" />
																{(deal.totalValue || deal.dealValue)?.toLocaleString() || 'N/A'}
															</p>
														</div>
														<div>
															<p className="text-muted-foreground">Client</p>
															<p className="font-semibold">{deal.clientName || 'N/A'}</p>
														</div>
														<div>
															<p className="text-muted-foreground">Created At</p>
															<p className="font-semibold">
																{format(new Date(deal.createdAt), 'MMM dd, yyyy')}
															</p>
														</div>
													</div>
												</div>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleViewDetails(deal)}
													className="ml-4"
												>
													<Eye className="h-4 w-4 mr-2" />
													View Details
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>

							{/* Pagination */}
							{pagination.totalPages > 1 && (
								<div className="flex items-center justify-between mt-6 pt-4 border-t">
									<div className="text-sm text-muted-foreground">
										Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePageChange(pagination.page - 1)}
											disabled={!pagination.hasPreviousPage}
										>
											<ChevronLeft className="h-4 w-4" />
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePageChange(pagination.page + 1)}
											disabled={!pagination.hasNextPage}
										>
											Next
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* Deal Details Modal */}
			<Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Deal Details</DialogTitle>
					</DialogHeader>
					{selectedDeal && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">Deal ID</p>
									<p className="font-semibold">{selectedDeal.id}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Status</p>
									{getStatusBadge(selectedDeal.status)}
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Client</p>
									<p className="font-semibold">{selectedDeal.clientName}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Deal Value</p>
									<p className="font-semibold flex items-center gap-1">
										<DollarSign className="h-4 w-4" />
										{(selectedDeal.totalValue || selectedDeal.dealValue)?.toLocaleString() || 'N/A'}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Salesman</p>
									<p className="font-semibold">{selectedDeal.salesmanName || selectedDeal.createdByName || 'Unknown'}</p>
								</div>
							</div>
							{(selectedDeal.completionNotes || selectedDeal.failureNotes) && (
								<div>
									<p className="text-sm text-muted-foreground mb-2">
										{selectedDeal.failureNotes ? 'Failure Notes' : 'Completion Notes'}
									</p>
									<p className="text-sm">{selectedDeal.failureNotes || selectedDeal.completionNotes}</p>
								</div>
							)}
							{selectedDeal.managerApprovedByName && (
								<div>
									<p className="text-sm text-muted-foreground">Manager Approval</p>
									<p className="font-semibold">
										Approved by {selectedDeal.managerApprovedByName} on{' '}
										{selectedDeal.managerApprovedAt
											? format(new Date(selectedDeal.managerApprovedAt), 'MMM dd, yyyy')
											: 'N/A'}
									</p>
								</div>
							)}
							{selectedDeal.completedAt && (
								<div>
									<p className="text-sm text-muted-foreground">Completed At</p>
									<p className="font-semibold">
										{format(new Date(selectedDeal.completedAt), 'MMM dd, yyyy')}
									</p>
								</div>
							)}
							{selectedDeal.failureNotes && (
								<div>
									<p className="text-sm text-muted-foreground">Failure Notes</p>
									<p className="text-sm text-red-600">{selectedDeal.failureNotes}</p>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default DealsManagementPage;

