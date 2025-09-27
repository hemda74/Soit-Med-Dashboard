import React from 'react';
import { useUserFilters } from '@/hooks/useUserFilters';
import UserFiltersUI from './UserFiltersUI';
import type { UserFilters as UserFiltersType } from '@/types/api.types';

interface UserFiltersProps {
    filters: UserFiltersType;
    onFiltersChange: (filters: UserFiltersType) => void;
    onApplyFilters: () => void;
    onClearFilters: () => void;
    isLoading?: boolean;
}

const UserFilters: React.FC<UserFiltersProps> = ({
    filters,
    onFiltersChange,
    onApplyFilters,
    onClearFilters,
    isLoading = false,
}) => {
    const {
        isExpanded,
        hasActiveFilters,
        activeFilterCount,
        handleFilterChange,
        handleDateChange,
        clearFilter,
        clearAllFilters,
        toggleExpanded,
    } = useUserFilters({
        onFiltersChange,
        onApplyFilters,
        onClearFilters,
        isLoading,
    });

    return (
        <UserFiltersUI
            filters={filters}
            isExpanded={isExpanded}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
            isLoading={isLoading}
            onFilterChange={handleFilterChange}
            onDateChange={handleDateChange}
            onClearFilter={clearFilter}
            onClearAllFilters={clearAllFilters}
            onToggleExpanded={toggleExpanded}
            onApplyFilters={onApplyFilters}
        />
    );
};

export default UserFilters;
