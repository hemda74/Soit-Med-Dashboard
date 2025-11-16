// Client Form Component - Create and Edit clients with Classification

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import type { Client, CreateClientDto, UpdateClientDto } from '@/types/sales.types';

// Classification constants
const CLASSIFICATIONS = ['A', 'B', 'C', 'D'] as const;
type Classification = typeof CLASSIFICATIONS[number];

// Validation schema for client creation
const createClientSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
	phone: z.string().max(20, 'Phone must be less than 20 characters').optional().or(z.literal('')),
	organizationName: z.string().max(200, 'Organization name must be less than 200 characters').optional().or(z.literal('')),
	classification: z.enum(['A', 'B', 'C', 'D'], {
		errorMap: () => ({ message: 'Classification must be A, B, C, or D' })
	}).optional(),
	assignedTo: z.string().optional().or(z.literal('')),
});

// Validation schema for client update
const updateClientSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters').optional(),
	phone: z.string().max(20, 'Phone must be less than 20 characters').optional().or(z.literal('')),
	organizationName: z.string().max(200, 'Organization name must be less than 200 characters').optional().or(z.literal('')),
	classification: z.enum(['A', 'B', 'C', 'D'], {
		errorMap: () => ({ message: 'Classification must be A, B, C, or D' })
	}).optional(),
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
				<CardTitle>{mode === 'create' ? 'Create New Client' : 'Edit Client'}</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name *</FormLabel>
									<FormControl>
										<Input placeholder="Client name" {...field} />
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
									<FormLabel>Phone</FormLabel>
									<FormControl>
										<Input placeholder="Phone number" {...field} />
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
									<FormLabel>Organization Name</FormLabel>
									<FormControl>
										<Input placeholder="Organization name" {...field} />
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
									<FormLabel>Classification</FormLabel>
									<Select
										onValueChange={(value) => field.onChange(value as Classification)}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select classification (A, B, C, or D)" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="">None</SelectItem>
											{CLASSIFICATIONS.map((classification) => (
												<SelectItem key={classification} value={classification}>
													{classification}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										Client classification: A (Highest priority), B (High), C (Medium), D (Low)
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
									<FormLabel>Assigned To</FormLabel>
									<FormControl>
										<Input placeholder="User ID (optional)" {...field} />
									</FormControl>
									<FormDescription>
										User ID to assign this client to (leave empty to assign to yourself)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end space-x-4">
							{onCancel && (
								<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
									Cancel
								</Button>
							)}
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Client' : 'Update Client'}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

