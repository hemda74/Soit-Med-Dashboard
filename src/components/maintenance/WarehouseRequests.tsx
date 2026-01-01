/**
 * Warehouse Requests Component
 * 
 * Lists SparePartRequests with WarehouseStatus = Checking
 * Allows Warehouse Managers to approve/reject with pricing
 * Updates availability status
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { maintenanceApi } from '@/services/maintenance/maintenanceApi';
import { API_ENDPOINTS } from '@/services/shared/endpoints';
import { getAuthToken } from '@/utils/authUtils';
import { getApiBaseUrl } from '@/utils/apiConfig';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { PackageIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { SparePartRequestResponseDTO, UpdateSparePartPriceDTO } from '@/types/maintenance.types';

export const WarehouseRequests: React.FC = () => {
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const [priceDialogOpen, setPriceDialogOpen] = useState(false);
	const [selectedRequest, setSelectedRequest] = useState<SparePartRequestResponseDTO | null>(null);
	const [prices, setPrices] = useState<UpdateSparePartPriceDTO>({
		companyPrice: 0,
		customerPrice: 0,
	});

	// Fetch warehouse pending requests
	const { data: requestsData, isLoading } = useQuery({
		queryKey: ['warehousePendingRequests'],
		queryFn: async () => {
			const token = getAuthToken();
			const response = await fetch(
				`${getApiBaseUrl()}${API_ENDPOINTS.MAINTENANCE.SPARE_PART.WAREHOUSE_PENDING}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) throw new Error('Failed to fetch warehouse requests');
			const result = await response.json();
			return result.data as SparePartRequestResponseDTO[];
		},
		enabled: !!user,
	});

	// Set price mutation
	const setPriceMutation = useMutation({
		mutationFn: async ({ id, data }: { id: number; data: UpdateSparePartPriceDTO }) => {
			return maintenanceApi.setSparePartPrice(id, data);
		},
		onSuccess: () => {
			toast.success('Price set successfully');
			queryClient.invalidateQueries({ queryKey: ['warehousePendingRequests'] });
			setPriceDialogOpen(false);
			setSelectedRequest(null);
			setPrices({ companyPrice: 0, customerPrice: 0 });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to set price');
		},
	});

	// Check availability mutation
	const checkAvailabilityMutation = useMutation({
		mutationFn: async ({ id, isLocalAvailable }: { id: number; isLocalAvailable: boolean }) => {
			return maintenanceApi.checkSparePartAvailability(id, isLocalAvailable);
		},
		onSuccess: () => {
			toast.success('Availability status updated');
			queryClient.invalidateQueries({ queryKey: ['warehousePendingRequests'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update availability');
		},
	});

	const handleSetPrice = (request: SparePartRequestResponseDTO) => {
		setSelectedRequest(request);
		setPrices({
			companyPrice: request.companyPrice || 0,
			customerPrice: request.customerPrice || 0,
		});
		setPriceDialogOpen(true);
	};

	const confirmSetPrice = () => {
		if (!selectedRequest) return;
		if (prices.companyPrice <= 0 || prices.customerPrice <= 0) {
			toast.error('Prices must be greater than 0');
			return;
		}
		setPriceMutation.mutate({ id: selectedRequest.id, data: prices });
	};

	const requests = requestsData || [];

	return (
		<div className="container mx-auto p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<PackageIcon className="h-6 w-6" />
						Warehouse Requests
					</CardTitle>
					<CardDescription>
						Review and approve spare part requests with pricing
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8">Loading requests...</div>
					) : requests.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No warehouse requests pending
						</div>
					) : (
						<div className="space-y-4">
							{requests.map((request) => (
								<Card key={request.id} className="hover:shadow-md transition-shadow">
									<CardContent className="pt-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<h3 className="font-semibold text-lg">{request.partName}</h3>
													<Badge variant="outline">{request.status}</Badge>
												</div>
												{request.partNumber && (
													<p className="text-sm text-muted-foreground mb-2">
														Part Number: {request.partNumber}
													</p>
												)}
												{request.description && (
													<p className="text-sm mb-2">{request.description}</p>
												)}
												<div className="grid grid-cols-2 gap-4 mt-4">
													<div>
														<p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
														<p className="text-sm">{request.manufacturer || 'N/A'}</p>
													</div>
													<div>
														<p className="text-sm font-medium text-muted-foreground">Created</p>
														<p className="text-sm">{format(new Date(request.createdAt), 'PPP')}</p>
													</div>
													{request.originalPrice && (
														<div>
															<p className="text-sm font-medium text-muted-foreground">Original Price</p>
															<p className="text-sm">{request.originalPrice.toFixed(2)} EGP</p>
														</div>
													)}
												</div>
											</div>
											<div className="flex gap-2 ml-4">
												<Button
													variant="outline"
													size="sm"
													onClick={() => checkAvailabilityMutation.mutate({ id: request.id, isLocalAvailable: true })}
													disabled={checkAvailabilityMutation.isPending}
												>
													<CheckCircleIcon className="h-4 w-4 mr-1" />
													Local Available
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => checkAvailabilityMutation.mutate({ id: request.id, isLocalAvailable: false })}
													disabled={checkAvailabilityMutation.isPending}
												>
													<XCircleIcon className="h-4 w-4 mr-1" />
													Global Required
												</Button>
												<Button
													variant="default"
													size="sm"
													onClick={() => handleSetPrice(request)}
													disabled={setPriceMutation.isPending}
												>
													Set Price
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

			{/* Set Price Dialog */}
			<Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Set Spare Part Price</DialogTitle>
						<DialogDescription>
							Set the company price and customer price for {selectedRequest?.partName}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div>
							<Label htmlFor="companyPrice">Company Price (EGP) *</Label>
							<Input
								id="companyPrice"
								type="number"
								step="0.01"
								min="0"
								value={prices.companyPrice}
								onChange={(e) =>
									setPrices({ ...prices, companyPrice: parseFloat(e.target.value) || 0 })
								}
							/>
						</div>
						<div>
							<Label htmlFor="customerPrice">Customer Price (EGP) *</Label>
							<Input
								id="customerPrice"
								type="number"
								step="0.01"
								min="0"
								value={prices.customerPrice}
								onChange={(e) =>
									setPrices({ ...prices, customerPrice: parseFloat(e.target.value) || 0 })
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setPriceDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={confirmSetPrice}
							disabled={setPriceMutation.isPending || prices.companyPrice <= 0 || prices.customerPrice <= 0}
						>
							Set Price
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

