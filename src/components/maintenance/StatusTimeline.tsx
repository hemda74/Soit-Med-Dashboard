// Status Timeline Component for Maintenance Requests (Delivery-style tracking)

import React from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckCircleOutlineIcon } from '@heroicons/react/24/outline';
import { MaintenanceRequestStatus } from '@/types/maintenance.types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusItem {
	status: MaintenanceRequestStatus;
	timestamp?: string;
	description?: string;
}

interface StatusTimelineProps {
	items: StatusItem[];
	currentStatus: MaintenanceRequestStatus;
	className?: string;
}

const statusOrder: MaintenanceRequestStatus[] = [
	MaintenanceRequestStatus.Pending,
	MaintenanceRequestStatus.Assigned,
	MaintenanceRequestStatus.InProgress,
	MaintenanceRequestStatus.NeedsSecondVisit,
	MaintenanceRequestStatus.NeedsSparePart,
	MaintenanceRequestStatus.WaitingForSparePart,
	MaintenanceRequestStatus.WaitingForCustomerApproval,
	MaintenanceRequestStatus.Completed,
];

const statusLabels: Record<MaintenanceRequestStatus, string> = {
	[MaintenanceRequestStatus.Pending]: 'Request Submitted',
	[MaintenanceRequestStatus.Assigned]: 'Assigned to Engineer',
	[MaintenanceRequestStatus.InProgress]: 'In Progress',
	[MaintenanceRequestStatus.NeedsSecondVisit]: 'Needs Second Visit',
	[MaintenanceRequestStatus.NeedsSparePart]: 'Needs Spare Part',
	[MaintenanceRequestStatus.WaitingForSparePart]: 'Waiting For Spare Part',
	[MaintenanceRequestStatus.WaitingForCustomerApproval]: 'Waiting For Approval',
	[MaintenanceRequestStatus.Completed]: 'Completed',
	[MaintenanceRequestStatus.Cancelled]: 'Cancelled',
	[MaintenanceRequestStatus.OnHold]: 'On Hold',
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
	items,
	currentStatus,
	className,
}) => {
	// Get all statuses up to current status
	const currentIndex = statusOrder.indexOf(currentStatus);
	const relevantStatuses = statusOrder.slice(0, currentIndex + 1);

	// Create timeline items
	const timelineItems = relevantStatuses.map((status) => {
		const item = items.find((i) => i.status === status);
		return {
			status,
			timestamp: item?.timestamp,
			description: item?.description,
			isCompleted: statusOrder.indexOf(status) <= currentIndex,
			isCurrent: status === currentStatus,
		};
	});

	return (
		<div className={cn('space-y-4', className)}>
			{timelineItems.map((item, index) => {
				const isLast = index === timelineItems.length - 1;
				const isCompleted = item.isCompleted && !item.isCurrent;
				const isCurrent = item.isCurrent;

				return (
					<div key={item.status} className="relative flex gap-4">
						{/* Timeline Line */}
						{!isLast && (
							<div
								className={cn(
									'absolute left-4 top-8 w-0.5 h-full',
									isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
								)}
							/>
						)}

						{/* Icon */}
						<div className="relative z-10">
							{isCompleted ? (
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
									<CheckCircleIcon className="h-5 w-5 text-white" />
								</div>
							) : isCurrent ? (
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 animate-pulse">
									<ClockIcon className="h-5 w-5 text-white" />
								</div>
							) : (
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
									<CheckCircleOutlineIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
								</div>
							)}
						</div>

						{/* Content */}
						<div className="flex-1 pb-6">
							<div
								className={cn(
									'font-medium',
									isCompleted
										? 'text-green-600 dark:text-green-400'
										: isCurrent
											? 'text-blue-600 dark:text-blue-400'
											: 'text-gray-500 dark:text-gray-400'
								)}
							>
								{statusLabels[item.status]}
							</div>
							{item.timestamp && (
								<div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
									{new Date(item.timestamp).toLocaleString()}
								</div>
							)}
							{item.description && (
								<div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
									{item.description}
								</div>
							)}
							{isCurrent && (
								<Badge variant="outline" className="mt-2">
									Current Status
								</Badge>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
};

