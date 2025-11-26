// Client Form Component - Create and Edit clients with Classification

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
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
	interestedEquipmentCategories: z.array(z.string()).optional(),
});

// Validation schema for client update - translations will be applied via form validation
const updateClientSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	phone: z.string().max(20).optional().or(z.literal('')),
	organizationName: z.string().max(200).optional().or(z.literal('')),
	classification: z.enum(['A', 'B', 'C', 'D']).optional(),
	assignedTo: z.string().optional().or(z.literal('')),
	interestedEquipmentCategories: z.array(z.string()).optional(),
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
			interestedEquipmentCategories: [],
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
			interestedEquipmentCategories: client?.interestedEquipmentCategories || [],
		},
	});

	// Fetch available equipment categories
	const { data: categoriesData } = useQuery({
		queryKey: ['equipmentCategories'],
		queryFn: async () => {
			try {
				const { productApi } = await import('@/services/sales/productApi');
				const response = await productApi.getAllProducts();
				const products = response.data || [];
				// Extract unique categories
				const categories = Array.from(
					new Set(
						products
							.map((p) => p.category)
							.filter((c): c is string => !!c)
					)
				).sort();
				return categories;
			} catch (error: any) {
				console.error('Failed to fetch equipment categories:', error);
				return [];
			}
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
	});

	const availableCategories = categoriesData || [];
	const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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
					interestedEquipmentCategories: data.interestedEquipmentCategories && data.interestedEquipmentCategories.length > 0
						? data.interestedEquipmentCategories
						: undefined,
				};
				await createClient(createData);
			} else {
				const updateData: UpdateClientDto = {
					name: data.name,
					phone: data.phone || undefined,
					organizationName: data.organizationName || undefined,
					classification: data.classification,
					assignedTo: data.assignedTo || undefined,
					interestedEquipmentCategories: data.interestedEquipmentCategories && data.interestedEquipmentCategories.length > 0
						? data.interestedEquipmentCategories
						: undefined,
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

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest('.relative')) {
				setShowCategoryDropdown(false);
			}
		};
		if (showCategoryDropdown) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [showCategoryDropdown]);

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

						<FormField
							control={form.control}
							name="interestedEquipmentCategories"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t('clientForm.interestedEquipmentCategories') || 'Interested Equipment Categories'}
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Button
												type="button"
												variant="outline"
												onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
												className="w-full justify-between"
											>
												<span className="truncate">
													{field.value && field.value.length > 0
														? `${field.value.length} categories selected`
														: t('clientForm.selectCategories') || 'Select equipment categories'}
												</span>
												<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
											{field.value && field.value.length > 0 && (
												<div className="flex flex-wrap gap-2 mt-2">
													{field.value.map((category: string, index: number) => (
														<Badge key={index} variant="secondary" className="flex items-center gap-1">
															{category}
															<button
																type="button"
																onClick={() => {
																	const newValue = field.value?.filter((c) => c !== category) || [];
																	field.onChange(newValue);
																}}
																className="ml-1 hover:text-destructive"
															>
																<XMarkIcon className="h-3 w-3" />
															</button>
														</Badge>
													))}
												</div>
											)}
											{showCategoryDropdown && (
												<div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
													<div className="p-2">
														{availableCategories.map((category: string) => (
															<label
																key={category}
																className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
															>
																<input
																	type="checkbox"
																	checked={field.value?.includes(category) || false}
																	onChange={(e) => {
																		const currentValue = field.value || [];
																		if (e.target.checked) {
																			field.onChange([...currentValue, category]);
																		} else {
																			field.onChange(currentValue.filter((c) => c !== category));
																		}
																	}}
																	className="rounded border-gray-300"
																/>
																<span className="text-sm">{category}</span>
															</label>
														))}
													</div>
												</div>
											)}
										</div>
									</FormControl>
									<FormDescription>
										{t('clientForm.interestedEquipmentCategoriesDescription') ||
											'Select equipment categories this client is interested in'}
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

