// Status Badge Component for Maintenance Requests

import { Badge } from '@/components/ui/badge';
import { MaintenanceRequestStatus } from '@/types/maintenance.types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
	status: MaintenanceRequestStatus;
	className?: string;
}

const statusConfig: Record<MaintenanceRequestStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
	[MaintenanceRequestStatus.Pending]: {
		label: 'Pending',
		variant: 'secondary',
	},
	[MaintenanceRequestStatus.Assigned]: {
		label: 'Assigned',
		variant: 'default',
	},
	[MaintenanceRequestStatus.InProgress]: {
		label: 'In Progress',
		variant: 'default',
	},
	[MaintenanceRequestStatus.NeedsSecondVisit]: {
		label: 'Needs Second Visit',
		variant: 'secondary',
	},
	[MaintenanceRequestStatus.NeedsSparePart]: {
		label: 'Needs Spare Part',
		variant: 'secondary',
	},
	[MaintenanceRequestStatus.WaitingForSparePart]: {
		label: 'Waiting For Spare Part',
		variant: 'secondary',
	},
	[MaintenanceRequestStatus.WaitingForCustomerApproval]: {
		label: 'Waiting For Approval',
		variant: 'secondary',
	},
	[MaintenanceRequestStatus.Completed]: {
		label: 'Completed',
		variant: 'default',
	},
	[MaintenanceRequestStatus.Cancelled]: {
		label: 'Cancelled',
		variant: 'destructive',
	},
	[MaintenanceRequestStatus.OnHold]: {
		label: 'On Hold',
		variant: 'outline',
	},
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
	const config = statusConfig[status];

	return (
		<Badge variant={config.variant} className={cn(className)}>
			{config.label}
		</Badge>
	);
};

