/**
 * Approval Queue Component
 * 
 * Lists all PendingApproval visits (from SalesSupport)
 * Allows Managers to Approve (→ Scheduled) or Reject (→ Cancelled)
 * 
 * Protected route: MaintenanceManager, SuperAdmin
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { API_ENDPOINTS } from '@/services/shared/endpoints';
import { getAuthToken } from '@/utils/authUtils';
import { getApiBaseUrl } from '@/utils/apiConfig';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { MaintenanceVisitResponseDTO } from '@/types/maintenance.types';

export const ApprovalQueue: React.FC = () => {
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [selectedVisit, setSelectedVisit] = useState<MaintenanceVisitResponseDTO | null>(null);
	const [rejectReason, setRejectReason] = useState('');

	// Fetch pending approval visits
	const { data: visitsData, isLoading } = useQuery({
		queryKey: ['pendingApprovalVisits'],
		queryFn: async () => {
			const token = getAuthToken();
			const response = await fetch(
				`${getApiBaseUrl()}${API_ENDPOINTS.MAINTENANCE.VISIT.PENDING_APPROVAL}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) throw new Error('Failed to fetch pending visits');
			const result = await response.json();
			return result.data as MaintenanceVisitResponseDTO[];
		},
		enabled: !!user,
	});

	// Approve visit mutation
	const approveMutation = useMutation({
		mutationFn: async (visitId: number) => {
			const token = getAuthToken();
			const response = await fetch(
				`${getApiBaseUrl()}${API_ENDPOINTS.MAINTENANCE.VISIT.APPROVE(visitId)}`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to approve visit');
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success('Visit approved successfully');
			queryClient.invalidateQueries({ queryKey: ['pendingApprovalVisits'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to approve visit');
		},
	});

	// Reject visit mutation
	const rejectMutation = useMutation({
		mutationFn: async ({ visitId, reason }: { visitId: number; reason: string }) => {
			const token = getAuthToken();
			const response = await fetch(
				`${getApiBaseUrl()}${API_ENDPOINTS.MAINTENANCE.VISIT.REJECT(visitId)}`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ reason }),
				}
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to reject visit');
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success('Visit rejected');
			queryClient.invalidateQueries({ queryKey: ['pendingApprovalVisits'] });
			setRejectDialogOpen(false);
			setRejectReason('');
			setSelectedVisit(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to reject visit');
		},
	});

	const handleApprove = (visitId: number) => {
		approveMutation.mutate(visitId);
	};

	const handleReject = (visit: MaintenanceVisitResponseDTO) => {
		setSelectedVisit(visit);
		setRejectDialogOpen(true);
	};

	const confirmReject = () => {
		if (!selectedVisit) return;
		if (!rejectReason.trim()) {
			toast.error('Please provide a rejection reason');
			return;
		}
		rejectMutation.mutate({ visitId: selectedVisit.id, reason: rejectReason });
	};

	const visits = visitsData || [];

	return (
		<div className="container mx-auto p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ClockIcon className="h-6 w-6" />
						Approval Queue
					</CardTitle>
					<CardDescription>
						Review and approve maintenance visits created by Sales Support
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8">Loading pending approvals...</div>
					) : visits.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No visits pending approval
						</div>
					) : (
						<div className="space-y-4">
							{visits.map((visit) => (
								<Card key={visit.id} className="hover:shadow-md transition-shadow">
									<CardContent className="pt-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<h3 className="font-semibold text-lg">
														{visit.ticketNumber || `Visit #${visit.id}`}
													</h3>
													<Badge variant="outline" className="bg-yellow-50">
														Pending Approval
													</Badge>
												</div>
												<div className="grid grid-cols-2 gap-4 mt-4">
													<div>
														<p className="text-sm font-medium text-muted-foreground">Customer</p>
														<p className="text-sm">{visit.customerName}</p>
													</div>
													<div>
														<p className="text-sm font-medium text-muted-foreground">Device</p>
														<p className="text-sm">{visit.deviceName}</p>
													</div>
													<div>
														<p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
														<p className="text-sm">
															{format(new Date(visit.scheduledDate), 'PPP p')}
														</p>
													</div>
													<div>
														<p className="text-sm font-medium text-muted-foreground">Origin</p>
														<p className="text-sm">{visit.origin}</p>
													</div>
												</div>
											</div>
											<div className="flex gap-2 ml-4">
												<Button
													variant="default"
													size="sm"
													onClick={() => handleApprove(visit.id)}
													disabled={approveMutation.isPending}
													className="flex items-center gap-1"
												>
													<CheckCircleIcon className="h-4 w-4" />
													Approve
												</Button>
												<Button
													variant="destructive"
													size="sm"
													onClick={() => handleReject(visit)}
													disabled={rejectMutation.isPending}
													className="flex items-center gap-1"
												>
													<XCircleIcon className="h-4 w-4" />
													Reject
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Reject Dialog */}
			<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Visit</DialogTitle>
						<DialogDescription>
							Please provide a reason for rejecting this visit. The visit will be cancelled.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div>
							<Label htmlFor="rejectReason">Rejection Reason *</Label>
							<Textarea
								id="rejectReason"
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								placeholder="Enter reason for rejection..."
								rows={4}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmReject}
							disabled={rejectMutation.isPending || !rejectReason.trim()}
						>
							Confirm Reject
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

