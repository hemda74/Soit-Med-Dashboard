// Deal Form Component - Create and edit deals according to new business logic

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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Deal, CreateDealDto, UpdateDealDto } from '@/types/sales.types';

// Validation schema for deal creation
const dealSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    dealValue: z.number().min(0.01, 'Deal value must be greater than 0'),
    dealDescription: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
    expectedCloseDate: z.date({
        message: 'Expected close date is required',
    }),
    offerId: z.string().optional(),
});

type DealFormValues = z.infer<typeof dealSchema>;

interface DealFormProps {
    deal?: Deal;
    onSuccess?: () => void;
    onCancel?: () => void;
    clientId?: string;
    offerId?: string;
}

export default function DealForm({ deal, onSuccess, onCancel, clientId, offerId }: DealFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuthStore();
    const { clients, createDeal, updateDeal, getMyClients } = useSalesStore();

    const form = useForm<DealFormValues>({
        resolver: zodResolver(dealSchema),
        defaultValues: {
            clientId: deal?.clientId || clientId || '',
            dealValue: deal?.dealValue || 0,
            dealDescription: deal?.dealDescription || '',
            expectedCloseDate: deal?.expectedCloseDate ? new Date(deal.expectedCloseDate) : new Date(),
            offerId: deal?.offerId || offerId || '',
        },
    });

    // Load clients if not already loaded
    React.useEffect(() => {
        if (!clients || clients.length === 0) {
            getMyClients();
        }
    }, [clients, getMyClients]);

    const onSubmit = async (data: DealFormValues) => {
        setIsSubmitting(true);
        try {
            const dealData: CreateDealDto | UpdateDealDto = {
                clientId: data.clientId,
                dealValue: data.dealValue,
                dealDescription: data.dealDescription,
                expectedCloseDate: data.expectedCloseDate.toISOString(),
                ...(data.offerId && { offerId: data.offerId }),
            };

            if (deal) {
                await updateDeal(deal.id, dealData as UpdateDealDto);
            } else {
                await createDeal(dealData as CreateDealDto);
            }

            onSuccess?.();
        } catch (error) {
            console.error('Error saving deal:', error);
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

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{deal ? 'Edit Deal' : 'Create New Deal'}</CardTitle>
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
                            name="dealValue"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deal Value (EGP) *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Enter deal value"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dealDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the deal details..."
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
                            name="expectedCloseDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Expected Close Date *</FormLabel>
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

                        <div className="flex justify-end space-x-2">
                            {onCancel && (
                                <Button type="button" variant="outline" onClick={onCancel}>
                                    Cancel
                                </Button>
                            )}
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : deal ? 'Update Deal' : 'Create Deal'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}


