// Maintenance Support Dashboard Component

import React, { useState, useEffect } from 'react';
import { usePendingRequests, useAssignToEngineer } from '@/hooks/useMaintenanceQueries';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { usePerformance } from '@/hooks/usePerformance';
import { StatusBadge } from './StatusBadge';
import {
	WrenchScrewdriverIcon,
	ClockIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	UserIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { MaintenanceRequestResponseDTO, AssignMaintenanceRequestDTO } from '@/types/maintenance.types';
import { apiRequest } from '@/services/shared/apiClient';
import { API_ENDPOINTS } from '@/services/shared/endpoints';
import { getAuthToken } from '@/utils/authUtils';

interface Engineer {
	id: string;
	userName: string;
	firstName?: string;
	lastName?: string;
	fullName?: string;
}

const MaintenanceSupportDashboard: React.FC = () => {
	usePerformance('MaintenanceSupportDashboard');
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [activeTab, setActiveTab] = useState('pending');
	const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequestResponseDTO | null>(null);
	const [showAssignDialog, setShowAssignDialog] = useState(false);
	const [selectedEngineerId, setSelectedEngineerId] = useState<string>('');
	const [engineers, setEngineers] = useState<Engineer[]>([]);
	const [loadingEngineers, setLoadingEngineers] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	// React Query hooks
	const { data: pendingRequests = [], isLoading, refetch } = usePendingRequests();
	const assignMutation = useAssignToEngineer();

	// Load engineers
	useEffect(() => {
		const loadEngineers = async () => {
			if (!user?.token) return;

			try {
				setLoadingEngineers(true);
				const response = await apiRequest<{ success: boolean; data: Engineer[] }>(
					API_ENDPOINTS.USER.BY_ROLE('Engineer'),
					{ method: 'GET' },
					user.token
				);

				if (response.success && response.data) {
					setEngineers(response.data);
				}
			} catch (error: any) {
				console.error('Failed to load engineers:', error);
				toast.error('Failed to load engineers');
			} finally {
				setLoadingEngineers(false);
			}
		};

		loadEngineers();
	}, [user?.token]);

	// Filter requests
	const filteredRequests = pendingRequests.filter((request) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			request.equipmentName.toLowerCase().includes(query) ||
			request.customerName.toLowerCase().includes(query) ||
			request.description.toLowerCase().includes(query) ||
			request.equipmentQRCode.toLowerCase().includes(query)
		);
	});

	// Handle assign
	const handleAssign = async () => {
		if (!selectedRequest || !selectedEngineerId) {
			toast.error('Please select an engineer');
			return;
		}

		const assignData: AssignMaintenanceRequestDTO = {
			engineerId: selectedEngineerId,
		};

		try {
			await assignMutation.mutateAsync({
				requestId: selectedRequest.id,
				data: assignData,
			});
			setShowAssignDialog(false);
			setSelectedRequest(null);
			setSelectedEngineerId('');
			refetch();
		} catch (error) {
			// Error handled by mutation
		}
	};

	// Get engineer name
	const getEngineerName = (engineerId: string) => {
		const engineer = engineers.find((e) => e.id === engineerId);
		if (!engineer) return 'Unknown';
		return engineer.fullName || `${engineer.firstName || ''} ${engineer.lastName || ''}`.trim() || engineer.userName;
	};

	// Statistics
	const stats = {
		total: pendingRequests.length,
		assigned: pendingRequests.filter((r) => r.assignedToEngineerId).length,
		unassigned: pendingRequests.filter((r) => !r.assignedToEngineerId).length,
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Maintenance Support Dashboard
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-2">
						Manage maintenance requests and assign engineers
					</p>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
									Total Requests
								</p>
								<p className="text-2xl font-bold text-blue-600">{stats.total}</p>
							</div>
							<WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
									Assigned
								</p>
								<p className="text-2xl font-bold text-green-600">{stats.assigned}</p>
							</div>
							<CheckCircleIcon className="h-8 w-8 text-green-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
									Unassigned
								</p>
								<p className="text-2xl font-bold text-orange-600">{stats.unassigned}</p>
							</div>
							<ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Maintenance Requests</CardTitle>
							<CardDescription>
								View and manage pending maintenance requests
							</CardDescription>
						</div>
						<Input
							placeholder="Search requests..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-64"
						/>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8">
							<p className="text-gray-500">Loading requests...</p>
						</div>
					) : filteredRequests.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">No pending requests found</p>
						</div>
					) : (
						<div className="space-y-4">
							{filteredRequests.map((request) => (
								<Card key={request.id} className="hover:shadow-md transition-shadow">
									<CardContent className="p-6">
										<div className="flex items-start justify-between">
											<div className="flex-1 space-y-3">
												<div className="flex items-center gap-3">
													<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
														Request #{request.id}
													</h3>
													<StatusBadge status={request.status} />
													{request.assignedToEngineerId && (
														<Badge variant="outline" className="flex items-center gap-1">
															<UserIcon className="h-3 w-3" />
															{request.assignedToEngineerName || 'Assigned'}
														</Badge>
													)}
												</div>

												<div className="grid grid-cols-2 gap-4 text-sm">
													<div>
														<p className="text-gray-500 dark:text-gray-400">Customer</p>
														<p className="font-medium">{request.customerName}</p>
													</div>
													<div>
														<p className="text-gray-500 dark:text-gray-400">Equipment</p>
														<p className="font-medium">{request.equipmentName}</p>
													</div>
													<div>
														<p className="text-gray-500 dark:text-gray-400">QR Code</p>
														<p className="font-medium">{request.equipmentQRCode}</p>
													</div>
													<div>
														<p className="text-gray-500 dark:text-gray-400">Created</p>
														<p className="font-medium">
															{format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
														</p>
													</div>
												</div>

												<div>
													<p className="text-gray-500 dark:text-gray-400 mb-1">Description</p>
													<p className="text-sm">{request.description}</p>
													{request.symptoms && (
														<div className="mt-2">
															<p className="text-gray-500 dark:text-gray-400 mb-1">
																Symptoms
															</p>
															<p className="text-sm">{request.symptoms}</p>
														</div>
													)}
												</div>

												{request.attachments && request.attachments.length > 0 && (
													<div>
														<p className="text-gray-500 dark:text-gray-400 mb-1">
															Attachments ({request.attachments.length})
														</p>
													</div>
												)}
											</div>

											<div className="flex flex-col gap-2 ml-4">
												{!request.assignedToEngineerId && (
													<Button
														onClick={() => {
															setSelectedRequest(request);
															setShowAssignDialog(true);
														}}
														className="w-full"
													>
														Assign Engineer
													</Button>
												)}
												<Button
													variant="outline"
													onClick={() => {
														setSelectedRequest(request);
														// TODO: Open details modal
													}}
													className="w-full"
												>
													View Details
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

			{/* Assign Engineer Dialog */}
			<Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Assign Engineer</DialogTitle>
						<DialogDescription>
							Select an engineer to assign this maintenance request
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{selectedRequest && (
							<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<p className="text-sm text-gray-600 dark:text-gray-400">Request #{selectedRequest.id}</p>
								<p className="font-medium">{selectedRequest.equipmentName}</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{selectedRequest.customerName}
								</p>
							</div>
						)}

						<div>
							<label className="text-sm font-medium mb-2 block">Select Engineer</label>
							<Select
								value={selectedEngineerId}
								onValueChange={setSelectedEngineerId}
								disabled={loadingEngineers}
							>
								<SelectTrigger>
									<SelectValue placeholder="Choose an engineer..." />
								</SelectTrigger>
								<SelectContent>
									{engineers.map((engineer) => (
										<SelectItem key={engineer.id} value={engineer.id}>
											{engineer.fullName ||
												`${engineer.firstName || ''} ${engineer.lastName || ''}`.trim() ||
												engineer.userName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setShowAssignDialog(false)}>
								Cancel
							</Button>
							<Button
								onClick={handleAssign}
								disabled={!selectedEngineerId || assignMutation.isPending}
							>
								{assignMutation.isPending ? 'Assigning...' : 'Assign'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default MaintenanceSupportDashboard;

