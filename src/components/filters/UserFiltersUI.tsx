import React from 'react';
import { Search, Filter, X, Calendar, Users, Building, CheckCircle, XCircle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import type { UserFilters } from '@/types/api.types';
import {
    DEPARTMENT_OPTIONS,
    ROLE_OPTIONS,
    SORT_OPTIONS,
    PAGE_SIZE_OPTIONS
} from '@/hooks/useUserFilters';

interface UserFiltersUIProps {
    filters: UserFilters;
    isExpanded: boolean;
    hasActiveFilters: boolean;
    activeFilterCount: number;
    isLoading: boolean;
    onFilterChange: (key: keyof UserFilters, value: any) => void;
    onDateChange: (key: 'createdFrom' | 'createdTo', value: string) => void;
    onClearFilter: (key: keyof UserFilters) => void;
    onClearAllFilters: () => void;
    onToggleExpanded: () => void;
    onApplyFilters: () => void;
}

const UserFiltersUI: React.FC<UserFiltersUIProps> = ({
    filters,
    isExpanded,
    hasActiveFilters,
    activeFilterCount,
    isLoading,
    onFilterChange,
    onDateChange,
    onClearFilter,
    onClearAllFilters,
    onToggleExpanded,
    onApplyFilters,
}) => {
    const { t } = useTranslation();

    return (
        <Card className="w-full shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {t('filters')}
                            </CardTitle>
                            {hasActiveFilters && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1">
                                {activeFilterCount}
                            </Badge>
                        )}

                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearAllFilters}
                                disabled={isLoading}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                            >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Clear All
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onToggleExpanded}
                            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Hide Filters
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    Show Filters
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-6 pt-0">
                    {/* Search Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="space-y-2">
                            <Label htmlFor="searchTerm" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                {t('searchTerm')}
                            </Label>
                            <Input
                                id="searchTerm"
                                placeholder={t('searchUsersPlaceholder')}
                                value={filters.searchTerm || ''}
                                onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                                className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Main Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Role Filter */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="role" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        {t('role')}
                                    </Label>
                                    {filters.role && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onClearFilter('role')}
                                            className="h-6 w-6 p-0 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                <Select
                                    value={filters.role || undefined}
                                    onValueChange={(value) => onFilterChange('role', value || undefined)}
                                >
                                    <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                        <SelectValue placeholder={t('selectRole')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                        {ROLE_OPTIONS.map((role) => (
                                            <SelectItem key={role} value={role} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Department Filter */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="department" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        {t('department')}
                                    </Label>
                                    {filters.departmentId && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onClearFilter('departmentId')}
                                            className="h-6 w-6 p-0 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                <Select
                                    value={filters.departmentId?.toString() || undefined}
                                    onValueChange={(value) => onFilterChange('departmentId', value ? parseInt(value) : undefined)}
                                >
                                    <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                        <SelectValue placeholder={t('selectDepartment')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                        {DEPARTMENT_OPTIONS.map((dept) => (
                                            <SelectItem key={dept.value} value={dept.value.toString()} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                {dept.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="status" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {filters.isActive === true ? (
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : filters.isActive === false ? (
                                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        ) : (
                                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        )}
                                        {t('status')}
                                    </Label>
                                    {filters.isActive !== undefined && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onClearFilter('isActive')}
                                            className="h-6 w-6 p-0 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                <Select
                                    value={filters.isActive?.toString() || undefined}
                                    onValueChange={(value) => onFilterChange('isActive', value === 'true' ? true : value === 'false' ? false : undefined)}
                                >
                                    <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                        <SelectValue placeholder={t('selectStatus')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                        <SelectItem value="true" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                {t('active')}
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="false" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                {t('inactive')}
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Date Range Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                Date Range
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="createdFrom" className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('createdFrom')}
                                        </Label>
                                        {filters.createdFrom && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onClearFilter('createdFrom')}
                                                className="h-6 w-6 p-0 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <Input
                                        id="createdFrom"
                                        type="date"
                                        value={filters.createdFrom ? new Date(filters.createdFrom).toISOString().split('T')[0] : ''}
                                        onChange={(e) => onDateChange('createdFrom', e.target.value)}
                                        className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="createdTo" className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('createdTo')}
                                        </Label>
                                        {filters.createdTo && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onClearFilter('createdTo')}
                                                className="h-6 w-6 p-0 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <Input
                                        id="createdTo"
                                        type="date"
                                        value={filters.createdTo ? new Date(filters.createdTo).toISOString().split('T')[0] : ''}
                                        onChange={(e) => onDateChange('createdTo', e.target.value)}
                                        className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sorting and Pagination */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sorting & Pagination</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sortBy" className="text-sm text-gray-600 dark:text-gray-400">{t('sortBy')}</Label>
                                    <Select
                                        value={filters.sortBy || 'CreatedAt'}
                                        onValueChange={(value) => onFilterChange('sortBy', value)}
                                    >
                                        <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                            {SORT_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sortOrder" className="text-sm text-gray-600 dark:text-gray-400">{t('sortOrder')}</Label>
                                    <Select
                                        value={filters.sortOrder || 'desc'}
                                        onValueChange={(value) => onFilterChange('sortOrder', value as 'asc' | 'desc')}
                                    >
                                        <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                            <SelectItem value="asc" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">{t('ascending')}</SelectItem>
                                            <SelectItem value="desc" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">{t('descending')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pageSize" className="text-sm text-gray-600 dark:text-gray-400">{t('pageSize')}</Label>
                                    <Select
                                        value={filters.pageSize?.toString() || '50'}
                                        onValueChange={(value) => onFilterChange('pageSize', parseInt(value))}
                                    >
                                        <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                            {PAGE_SIZE_OPTIONS.map((size) => (
                                                <SelectItem key={size} value={size.toString()} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    {size} {t('perPage')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Apply Filters Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            onClick={onApplyFilters}
                            disabled={isLoading}
                            className="min-w-[140px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {t('applying')}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    {t('applyFilters')}
                                </div>
                            )}
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default UserFiltersUI;
