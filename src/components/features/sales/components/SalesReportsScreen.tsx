import React from 'react';
import { SalesReportsScreenUI } from './SalesReportsScreenUI';
import CreateSalesReportModal from '@/components/sales/CreateSalesReportModal';
import EditSalesReportModal from '@/components/sales/EditSalesReportModal';
import RateSalesReportModal from '@/components/sales/RateSalesReportModal';
import DeleteSalesReportModal from '@/components/sales/DeleteSalesReportModal';
import { useSalesReportsScreen } from '../hooks/useSalesReportsScreen';

export const SalesReportsScreen: React.FC = () => {
    const {
        hasAccess,
        reports,
        filters,
        isLoading,
        error,
        totalPages,
        currentPage,
        totalReports,
        availableUsers,
        usersLoading,
        showCreateModal,
        editingReport,
        ratingReport,
        deletingReport,
        onFilterChange,
        onPageChange,
        onCreateReport,
        onEditReport,
        onDeleteReport,
        onRateReport,
        onViewComments,
        onClearError,
        onCloseCreateModal,
        onCloseEditModal,
        onCloseDeleteModal,
        onCloseRateModal,
        createReport,
        updateReport,
        deleteReport,
        rateReport,
        getStarRating,
    } = useSalesReportsScreen();

    return (
        <>
            <SalesReportsScreenUI
                hasAccess={hasAccess}
                reports={reports}
                filters={filters}
                isLoading={isLoading}
                error={error}
                totalPages={totalPages}
                currentPage={currentPage}
                totalReports={totalReports}
                availableUsers={availableUsers}
                usersLoading={usersLoading}
                onFilterChange={onFilterChange}
                onPageChange={onPageChange}
                onCreateReport={onCreateReport}
                onEditReport={onEditReport}
                onDeleteReport={onDeleteReport}
                onRateReport={onRateReport}
                onViewComments={onViewComments}
                onClearError={onClearError}
                getStarRating={getStarRating}
            />

            {showCreateModal && (
                <CreateSalesReportModal
                    onClose={onCloseCreateModal}
                    onSubmit={createReport}
                />
            )}

            {editingReport && (
                <EditSalesReportModal
                    report={editingReport}
                    onClose={onCloseEditModal}
                    onSubmit={updateReport}
                />
            )}

            {ratingReport && (
                <RateSalesReportModal
                    report={ratingReport}
                    onClose={onCloseRateModal}
                    onSubmit={rateReport}
                />
            )}

            {deletingReport && (
                <DeleteSalesReportModal
                    report={deletingReport}
                    onClose={onCloseDeleteModal}
                    onConfirm={deleteReport}
                />
            )}
        </>
    );
};

export default SalesReportsScreen;
