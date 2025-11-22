// Deal Form Component - Create and edit deals according to new business logic

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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Deal, CreateDealDto, UpdateDealDto } from '@/types/sales.types';
import { useTranslation } from '@/hooks/useTranslation';

type DealFormValues = {
    clientId: string;
    dealValue: number;
    dealDescription: string;
    expectedCloseDate: Date;
    offerId?: string;
};

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
    const { t } = useTranslation();

    const dealSchema = useMemo(
        () =>
            z.object({
                clientId: z.string().min(1, t('dealForm.validation.clientRequired')),
                dealValue: z
                    .number({
                        required_error: t('dealForm.validation.dealValueRequired'),
                        invalid_type_error: t('dealForm.validation.dealValueInvalid'),
                    })
                    .min(0.01, t('dealForm.validation.dealValueMin')),
                dealDescription: z
                    .string()
                    .min(10, t('dealForm.validation.descriptionMin'))
                    .max(500, t('dealForm.validation.descriptionMax')),
                expectedCloseDate: z.date({
                    required_error: t('dealForm.validation.expectedCloseDateRequired'),
                    invalid_type_error: t('dealForm.validation.expectedCloseDateRequired'),
                }),
                offerId: z.string().optional(),
            }),
        [t]
    );

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
            console.error(t('dealForm.errors.saveDeal'), error);
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
                <CardTitle>{deal ? t('dealForm.editTitle') : t('dealForm.createTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="clientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('dealForm.clientLabel')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!clientId}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('dealForm.clientPlaceholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {getAvailableClients().map((client) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name}{' '}
                                                    {client.classification ? `(${client.classification})` : ''}
                                                    {client.organizationName ? ` - ${client.organizationName}` : ''}
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
                                    <FormLabel>{t('dealForm.dealValueLabel')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder={t('dealForm.dealValuePlaceholder')}
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
                                    <FormLabel>{t('dealForm.descriptionLabel')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('dealForm.descriptionPlaceholder')}
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
                                    <FormLabel>{t('dealForm.expectedCloseDateLabel')}</FormLabel>
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
                                                    {field.value ? format(field.value, "PPP") : <span>{t('dealForm.datePlaceholder')}</span>}
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
                                    {t('cancel')}
                                </Button>
                            )}
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? t('saving')
                                    : deal
                                    ? t('dealForm.updateButton')
                                    : t('dealForm.createButton')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}


