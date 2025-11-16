import React from 'react';
import SalesManagerDealApprovals from '@/components/dashboards/SalesManagerDealApprovals';
import { PageHeader } from '@/components/shared';

const DealApprovalsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Pending Deal Approvals"
                description="Review and approve deals awaiting your approval"
            />
            <SalesManagerDealApprovals />
        </div>
    );
};

export default DealApprovalsPage;

