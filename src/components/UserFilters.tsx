import { useState } from 'react';
import { Search, Filter, X, Calendar, Users, Building, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';
import type { UserFilters } from '@/types/api.types';

interface UserFiltersProps {
    filters: UserFilters;
    onFiltersChange: (filters: UserFilters) => void;
    onApplyFilters: () => void;
    onClearFilters: () => void;
    isLoading?: boolean;
}

const DEPARTMENT_OPTIONS = [
    { value: 1, label: 'Administration' },
    { value: 2, label: 'Medical' },
    { value: 3, label: 'Sales' },
    { value: 4, label: 'Engineering' },
    { value: 5, label: 'Finance' },
    { value: 6, label: 'Legal' },
];

const ROLE_OPTIONS = [
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

const SORT_OPTIONS = [
    { value: 'CreatedAt', label: 'Created Date' },
    { value: 'FullName', label: 'Full Name' },
    { value: 'Email', label: 'Email' },
    { value: 'IsActive', label: 'Status' },
    { value: 'LastLoginAt', label: 'Last Login' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function UserFilters({
    filters,
    onFiltersChange,
    onApplyFilters,
    onClearFilters,
    isLoading = false,
}: UserFiltersProps) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleFilterChange = (key: keyof UserFilters, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    };

    const handleDateChange = (key: 'createdFrom' | 'createdTo', value: string) => {
        // Convert to ISO string for API
        const isoString = value ? new Date(value).toISOString() : undefined;
        handleFilterChange(key, isoString);
    };

    const hasActiveFilters = Object.values(filters).some(value =>
        value !== undefined && value !== null && value !== ''
    );

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5" />
                        {t('filters')}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilters}
                                disabled={isLoading}
                            >
                                <X className="h-4 w-4 mr-1" />
                                {t('clearFilters')}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? t('hideFilters') : t('showFilters')}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-6">
                    {/* Search Term */}
                    <div className="space-y-2">
                        <Label htmlFor="searchTerm" className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            {t('searchTerm')}
                        </Label>
                        <Input
                            id="searchTerm"
                            placeholder={t('searchUsersPlaceholder')}
                            value={filters.searchTerm || ''}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        />
                    </div>

                    {/* Filters Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Role Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="role" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {t('role')}
                            </Label>
                            <Select
                                value={filters.role || ''}
                                onValueChange={(value) => handleFilterChange('role', value || undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectRole')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">{t('allRoles')}</SelectItem>
                                    {ROLE_OPTIONS.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Department Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="department" className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {t('department')}
                            </Label>
                            <Select
                                value={filters.departmentId?.toString() || ''}
                                onValueChange={(value) => handleFilterChange('departmentId', value ? parseInt(value) : undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectDepartment')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">{t('allDepartments')}</SelectItem>
                                    {DEPARTMENT_OPTIONS.map((dept) => (
                                        <SelectItem key={dept.value} value={dept.value.toString()}>
                                            {dept.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="status" className="flex items-center gap-2">
                                {filters.isActive === true ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : filters.isActive === false ? (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                ) : (
                                    <Users className="h-4 w-4" />
                                )}
                                {t('status')}
                            </Label>
                            <Select
                                value={filters.isActive?.toString() || ''}
                                onValueChange={(value) => handleFilterChange('isActive', value === '' ? undefined : value === 'true')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectStatus')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">{t('allStatuses')}</SelectItem>
                                    <SelectItem value="true">{t('active')}</SelectItem>
                                    <SelectItem value="false">{t('inactive')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Date Range Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="createdFrom" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {t('createdFrom')}
                            </Label>
                            <Input
                                id="createdFrom"
                                type="date"
                                value={filters.createdFrom ? new Date(filters.createdFrom).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleDateChange('createdFrom', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="createdTo" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {t('createdTo')}
                            </Label>
                            <Input
                                id="createdTo"
                                type="date"
                                value={filters.createdTo ? new Date(filters.createdTo).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleDateChange('createdTo', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Sorting and Pagination */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sortBy">{t('sortBy')}</Label>
                            <Select
                                value={filters.sortBy || 'CreatedAt'}
                                onValueChange={(value) => handleFilterChange('sortBy', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SORT_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sortOrder">{t('sortOrder')}</Label>
                            <Select
                                value={filters.sortOrder || 'desc'}
                                onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asc">{t('ascending')}</SelectItem>
                                    <SelectItem value="desc">{t('descending')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pageSize">{t('pageSize')}</Label>
                            <Select
                                value={filters.pageSize?.toString() || '50'}
                                onValueChange={(value) => handleFilterChange('pageSize', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <SelectItem key={size} value={size.toString()}>
                                            {size} {t('perPage')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Apply Filters Button */}
                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            onClick={onApplyFilters}
                            disabled={isLoading}
                            className="min-w-[120px]"
                        >
                            {isLoading ? t('applying') : t('applyFilters')}
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
