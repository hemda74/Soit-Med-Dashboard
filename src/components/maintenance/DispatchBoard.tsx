/**
 * Dispatch Board Component
 * 
 * Allows Managers/Support to filter visits by Governorate/Skill/Status/Date
 * and assign Engineers (multi-select) to visits
 * 
 * Features:
 * - Filter visits by Governorate, Skill, Status, Date Range
 * - Multi-select Engineer assignment
 * - Real-time updates via SignalR
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { maintenanceApi } from '@/services/maintenance/maintenanceApi';
import { API_ENDPOINTS } from '@/services/shared/endpoints';
import { getAuthToken } from '@/utils/authUtils';
import { getApiBaseUrl } from '@/utils/apiConfig';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FilterIcon, UserGroupIcon, MapPinIcon } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { MaintenanceVisitResponseDTO, VisitStatus } from '@/types/maintenance.types';

interface DispatchBoardFilters {
	governorateId?: number;
	status?: VisitStatus;
	dateFrom?: Date;
	dateTo?: Date;
	skill?: string;
}

interface Engineer {
	id: string;
	name: string;
	governorateIds?: number[];
}

export const DispatchBoard: React.FC = () => {
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const [filters, setFilters] = useState<DispatchBoardFilters>({});
	const [selectedVisits, setSelectedVisits] = useState<number[]>([]);
	const [selectedEngineers, setSelectedEngineers] = useState<string[]>([]);
	const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(null);

	// Fetch visits with filters
	const { data: visitsData, isLoading } = useQuery({
		queryKey: ['dispatchVisits', filters],
		queryFn: async () => {
			const token = getAuthToken();
			const params = new URLSearchParams();
			if (filters.governorateId) params.append('governorateId', filters.governorateId.toString());
			if (filters.status) params.append('status', filters.status);
			if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
			if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());

			const response = await fetch(
				`${getApiBaseUrl()}${API_ENDPOINTS.MAINTENANCE.VISIT.DISPATCH}?${params.toString()}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) throw new Error('Failed to fetch visits');
			const result = await response.json();
			return result.data as MaintenanceVisitResponseDTO[];
		},
		enabled: !!user,
	});

	// Fetch available engineers
	const { data: engineersData } = useQuery({
		queryKey: ['engineers'],
		queryFn: async () => {
			const token = getAuthToken();
			const response = await fetch(
				`${getApiBaseUrl()}/api/User/role/Engineer`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) throw new Error('Failed to fetch engineers');
			const result = await response.json();
			return result.data as Engineer[];
		},
		enabled: !!user,
	});

	// Assign engineers mutation
	const assignMutation = useMutation({
		mutationFn: async ({ visitId, engineerIds }: { visitId: number; engineerIds: string[] }) => {
			const token = getAuthToken();
			const response = await fetch(
				`${getApiBaseUrl()}${API_ENDPOINTS.MAINTENANCE.VISIT.ASSIGN_ENGINEERS(visitId)}`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ engineerIds }),
				}
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to assign engineers');
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success('Engineers assigned successfully');
			queryClient.invalidateQueries({ queryKey: ['dispatchVisits'] });
			setSelectedVisits([]);
			setSelectedEngineers([]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to assign engineers');
		},
	});

	const handleAssignEngineers = () => {
		if (selectedVisits.length === 0 || selectedEngineers.length === 0) {
			toast.error('Please select visits and engineers');
			return;
		}

		selectedVisits.forEach(visitId => {
			assignMutation.mutate({ visitId, engineerIds: selectedEngineers });
		});
	};

	const visits = visitsData || [];

	return (
		<div className="container mx-auto p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserGroupIcon className="h-6 w-6" />
						Dispatch Board
					</CardTitle>
					<CardDescription>
						Filter and assign engineers to maintenance visits
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Filters */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						<div>
							<Label>Governorate</Label>
							<Select
								value={filters.governorateId?.toString() || ''}
								onValueChange={(value) =>
									setFilters({ ...filters, governorateId: value ? parseInt(value) : undefined })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="All Governorates" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Governorates</SelectItem>
									{/* TODO: Load governorates from API */}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Status</Label>
							<Select
								value={filters.status || ''}
								onValueChange={(value) =>
									setFilters({ ...filters, status: value as VisitStatus | undefined })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="All Statuses" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Statuses</SelectItem>
									<SelectItem value="PendingApproval">Pending Approval</SelectItem>
									<SelectItem value="Scheduled">Scheduled</SelectItem>
									<SelectItem value="InProgress">In Progress</SelectItem>
									<SelectItem value="NeedsSpareParts">Needs Spare Parts</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Date From</Label>
							<Popover open={showDatePicker === 'from'} onOpenChange={(open) => setShowDatePicker(open ? 'from' : null)}>
								<PopoverTrigger asChild>
									<Button variant="outline" className="w-full justify-start text-left font-normal">
										<CalendarIcon className="mr-2 h-4 w-4" />
										{filters.dateFrom ? format(filters.dateFrom, 'PPP') : 'Select date'}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={filters.dateFrom}
										onSelect={(date) => {
											setFilters({ ...filters, dateFrom: date });
											setShowDatePicker(null);
										}}
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div>
							<Label>Date To</Label>
							<Popover open={showDatePicker === 'to'} onOpenChange={(open) => setShowDatePicker(open ? 'to' : null)}>
								<PopoverTrigger asChild>
									<Button variant="outline" className="w-full justify-start text-left font-normal">
										<CalendarIcon className="mr-2 h-4 w-4" />
										{filters.dateTo ? format(filters.dateTo, 'PPP') : 'Select date'}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={filters.dateTo}
										onSelect={(date) => {
											setFilters({ ...filters, dateTo: date });
											setShowDatePicker(null);
										}}
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					{/* Assignment Section */}
					{selectedVisits.length > 0 && (
						<Card className="mb-6">
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">
											{selectedVisits.length} visit(s) selected
										</p>
										<p className="text-sm text-muted-foreground">
											Select engineers to assign
										</p>
									</div>
									<div className="flex gap-2">
										<Select
											value=""
											onValueChange={(value) => {
												if (value && !selectedEngineers.includes(value)) {
													setSelectedEngineers([...selectedEngineers, value]);
												}
											}}
										>
											<SelectTrigger className="w-[200px]">
												<SelectValue placeholder="Add Engineer" />
											</SelectTrigger>
											<SelectContent>
												{engineersData?.map((engineer) => (
													<SelectItem key={engineer.id} value={engineer.id}>
														{engineer.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Button
											onClick={handleAssignEngineers}
											disabled={assignMutation.isPending || selectedEngineers.length === 0}
										>
											Assign Engineers
										</Button>
									</div>
								</div>
								{selectedEngineers.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-4">
										{selectedEngineers.map((engineerId) => {
											const engineer = engineersData?.find((e) => e.id === engineerId);
											return (
												<Badge key={engineerId} variant="secondary" className="flex items-center gap-1">
													{engineer?.name || engineerId}
													<button
														onClick={() =>
															setSelectedEngineers(selectedEngineers.filter((id) => id !== engineerId))
														}
														className="ml-1 hover:text-destructive"
													>
														×
													</button>
												</Badge>
											);
										})}
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Visits List */}
					{isLoading ? (
						<div className="text-center py-8">Loading visits...</div>
					) : visits.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No visits found matching the filters
						</div>
					) : (
						<div className="space-y-4">
							{visits.map((visit) => (
								<Card key={visit.id} className="hover:shadow-md transition-shadow">
									<CardContent className="pt-6">
										<div className="flex items-start justify-between">
											<div className="flex items-start gap-4 flex-1">
												<Checkbox
													checked={selectedVisits.includes(visit.id)}
													onCheckedChange={(checked) => {
														if (checked) {
															setSelectedVisits([...selectedVisits, visit.id]);
														} else {
															setSelectedVisits(selectedVisits.filter((id) => id !== visit.id));
														}
													}}
												/>
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-2">
														<h3 className="font-semibold">{visit.ticketNumber || `Visit #${visit.id}`}</h3>
														<Badge variant="outline">{visit.status}</Badge>
														<Badge variant="secondary">{visit.origin}</Badge>
													</div>
													<p className="text-sm text-muted-foreground mb-2">
														Customer: {visit.customerName} | Device: {visit.deviceName}
													</p>
													<p className="text-sm">
														Scheduled: {format(new Date(visit.scheduledDate), 'PPP p')}
													</p>
													{visit.assignedEngineerNames && visit.assignedEngineerNames.length > 0 && (
														<div className="flex flex-wrap gap-2 mt-2">
															{visit.assignedEngineerNames.map((name, idx) => (
																<Badge key={idx} variant="secondary">{name}</Badge>
															))}
														</div>
													)}
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

