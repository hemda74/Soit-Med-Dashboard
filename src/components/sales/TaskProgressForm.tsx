// Task Progress Form Component - Create task progress with offer request integration

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CreateTaskProgressDto } from '@/types/sales.types';
import { useTranslation } from '@/hooks/useTranslation';

const createTaskProgressSchema = (t: (key: string) => string) =>
    z.object({
        clientId: z.string().min(1, t('taskProgressForm.validation.clientRequired')),
        taskId: z.string().min(1, t('taskProgressForm.validation.taskRequired')),
        progressType: z.enum(['Visit', 'Call', 'Email', 'Meeting'], {
            message: t('taskProgressForm.validation.progressTypeRequired'),
        }),
        description: z
            .string()
            .min(5, t('taskProgressForm.validation.descriptionMin'))
            .max(200, t('taskProgressForm.validation.descriptionMax')),
        progressDate: z.date({
            errorMap: () => ({ message: t('taskProgressForm.validation.progressDateRequired') }),
        }),
        visitResult: z.enum(['Interested', 'NotInterested']).optional(),
        nextStep: z.enum(['NeedsOffer', 'NeedsDeal']).optional(),
        followUpDate: z.date().optional(),
        satisfactionRating: z
            .number({
                errorMap: () => ({ message: t('taskProgressForm.validation.satisfactionInvalid') }),
            })
            .min(1)
            .max(5)
            .optional(),
        createOfferRequest: z.boolean().optional(),
        requestedProducts: z.string().optional(),
        priority: z.enum(['Low', 'Medium', 'High']).optional(),
    });

type TaskProgressFormValues = z.infer<ReturnType<typeof createTaskProgressSchema>>;

interface TaskProgressFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    clientId?: string;
    taskId?: string;
}

export default function TaskProgressForm({ onSuccess, onCancel, clientId, taskId }: TaskProgressFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createOfferRequest, setCreateOfferRequest] = useState(false);
    const { user } = useAuthStore();
    const { clients, createTaskProgress, getMyClients } = useSalesStore();
    const { t } = useTranslation();

    const taskProgressSchema = useMemo(() => createTaskProgressSchema(t), [t]);

    const form = useForm<TaskProgressFormValues>({
        resolver: zodResolver(taskProgressSchema),
        defaultValues: {
            clientId: clientId || '',
            taskId: taskId || '',
            progressType: 'Visit',
            description: '',
            progressDate: new Date(),
            createOfferRequest: false,
            priority: 'Medium',
        },
    });

    // Load clients if not already loaded
    React.useEffect(() => {
        if (!clients || clients.length === 0) {
            getMyClients();
        }
    }, [clients, getMyClients]);

    const onSubmit = async (data: TaskProgressFormValues) => {
        setIsSubmitting(true);
        try {
            const progressData: CreateTaskProgressDto = {
                clientId: data.clientId,
                taskId: data.taskId,
                progressType: data.progressType,
                description: data.description,
                progressDate: data.progressDate.toISOString(),
                visitResult: data.visitResult,
                nextStep: data.nextStep,
                followUpDate: data.followUpDate?.toISOString(),
                satisfactionRating: data.satisfactionRating,
                createOfferRequest: data.createOfferRequest,
                requestedProducts: data.requestedProducts,
                priority: data.priority,
            };

            await createTaskProgress(progressData);
            onSuccess?.();
        } catch (error) {
            console.error(t('taskProgressForm.errors.createFailed'), error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter clients based on user role
    const getAvailableClients = () => {
        if (!clients) return [];
        if (user?.roles.includes('SuperAdmin')) {
            return clients;
        }
        // For SalesManager and SalesMan, only show their assigned clients
        return clients.filter(client => client.assignedTo === user?.id || client.assignedSalesManName === user?.userName);
    };

    // Mock tasks - in real implementation, this would come from an API
    const mockTasks = useMemo(
        () => [
            {
                id: '1',
                title: t('taskProgressForm.mockTasks.initialVisitTitle'),
                description: t('taskProgressForm.mockTasks.initialVisitDescription'),
            },
            {
                id: '2',
                title: t('taskProgressForm.mockTasks.productPresentationTitle'),
                description: t('taskProgressForm.mockTasks.productPresentationDescription'),
            },
            {
                id: '3',
                title: t('taskProgressForm.mockTasks.followUpCallTitle'),
                description: t('taskProgressForm.mockTasks.followUpCallDescription'),
            },
            {
                id: '4',
                title: t('taskProgressForm.mockTasks.proposalDiscussionTitle'),
                description: t('taskProgressForm.mockTasks.proposalDiscussionDescription'),
            },
            {
                id: '5',
                title: t('taskProgressForm.mockTasks.contractNegotiationTitle'),
                description: t('taskProgressForm.mockTasks.contractNegotiationDescription'),
            },
        ],
        [t]
    );

    const handleProgressTypeChange = (value: string) => {
        form.setValue('progressType', value as any);

        // Reset visit-specific fields when changing progress type
        if (value !== 'Visit') {
            form.setValue('visitResult', undefined);
            form.setValue('nextStep', undefined);
        }
    };

    const handleVisitResultChange = (value: string) => {
        form.setValue('visitResult', value as any);

        // Auto-suggest next step based on visit result
        if (value === 'Interested') {
            form.setValue('nextStep', 'NeedsOffer');
            setCreateOfferRequest(true);
            form.setValue('createOfferRequest', true);
        } else if (value === 'NotInterested') {
            // No auto-suggest for not interested - let user choose
            form.setValue('nextStep', undefined);
        }
    };

    const watchProgressType = form.watch('progressType');
    const watchFollowUpDate = form.watch('followUpDate');

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{t('taskProgressForm.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="clientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('taskProgressForm.fields.client')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!clientId}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('taskProgressForm.placeholders.client')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {getAvailableClients().map((client) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name} {client.classification ? `(${client.classification})` : ''}{' '}
                                                    {client.organizationName ? `- ${client.organizationName}` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="taskId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('taskProgressForm.fields.task')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!taskId}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('taskProgressForm.placeholders.task')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {mockTasks.map((task) => (
                                                <SelectItem key={task.id} value={task.id}>
                                                    {task.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="progressType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('taskProgressForm.fields.progressType')}</FormLabel>
                                    <Select onValueChange={handleProgressTypeChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('taskProgressForm.placeholders.progressType')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Visit">{t('taskProgressForm.progressTypes.visit')}</SelectItem>
                                            <SelectItem value="Call">{t('taskProgressForm.progressTypes.call')}</SelectItem>
                                            <SelectItem value="Email">{t('taskProgressForm.progressTypes.email')}</SelectItem>
                                            <SelectItem value="Meeting">{t('taskProgressForm.progressTypes.meeting')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('taskProgressForm.fields.description')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('taskProgressForm.placeholders.description')}
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="progressDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>{t('taskProgressForm.fields.progressDate')}</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>{t('taskProgressForm.placeholders.date')}</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Visit-specific fields */}
                        {watchProgressType === 'Visit' && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="visitResult"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('taskProgressForm.fields.visitResult')}</FormLabel>
                                            <Select onValueChange={handleVisitResultChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('taskProgressForm.placeholders.visitResult')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Interested">
                                                        {t('taskProgressForm.visitResults.interested')}
                                                    </SelectItem>
                                                    <SelectItem value="NotInterested">
                                                        {t('taskProgressForm.visitResults.notInterested')}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="nextStep"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('taskProgressForm.fields.nextStep')}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('taskProgressForm.placeholders.nextStep')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="NeedsOffer">
                                                        {t('taskProgressForm.nextSteps.needsOffer')}
                                                    </SelectItem>
                                                    <SelectItem value="NeedsDeal">
                                                        {t('taskProgressForm.nextSteps.needsDeal')}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="satisfactionRating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('taskProgressForm.fields.satisfactionRating')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    placeholder={t('taskProgressForm.placeholders.satisfactionRating')}
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {/* Follow-up date */}
                        {watchFollowUpDate && (
                            <FormField
                                control={form.control}
                                name="followUpDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{t('taskProgressForm.fields.followUpDate')}</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>{t('taskProgressForm.placeholders.followUpDate')}</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date()}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Offer request creation */}
                        <FormField
                            control={form.control}
                            name="createOfferRequest"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked);
                                                setCreateOfferRequest(checked as boolean);
                                            }}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>{t('taskProgressForm.createOfferRequest.label')}</FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            {t('taskProgressForm.createOfferRequest.description')}
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {createOfferRequest && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="requestedProducts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('taskProgressForm.fields.requestedProducts')}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={t('taskProgressForm.placeholders.requestedProducts')}
                                                    className="min-h-[80px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('taskProgressForm.priority.label')}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('taskProgressForm.priority.placeholder')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Low">{t('taskProgressForm.priority.low')}</SelectItem>
                                                    <SelectItem value="Medium">{t('taskProgressForm.priority.medium')}</SelectItem>
                                                    <SelectItem value="High">{t('taskProgressForm.priority.high')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <div className="flex justify-end space-x-2">
                            {onCancel && (
                                <Button type="button" variant="outline" onClick={onCancel}>
                                    {t('cancel')}
                                </Button>
                            )}
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t('creating') : t('taskProgressForm.submitButton')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}


