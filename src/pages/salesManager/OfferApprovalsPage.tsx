import React from 'react';
import SalesManagerOfferApprovals from '@/components/dashboards/SalesManagerOfferApprovals';
import SalesManagerDealApprovals from '@/components/dashboards/SalesManagerDealApprovals';
import { PageHeader } from '@/components/shared';
import { useAuthStore } from '@/stores/authStore';

const OfferApprovalsPage: React.FC = () => {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.roles?.includes('SuperAdmin') || false;
    const isSalesManager = user?.roles?.includes('SalesManager') || false;

    // SuperAdmin sees deals on this page, SalesManager sees offers
    if (isSuperAdmin) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Pending Deal Approvals"
                    description="Review and approve deals awaiting approval"
                />
                <SalesManagerDealApprovals />
            </div>
        );
    }

    // SalesManager sees offers
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

