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
	Clock,
	DollarSign,
	FileText,
	User,
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
	offerDetails?: {
		id: number;
		clientName?: string;
		assignedToName?: string;
		createdByName?: string;
		totalAmount?: number;
		products?: string;
		status?: string;
		createdAt?: string;
		updatedAt?: string;
	};
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
				// response.data is PaginatedData<T>, so response.data.data is the actual array
				let dealsData = Array.isArray(response.data.data)
					? response.data.data
					: Array.isArray(response.data)
						? response.data
						: [];

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

				// Pagination metadata is in response.data (PaginatedData structure)
				const paginationData = response.data;
				if (paginationData && typeof paginationData === 'object' && 'totalCount' in paginationData) {
					setPagination((prev) => ({
						...prev,
						totalCount: paginationData.totalCount || dealsData.length,
						totalPages: paginationData.totalPages || 1,
						hasPreviousPage: paginationData.hasPreviousPage || false,
						hasNextPage: paginationData.hasNextPage || false,
					}));
				} else {
					// Fallback if structure is different
					setPagination((prev) => ({
						...prev,
						totalCount: dealsData.length,
						totalPages: 1,
						hasPreviousPage: false,
						hasNextPage: false,
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
				const dealData = response.data;
				if (!dealData.offerId) {
					setSelectedDeal(dealData);
					setShowDetailsModal(true);
					return;
				}

				try {
					const offerResponse = await salesApi.getOffer(dealData.offerId.toString());
					if (offerResponse.success && offerResponse.data) {
						dealData.offerDetails = offerResponse.data;
					}
				} catch (offerError) {
					console.warn('Failed to load offer details for deal', deal.id, offerError);
				}

				setSelectedDeal(dealData);
				setShowDetailsModal(true);
			}
		} catch (err: any) {
			console.error('Failed to load deal details:', err);
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
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{filteredDeals.map((deal) => (
									<Card
										key={deal.id}
										className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02] hover:shadow-xl transition-all duration-200"
									>
										<CardContent className="p-5 md:p-6 space-y-4">
											<div className="flex items-center justify-between gap-3">
												<div className="flex items-center gap-3">
													{getStatusBadge(deal.status)}
													<div className="text-xs uppercase tracking-wide text-muted-foreground">
														Deal #{deal.id}
													</div>
												</div>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleViewDetails(deal)}
													className="gap-1"
												>
													<Eye className="h-4 w-4" />
													View
												</Button>
											</div>

											<div className="space-y-2">
												<p className="text-sm text-muted-foreground">Client</p>
												<div className="flex items-center gap-2">
													<User className="h-4 w-4 text-primary" />
													<p className="text-lg font-semibold text-foreground">
														{deal.clientName || 'Unknown Client'}
													</p>
												</div>
											</div>

											<div className="grid grid-cols-2 gap-4 text-sm">
												<div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3 border border-emerald-100 dark:border-emerald-900/40">
													<p className="text-xs text-emerald-700 dark:text-emerald-300">Deal Value</p>
													<p className="mt-1 text-xl font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
														<DollarSign className="h-4 w-4" />
														{new Intl.NumberFormat('en-US', {
															style: 'currency',
															currency: 'EGP',
															maximumFractionDigits: 0,
														}).format(deal.totalValue || deal.dealValue || 0)}
													</p>
												</div>
												<div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-100 dark:border-blue-900/40">
													<p className="text-xs text-blue-700 dark:text-blue-300">Salesman</p>
													<p className="mt-1 font-semibold text-blue-900 dark:text-blue-100">
														{deal.salesmanName || deal.createdByName || 'Unknown'}
													</p>
													<p className="text-xs text-blue-600/80 dark:text-blue-300/70">
														Created {format(new Date(deal.createdAt), 'MMM dd, yyyy')}
													</p>
												</div>
											</div>

											<div className="flex flex-wrap gap-3 text-xs">
												<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
													<Clock className="h-4 w-4 text-slate-500" />
													<span>
														Manager:{' '}
														<strong>
															{deal.managerApprovedAt
																? format(new Date(deal.managerApprovedAt), 'MMM dd, yyyy')
																: deal.managerRejectionReason
																	? `Rejected (${deal.managerRejectionReason})`
																	: 'Pending'}
														</strong>
													</span>
												</div>
												<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
													<Clock className="h-4 w-4 text-slate-500" />
													<span>
														Super Admin:{' '}
														<strong>
															{deal.superAdminApprovedAt
																? format(new Date(deal.superAdminApprovedAt), 'MMM dd, yyyy')
																: deal.superAdminRejectionReason
																	? `Rejected (${deal.superAdminRejectionReason})`
																	: 'Pending'}
														</strong>
													</span>
												</div>
												{deal.closedDate && (
													<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
														<CheckCircle2 className="h-4 w-4 text-emerald-500" />
														<span>
															Closed:{' '}
															<strong>
																{format(new Date(deal.closedDate), 'MMM dd, yyyy')}
															</strong>
														</span>
													</div>
												)}
											</div>

											{deal.failureNotes && (
												<div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 p-3 text-sm text-red-800 dark:text-red-100">
													<p className="font-semibold mb-1">Failure Notes</p>
													<p className="line-clamp-2">{deal.failureNotes}</p>
												</div>
											)}
											{deal.completionNotes && !deal.failureNotes && (
												<div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/10 p-3 text-sm text-emerald-900 dark:text-emerald-100">
													<p className="font-semibold mb-1">Completion Notes</p>
													<p className="line-clamp-2">{deal.completionNotes}</p>
												</div>
											)}

											<div className="flex justify-end">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleViewDetails(deal)}
													className="text-primary hover:text-primary/80 gap-2"
												>
													<Eye className="h-4 w-4" />
													View Timeline
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
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-3">
									<div>
										<p className="text-sm text-muted-foreground">Deal ID</p>
										<p className="font-semibold text-lg">{selectedDeal.id}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Client</p>
										<p className="font-semibold">{selectedDeal.clientName}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Deal Value</p>
										<p className="font-semibold flex items-center gap-1 text-emerald-600 text-lg">
											<DollarSign className="h-4 w-4" />
											{(selectedDeal.totalValue || selectedDeal.dealValue)?.toLocaleString('en-US', {
												maximumFractionDigits: 0,
											}) || 'N/A'}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Created At</p>
										<p className="font-semibold">
											{format(new Date(selectedDeal.createdAt), 'MMM dd, yyyy')}
										</p>
									</div>
								</div>

								<div className="space-y-3">
									<div>
										<p className="text-sm text-muted-foreground">Status</p>
										<div className="mt-1">{getStatusBadge(selectedDeal.status)}</div>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Salesman</p>
										<p className="font-semibold">{selectedDeal.salesmanName || selectedDeal.createdByName || 'Unknown'}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Approvals</p>
										<div className="space-y-1 text-sm">
											<p>
												<strong>Manager:</strong>{' '}
												{selectedDeal.managerApprovedByName
													? `Approved by ${selectedDeal.managerApprovedByName} on ${selectedDeal.managerApprovedAt
														? format(new Date(selectedDeal.managerApprovedAt), 'MMM dd, yyyy')
														: 'N/A'
													}`
													: selectedDeal.managerRejectionReason
														? `Rejected (${selectedDeal.managerRejectionReason})`
														: 'Pending'}
											</p>
											<p>
												<strong>Super Admin:</strong>{' '}
												{selectedDeal.superAdminApprovedByName
													? `Approved by ${selectedDeal.superAdminApprovedByName} on ${selectedDeal.superAdminApprovedAt
														? format(new Date(selectedDeal.superAdminApprovedAt), 'MMM dd, yyyy')
														: 'N/A'
													}`
													: selectedDeal.superAdminRejectionReason
														? `Rejected (${selectedDeal.superAdminRejectionReason})`
														: 'Pending'}
											</p>
										</div>
									</div>
								</div>
							</div>

							{selectedDeal.expectedDeliveryDate && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-muted-foreground">Expected Delivery Date</p>
										<p className="font-semibold">
											{format(new Date(selectedDeal.expectedDeliveryDate), 'MMM dd, yyyy')}
										</p>
									</div>
									{selectedDeal.closedDate && (
										<div>
											<p className="text-sm text-muted-foreground">Closed Date</p>
											<p className="font-semibold">
												{format(new Date(selectedDeal.closedDate), 'MMM dd, yyyy')}
											</p>
										</div>
									)}
								</div>
							)}

							{(selectedDeal.completionNotes || selectedDeal.failureNotes) && (
								<div className="rounded-lg border border-muted p-4 bg-muted/30">
									<p className="text-sm text-muted-foreground mb-2">
										{selectedDeal.failureNotes ? 'Failure Notes' : 'Completion Notes'}
									</p>
									<p className="text-sm">{selectedDeal.failureNotes || selectedDeal.completionNotes}</p>
								</div>
							)}

							{selectedDeal.offerDetails && (
								<div className="border rounded-xl p-4 space-y-3">
									<h3 className="text-lg font-semibold flex items-center gap-2">
										<FileText className="h-4 w-4 text-primary" />
										Linked Offer
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
										<div>
											<p className="text-muted-foreground">Offer ID</p>
											<p className="font-semibold">#{selectedDeal.offerDetails.id}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Offer Value</p>
											<p className="font-semibold">
												EGP {(selectedDeal.offerDetails.totalAmount || 0).toLocaleString('en-US', {
													maximumFractionDigits: 0,
												})}
											</p>
										</div>
										<div>
											<p className="text-muted-foreground">Status</p>
											<p className="font-semibold">{selectedDeal.offerDetails.status || 'N/A'}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Assigned To</p>
											<p className="font-semibold">{selectedDeal.offerDetails.assignedToName || 'N/A'}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Created By</p>
											<p className="font-semibold">{selectedDeal.offerDetails.createdByName || 'N/A'}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Created At</p>
											<p className="font-semibold">
												{selectedDeal.offerDetails.createdAt
													? format(new Date(selectedDeal.offerDetails.createdAt), 'MMM dd, yyyy')
													: 'N/A'}
											</p>
										</div>
									</div>
									{selectedDeal.offerDetails.products && (
										<div>
											<p className="text-sm text-muted-foreground mb-1">Products</p>
											<p className="text-sm whitespace-pre-line">
												{selectedDeal.offerDetails.products}
											</p>
										</div>
									)}
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

