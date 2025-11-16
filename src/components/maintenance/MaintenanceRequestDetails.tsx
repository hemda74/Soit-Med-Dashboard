// Maintenance Request Details Component

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMaintenanceRequest, useVisitsByRequest, useAttachmentsByRequest } from '@/hooks/useMaintenanceQueries';
import { StatusBadge, StatusTimeline } from './';
import {
	WrenchScrewdriverIcon,
	UserIcon,
	BuildingOfficeIcon,
	CalendarIcon,
	DocumentTextIcon,
	PhotoIcon,
	ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { usePerformance } from '@/hooks/usePerformance';
import { LoadingSpinner } from '@/components/shared';
import type { MaintenanceRequestResponseDTO } from '@/types/maintenance.types';

const MaintenanceRequestDetails: React.FC = () => {
	usePerformance('MaintenanceRequestDetails');
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const requestId = id ? parseInt(id, 10) : 0;

	const { data: request, isLoading, error } = useMaintenanceRequest(requestId);
	const { data: visits = [] } = useVisitsByRequest(requestId);
	const { data: attachments = [] } = useAttachmentsByRequest(requestId);

	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<LoadingSpinner />
			</div>
		);
	}

	if (error || !request) {
		return (
			<div className="container mx-auto p-6">
				<Card>
					<CardContent className="p-6">
						<p className="text-red-600">Failed to load maintenance request details</p>
						<Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
							<ArrowLeftIcon className="h-4 w-4 mr-2" />
							Go Back
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button onClick={() => navigate(-1)} variant="outline" size="sm">
						<ArrowLeftIcon className="h-4 w-4 mr-2" />
						Back
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
							Maintenance Request #{request.id}
						</h1>
						<p className="text-gray-600 dark:text-gray-400 mt-1">
							{request.equipmentName} - {request.customerName}
						</p>
					</div>
				</div>
				<StatusBadge status={request.status} />
			</div>

			{/* Status Timeline */}
			<Card>
				<CardHeader>
					<CardTitle>Status Timeline</CardTitle>
				</CardHeader>
				<CardContent>
					<StatusTimeline
						items={[
							{
								status: request.status,
								timestamp: request.createdAt,
								description: 'Request created',
							},
							...(request.assignedToEngineerId
								? [
										{
											status: 'Assigned' as any,
											timestamp: request.startedAt,
											description: `Assigned to ${request.assignedToEngineerName}`,
										},
									]
								: []),
							...(request.completedAt
								? [
										{
											status: 'Completed' as any,
											timestamp: request.completedAt,
											description: 'Request completed',
										},
									]
								: []),
						]}
						currentStatus={request.status}
					/>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Details */}
				<div className="lg:col-span-2 space-y-6">
					{/* Request Information */}
					<Card>
						<CardHeader>
							<CardTitle>Request Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Description
								</label>
								<p className="mt-1 text-gray-900 dark:text-white">{request.description}</p>
							</div>

							{request.symptoms && (
								<div>
									<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Symptoms
									</label>
									<p className="mt-1 text-gray-900 dark:text-white">{request.symptoms}</p>
								</div>
							)}

							<Separator />

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Created At
									</label>
									<p className="mt-1 text-gray-900 dark:text-white">
										{format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
									</p>
								</div>
								{request.startedAt && (
									<div>
										<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
											Started At
										</label>
										<p className="mt-1 text-gray-900 dark:text-white">
											{format(new Date(request.startedAt), 'MMM dd, yyyy HH:mm')}
										</p>
									</div>
								)}
								{request.completedAt && (
									<div>
										<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
											Completed At
										</label>
										<p className="mt-1 text-gray-900 dark:text-white">
											{format(new Date(request.completedAt), 'MMM dd, yyyy HH:mm')}
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Maintenance Visits */}
					<Card>
						<CardHeader>
							<CardTitle>Maintenance Visits ({visits.length})</CardTitle>
						</CardHeader>
						<CardContent>
							{visits.length === 0 ? (
								<p className="text-gray-500 text-center py-4">No visits recorded yet</p>
							) : (
								<div className="space-y-4">
									{visits.map((visit) => (
										<Card key={visit.id} className="bg-gray-50 dark:bg-gray-800">
											<CardContent className="p-4">
												<div className="flex items-start justify-between mb-3">
													<div>
														<p className="font-medium">Visit #{visit.id}</p>
														<p className="text-sm text-gray-500">
															{format(new Date(visit.visitDate), 'MMM dd, yyyy HH:mm')}
														</p>
													</div>
													<Badge variant="outline">{visit.outcome}</Badge>
												</div>

												{visit.report && (
													<div className="mb-3">
														<label className="text-sm font-medium text-gray-500">Report</label>
														<p className="text-sm mt-1">{visit.report}</p>
													</div>
												)}

												{visit.actionsTaken && (
													<div className="mb-3">
														<label className="text-sm font-medium text-gray-500">Actions Taken</label>
														<p className="text-sm mt-1">{visit.actionsTaken}</p>
													</div>
												)}

												{visit.serviceFee && (
													<div>
														<label className="text-sm font-medium text-gray-500">Service Fee</label>
														<p className="text-sm mt-1 font-medium">
															{visit.serviceFee.toLocaleString()} EGP
														</p>
													</div>
												)}
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Attachments */}
					{attachments.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Attachments ({attachments.length})</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									{attachments.map((attachment) => (
										<div
											key={attachment.id}
											className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
										>
											<PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
											<p className="text-xs text-center truncate">{attachment.fileName}</p>
											<p className="text-xs text-gray-500 text-center mt-1">
												{format(new Date(attachment.uploadedAt), 'MMM dd, yyyy')}
											</p>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Customer Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<UserIcon className="h-5 w-5" />
								Customer Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Customer Name
								</label>
								<p className="mt-1 font-medium">{request.customerName}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Customer Type
								</label>
								<p className="mt-1">{request.customerType}</p>
							</div>
							{request.hospitalName && (
								<div>
									<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Hospital
									</label>
									<p className="mt-1">{request.hospitalName}</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Equipment Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<WrenchScrewdriverIcon className="h-5 w-5" />
								Equipment Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<label className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Equipment Name
								</label>
								<p className="mt-1 font-medium">{request.equipmentName}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500 dark:text-gray-400">QR Code</label>
								<p className="mt-1 font-mono text-sm">{request.equipmentQRCode}</p>
							</div>
						</CardContent>
					</Card>

					{/* Engineer Information */}
					{request.assignedToEngineerId && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<UserIcon className="h-5 w-5" />
									Assigned Engineer
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="font-medium">{request.assignedToEngineerName || 'Unknown'}</p>
							</CardContent>
						</Card>
					)}

					{/* Payment Information */}
					{request.totalAmount && (
						<Card>
							<CardHeader>
								<CardTitle>Payment Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="flex justify-between">
									<span className="text-sm text-gray-500">Total Amount</span>
									<span className="font-medium">{request.totalAmount.toLocaleString()} EGP</span>
								</div>
								{request.paidAmount && (
									<div className="flex justify-between">
										<span className="text-sm text-gray-500">Paid Amount</span>
										<span className="font-medium text-green-600">
											{request.paidAmount.toLocaleString()} EGP
										</span>
									</div>
								)}
								{request.remainingAmount && (
									<div className="flex justify-between">
										<span className="text-sm text-gray-500">Remaining</span>
										<span className="font-medium text-orange-600">
											{request.remainingAmount.toLocaleString()} EGP
										</span>
									</div>
								)}
								<div className="flex justify-between pt-2 border-t">
									<span className="text-sm font-medium">Payment Status</span>
									<Badge variant="outline">{request.paymentStatus}</Badge>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
};

export default MaintenanceRequestDetails;


