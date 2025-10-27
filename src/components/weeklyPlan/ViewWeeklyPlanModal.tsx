import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ListChecks,
    Calendar,
    User,
    CheckCircle2,
    Circle,
    Star,
} from 'lucide-react';
import { format } from 'date-fns';
import type { WeeklyPlan } from '@/types/weeklyPlan.types';

interface ViewWeeklyPlanModalProps {
    plan: WeeklyPlan;
    onClose: () => void;
}

const renderStars = (rating: number) => {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);
    return (
        <div className="flex items-center gap-1">
            {stars.map((star) => (
                <Star
                    key={star}
                    className={`h-5 w-5 ${star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                        }`}
                />
            ))}
        </div>
    );
};

const ViewWeeklyPlanModal: React.FC<ViewWeeklyPlanModalProps> = ({
    plan,
    onClose,
}) => {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogDescription>
                        View weekly plan details and progress
                    </DialogDescription>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <DialogTitle className="flex items-center gap-2 text-2xl mb-2">
                                <ListChecks className="h-6 w-6" />
                                {plan.title}
                            </DialogTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {plan.employee ? `${plan.employee.firstName} ${plan.employee.lastName}` : plan.employeeId}
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
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Description */}
                    {plan.description && (
                        <div>
                            <h3 className="font-semibold mb-2">
                                Description
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {plan.description}
                            </p>
                        </div>
                    )}

                    {/* Progress Overview */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">
                                Overall Progress
                            </span>
                            <span className="text-2xl font-bold text-green-600">
                                {plan.tasks && plan.tasks.length > 0
                                    ? Math.round((plan.tasks.filter(t => t.status === 'Completed').length / plan.tasks.length) * 100)
                                    : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-green-500 h-3 rounded-full transition-all"
                                style={{
                                    width: `${plan.tasks && plan.tasks.length > 0
                                        ? Math.round((plan.tasks.filter(t => t.status === 'Completed').length / plan.tasks.length) * 100)
                                        : 0}%`,
                                }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {plan.tasks?.filter(t => t.status === 'Completed').length || 0} of {plan.tasks?.length || 0}{' '}
                            tasks completed
                        </p>
                    </div>

                    {/* Tasks */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <ListChecks className="h-5 w-5" />
                            Tasks ({plan.tasks?.length || 0})
                        </h3>
                        <div className="space-y-2">
                            {plan.tasks
                                ?.map((task) => (
                                    <div
                                        key={task.id}
                                        className={`p-3 border rounded-lg ${task.status === 'Completed'
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200'
                                            : 'bg-white dark:bg-gray-800'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {task.status === 'Completed' ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {task.taskType}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        task.priority === 'High' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                                        task.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                                        'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                                    }`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                                {task.clientName && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        Client: {task.clientName}
                                                    </p>
                                                )}
                                                {task.plannedDate && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Scheduled: {format(new Date(task.plannedDate), 'MMM dd, yyyy')}
                                                    </p>
                                                )}
                                                {task.purpose && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {task.purpose}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )) || []}
                        </div>
                    </div>

                    {/* Daily Progress section removed - Not part of new WeeklyPlan API structure */}

                    {/* Manager Review */}
                    {plan.rating && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                Manager Review
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {renderStars(plan.rating)}
                                    <span className="text-lg font-semibold">
                                        {plan.rating}/5
                                    </span>
                                </div>
                                {plan.managerComment && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Comment:
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                            {
                                                plan.managerComment
                                            }
                                        </p>
                                    </div>
                                )}
                                {plan.managerReviewedAt && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Reviewed on{' '}
                                        {format(
                                            new Date(
                                                plan.managerReviewedAt
                                            ),
                                            'MMMM dd, yyyy'
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewWeeklyPlanModal;




