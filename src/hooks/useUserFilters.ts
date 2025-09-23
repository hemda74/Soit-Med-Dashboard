import { useState, useCallback } from 'react';
import type { UserFilters } from '@/types/api.types';

// Filter options constants
export const DEPARTMENT_OPTIONS = [
	{ value: 1, label: 'Administration' },
	{ value: 2, label: 'Medical' },
	{ value: 3, label: 'Sales' },
	{ value: 4, label: 'Engineering' },
	{ value: 5, label: 'Finance' },
	{ value: 6, label: 'Legal' },
];

export const ROLE_OPTIONS = [
	'SuperAdmin',
	'Admin',
	'Doctor',
	'Technician',
	'Salesman',
	'Engineer',
	'FinanceManager',
	'FinanceEmployee',
	'LegalManager',
	'LegalEmployee',
];

export const SORT_OPTIONS = [
	{ value: 'CreatedAt', label: 'Created Date' },
	{ value: 'FullName', label: 'Full Name' },
	{ value: 'Email', label: 'Email' },
	{ value: 'IsActive', label: 'Status' },
	{ value: 'LastLoginAt', label: 'Last Login' },
];

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Default filter values
export const DEFAULT_FILTERS: UserFilters = {
	searchTerm: '',
	role: undefined,
	departmentId: undefined,
	isActive: undefined,
	createdFrom: undefined,
	createdTo: undefined,
	sortBy: 'CreatedAt',
	sortOrder: 'desc',
	pageSize: 50,
	pageNumber: 1,
};

export interface UseUserFiltersProps {
	onFiltersChange: (filters: UserFilters) => void;
	onApplyFilters: () => void;
	onClearFilters: () => void;
	isLoading?: boolean;
}

export const useUserFilters = ({
	onFiltersChange,
	onApplyFilters,
	onClearFilters,
	isLoading = false,
}: UseUserFiltersProps) => {
	const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);
	const [isExpanded, setIsExpanded] = useState(false);

	// Handle individual filter changes
	const handleFilterChange = useCallback(
		(key: keyof UserFilters, value: any) => {
			const newFilters = {
				...filters,
				[key]: value,
			};
			setFilters(newFilters);
			onFiltersChange(newFilters);
		},
		[filters, onFiltersChange]
	);

	// Handle date changes with proper ISO conversion
	const handleDateChange = useCallback(
		(key: 'createdFrom' | 'createdTo', value: string) => {
			const isoString = value
				? new Date(value).toISOString()
				: undefined;
			handleFilterChange(key, isoString);
		},
		[handleFilterChange]
	);

	// Clear individual filter
	const clearFilter = useCallback(
		(key: keyof UserFilters) => {
			handleFilterChange(key, undefined);
		},
		[handleFilterChange]
	);

	// Clear all filters
	const clearAllFilters = useCallback(() => {
		setFilters(DEFAULT_FILTERS);
		onClearFilters();
	}, [onClearFilters]);

	// Toggle filter panel
	const toggleExpanded = useCallback(() => {
		setIsExpanded((prev) => !prev);
	}, []);

	// Check if any filters are active
	const hasActiveFilters = Object.entries(filters).some(
		([key, value]) => {
			if (
				key === 'sortBy' ||
				key === 'sortOrder' ||
				key === 'pageSize' ||
				key === 'pageNumber'
			) {
				return false; // Don't count default values as active filters
			}
			return (
				value !== undefined &&
				value !== null &&
				value !== ''
			);
		}
	);

	// Get active filter count
	const activeFilterCount = Object.entries(filters).filter(
		([key, value]) => {
			if (
				key === 'sortBy' ||
				key === 'sortOrder' ||
				key === 'pageSize' ||
				key === 'pageNumber'
			) {
				return false;
			}
			return (
				value !== undefined &&
				value !== null &&
				value !== ''
			);
		}
	).length;

	return {
		filters,
		isExpanded,
		hasActiveFilters,
		activeFilterCount,
		handleFilterChange,
		handleDateChange,
		clearFilter,
		clearAllFilters,
		toggleExpanded,
		setIsExpanded,
	};
};
