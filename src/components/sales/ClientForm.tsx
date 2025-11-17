// Client Form Component - Create and Edit clients with Classification

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import type { Client, CreateClientDto, UpdateClientDto } from '@/types/sales.types';

// Classification constants
const CLASSIFICATIONS = ['A', 'B', 'C', 'D'] as const;
type Classification = typeof CLASSIFICATIONS[number];

// Validation schema for client creation - translations will be applied via form validation
const createClientSchema = z.object({
	name: z.string().min(1).max(200),
	phone: z.string().max(20).optional().or(z.literal('')),
	organizationName: z.string().max(200).optional().or(z.literal('')),
	classification: z.enum(['A', 'B', 'C', 'D']).optional(),
	assignedTo: z.string().optional().or(z.literal('')),
});

// Validation schema for client update - translations will be applied via form validation
const updateClientSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	phone: z.string().max(20).optional().or(z.literal('')),
	organizationName: z.string().max(200).optional().or(z.literal('')),
	classification: z.enum(['A', 'B', 'C', 'D']).optional(),
	assignedTo: z.string().optional().or(z.literal('')),
});

type CreateClientFormValues = z.infer<typeof createClientSchema>;
type UpdateClientFormValues = z.infer<typeof updateClientSchema>;

interface ClientFormProps {
	client?: Client;
	onSuccess?: () => void;
	onCancel?: () => void;
	mode?: 'create' | 'update';
}

export default function ClientForm({ client, onSuccess, onCancel, mode = 'create' }: ClientFormProps) {
	const { t } = useTranslation();
	const { createClient, updateClient } = useSalesStore();
	const { user } = useAuthStore();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const createForm = useForm<CreateClientFormValues>({
		resolver: zodResolver(createClientSchema),
		defaultValues: {
			name: '',
			phone: '',
			organizationName: '',
			classification: undefined,
			assignedTo: user?.id || '',
		},
	});

	const updateForm = useForm<UpdateClientFormValues>({
		resolver: zodResolver(updateClientSchema),
		defaultValues: {
			name: client?.name || '',
			phone: client?.phone || '',
			organizationName: client?.organizationName || '',
			classification: (client?.classification as Classification) || undefined,
			assignedTo: client?.assignedTo || '',
		},
	});

	const form = mode === 'create' ? createForm : updateForm;

	const onSubmit = async (data: CreateClientFormValues | UpdateClientFormValues) => {
		setIsSubmitting(true);
		try {
			if (mode === 'create') {
				const createData: CreateClientDto = {
					name: data.name!,
					phone: data.phone || undefined,
					organizationName: data.organizationName || undefined,
					classification: data.classification,
					assignedTo: data.assignedTo || undefined,
				};
				await createClient(createData);
			} else {
				const updateData: UpdateClientDto = {
					name: data.name,
					phone: data.phone || undefined,
					organizationName: data.organizationName || undefined,
					classification: data.classification,
					assignedTo: data.assignedTo || undefined,
				};
				if (client?.id) {
					await updateClient(client.id, updateData);
				}
			}
			onSuccess?.();
		} catch (error) {
			console.error('Error saving client:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>{mode === 'create' ? t('createNewClient') : t('editClient')}</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('name')} *</FormLabel>
									<FormControl>
										<Input placeholder={t('clientNamePlaceholder')} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('phone')}</FormLabel>
									<FormControl>
										<Input placeholder={t('phoneNumberPlaceholder')} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="organizationName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('organizationName')}</FormLabel>
									<FormControl>
										<Input placeholder={t('organizationNamePlaceholder')} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="classification"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('classification')}</FormLabel>
									<Select
										onValueChange={(value) => field.onChange(value as Classification)}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder={t('selectClassificationPlaceholder')} />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="">{t('common.close')}</SelectItem>
											{CLASSIFICATIONS.map((classification) => (
												<SelectItem key={classification} value={classification}>
													{classification}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										{t('classificationDescription')}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="assignedTo"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('assignedTo')}</FormLabel>
									<FormControl>
										<Input placeholder={t('userIdOptionalPlaceholder')} {...field} />
									</FormControl>
									<FormDescription>
										{t('assignedToDescription')}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end space-x-4">
							{onCancel && (
								<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
									{t('common.cancel')}
								</Button>
							)}
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? t('saving') : mode === 'create' ? t('createClient') : t('updateClient')}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

