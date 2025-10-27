// Task Progress Form Component - Create task progress with offer request integration

import React, { useState } from 'react';
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

// Validation schema for task progress creation
const taskProgressSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    taskId: z.string().min(1, 'Task is required'),
    progressType: z.enum(['Visit', 'Call', 'Email', 'Meeting'], {
        message: 'Progress type is required',
    }),
    description: z.string().min(5, 'Description must be at least 5 characters').max(200, 'Description must be less than 200 characters'),
    progressDate: z.date({
        message: 'Progress date is required',
    }),
    visitResult: z.enum(['Interested', 'NotInterested']).optional(),
    nextStep: z.enum(['NeedsOffer', 'NeedsDeal']).optional(),
    followUpDate: z.date().optional(),
    satisfactionRating: z.number().min(1).max(5).optional(),
    createOfferRequest: z.boolean().optional(),
    requestedProducts: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
});

type TaskProgressFormValues = z.infer<typeof taskProgressSchema>;

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
            console.error('Error creating task progress:', error);
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
        // For SalesManager and Salesman, only show their assigned clients
        return clients.filter(client => client.assignedSalesmanId === user?.id);
    };

    // Mock tasks - in real implementation, this would come from an API
    const mockTasks = [
        { id: '1', title: 'Initial Client Visit', description: 'First visit to establish relationship' },
        { id: '2', title: 'Product Presentation', description: 'Present product catalog and capabilities' },
        { id: '3', title: 'Follow-up Call', description: 'Follow up on previous meeting' },
        { id: '4', title: 'Proposal Discussion', description: 'Discuss proposal details and pricing' },
        { id: '5', title: 'Contract Negotiation', description: 'Negotiate terms and conditions' },
    ];

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
        } else if (value === 'NotInterested') {
            // No auto-suggest for not interested - let user choose
            form.setValue('nextStep', undefined);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Create Task Progress</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="clientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!clientId}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a client" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {getAvailableClients().map((client) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name} ({client.type})
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
                                    <FormLabel>Task *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!taskId}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a task" />
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
                                    <FormLabel>Progress Type *</FormLabel>
                                    <Select onValueChange={handleProgressTypeChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select progress type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Visit">Visit</SelectItem>
                                            <SelectItem value="Call">Call</SelectItem>
                                            <SelectItem value="Email">Email</SelectItem>
                                            <SelectItem value="Meeting">Meeting</SelectItem>
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
                                    <FormLabel>Description *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe what happened during this progress..."
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
                                    <FormLabel>Progress Date *</FormLabel>
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
                                                        <span>Pick a date</span>
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
                        {form.watch('progressType') === 'Visit' && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="visitResult"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Visit Result</FormLabel>
                                            <Select onValueChange={handleVisitResultChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select visit result" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Interested">Interested</SelectItem>
                                                    <SelectItem value="NotInterested">Not Interested</SelectItem>
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
                                            <FormLabel>Next Step</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select next step" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="NeedsOffer">Needs Offer</SelectItem>
                                                    <SelectItem value="NeedsDeal">Needs Deal</SelectItem>
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
                                            <FormLabel>Satisfaction Rating (1-5)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    placeholder="Rate client satisfaction"
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
                        {form.watch('followUpDate') && (
                            <FormField
                                control={form.control}
                                name="followUpDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Follow-up Date</FormLabel>
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
                                                            <span>Pick a follow-up date</span>
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
                                        <FormLabel>Create Offer Request</FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically create an offer request for this client
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
                                            <FormLabel>Requested Products *</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe the products the client is interested in..."
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
                                            <FormLabel>Priority</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Low">Low</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="High">High</SelectItem>
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
                                    Cancel
                                </Button>
                            )}
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Progress'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}


