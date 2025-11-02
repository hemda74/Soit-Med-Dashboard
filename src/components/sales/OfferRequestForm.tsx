// Offer Request Form Component - Create and manage offer requests

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { OfferRequest, CreateOfferRequestDto, UpdateOfferRequestDto, AssignOfferRequestDto } from '@/types/sales.types';

// Validation schema for offer request creation
const offerRequestSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    requestedProducts: z.string().min(10, 'Requested products must be at least 10 characters').max(500, 'Requested products must be less than 500 characters'),
    priority: z.enum(['Low', 'Medium', 'High'], {
        message: 'Priority is required',
    }),
    taskProgressId: z.string().optional(),
});

// Validation schema for offer request updates
const updateOfferRequestSchema = z.object({
    requestedProducts: z.string().min(10, 'Requested products must be at least 10 characters').max(500, 'Requested products must be less than 500 characters'),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    status: z.enum(['Pending', 'Assigned', 'InProgress', 'Completed', 'Cancelled']).optional(),
    offerDescription: z.string().optional(),
    offerValue: z.number().optional(),
    offerValidUntil: z.date().optional(),
    completionNotes: z.string().optional(),
});

// Validation schema for assignment
const assignmentSchema = z.object({
    assignedTo: z.string().min(1, 'Assignee is required'),
});

type OfferRequestFormValues = z.infer<typeof offerRequestSchema>;
type UpdateOfferRequestFormValues = z.infer<typeof updateOfferRequestSchema>;
type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface OfferRequestFormProps {
    offerRequest?: OfferRequest;
    onSuccess?: () => void;
    onCancel?: () => void;
    clientId?: string;
    taskProgressId?: string;
    mode?: 'create' | 'update' | 'assign';
}

export default function OfferRequestForm({
    offerRequest,
    onSuccess,
    onCancel,
    clientId,
    taskProgressId,
    mode = 'create'
}: OfferRequestFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuthStore();
    const {
        clients,
        createOfferRequest,
        updateOfferRequest,
        assignOfferRequest,
        getMyClients,
        // getOfferRequests
    } = useSalesStore();

    const createForm = useForm<OfferRequestFormValues>({
        resolver: zodResolver(offerRequestSchema),
        defaultValues: {
            clientId: offerRequest?.clientId?.toString() || clientId || '',
            requestedProducts: offerRequest?.requestedProducts || '',
            priority: offerRequest?.priority || 'Medium',
            taskProgressId: offerRequest?.taskProgressId?.toString() || taskProgressId || '',
        },
    });

    const updateForm = useForm<UpdateOfferRequestFormValues>({
        resolver: zodResolver(updateOfferRequestSchema),
        defaultValues: {
            requestedProducts: offerRequest?.requestedProducts || '',
            priority: offerRequest?.priority || 'Medium',
            status: offerRequest?.status || 'Pending',
            offerDescription: offerRequest?.offerDescription || '',
            offerValue: offerRequest?.offerValue || 0,
            offerValidUntil: offerRequest?.offerValidUntil ? new Date(offerRequest.offerValidUntil) : undefined,
            completionNotes: offerRequest?.completionNotes || '',
        },
    });

    const assignmentForm = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            assignedTo: offerRequest?.assignedTo || '',
        },
    });

    // Load clients if not already loaded
    React.useEffect(() => {
        if (!clients || clients.length === 0) {
            getMyClients();
        }
    }, [clients, getMyClients]);

    const onSubmitCreate = async (data: OfferRequestFormValues) => {
        setIsSubmitting(true);
        try {
            const requestData: CreateOfferRequestDto = {
                clientId: data.clientId,
                requestedProducts: data.requestedProducts,
                priority: data.priority,
                taskProgressId: data.taskProgressId,
            };

            await createOfferRequest(requestData);
            onSuccess?.();
        } catch (error) {
            console.error('Error creating offer request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmitUpdate = async (data: UpdateOfferRequestFormValues) => {
        if (!offerRequest) return;

        setIsSubmitting(true);
        try {
            const updateData: UpdateOfferRequestDto = {
                requestedProducts: data.requestedProducts,
                priority: data.priority,
                status: data.status,
                offerDescription: data.offerDescription,
                offerValue: data.offerValue,
                offerValidUntil: data.offerValidUntil?.toISOString(),
                completionNotes: data.completionNotes,
            };

            await updateOfferRequest(offerRequest.id.toString(), updateData);
            onSuccess?.();
        } catch (error) {
            console.error('Error updating offer request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmitAssignment = async (data: AssignmentFormValues) => {
        if (!offerRequest) return;

        setIsSubmitting(true);
        try {
            const assignmentData: AssignOfferRequestDto = {
                assignedTo: data.assignedTo,
            };

            await assignOfferRequest(offerRequest.id.toString(), assignmentData);
            onSuccess?.();
        } catch (error) {
            console.error('Error assigning offer request:', error);
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Assigned':
                return 'bg-purple-100 text-purple-800';
            case 'InProgress':
                return 'bg-blue-100 text-blue-800';
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High':
                return 'bg-red-100 text-red-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'Low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Mock users for assignment - in real implementation, this would come from an API
    const mockUsers = [
        { id: '1', name: 'John Doe', roles: ['SalesSupport'] },
        { id: '2', name: 'Jane Smith', roles: ['SalesSupport'] },
        { id: '3', name: 'Mike Johnson', roles: ['SalesSupport'] },
    ];

    const canCreate = () => {
        return user?.roles.includes('Salesman') || user?.roles.includes('SalesManager') || user?.roles.includes('SuperAdmin');
    };

    const canUpdate = () => {
        if (!offerRequest) return false;
        return user?.roles.includes('SalesSupport') && offerRequest.assignedTo === user.id;
    };

    const canAssign = () => {
        return user?.roles.includes('SalesManager') || user?.roles.includes('SuperAdmin');
    };

    if (mode === 'create' && !canCreate()) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                        <p>You don't have permission to create offer requests.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (mode === 'update' && !canUpdate()) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                        <p>You don't have permission to update this offer request.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (mode === 'assign' && !canAssign()) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                        <p>You don't have permission to assign offer requests.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {mode === 'create' && 'Create Offer Request'}
                    {mode === 'update' && 'Update Offer Request'}
                    {mode === 'assign' && 'Assign Offer Request'}
                    {offerRequest && (
                        <>
                            <Badge className={getStatusColor(offerRequest.status)}>
                                {offerRequest.status}
                            </Badge>
                            <Badge className={getPriorityColor(offerRequest.priority || 'Medium')}>
                                {offerRequest.priority || 'Medium'} Priority
                            </Badge>
                        </>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Show offer request details for update/assign modes */}
                {(mode === 'update' || mode === 'assign') && offerRequest && (
                    <>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Client</label>
                                    <p className="text-sm">{offerRequest.clientName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Requested By</label>
                                    <p className="text-sm">{offerRequest.requestedByName}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Requested Products</label>
                                <p className="text-sm">{offerRequest.requestedProducts}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                                    <p className="text-sm">{offerRequest.createdAt ? format(new Date(offerRequest.createdAt), 'PPP') : 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                                    <p className="text-sm">{offerRequest.assignedToName || 'Not assigned'}</p>
                                </div>
                            </div>
                        </div>
                        <Separator />
                    </>
                )}

                {/* Create Form */}
                {mode === 'create' && (
                    <Form {...createForm}>
                        <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-6">
                            <FormField
                                control={createForm.control}
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
                                control={createForm.control}
                                name="requestedProducts"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Requested Products *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the products the client is interested in..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={createForm.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority *</FormLabel>
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

                            <div className="flex justify-end space-x-2">
                                {onCancel && (
                                    <Button type="button" variant="outline" onClick={onCancel}>
                                        Cancel
                                    </Button>
                                )}
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create Request'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}

                {/* Update Form */}
                {mode === 'update' && (
                    <Form {...updateForm}>
                        <form onSubmit={updateForm.handleSubmit(onSubmitUpdate)} className="space-y-6">
                            <FormField
                                control={updateForm.control}
                                name="requestedProducts"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Requested Products *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the products the client is interested in..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={updateForm.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
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

                            <FormField
                                control={updateForm.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Assigned">Assigned</SelectItem>
                                                <SelectItem value="InProgress">In Progress</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={updateForm.control}
                                name="offerDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Offer Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the offer details..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={updateForm.control}
                                    name="offerValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Offer Value (EGP)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Enter offer value"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={updateForm.control}
                                    name="offerValidUntil"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Offer Valid Until</FormLabel>
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
                                                        disabled={(date) => date < new Date()}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={updateForm.control}
                                name="completionNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Completion Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Add any completion notes..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2">
                                {onCancel && (
                                    <Button type="button" variant="outline" onClick={onCancel}>
                                        Cancel
                                    </Button>
                                )}
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Updating...' : 'Update Request'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}

                {/* Assignment Form */}
                {mode === 'assign' && (
                    <Form {...assignmentForm}>
                        <form onSubmit={assignmentForm.handleSubmit(onSubmitAssignment)} className="space-y-6">
                            <FormField
                                control={assignmentForm.control}
                                name="assignedTo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign To *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a sales support user" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {mockUsers.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.name} ({user.roles.join(', ')})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2">
                                {onCancel && (
                                    <Button type="button" variant="outline" onClick={onCancel}>
                                        Cancel
                                    </Button>
                                )}
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Assigning...' : 'Assign Request'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
}

