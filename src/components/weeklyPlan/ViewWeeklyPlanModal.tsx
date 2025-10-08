import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    ListChecks,
    Calendar,
    User,
    CheckCircle2,
    Circle,
    Star,
    Clock
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
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <DialogTitle className="flex items-center gap-2 text-2xl mb-2">
                                <ListChecks className="h-6 w-6" />
                                {plan.title}
                            </DialogTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {plan.employeeName}
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
                                {plan.completionPercentage}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-green-500 h-3 rounded-full transition-all"
                                style={{
                                    width: `${plan.completionPercentage}%`,
                                }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {plan.completedTasks} of {plan.totalTasks}{' '}
                            tasks completed
                        </p>
                    </div>

                    {/* Tasks */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <ListChecks className="h-5 w-5" />
                            Tasks ({plan.tasks.length})
                        </h3>
                        <div className="space-y-2">
                            {plan.tasks
                                .sort(
                                    (a, b) =>
                                        a.displayOrder -
                                        b.displayOrder
                                )
                                .map((task) => (
                                    <div
                                        key={task.id}
                                        className={`p-3 border rounded-lg ${task.isCompleted
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200'
                                            : 'bg-white dark:bg-gray-800'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {task.isCompleted ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <p
                                                    className={`font-medium ${task.isCompleted
                                                        ? 'line-through text-gray-500'
                                                        : ''
                                                        }`}
                                                >
                                                    {
                                                        task.title
                                                    }
                                                </p>
                                                {task.description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {
                                                            task.description
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Daily Progress */}
                    {plan.dailyProgresses.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Daily Progress (
                                {plan.dailyProgresses.length})
                            </h3>
                            <div className="space-y-3">
                                {plan.dailyProgresses
                                    .sort(
                                        (a, b) =>
                                            new Date(
                                                b.progressDate
                                            ).getTime() -
                                            new Date(
                                                a.progressDate
                                            ).getTime()
                                    )
                                    .map((progress) => (
                                        <div
                                            key={
                                                progress.id
                                            }
                                            className="p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">
                                                    {format(
                                                        new Date(
                                                            progress.progressDate
                                                        ),
                                                        'EEEE, MMMM dd, yyyy'
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                {
                                                    progress.notes
                                                }
                                            </p>
                                            {progress.tasksWorkedOn &&
                                                progress
                                                    .tasksWorkedOn
                                                    .length >
                                                0 && (
                                                    <div className="mt-2">
                                                        <p className="text-sm text-gray-500 mb-1">
                                                            Tasks
                                                            worked
                                                            on:
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {progress.tasksWorkedOn.map(
                                                                (
                                                                    taskId
                                                                ) => {
                                                                    const task =
                                                                        plan.tasks.find(
                                                                            (
                                                                                t
                                                                            ) =>
                                                                                t.id ===
                                                                                taskId
                                                                        );
                                                                    return task ? (
                                                                        <Badge
                                                                            key={
                                                                                taskId
                                                                            }
                                                                            variant="outline"
                                                                        >
                                                                            {
                                                                                task.title
                                                                            }
                                                                        </Badge>
                                                                    ) : null;
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

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




