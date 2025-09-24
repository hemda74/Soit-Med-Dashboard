import React, { useState, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Plus,
    Search,
    Filter,
    Calendar,
    User,
    FileText,
    Star,
    Edit,
    Trash2,
    MessageSquare,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useSalesReports } from '@/hooks/useSalesReports';
import type { SalesReportResponseDto, FilterSalesReportsDto } from '@/types/salesReport.types';
import CreateSalesReportModal from './CreateSalesReportModal';
import EditSalesReportModal from './EditSalesReportModal';
import RateSalesReportModal from './RateSalesReportModal';
import DeleteSalesReportModal from './DeleteSalesReportModal';

const SalesReportsScreen: React.FC = () => {
    const { hasAnyRole } = useAuthStore();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingReport, setEditingReport] = useState<SalesReportResponseDto | null>(null);
    const [ratingReport, setRatingReport] = useState<SalesReportResponseDto | null>(null);
    const [deletingReport, setDeletingReport] = useState<SalesReportResponseDto | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Check if user has access to sales reports
    const hasAccess = hasAnyRole(['Salesman', 'SalesManager', 'SuperAdmin']); // Sales Employee, Sales Manager, and Super Admin

    if (!hasAccess) {
        return <Navigate to="/dashboard" replace />;
    }

    const {
        reports,
        loading,
        error,
        pagination,
        filters,
        canCreate,
        canEdit,
        canDelete,
        canRate,
        createReport,
        updateReport,
        deleteReport,
        rateReport,
        fetchReports,
        setFilters,
        clearError
    } = useSalesReports();

    const handleFilterChange = useCallback((newFilters: Partial<FilterSalesReportsDto>) => {
        const updatedFilters = { ...filters, ...newFilters, page: 1 };
        setFilters(updatedFilters);
        fetchReports(updatedFilters);
    }, [filters, setFilters, fetchReports]);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        // Filter reports locally for search
        // In a real app, you might want to implement server-side search
    }, []);

    const filteredReports = useMemo(() => {
        if (!searchTerm) return reports;
        return reports.filter(report =>
            report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reports, searchTerm]);

    const getReportTypeColor = useCallback((type: string) => {
        switch (type) {
            case 'daily': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'weekly': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'monthly': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'custom': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    }, []);

    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }, []);

    const renderStars = useCallback((rating: number | null) => {
        if (!rating) return null;
        return (
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                    />
                ))}
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    ({rating}/5)
                </span>
            </div>
        );
    }, []);

    if (loading && reports.length === 0) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading sales reports...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Reports</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage and track sales performance reports
                    </p>
                </div>
                {canCreate && (
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Report
                    </Button>
                )}
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters & Search
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search reports..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Report Type Filter */}
                        <Select
                            value={filters.type || 'all'}
                            onValueChange={(value) => handleFilterChange({ type: value === 'all' ? undefined : value as any })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Start Date */}
                        <Input
                            type="date"
                            placeholder="Start Date"
                            value={filters.startDate || ''}
                            onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
                        />

                        {/* End Date */}
                        <Input
                            type="date"
                            placeholder="End Date"
                            value={filters.endDate || ''}
                            onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
                        />
                    </div>

                    {/* Clear Filters */}
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setFilters({ page: 1, pageSize: 10 });
                                fetchReports({ page: 1, pageSize: 10 });
                                setSearchTerm('');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-red-800 dark:text-red-200">{error}</p>
                            <Button variant="outline" size="sm" onClick={clearError}>
                                Dismiss
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reports List */}
            <div className="space-y-4">
                {filteredReports.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No Reports Found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {searchTerm ? 'No reports match your search criteria.' : 'No sales reports have been created yet.'}
                            </p>
                            {canCreate && !searchTerm && (
                                <Button onClick={() => setShowCreateModal(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Report
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredReports.map((report) => (
                        <Card key={report.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {report.title}
                                            </h3>
                                            <Badge className={getReportTypeColor(report.type)}>
                                                {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDate(report.reportDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <User className="h-4 w-4" />
                                                <span>{report.employeeName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <FileText className="h-4 w-4" />
                                                <span>Created {formatDate(report.createdAt)}</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                                            {report.body}
                                        </p>

                                        {/* Rating Section */}
                                        {report.rating && (
                                            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                        Manager Rating:
                                                    </span>
                                                    {renderStars(report.rating)}
                                                </div>
                                                {report.comment && (
                                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                        "{report.comment}"
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-4">
                                        {canEdit(report) && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEditingReport(report)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canDelete(report) && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setDeletingReport(report)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canRate && !report.rating && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setRatingReport(report)}
                                            >
                                                <Star className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canRate && report.rating && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setRatingReport(report)}
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                                {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
                                {pagination.totalCount} reports
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.hasPreviousPage}
                                    onClick={() => handleFilterChange({ page: pagination.page - 1 })}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.hasNextPage}
                                    onClick={() => handleFilterChange({ page: pagination.page + 1 })}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateSalesReportModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={createReport}
                />
            )}

            {editingReport && (
                <EditSalesReportModal
                    report={editingReport}
                    onClose={() => setEditingReport(null)}
                    onSubmit={updateReport}
                />
            )}

            {ratingReport && (
                <RateSalesReportModal
                    report={ratingReport}
                    onClose={() => setRatingReport(null)}
                    onSubmit={rateReport}
                />
            )}

            {deletingReport && (
                <DeleteSalesReportModal
                    report={deletingReport}
                    onClose={() => setDeletingReport(null)}
                    onConfirm={deleteReport}
                />
            )}
        </div>
    );
};

export default SalesReportsScreen;
