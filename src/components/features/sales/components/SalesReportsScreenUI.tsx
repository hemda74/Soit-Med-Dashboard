import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Plus,
    Search,
    Calendar,
    User,
    FileText,
    Star,
    Edit,
    Trash2,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Users
} from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorDisplay, PageHeader, FilterCard } from '@/components/shared';
import type { SalesReportResponseDto, FilterSalesReportsDto, UserOption } from '@/types/salesReport.types';

// Helper function to render stars
const renderStars = (rating: number | null, getStarRating: (rating: number | null) => { rating: number; stars: { filled: boolean; index: number }[] } | null) => {
    const starData = getStarRating(rating);
    if (!starData) return null;

    return (
        <div className="flex items-center gap-1">
            {starData.stars.map((star) => (
                <Star
                    key={star.index}
                    className={`h-4 w-4 ${star.filled
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                        }`}
                />
            ))}
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                ({starData.rating}/5)
            </span>
        </div>
    );
};

interface SalesReportsScreenUIProps {
    hasAccess: boolean;
    reports: SalesReportResponseDto[];
    filters: FilterSalesReportsDto;
    isLoading: boolean;
    error: string | null;
    totalPages: number;
    currentPage: number;
    totalReports: number;
    availableUsers: UserOption[];
    usersLoading: boolean;
    onFilterChange: (filters: Partial<FilterSalesReportsDto>) => void;
    onPageChange: (page: number) => void;
    onCreateReport: () => void;
    onEditReport: (report: SalesReportResponseDto) => void;
    onDeleteReport: (report: SalesReportResponseDto) => void;
    onRateReport: (report: SalesReportResponseDto) => void;
    onViewComments: (report: SalesReportResponseDto) => void;
    onClearError: () => void;
    getStarRating: (rating: number | null) => { rating: number; stars: { filled: boolean; index: number }[] } | null;
}

export const SalesReportsScreenUI: React.FC<SalesReportsScreenUIProps> = ({
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
    onFilterChange,
    onPageChange,
    onCreateReport,
    onEditReport,
    onDeleteReport,
    onRateReport,
    onViewComments,
    onClearError,
    getStarRating
}) => {
    if (!hasAccess) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Access Denied
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        You don't have permission to view sales reports.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Sales Reports"
                description="Manage and track sales performance reports"
                action={
                    <Button onClick={onCreateReport} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Report
                    </Button>
                }
            />

            <FilterCard>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search reports..."
                                value={filters.searchTerm || ''}
                                onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Type
                        </label>
                        <Select
                            value={filters.type || 'all'}
                            onValueChange={(value) => onFilterChange({ type: value === 'all' ? undefined : value as 'daily' | 'weekly' | 'monthly' | 'custom' })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Employee
                        </label>
                        <Select
                            value={filters.employeeId || 'all'}
                            onValueChange={(value) => onFilterChange({ employeeId: value === 'all' ? undefined : value })}
                            disabled={usersLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={usersLoading ? "Loading..." : "All employees"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All employees</SelectItem>
                                {availableUsers.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Start Date
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) => onFilterChange({ startDate: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            End Date
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) => onFilterChange({ endDate: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>
            </FilterCard>

            {error && (
                <ErrorDisplay
                    message={error}
                    onDismiss={onClearError}
                />
            )}

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" text="Loading reports..." />
                </div>
            ) : reports.length === 0 ? (
                <EmptyState
                    title="No reports found"
                    description="Create your first sales report to get started."
                    action={
                        <Button onClick={onCreateReport} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Report
                        </Button>
                    }
                />
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {reports.length} of {totalReports} reports
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {reports.map((report) => (
                            <Card key={report.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                    {report.title}
                                                </h3>
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    {report.type}
                                                </Badge>
                                            </div>

                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                                {report.body}
                                            </p>

                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    {report.employeeName}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(report.reportDate).toLocaleDateString()}
                                                </div>
                                                {report.rating !== null && report.rating !== undefined && (
                                                    <div className="flex items-center gap-1">
                                                        {renderStars(report.rating, getStarRating)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onRateReport(report)}
                                                className="flex items-center gap-1"
                                            >
                                                <Star className="h-4 w-4" />
                                                Rate
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onEditReport(report)}
                                                className="flex items-center gap-1"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onViewComments(report)}
                                                className="flex items-center gap-1"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                Comments
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onDeleteReport(report)}
                                                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
