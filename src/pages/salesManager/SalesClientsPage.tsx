import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesApi } from '@/services/sales/salesApi';
import { useTranslation } from '@/hooks/useTranslation';
import { usePerformance } from '@/hooks/usePerformance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { MagnifyingGlassIcon, BuildingOfficeIcon, PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Pagination from '@/components/Pagination';
import type { ClientSearchFilters, Client } from '@/types/sales.types';
import ClientDetails from '@/components/sales/ClientDetails';

const SalesClientsPage: React.FC = () => {
	usePerformance('SalesClientsPage');
	const { t } = useTranslation();

	const [searchTerm, setSearchTerm] = useState('');
	const [classification, setClassification] = useState<string>('all');
	const [assignedSalesmanId, setAssignedSalesmanId] = useState<string>('all');
	const [city, setCity] = useState<string>('');
	const [governorateId, setGovernorateId] = useState<string>('all');
	const [equipmentCategory, setEquipmentCategory] = useState<string>('all');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
	const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
	const [showClientDetails, setShowClientDetails] = useState(false);

	// Fetch salesmen for filter
	const { data: salesmenData } = useQuery({
		queryKey: ['salesmen'],
		queryFn: async () => {
			try {
				const response = await salesApi.getOfferSalesmen();
				return response.data || [];
			} catch (error: any) {
				console.error('Failed to fetch salesmen:', error);
				// Return empty array on error to prevent breaking the UI
				return [];
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2, // Retry twice on failure
	});

	const salesmen = salesmenData || [];

	// Fetch governorates
	const { data: governoratesData } = useQuery({
		queryKey: ['governorates'],
		queryFn: async () => {
			try {
				const { getGovernorates } = await import('@/services/roleSpecific/baseRoleSpecificApi');
				const { getAuthToken } = await import('@/utils/authUtils');
				const token = getAuthToken();
				if (!token) {
					console.error('No auth token available');
					return [];
				}
				const response = await getGovernorates(token);
				// getGovernorates returns the array directly, not wrapped in response.data
				return Array.isArray(response) ? response : [];
			} catch (error: any) {
				console.error('Failed to fetch governorates:', error);
				return [];
			}
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
	});

	const governorates = governoratesData || [];

	// Fetch equipment categories from products
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

	const equipmentCategories = categoriesData || [];

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
			setPage(1); // Reset to first page on new search
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Build filters
	const filters: ClientSearchFilters = {
		query: debouncedSearchTerm || undefined,
		classification: classification && classification !== 'all' ? (classification as 'A' | 'B' | 'C' | 'D') : undefined,
		assignedSalesmanId: assignedSalesmanId && assignedSalesmanId !== 'all' ? assignedSalesmanId : undefined,
		city: city || undefined,
		governorateId: governorateId && governorateId !== 'all' ? Number(governorateId) : undefined,
		equipmentCategory: equipmentCategory && equipmentCategory !== 'all' ? equipmentCategory : undefined,
		page,
		pageSize,
	};

	// Fetch clients
	const {
		data: clientsData,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ['salesClients', filters],
		queryFn: async () => {
			const response = await salesApi.searchClients(filters);
			return response;
		},
		enabled: true,
		staleTime: 30000, // 30 seconds
	});

	const clients = clientsData?.data?.clients || [];
	const pagination = clientsData?.data || {
		totalCount: 0,
		page: 1,
		pageSize: 20,
		totalPages: 0,
		hasNextPage: false,
		hasPreviousPage: false,
	};

	const handleSearch = (value: string) => {
		setSearchTerm(value);
	};

	const handleClassificationChange = (value: string) => {
		setClassification(value);
		setPage(1);
	};

	const handleSalesmanChange = (value: string) => {
		setAssignedSalesmanId(value);
		setPage(1);
	};

	const handleCityChange = (value: string) => {
		setCity(value);
		setPage(1);
	};

	const handleGovernorateChange = (value: string) => {
		setGovernorateId(value);
		setPage(1);
	};

	const handleEquipmentCategoryChange = (value: string) => {
		setEquipmentCategory(value);
		setPage(1);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setPage(1);
	};

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), 'MMM dd, yyyy');
		} catch {
			return dateString;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">
						{t('salesClients.title') || 'Sales Clients'}
					</h1>
					<p className="text-muted-foreground mt-1">
						{t('salesClients.description') ||
							'View and manage all sales clients'}
					</p>
				</div>
			</div>

			{/* Filters Card */}
			<Card>
				<CardHeader>
					<CardTitle>
						{t('salesClients.filters') || 'Filters'}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{/* Search */}
						<div className="relative">
							<MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
							<Input
								type="text"
								placeholder={
									t('salesClients.searchPlaceholder') ||
									'Search by name or organization...'
								}
								value={searchTerm}
								onChange={(e) => handleSearch(e.target.value)}
								className="pl-10"
							/>
						</div>

						{/* Classification Filter */}
						<Select
							value={classification}
							onValueChange={handleClassificationChange}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={
										t('salesClients.allClassifications') ||
										'All Classifications'
									}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									{t('salesClients.allClassifications') ||
										'All Classifications'}
								</SelectItem>
								<SelectItem value="A">A</SelectItem>
								<SelectItem value="B">B</SelectItem>
								<SelectItem value="C">C</SelectItem>
								<SelectItem value="D">D</SelectItem>
							</SelectContent>
						</Select>

						{/* Salesman Filter */}
						<Select
							value={assignedSalesmanId}
							onValueChange={handleSalesmanChange}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={
										t('salesClients.allSalesmen') ||
										'All Salesmen'
									}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									{t('salesClients.allSalesmen') ||
										'All Salesmen'}
								</SelectItem>
								{salesmen.map((salesman: any) => {
									const fullName = `${salesman.firstName || ''} ${salesman.lastName || ''}`.trim() || salesman.userName || salesman.email || '';
									return (
										<SelectItem key={salesman.id} value={salesman.id}>
											{fullName}
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>

						{/* City Filter */}
						<Input
							type="text"
							placeholder={t('salesClients.city') || 'City...'}
							value={city}
							onChange={(e) => handleCityChange(e.target.value)}
						/>

						{/* Governorate Filter */}
						<Select
							value={governorateId}
							onValueChange={handleGovernorateChange}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={
										t('salesClients.allGovernorates') ||
										'All Governorates'
									}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									{t('salesClients.allGovernorates') ||
										'All Governorates'}
								</SelectItem>
								{governorates.map((gov: any) => (
									<SelectItem key={gov.governorateId || gov.id} value={(gov.governorateId || gov.id).toString()}>
										{gov.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Equipment Category Filter */}
						<Select
							value={equipmentCategory}
							onValueChange={handleEquipmentCategoryChange}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={
										t('salesClients.allCategories') ||
										'All Equipment Categories'
									}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									{t('salesClients.allCategories') ||
										'All Equipment Categories'}
								</SelectItem>
								{equipmentCategories.map((category: string) => (
									<SelectItem key={category} value={category}>
										{category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Page Size */}
						<Select
							value={pageSize.toString()}
							onValueChange={(value) =>
								handlePageSizeChange(Number(value))
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="10">10 per page</SelectItem>
								<SelectItem value="20">20 per page</SelectItem>
								<SelectItem value="50">50 per page</SelectItem>
								<SelectItem value="100">100 per page</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Clients Table Card */}
			<Card>
				<CardHeader>
					<CardTitle>
						{t('salesClients.clientsList') || 'Clients List'}
						{clientsData?.data && (
							<span className="text-sm font-normal text-muted-foreground ml-2">
								({pagination.totalCount}{' '}
								{t('salesClients.total') || 'total'})
							</span>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="text-center">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
								<p className="text-muted-foreground">
									{t('salesClients.loading') || 'Loading clients...'}
								</p>
							</div>
						</div>
					) : isError ? (
						<div className="flex items-center justify-center py-12">
							<div className="text-center">
								<p className="text-destructive mb-4">
									{t('salesClients.error') ||
										'Error loading clients'}
								</p>
								<p className="text-sm text-muted-foreground mb-4">
									{error instanceof Error
										? error.message
										: 'Unknown error'}
								</p>
								<Button onClick={() => refetch()}>
									{t('salesClients.retry') || 'Retry'}
								</Button>
							</div>
						</div>
					) : clients.length === 0 ? (
						<div className="flex items-center justify-center py-12">
							<div className="text-center">
								<BuildingOfficeIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<p className="text-muted-foreground">
									{t('salesClients.noClients') ||
										'No clients found'}
								</p>
							</div>
						</div>
					) : (
						<>
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>
												{t('salesClients.name') || 'Name'}
											</TableHead>
											<TableHead>
												{t('salesClients.organization') ||
													'Organization'}
											</TableHead>
											<TableHead>
												{t('salesClients.phone') || 'Phone'}
											</TableHead>
											<TableHead>
												{t('salesClients.classification') ||
													'Classification'}
											</TableHead>
											<TableHead>
												{t('salesClients.city') || 'City'}
											</TableHead>
											<TableHead>
												{t('salesClients.governorate') ||
													'Governorate'}
											</TableHead>
											<TableHead>
												{t('salesClients.assignedTo') ||
													'Assigned To'}
											</TableHead>
											<TableHead>
												{t('salesClients.createdAt') ||
													'Created At'}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{clients.map((client) => (
											<TableRow 
												key={client.id}
												className="cursor-pointer hover:bg-muted/50 transition-colors"
												onClick={() => {
													setSelectedClientId(client.id.toString());
													setShowClientDetails(true);
												}}
											>
												<TableCell className="font-medium">
													{client.name}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<BuildingOfficeIcon className="h-4 w-4 text-muted-foreground" />
														{client.organizationName || '-'}
													</div>
												</TableCell>
												<TableCell>
													{client.phone ? (
														<div className="flex items-center gap-2">
															<PhoneIcon className="h-4 w-4 text-muted-foreground" />
															{client.phone}
														</div>
													) : (
														<span className="text-muted-foreground">
															-
														</span>
													)}
												</TableCell>
												<TableCell>
													{client.classification ? (
														<Badge variant="outline">
															{client.classification}
														</Badge>
													) : (
														<span className="text-muted-foreground">
															-
														</span>
													)}
												</TableCell>
												<TableCell>
													{client.city ? (
														<span>{client.city}</span>
													) : (
														<span className="text-muted-foreground">
															-
														</span>
													)}
												</TableCell>
												<TableCell>
													{client.governorate ? (
														<span>{client.governorate}</span>
													) : (
														<span className="text-muted-foreground">
															-
														</span>
													)}
												</TableCell>
												<TableCell>
													{client.assignedTo ? (
														<Badge variant="secondary">
															{client.assignedToName || client.assignedTo}
														</Badge>
													) : (
														<span className="text-muted-foreground">
															{t('salesClients.notAssigned') ||
																'Not assigned'}
														</span>
													)}
												</TableCell>
												<TableCell>
													{formatDate(client.createdAt)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* Pagination */}
							{pagination.totalPages > 1 && (
								<div className="mt-6">
									<Pagination
										currentPage={pagination.page}
										totalPages={pagination.totalPages}
										onPageChange={handlePageChange}
										pageSize={pagination.pageSize}
										totalItems={pagination.totalCount}
									/>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* Client Details Modal */}
			{showClientDetails && selectedClientId && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
						<div className="flex items-center justify-between p-4 border-b">
							<h2 className="text-xl font-semibold">
								{t('salesClients.title') || 'Client Details'}
							</h2>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => {
									setShowClientDetails(false);
									setSelectedClientId(null);
								}}
							>
								<XMarkIcon className="h-5 w-5" />
							</Button>
						</div>
						<div className="flex-1 overflow-y-auto p-4">
							<ClientDetails clientId={selectedClientId} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SalesClientsPage;

