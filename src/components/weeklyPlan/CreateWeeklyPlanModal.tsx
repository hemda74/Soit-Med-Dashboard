import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Calendar,
    ListChecks,
    X,
    Plus,
    Trash2,
    GripVertical,
} from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import type { CreateWeeklyPlanDto } from '@/types/weeklyPlan.types';

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    clientId: z.number().optional(),
    clientName: z.string().optional(),
    clientStatus: z.string().optional(),
    clientClassification: z.string().optional(),
    clientPhone: z.string().optional(),
    clientAddress: z.string().optional(),
    clientLocation: z.string().optional(),
    plannedDate: z.string().min(1, 'Planned date is required'),
    notes: z.string().optional(),
});

const createPlanSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters'),
    description: z
        .string()
        .min(1, 'Description is required')
        .max(1000, 'Description must be less than 1000 characters'),
    weekStartDate: z.string().min(1, 'Start date is required'),
    weekEndDate: z.string().min(1, 'End date is required'),
    tasks: z.array(taskSchema).optional(),
});

type CreatePlanFormData = z.infer<typeof createPlanSchema>;

interface CreateWeeklyPlanModalProps {
    onClose: () => void;
    onSubmit: (data: CreateWeeklyPlanDto) => Promise<boolean>;
}

const CreateWeeklyPlanModal: React.FC<CreateWeeklyPlanModalProps> = ({
    onClose,
    onSubmit,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get current week dates
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 }); // Saturday

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CreatePlanFormData>({
        resolver: zodResolver(createPlanSchema),
        defaultValues: {
            title: '',
            description: '',
            weekStartDate: format(weekStart, 'yyyy-MM-dd'),
            weekEndDate: format(weekEnd, 'yyyy-MM-dd'),
            tasks: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'tasks',
    });

    const handleFormSubmit = async (data: CreatePlanFormData) => {
        setIsSubmitting(true);
        try {
            const success = await onSubmit(data);
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Error creating plan:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addTask = () => {
        append({
            taskType: 'Visit' as const,
            plannedDate: '',
            priority: 'Medium' as const,
            status: 'Planned' as const,
        });
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <ListChecks className="h-6 w-6" />
                        Create Weekly Plan
                    </DialogTitle>
                    <DialogDescription>
                        Create a new weekly plan with tasks for this week.
                        Track your progress daily.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="space-y-6"
                >
                    {/* Plan Details */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Plan Title *</Label>
                            <Input
                                id="title"
                                {...register('title')}
                                placeholder="e.g., First Week of October Plan"
                                className={
                                    errors.title
                                        ? 'border-red-500'
                                        : ''
                                }
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">
                                    {errors.title.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Brief description of this week's plan and objectives..."
                                rows={3}
                                className={
                                    errors.description
                                        ? 'border-red-500'
                                        : ''
                                }
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="weekStartDate">
                                    Week Start Date *
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="weekStartDate"
                                        type="date"
                                        {...register(
                                            'weekStartDate'
                                        )}
                                        className={`pl-10 ${errors.weekStartDate
                                            ? 'border-red-500'
                                            : ''
                                            }`}
                                    />
                                </div>
                                {errors.weekStartDate && (
                                    <p className="text-sm text-red-500">
                                        {
                                            errors.weekStartDate
                                                .message
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="weekEndDate">
                                    Week End Date *
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="weekEndDate"
                                        type="date"
                                        {...register('weekEndDate')}
                                        className={`pl-10 ${errors.weekEndDate
                                            ? 'border-red-500'
                                            : ''
                                            }`}
                                    />
                                </div>
                                {errors.weekEndDate && (
                                    <p className="text-sm text-red-500">
                                        {
                                            errors.weekEndDate
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tasks Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">
                                Tasks
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTask}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Task
                            </Button>
                        </div>

                        {fields.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                <ListChecks className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    No tasks yet. Click "Add Task" to
                                    get started.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="p-4 border rounded-lg space-y-3 bg-gray-50 dark:bg-gray-900"
                                    >
                                        <div className="flex items-start gap-3">
                                            <GripVertical className="h-5 w-5 text-gray-400 mt-2" />
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <Label>Task Type *</Label>
                                                    <select
                                                        {...register(
                                                            `tasks.${index}.taskType`
                                                        )}
                                                        className="w-full px-3 py-2 border rounded-lg"
                                                    >
                                                        <option value="Visit">Visit</option>
                                                        <option value="FollowUp">Follow Up</option>
                                                        <option value="Call">Call</option>
                                                        <option value="Email">Email</option>
                                                        <option value="Meeting">Meeting</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label>Planned Date *</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        {...register(
                                                            `tasks.${index}.plannedDate`
                                                        )}
                                                        className={
                                                            errors
                                                                .tasks?.[
                                                                index
                                                            ]
                                                                ?.plannedDate
                                                                ? 'border-red-500'
                                                                : ''
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Priority *</Label>
                                                    <select
                                                        {...register(
                                                            `tasks.${index}.priority`
                                                        )}
                                                        className="w-full px-3 py-2 border rounded-lg"
                                                    >
                                                        <option value="High">High</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="Low">Low</option>
                                                    </select>
                                                </div>
                                                <Textarea
                                                    {...register(
                                                        `tasks.${index}.purpose`
                                                    )}
                                                    placeholder="Purpose (optional)"
                                                    rows={2}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    remove(
                                                        index
                                                    )
                                                }
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <ListChecks className="h-4 w-4" />
                                    Create Plan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateWeeklyPlanModal;


