import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';
import {
    Plus,
    Calendar,
    User,
    ListChecks,
    Star,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    Users,
    CheckCircle2,
    Clock,
    FileText,
} from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorDisplay } from '@/components/shared';
import { useWeeklyPlans } from '@/hooks/useWeeklyPlans';
// import { useUsersForFilter } from '@/hooks/useUsersForFilter'; // Disabled - SalesManager doesn't have access
import { useAuthStore } from '@/stores/authStore';
import { weeklyPlanApi } from '@/services/weeklyPlan/weeklyPlanApi';
import type { EmployeeInfo } from '@/types/weeklyPlan.types';
import CreateWeeklyPlanModal from './CreateWeeklyPlanModal';
import ViewWeeklyPlanModal from './ViewWeeklyPlanModal';
import EditWeeklyPlanModal from './EditWeeklyPlanModal';
import DeleteWeeklyPlanModal from './DeleteWeeklyPlanModal';
import ReviewWeeklyPlanModal from './ReviewWeeklyPlanModal';
import type { WeeklyPlan, FilterWeeklyPlansDto } from '@/types/weeklyPlan.types';
import { format } from 'date-fns';

// Helper function to render stars

export const WeeklyPlansScreen: React.FC = () => {
    const { t } = useTranslation();
    const {
        plans,
        loading,
        error,
        pagination,
        filters,
        hasAccess,
        canCreate,
        canReview,
        fetchPlans,
        createPlan,
        updatePlan,
        deletePlan,
        reviewPlan,
        setFilters,
        clearError,
    } = useWeeklyPlans();

    const { user } = useAuthStore();
    // Fetch salesmen for filter dropdown
    const [availableUsers, setAvailableUsers] = useState<EmployeeInfo[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewingPlan, setViewingPlan] = useState<WeeklyPlan | null>(null);
    const [editingPlan, setEditingPlan] = useState<WeeklyPlan | null>(null);
    const [deletingPlan, setDeletingPlan] = useState<WeeklyPlan | null>(null);
    const [reviewingPlan, setReviewingPlan] = useState<WeeklyPlan | null>(
        null
    );

    useEffect(() => {
        if (hasAccess) {
            fetchPlans({ page: 1, pageSize: 20 });
        }
    }, [hasAccess]);

    // Fetch salesmen for filter dropdown
    useEffect(() => {
        const fetchSalesmen = async () => {
            if (!canReview) return; // Only fetch for managers/Admins

            try {
                setUsersLoading(true);
                const response = await weeklyPlanApi.getAllSalesmen();
                if (response.success && response.data) {
                    setAvailableUsers(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch salesmen:', error);
            } finally {
                setUsersLoading(false);
            }
        };

        fetchSalesmen();
    }, [canReview]);

    const handleFilterChange = (newFilters: Partial<FilterWeeklyPlansDto>) => {
        const updatedFilters = { ...filters, ...newFilters, page: 1 };
        setFilters(updatedFilters);
        fetchPlans(updatedFilters);
    };

    const handlePageChange = (page: number) => {
        const updatedFilters = { ...filters, page };
        setFilters(updatedFilters);
        fetchPlans(updatedFilters);
    };

    // Calculate statistics
    const statistics = useMemo(() => {
        const totalPlans = pagination.totalCount || plans.length;
        const completedTasks = plans.reduce((acc, plan) => {
            // Use completedTasks from API if available, otherwise calculate
            if (plan.completedTasks !== undefined) {
                return acc + plan.completedTasks;
            }
            // Fallback: calculate from tasks array
            return acc + (plan.tasks?.filter(t =>
                t.isCompleted === true || t.status === 'Completed'
            ).length || 0);
        }, 0);
        const totalTasks = plans.reduce((acc, plan) => {
            // Use totalTasks from API if available, otherwise calculate
            if (plan.totalTasks !== undefined) {
                return acc + plan.totalTasks;
            }
            // Fallback: calculate from tasks array
            return acc + (plan.tasks?.length || 0);
        }, 0);
        // Calculate hasManagerReview based on managerReviewedAt (real data from backend)
        const pendingReviews = plans.filter(plan => !plan.managerReviewedAt).length;
        const reviewedPlans = plans.filter(plan => !!plan.managerReviewedAt).length;
        return {
            totalPlans,
            completedTasks,
            totalTasks,
            pendingReviews,
            reviewedPlans,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        };
    }, [plans, pagination.totalCount]);

    if (!hasAccess) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Access Denied
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        You don't have permission to view weekly plans.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Enhanced Professional Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-800 rounded-xl shadow-lg p-8 text-white">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-white">Weekly Plans</h1>
                            <p className="text-indigo-100 dark:text-indigo-200 text-lg">
                                Manage and track weekly to-do lists and progress
                            </p>
                            <p className="text-indigo-200 dark:text-indigo-300 text-sm mt-2">
                                Stay organized and monitor your team's weekly achievements
                            </p>
                        </div>
                        {canCreate && (
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 shadow-md transition-all duration-200"
                                size="lg"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Create Plan
                            </Button>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500 dark:border-l-indigo-400">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalPlans')}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {statistics.totalPlans}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {statistics.reviewedPlans} reviewed
                                    </p>
                                </div>
                                <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-full">
                                    <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500 dark:border-l-green-400">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('completionRate')}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {statistics.completionRate}%
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {statistics.completedTasks} / {statistics.totalTasks} tasks
                                    </p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
                                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500 dark:border-l-yellow-400">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('pendingReviews')}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {statistics.pendingReviews}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Awaiting manager review
                                    </p>
                                </div>
                                <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-full">
                                    <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Enhanced Filter Section */}
                <Card className="border-0 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ListChecks className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            Filters & Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {canReview && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Employee
                                    </label>
                                    <Select
                                        value={
                                            filters.employeeId || 'all'
                                        }
                                        onValueChange={(value) =>
                                            handleFilterChange({
                                                employeeId:
                                                    value === 'all'
                                                        ? undefined
                                                        : value,
                                            })
                                        }
                                        disabled={usersLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    usersLoading
                                                        ? 'Loading...'
                                                        : 'All employees'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All employees
                                            </SelectItem>
                                            {availableUsers.map(
                                                (salesman) => (
                                                    <SelectItem
                                                        key={salesman.id}
                                                        value={salesman.id}
                                                    >
                                                        {salesman.firstName} {salesman.lastName}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Start Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="date"
                                        value={filters.weekStartDate || ''}
                                        onChange={(e) =>
                                            handleFilterChange({
                                                weekStartDate:
                                                    e.target
                                                        .value,
                                            })
                                        }
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
                                        value={filters.weekEndDate || ''}
                                        onChange={(e) =>
                                            handleFilterChange({
                                                weekEndDate:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {canReview && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Review Status
                                        </label>
                                        <Select
                                            value={
                                                filters.hasManagerReview ===
                                                    undefined
                                                    ? 'all'
                                                    : filters.hasManagerReview
                                                        ? 'reviewed'
                                                        : 'pending'
                                            }
                                            onValueChange={(
                                                value
                                            ) =>
                                                handleFilterChange(
                                                    {
                                                        hasManagerReview:
                                                            value ===
                                                                'all'
                                                                ? undefined
                                                                : value ===
                                                                'reviewed',
                                                    }
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('allPlans')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All plans
                                                </SelectItem>
                                                <SelectItem value="reviewed">
                                                    Reviewed
                                                </SelectItem>
                                                <SelectItem value="pending">
                                                    Pending
                                                    review
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <ErrorDisplay message={error} onDismiss={clearError} />
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner
                            size="lg"
                            text="Loading plans..."
                        />
                    </div>
                ) : plans.length === 0 ? (
                    <EmptyState
                        title="No plans found"
                        description={
                            canCreate
                                ? 'Create your first weekly plan to get started.'
                                : 'No weekly plans available yet.'
                        }
                        action={
                            canCreate ? (
                                <Button
                                    onClick={() =>
                                        setShowCreateModal(
                                            true
                                        )
                                    }
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Plan
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        {/* Results Header */}
                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Showing <span className="font-bold text-indigo-600 dark:text-indigo-400">{plans.length}</span> of{' '}
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{pagination.totalCount}</span> plans
                            </p>
                        </div>

                        {/* Enhanced Plan Cards Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {plans.map((plan) => {
                                console.log('Rendering plan:', plan.id, 'API data:', {
                                    totalTasks: plan.totalTasks,
                                    completedTasks: plan.completedTasks,
                                    completionPercentage: plan.completionPercentage,
                                    tasksArray: plan.tasks
                                });

                                // Use API-calculated values if available, otherwise calculate
                                const totalTasks = plan.totalTasks ?? plan.tasks?.length ?? 0;
                                const completedTasks = plan.completedTasks ?? plan.tasks?.filter(t => {
                                    // Check isCompleted property (from API)
                                    if (t.isCompleted === true) return true;
                                    // Fallback: check status property
                                    if (t.status === 'Completed') return true;
                                    // Fallback: tasks with progress are considered completed
                                    if ((t.progressCount && t.progressCount > 0) || (t.progresses && t.progresses.length > 0)) return true;
                                    return false;
                                }).length ?? 0;
                                const progressPercentage = plan.completionPercentage ?? (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
                                const isComplete = progressPercentage === 100;
                                // Pending Review: plan has no manager review yet (managerReviewedAt is null) and user can review
                                const isPendingReview = !plan.managerReviewedAt && canReview;

                                return (
                                    <Card
                                        key={plan.id}
                                        className={`hover:shadow-xl transition-all duration-300 border-l-4 ${isComplete
                                            ? 'border-l-green-500 dark:border-l-green-400'
                                            : isPendingReview
                                                ? 'border-l-yellow-500 dark:border-l-yellow-400'
                                                : 'border-l-indigo-500 dark:border-l-indigo-400'
                                            }`}
                                    >
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                {/* Header Section */}
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                                                {plan.title}
                                                            </h3>
                                                            {isComplete && (
                                                                <Badge className="bg-green-500 text-white">
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                    Complete
                                                                </Badge>
                                                            )}
                                                            {isPendingReview && (
                                                                <Badge className="bg-yellow-500 text-white">
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    Pending Review
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        {plan.description && (
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                                                {plan.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Info Section */}
                                                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                                                            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('employee')}</p>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {plan.employee
                                                                    ? `${plan.employee.firstName} ${plan.employee.lastName}`
                                                                    : plan.employeeId}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Week</p>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {(() => {
                                                                    try {
                                                                        const startDate = new Date(plan.weekStartDate);
                                                                        const endDate = new Date(plan.weekEndDate);
                                                                        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                                                                            return 'Invalid dates';
                                                                        }
                                                                        return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd')}`;
                                                                    } catch (error) {
                                                                        return 'Invalid dates';
                                                                    }
                                                                })()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Section */}
                                                <div className="space-y-2 pt-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <ListChecks className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                                Tasks Progress
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                            {completedTasks} / {totalTasks}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                                        <div
                                                            className={`h-3 rounded-full transition-all duration-500 ${isComplete
                                                                ? 'bg-gradient-to-r from-green-500 to-green-600'
                                                                : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                                                                }`}
                                                            style={{
                                                                width: `${progressPercentage}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-right">
                                                        {progressPercentage}% complete
                                                    </p>
                                                </div>

                                                {/* Actions Section */}
                                                <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setViewingPlan(plan)}
                                                        className="flex-1 flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View
                                                    </Button>
                                                    {canReview && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setReviewingPlan(plan)}
                                                            className="flex-1 flex items-center justify-center gap-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                                        >
                                                            <Star className="h-4 w-4" />
                                                            Review
                                                        </Button>
                                                    )}
                                                    {plan.employeeId === user?.id && canCreate && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setEditingPlan(plan)}
                                                                className="flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setDeletingPlan(plan)}
                                                                className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Enhanced Pagination */}
                        {pagination.totalPages > 1 && (
                            <Card className="border-0 shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Page <span className="font-bold text-indigo-600 dark:text-indigo-400">{pagination.page}</span> of{' '}
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{pagination.totalPages}</span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handlePageChange(
                                                        pagination.page - 1
                                                    )
                                                }
                                                disabled={pagination.page === 1}
                                                className="flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handlePageChange(
                                                        pagination.page + 1
                                                    )
                                                }
                                                disabled={!pagination.hasNextPage}
                                                className="flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* Modals */}
                {showCreateModal && (
                    <CreateWeeklyPlanModal
                        onClose={() => setShowCreateModal(false)}
                        onSubmit={createPlan}
                    />
                )}

                {viewingPlan && (
                    <ViewWeeklyPlanModal
                        plan={viewingPlan}
                        onClose={() => setViewingPlan(null)}
                    />
                )}

                {editingPlan && (
                    <EditWeeklyPlanModal
                        plan={editingPlan}
                        onClose={() => setEditingPlan(null)}
                        onSubmit={async (data) => {
                            const success = await updatePlan(
                                editingPlan.id,
                                data
                            );
                            if (success) {
                                setEditingPlan(null);
                            }
                            return success;
                        }}
                    />
                )}

                {deletingPlan && (
                    <DeleteWeeklyPlanModal
                        plan={deletingPlan}
                        onClose={() => setDeletingPlan(null)}
                        onConfirm={async () => {
                            const success = await deletePlan(
                                deletingPlan.id
                            );
                            if (success) {
                                setDeletingPlan(null);
                            }
                            return success;
                        }}
                    />
                )}

                {reviewingPlan && (
                    <ReviewWeeklyPlanModal
                        plan={reviewingPlan}
                        onClose={() => setReviewingPlan(null)}
                        onSubmit={async (data) => {
                            const success = await reviewPlan(
                                reviewingPlan.id,
                                data
                            );
                            if (success) {
                                setReviewingPlan(null);
                            }
                            return success;
                        }}
                    />
                )}
            </div>
        </div>
    );
};


