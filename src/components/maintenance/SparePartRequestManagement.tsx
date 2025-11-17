// Spare Part Request Management Component

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	useSetSparePartPrice,
	useCustomerSparePartDecision,
} from '@/hooks/useMaintenanceQueries';
import { useAuthStore } from '@/stores/authStore';
import { usePerformance } from '@/hooks/usePerformance';
import {
	CheckCircleIcon,
	XCircleIcon,
	CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import type {
	SparePartRequestResponseDTO,
	UpdateSparePartPriceDTO,
	CustomerSparePartDecisionDTO,
	SparePartAvailabilityStatus,
	MaintenanceRequestAttachmentResponseDTO,
} from '@/types/maintenance.types';
import { SparePartAvailabilityStatus as Status } from '@/types/maintenance.types';
import ImageGallery from '@/components/shared/ImageGallery';
import { useAttachmentsByRequest } from '@/hooks/useMaintenanceQueries';
import { useTranslation } from '@/hooks/useTranslation';

const SparePartRequestManagement: React.FC = () => {
	usePerformance('SparePartRequestManagement');
	const { t } = useTranslation();
	const { hasAnyRole } = useAuthStore();
	const [selectedRequest, setSelectedRequest] = useState<SparePartRequestResponseDTO | null>(null);
	const [showPriceDialog, setShowPriceDialog] = useState(false);
	const [showApprovalDialog, setShowApprovalDialog] = useState(false);
	const [priceData, setPriceData] = useState<UpdateSparePartPriceDTO>({
		companyPrice: 0,
		customerPrice: 0,
	});
	const [approvalData, setApprovalData] = useState<CustomerSparePartDecisionDTO>({
		approved: true,
		rejectionReason: '',
	});

	const isInventoryManager = hasAnyRole(['InventoryManager', 'SuperAdmin']);
	const isCustomer = hasAnyRole(['Doctor', 'HospitalAdmin']);

	// Fetch spare part requests
	const { data: requests = [], isLoading, refetch } = useQuery<SparePartRequestResponseDTO[]>({
		queryKey: ['sparePartRequests'],
		queryFn: async () => {
			// TODO: Implement API endpoint to get all spare part requests
			// For now, return empty array
			return [] as SparePartRequestResponseDTO[];
		},
	});

	const setPriceMutation = useSetSparePartPrice();
	const decisionMutation = useCustomerSparePartDecision();

	// Handle set price
	const handleSetPrice = async () => {
		if (!selectedRequest) return;

		try {
			await setPriceMutation.mutateAsync({
				id: selectedRequest.id,
				data: priceData,
			});
			setShowPriceDialog(false);
			setSelectedRequest(null);
			refetch();
		} catch (error) {
			// Error handled by mutation
		}
	};

	// Handle customer decision
	const handleCustomerDecision = async () => {
		if (!selectedRequest) return;

		try {
			await decisionMutation.mutateAsync({
				id: selectedRequest.id,
				data: approvalData,
			});
			setShowApprovalDialog(false);
			setSelectedRequest(null);
			refetch();
		} catch (error) {
			// Error handled by mutation
		}
	};

	// Get status badge
	const getStatusBadge = (status: SparePartAvailabilityStatus) => {
		const config: Record<SparePartAvailabilityStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
			[Status.Pending]: { label: 'Pending', variant: 'secondary' },
			[Status.LocalAvailable]: { label: 'Local Available', variant: 'default' },
			[Status.GlobalRequired]: { label: 'Global Required', variant: 'outline' },
			[Status.PriceSet]: { label: 'Price Set', variant: 'default' },
			[Status.WaitingForCustomerApproval]: { label: 'Waiting For Approval', variant: 'secondary' },
			[Status.CustomerApproved]: { label: 'Approved', variant: 'default' },
			[Status.CustomerRejected]: { label: 'Rejected', variant: 'destructive' },
			[Status.ReadyForEngineer]: { label: 'Ready For Engineer', variant: 'default' },
			[Status.DeliveredToEngineer]: { label: 'Delivered', variant: 'default' },
		};

		const statusConfig = config[status];
		return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Spare Part Requests Management
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-2">
						Manage spare part requests and pricing
					</p>
				</div>
			</div>

			{/* Requests List */}
			<Card>
				<CardHeader>
					<CardTitle>{t('sparePartRequests')} ({requests.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8">
							<p className="text-gray-500">{t('loadingRequests')}</p>
						</div>
					) : requests.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">{t('noSparePartRequestsFound')}</p>
						</div>
					) : (
						<div className="space-y-4">
							{requests.map((request) => (
								<SparePartRequestCard
									key={request.id}
									request={request}
									isInventoryManager={isInventoryManager}
									isCustomer={isCustomer}
									onSetPrice={() => {
										setSelectedRequest(request);
										setShowPriceDialog(true);
									}}
									onApprove={() => {
										setSelectedRequest(request);
										setApprovalData({ approved: true, rejectionReason: '' });
										setShowApprovalDialog(true);
									}}
									onReject={() => {
										setSelectedRequest(request);
										setApprovalData({ approved: false, rejectionReason: '' });
										setShowApprovalDialog(true);
									}}
									getStatusBadge={getStatusBadge}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Set Price Dialog */}
			<Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('setSparePartPrice')}</DialogTitle>
						<DialogDescription>
							{t('setCompanyAndCustomerPrices')}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{selectedRequest && (
							<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<p className="text-sm text-gray-600 dark:text-gray-400">{t('partName')}</p>
								<p className="font-medium">{selectedRequest.partName}</p>
							</div>
						)}

						<div>
							<Label htmlFor="companyPrice">{t('companyPriceEgp')} *</Label>
							<Input
								id="companyPrice"
								type="number"
								value={priceData.companyPrice || ''}
								onChange={(e) =>
									setPriceData({
										...priceData,
										companyPrice: parseFloat(e.target.value) || 0,
									})
								}
								placeholder="0.00"
							/>
						</div>

						<div>
							<Label htmlFor="customerPrice">{t('customerPriceEgp')} *</Label>
							<Input
								id="customerPrice"
								type="number"
								value={priceData.customerPrice || ''}
								onChange={(e) =>
									setPriceData({
										...priceData,
										customerPrice: parseFloat(e.target.value) || 0,
									})
								}
								placeholder="0.00"
							/>
						</div>

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setShowPriceDialog(false)}>
								Cancel
							</Button>
							<Button onClick={handleSetPrice} disabled={setPriceMutation.isPending}>
								{setPriceMutation.isPending ? 'Setting...' : 'Set Price'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Customer Approval Dialog */}
			<Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{approvalData.approved ? t('approveSparePart') : t('rejectSparePart')}
						</DialogTitle>
						<DialogDescription>
							{approvalData.approved
								? t('confirmApprovalSparePart')
								: t('provideRejectionReason')}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{selectedRequest && (
							<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<p className="text-sm text-gray-600 dark:text-gray-400">{t('partName')}</p>
								<p className="font-medium">{selectedRequest.partName}</p>
								{selectedRequest.customerPrice && (
									<div className="mt-2">
										<p className="text-sm text-gray-600 dark:text-gray-400">{t('price')}</p>
										<p className="font-medium text-lg">
											{selectedRequest.customerPrice.toLocaleString()} EGP
										</p>
									</div>
								)}
							</div>
						)}

						{!approvalData.approved && (
							<div>
								<Label htmlFor="rejectionReason">{t('rejectionReason')} *</Label>
								<Textarea
									id="rejectionReason"
									value={approvalData.rejectionReason || ''}
									onChange={(e) =>
										setApprovalData({ ...approvalData, rejectionReason: e.target.value })
									}
									placeholder={t('enterRejectionReason')}
									rows={4}
									required
								/>
							</div>
						)}

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
								{t('common.cancel')}
							</Button>
							<Button
								onClick={handleCustomerDecision}
								disabled={
									decisionMutation.isPending ||
									(!approvalData.approved && !approvalData.rejectionReason?.trim())
								}
								variant={approvalData.approved ? 'default' : 'destructive'}
							>
								{decisionMutation.isPending
									? approvalData.approved
										? t('approving')
										: t('rejecting')
									: approvalData.approved
										? t('approve')
										: t('reject')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

// Separate component for better performance and image handling
interface SparePartRequestCardProps {
	request: SparePartRequestResponseDTO;
	isInventoryManager: boolean;
	isCustomer: boolean;
	onSetPrice: () => void;
	onApprove: () => void;
	onReject: () => void;
	getStatusBadge: (status: SparePartAvailabilityStatus) => React.ReactNode;
}

const SparePartRequestCard: React.FC<SparePartRequestCardProps> = ({
	request,
	isInventoryManager,
	isCustomer,
	onSetPrice,
	onApprove,
	onReject,
	getStatusBadge,
}) => {
	// Fetch attachments only if maintenanceRequestId exists
	const { data: attachments = [] } = useAttachmentsByRequest(
		request.maintenanceRequestId || 0
	);

	// Filter only image attachments
	const imageAttachments = React.useMemo(() => {
		return attachments.filter(
			(att: MaintenanceRequestAttachmentResponseDTO) =>
				att.attachmentType === 'Image' ||
				att.fileType?.startsWith('image/') ||
				/\.(jpg|jpeg|png|gif|webp)$/i.test(att.fileName)
		);
	}, [attachments]);

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					<div className="flex-1 space-y-3">
						<div className="flex items-center gap-3">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Request #{request.id}
							</h3>
							{getStatusBadge(request.status)}
						</div>

						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-gray-500 dark:text-gray-400">{t('partName')}</p>
								<p className="font-medium">{request.partName}</p>
							</div>
							{request.partNumber && (
								<div>
									<p className="text-gray-500 dark:text-gray-400">{t('partNumber')}</p>
									<p className="font-medium">{request.partNumber}</p>
								</div>
							)}
							{request.manufacturer && (
								<div>
									<p className="text-gray-500 dark:text-gray-400">{t('manufacturer')}</p>
									<p className="font-medium">{request.manufacturer}</p>
								</div>
							)}
							<div>
								<p className="text-gray-500 dark:text-gray-400">{t('created')}</p>
								<p className="font-medium">
									{format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
								</p>
							</div>
						</div>

						{request.description && (
							<div>
								<p className="text-sm font-medium text-gray-500 mb-1">Description</p>
								<p className="text-sm">{request.description}</p>
							</div>
						)}

						{request.customerPrice && (
							<div className="flex items-center gap-4">
								<div>
									<p className="text-sm text-gray-500">{t('customerPriceEgp')}</p>
									<p className="font-medium text-lg text-green-600">
										{request.customerPrice.toLocaleString()} EGP
									</p>
								</div>
								{request.companyPrice && (
									<div>
										<p className="text-sm text-gray-500">{t('companyPriceEgp')}</p>
										<p className="font-medium text-sm text-gray-600">
											{request.companyPrice.toLocaleString()} EGP
										</p>
									</div>
								)}
							</div>
						)}

						{/* Image Gallery - Only render if there are images */}
						{imageAttachments.length > 0 && (
							<div>
								<p className="text-sm font-medium text-gray-500 mb-2">
									Images ({imageAttachments.length})
								</p>
								<ImageGallery
									images={imageAttachments.map((att) => ({
										id: att.id,
										filePath: att.filePath,
										fileName: att.fileName,
										description: att.description,
									}))}
									maxThumbnails={4}
									thumbnailSize="md"
								/>
							</div>
						)}
					</div>

					<div className="flex flex-col gap-2 ml-4">
						{isInventoryManager &&
							request.status === Status.GlobalRequired &&
							!request.customerPrice && (
								<Button onClick={onSetPrice} className="w-full">
									<CurrencyDollarIcon className="h-4 w-4 mr-2" />
									Set Price
								</Button>
							)}
						{isCustomer &&
							request.status === Status.WaitingForCustomerApproval && (
								<>
									<Button
										onClick={onApprove}
										className="w-full"
										variant="default"
									>
										<CheckCircleIcon className="h-4 w-4 mr-2" />
										Approve
									</Button>
									<Button
										onClick={onReject}
										className="w-full"
										variant="destructive"
									>
										<XCircleIcon className="h-4 w-4 mr-2" />
										Reject
									</Button>
								</>
							)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SparePartRequestManagement;


