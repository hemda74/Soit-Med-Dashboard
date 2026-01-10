import React, { useEffect, useState } from 'react';
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
    Volume2,
} from 'lucide-react';
import { getStaticFileUrl } from '@/utils/apiConfig';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import type { WeeklyPlan } from '@/types/weeklyPlan.types';
import { weeklyPlanApi } from '@/services/weeklyPlan/weeklyPlanApi';
import { LoadingSpinner } from '@/components/shared';

interface ViewWeeklyPlanModalProps {
    plan: WeeklyPlan;
    onClose: () => void;
}

// Helper function to render stars
const renderStars = (rating: number) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-5 w-5 ${star <= rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300 dark:text-gray-600'
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
    const { t } = useTranslation();
    const [fullPlan, setFullPlan] = useState<WeeklyPlan | null>(plan);
    const [loading, setLoading] = useState(false);

    // Fetch full plan details with progresses when modal opens
    useEffect(() => {
        const fetchFullPlan = async () => {
            try {
                setLoading(true);
                const response = await weeklyPlanApi.getWeeklyPlanById(plan.id);
                if (response.success && response.data) {
                    setFullPlan(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch full plan details:', error);
                // Keep the original plan if fetch fails
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if we don't have progresses loaded
        const hasProgresses = plan.tasks?.some(task => task.progresses && task.progresses.length > 0);
        if (!hasProgresses) {
            fetchFullPlan();
        }
    }, [plan.id]);

    const displayPlan = fullPlan || plan;

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner size="md" text="Loading plan details..." />
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogDescription>
                                View weekly plan details and progress
                            </DialogDescription>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <DialogTitle className="flex items-center gap-2 text-2xl mb-2">
                                        <ListChecks className="h-6 w-6" />
                                        {displayPlan.title}
                                    </DialogTitle>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            {displayPlan.employee ? `${displayPlan.employee.firstName} ${displayPlan.employee.lastName}` : displayPlan.employeeId}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {format(
                                                new Date(
                                                    displayPlan.weekStartDate
                                                ),
                                                'MMM dd'
                                            )}{' '}
                                            -{' '}
                                            {format(
                                                new Date(
                                                    displayPlan.weekEndDate
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
                            {displayPlan.description && (
                                <div>
                                    <h3 className="font-semibold mb-2">
                                        Description
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {displayPlan.description}
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
                                        {(() => {
                                            const totalTasks = displayPlan.tasks?.length || 0;
                                            if (totalTasks === 0) return 0;
                                            // Check completion: status === 'Completed' OR has progress records
                                            const completedTasks = displayPlan.tasks?.filter(t => {
                                                if (t.status === 'Completed') return true;
                                                // Fallback: tasks with progress are considered completed
                                                if ((t.progressCount && t.progressCount > 0) || (t.progresses && t.progresses.length > 0)) return true;
                                                return false;
                                            }).length || 0;
                                            return Math.round((completedTasks / totalTasks) * 100);
                                        })()}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-green-500 h-3 rounded-full transition-all"
                                        style={{
                                            width: `${(() => {
                                                const totalTasks = displayPlan.tasks?.length || 0;
                                                if (totalTasks === 0) return 0;
                                                const completedTasks = displayPlan.tasks?.filter(t => {
                                                    if (t.status === 'Completed') return true;
                                                    if ((t.progressCount && t.progressCount > 0) || (t.progresses && t.progresses.length > 0)) return true;
                                                    return false;
                                                }).length || 0;
                                                return Math.round((completedTasks / totalTasks) * 100);
                                            })()}%`,
                                        }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {(() => {
                                        const totalTasks = displayPlan.tasks?.length || 0;
                                        const completedTasks = displayPlan.tasks?.filter(t => {
                                            if (t.status === 'Completed') return true;
                                            if ((t.progressCount && t.progressCount > 0) || (t.progresses && t.progresses.length > 0)) return true;
                                            return false;
                                        }).length || 0;
                                        return `${completedTasks} of ${totalTasks}`;
                                    })()} tasks completed
                                </p>
                            </div>

                            {/* Tasks */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <ListChecks className="h-5 w-5" />
                                    Tasks ({displayPlan.tasks?.length || 0})
                                </h3>
                                <div className="space-y-2">
                                    {displayPlan.tasks
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
                                                                {task.taskType || task.title}
                                                            </span>
                                                            {task.priority && (
                                                                <span className={`text-xs px-2 py-1 rounded ${task.priority === 'High' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                                                    task.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                                                        'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                                                    }`}>
                                                                    {task.priority}
                                                                </span>
                                                            )}
                                                            {task.status && (
                                                                <span className={`text-xs px-2 py-1 rounded ${task.status === 'Completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                                                    task.status === 'InProgress' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                                                        task.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                                                            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                                                    }`}>
                                                                    {task.status}
                                                                </span>
                                                            )}
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
                                                        {task.notes && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                {task.notes}
                                                            </p>
                                                        )}

                                                        {/* Task Progresses */}
                                                        {task.progresses && task.progresses.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                                    Progress Updates ({task.progresses.length})
                                                                </p>
                                                                <div className="space-y-2">
                                                                    {task.progresses.map((progress) => (
                                                                        <div
                                                                            key={progress.id}
                                                                            className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-xs"
                                                                        >
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                                    {format(new Date(progress.progressDate), 'MMM dd, yyyy')}
                                                                                </span>
                                                                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                                                                    {progress.progressType}
                                                                                </span>
                                                                            </div>
                                                                            {progress.description && (
                                                                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                                                    {progress.description}
                                                                                </p>
                                                                            )}
                                                                            {progress.voiceDescriptionUrl && (
                                                                                <div className="mt-2">
                                                                                    <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                                        <Volume2 className="h-3 w-3" />
                                                                                        <span>{t('voiceDescription')}</span>
                                                                                    </div>
                                                                                    <audio
                                                                                        controls
                                                                                        className="w-full max-w-md h-8"
                                                                                        preload="metadata"
                                                                                    >
                                                                                        <source src={getStaticFileUrl(progress.voiceDescriptionUrl)} type="audio/mp4" />
                                                                                        <source src={getStaticFileUrl(progress.voiceDescriptionUrl)} type="audio/mpeg" />
                                                                                        <source src={getStaticFileUrl(progress.voiceDescriptionUrl)} type="audio/wav" />
                                                                                        <source src={getStaticFileUrl(progress.voiceDescriptionUrl)} type="audio/m4a" />
                                                                                        <source src={getStaticFileUrl(progress.voiceDescriptionUrl)} type="audio/ogg" />
                                                                                        Your browser does not support the audio element.
                                                                                    </audio>
                                                                                </div>
                                                                            )}
                                                                            {progress.visitResult && (
                                                                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                                                    Result: <span className="font-medium">{progress.visitResult}</span>
                                                                                </p>
                                                                            )}
                                                                            {progress.nextStep && (
                                                                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                                                    Next Step: <span className="font-medium">{progress.nextStep}</span>
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )) || []}
                                </div>
                            </div>

                            {/* Daily Progress section removed - Not part of new WeeklyPlan API structure */}

                            {/* Manager Review */}
                            {displayPlan.rating && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-500" />
                                        Manager Review
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {renderStars(displayPlan.rating)}
                                            <span className="text-lg font-semibold">
                                                {displayPlan.rating}/5
                                            </span>
                                        </div>
                                        {displayPlan.managerComment && (
                                            <div className="mt-3">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Comment:
                                                </p>
                                                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                    {
                                                        displayPlan.managerComment
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        {displayPlan.managerReviewedAt && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Reviewed on{' '}
                                                {format(
                                                    new Date(
                                                        displayPlan.managerReviewedAt
                                                    ),
                                                    'MMMM dd, yyyy'
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ViewWeeklyPlanModal;




