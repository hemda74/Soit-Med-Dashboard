import React from 'react';
import SalesManagerOfferApprovals from '@/components/dashboards/SalesManagerOfferApprovals';
import { PageHeader } from '@/components/shared';

const OfferApprovalsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Pending Offer Approvals"
                description="Review and approve offers before they are sent to salesmen"
            />
            <SalesManagerOfferApprovals />
        </div>
    );
};

export default OfferApprovalsPage;

