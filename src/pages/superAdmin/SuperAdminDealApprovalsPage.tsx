import React from 'react';
import SuperAdminDealApprovals from '@/components/dashboards/SuperAdminDealApprovals';
import { PageHeader } from '@/components/shared';

const SuperAdminDealApprovalsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Pending Deal Approvals (Super Admin)"
                description="Review and approve deals awaiting final approval"
            />
            <SuperAdminDealApprovals />
        </div>
    );
};

export default SuperAdminDealApprovalsPage;

