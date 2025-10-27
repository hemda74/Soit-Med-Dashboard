import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
} from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorDisplay, PageHeader, FilterCard } from '@/components/shared';
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
const renderStars = (rating: number | null) => {
    if (!rating) return null;

    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    return (
        <div className="flex items-center gap-1">
            {stars.map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                        }`}
                />
            ))}
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                ({rating}/5)
            </span>
        </div>
    );
};

export const WeeklyPlansScreen: React.FC = () => {
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
            if (!canReview) return; // Only fetch for managers/admins

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
        <div className="space-y-6">
            <PageHeader
                title="Weekly Plans"
                description="Manage and track weekly to-do lists and progress"
                action={
                    canCreate ? (
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Create Plan
                        </Button>
                    ) : undefined
                }
            />

            <FilterCard>
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
                                        <SelectValue placeholder="All plans" />
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Minimum Rating
                                </label>
                                <Select
                                    value={
                                        filters.minRating?.toString() ||
                                        'all'
                                    }
                                    onValueChange={(
                                        value
                                    ) =>
                                        handleFilterChange(
                                            {
                                                minRating:
                                                    value ===
                                                        'all'
                                                        ? undefined
                                                        : parseInt(
                                                            value
                                                        ),
                                            }
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All ratings" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All ratings
                                        </SelectItem>
                                        <SelectItem value="1">
                                            1+ stars
                                        </SelectItem>
                                        <SelectItem value="2">
                                            2+ stars
                                        </SelectItem>
                                        <SelectItem value="3">
                                            3+ stars
                                        </SelectItem>
                                        <SelectItem value="4">
                                            4+ stars
                                        </SelectItem>
                                        <SelectItem value="5">
                                            5 stars
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>
            </FilterCard>

            {error && (
                <ErrorDisplay message={error} onDismiss={clearError} />
            )}

            {loading ? (
                <div className="flex justify-center py-8">
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
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {plans.length} of{' '}
                            {pagination.totalCount} plans
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className="hover:shadow-md transition-shadow"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                    {
                                                        plan.title
                                                    }
                                                </h3>
                                                {plan.rating && (
                                                    <Badge
                                                        variant="outline"
                                                        className="flex items-center gap-1"
                                                    >
                                                        {renderStars(
                                                            plan.rating
                                                        )}
                                                    </Badge>
                                                )}
                                            </div>

                                            {plan.description && (
                                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                                    {
                                                        plan.description
                                                    }
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    {plan.employee
                                                        ? `${plan.employee.firstName} ${plan.employee.lastName}`
                                                        : plan.employeeId
                                                    }
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(
                                                        new Date(
                                                            plan.weekStartDate
                                                        ),
                                                        'MMM dd'
                                                    )}{' '}
                                                    -{' '}
                                                    {format(
                                                        new Date(
                                                            plan.weekEndDate
                                                        ),
                                                        'MMM dd, yyyy'
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ListChecks className="h-4 w-4" />
                                                    {plan.tasks?.filter(t => t.status === 'Completed').length || 0}
                                                    /
                                                    {plan.tasks?.length || 0}{' '}
                                                    tasks
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full transition-all"
                                                    style={{
                                                        width: `${plan.tasks && plan.tasks.length > 0
                                                            ? Math.round((plan.tasks.filter(t => t.status === 'Completed').length / plan.tasks.length) * 100)
                                                            : 0}%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {plan.tasks && plan.tasks.length > 0
                                                    ? Math.round((plan.tasks.filter(t => t.status === 'Completed').length / plan.tasks.length) * 100)
                                                    : 0
                                                }% complete
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setViewingPlan(
                                                        plan
                                                    )
                                                }
                                                className="flex items-center gap-1"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Button>
                                            {canReview && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setReviewingPlan(
                                                            plan
                                                        )
                                                    }
                                                    className="flex items-center gap-1"
                                                >
                                                    <Star className="h-4 w-4" />
                                                    Review
                                                </Button>
                                            )}
                                            {plan.employeeId ===
                                                user?.id &&
                                                canCreate && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setEditingPlan(
                                                                    plan
                                                                )
                                                            }
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setDeletingPlan(
                                                                    plan
                                                                )
                                                            }
                                                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete
                                                        </Button>
                                                    </>
                                                )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Page {pagination.page} of{' '}
                                {pagination.totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.page -
                                            1
                                        )
                                    }
                                    disabled={
                                        pagination.page === 1
                                    }
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.page +
                                            1
                                        )
                                    }
                                    disabled={
                                        !pagination.hasNextPage
                                    }
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
    );
};


