import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesApi } from '@/services/sales/salesApi';
import { useTranslation } from '@/hooks/useTranslation';
import { usePerformance } from '@/hooks/usePerformance';
import { useDebounce } from '@/hooks/useDebounce';
import { STALE_TIME, DEBOUNCE_DELAY } from '@/constants/time';
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
import { MagnifyingGlassIcon, BuildingOfficeIcon, PhoneIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import type { ClientSearchFilters, SalesMan, Governorate } from '@/types/sales.types';
import ClientDetails from '@/components/sales/ClientDetails';
import { getGovernorates } from '@/services/roleSpecific/baseRoleSpecificApi';
import { getAuthToken } from '@/utils/authUtils';
import { productApi } from '@/services/sales/productApi';
import { toast } from 'react-hot-toast';

const SalesClientsPage: React.FC = () => {
	usePerformance('SalesClientsPage');
	const { t, language } = useTranslation();
	const isArabic = language === 'ar';
	const headerAlignmentClass = isArabic ? 'text-right' : 'text-left';

	const [searchTerm, setSearchTerm] = useState('');
	const [classification, setClassification] = useState<string>('all');
	const [assignedSalesManId, setAssignedSalesManId] = useState<string>('all');
	const [city, setCity] = useState<string>('');
	const [governorateId, setGovernorateId] = useState<string>('all');
	const [equipmentCategories, setEquipmentCategories] = useState<string[]>([]);
	const [clientCategory, setClientCategory] = useState<string>('all');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
	const [showClientDetails, setShowClientDetails] = useState(false);
	const [isEquipmentDropdownOpen, setIsEquipmentDropdownOpen] = useState(false);

	// Use debounce hooks
	const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY.SEARCH);
	const debouncedCity = useDebounce(city, DEBOUNCE_DELAY.SEARCH);

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
	}, [debouncedSearchTerm, classification, assignedSalesManId, debouncedCity, governorateId, equipmentCategories.length, clientCategory]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest('.relative')) {
				setIsEquipmentDropdownOpen(false);
			}
		};
		if (isEquipmentDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [isEquipmentDropdownOpen]);

	// Fetch salesmen for filter
	const { data: salesmenData } = useQuery({
		queryKey: ['salesmen'],
		queryFn: async () => {
			try {
				const response = await salesApi.getOfferSalesmen();
				return response.data || [];
			} catch (error: unknown) {
				console.error('Failed to fetch salesmen:', error);
				if (error instanceof Error) {
					toast.error(`فشل تحميل بيانات المندوبين: ${error.message}`);
				} else {
					toast.error('حدث خطأ غير متوقع أثناء تحميل بيانات المندوبين');
				}
				return [];
			}
		},
		staleTime: STALE_TIME.SHORT,
		retry: 2,
	});

	const salesmen: SalesMan[] = salesmenData || [];

	// Fetch governorates
	const { data: governoratesData } = useQuery({
		queryKey: ['governorates'],
		queryFn: async () => {
			try {
				const token = getAuthToken();
				if (!token) {
					console.error('No auth token available');
					return [];
				}
				const response = await getGovernorates(token);
				return Array.isArray(response) ? response : [];
			} catch (error: unknown) {
				console.error('Failed to fetch governorates:', error);
				if (error instanceof Error) {
					toast.error(`فشل تحميل المحافظات: ${error.message}`);
				} else {
					toast.error('حدث خطأ غير متوقع أثناء تحميل المحافظات');
				}
				return [];
			}
		},
		staleTime: STALE_TIME.MEDIUM,
	});

	const governorates: Governorate[] = governoratesData || [];

	// Fetch equipment categories from products
	const { data: categoriesData } = useQuery({
		queryKey: ['equipmentCategories'],
		queryFn: async () => {
			try {
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
			} catch (error: unknown) {
				console.error('Failed to fetch equipment categories:', error);
				if (error instanceof Error) {
					toast.error(`فشل تحميل تصنيفات المعدات: ${error.message}`);
				} else {
					toast.error('حدث خطأ غير متوقع أثناء تحميل تصنيفات المعدات');
				}
				return [];
			}
		},
		staleTime: STALE_TIME.MEDIUM,
	});

	const availableEquipmentCategories = categoriesData || [];

	// Build filters with useMemo
	const filters: ClientSearchFilters = useMemo(() => ({
		query: debouncedSearchTerm || undefined,
		classification: classification && classification !== 'all' ? (classification as 'A' | 'B' | 'C' | 'D') : undefined,
		assignedSalesManId: assignedSalesManId && assignedSalesManId !== 'all' ? assignedSalesManId : undefined,
		city: debouncedCity || undefined,
		governorateId: governorateId && governorateId !== 'all' ? Number(governorateId) : undefined,
		equipmentCategories: equipmentCategories.length > 0 ? equipmentCategories : undefined,
		clientCategory: clientCategory && clientCategory !== 'all' ? (clientCategory as 'Potential' | 'Existing') : undefined,
		page,
		pageSize,
	}), [debouncedSearchTerm, classification, assignedSalesManId, debouncedCity, governorateId, equipmentCategories, clientCategory, page, pageSize]);

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
		staleTime: STALE_TIME.VERY_SHORT,
	});

	// Backend now returns { success: true, data: { clients: [...], totalCount, page, pageSize, ... } }
	const clients = clientsData?.data?.clients || [];
	const pagination = clientsData?.data && typeof clientsData.data === 'object' && 'clients' in clientsData.data
		? clientsData.data
		: {
			totalCount: 0,
			page: filters.page || 1,
			pageSize: filters.pageSize || 20,
			totalPages: 0,
			hasNextPage: false,
			hasPreviousPage: false,
		};

	// Helper functions
	const getSalesManDisplayName = useCallback((salesman: SalesMan): string => {
		const fullName = `${salesman.firstName || ''} ${salesman.lastName || ''}`.trim();
		return fullName || salesman.userName || salesman.email || 'Unknown';
	}, []);

	const getGovernorateId = useCallback((gov: Governorate): string => {
		return (gov.governorateId || gov.id || '').toString();
	}, []);

	// Handlers with useCallback
	const handleSearch = useCallback((value: string) => {
		setSearchTerm(value);
	}, []);

	const handleClassificationChange = useCallback((value: string) => {
		setClassification(value);
		setPage(1);
	}, []);

	const handleSalesManChange = useCallback((value: string) => {
		setAssignedSalesManId(value);
		setPage(1);
	}, []);

	const handleCityChange = useCallback((value: string) => {
		setCity(value);
		// Page will be reset by useEffect when debouncedCity changes
	}, []);

	const handleGovernorateChange = useCallback((value: string) => {
		setGovernorateId(value);
		setPage(1);
	}, []);

	const handleEquipmentCategoryToggle = useCallback((category: string) => {
		setEquipmentCategories((prev) => {
			if (prev.includes(category)) {
				return prev.filter((c) => c !== category);
			} else {
				return [...prev, category];
			}
		});
		setPage(1);
	}, []);

	const handleClearEquipmentCategories = useCallback(() => {
		setEquipmentCategories([]);
		setPage(1);
	}, []);

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, []);

	const handlePageSizeChange = useCallback((newPageSize: number) => {
		setPageSize(newPageSize);
		setPage(1);
	}, []);

	const formatDate = useCallback((dateString: string) => {
		try {
			return format(new Date(dateString), 'MMM dd, yyyy');
		} catch {
			return dateString;
		}
	}, []);

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

						{/* Client Category Filter */}
						<Select
							value={clientCategory}
							onValueChange={setClientCategory}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={
										t('salesClients.allCategories') ||
										'All Categories'
									}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									{t('salesClients.allCategories') ||
										'All Categories'}
								</SelectItem>
								<SelectItem value="Potential">
									{t('salesClients.potentialClient') || 'Potential Clients'}
								</SelectItem>
								<SelectItem value="Existing">
									{t('salesClients.existingClient') || 'Existing Clients'}
								</SelectItem>
							</SelectContent>
						</Select>

						{/* SalesMan Filter */}
						<Select
							value={assignedSalesManId}
							onValueChange={handleSalesManChange}
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
								{salesmen.map((salesman) => (
									<SelectItem key={salesman.id} value={salesman.id}>
										{getSalesManDisplayName(salesman)}
									</SelectItem>
								))}
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
								{governorates.map((gov) => (
									<SelectItem key={getGovernorateId(gov)} value={getGovernorateId(gov)}>
										{gov.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Equipment Category Filter - Multi-select */}
						<div className="relative">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsEquipmentDropdownOpen(!isEquipmentDropdownOpen)}
								className="w-full justify-between"
							>
								<span className="truncate">
									{equipmentCategories.length === 0
										? t('salesClients.allCategories') || 'All Equipment Categories'
										: equipmentCategories.length === 1
											? equipmentCategories[0]
											: `${equipmentCategories.length} categories selected`}
								</span>
								<ChevronDownIcon
									className={cn(
										"ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform",
										isEquipmentDropdownOpen && "rotate-180"
									)}
								/>
							</Button>
							{equipmentCategories.length > 0 && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={handleClearEquipmentCategories}
									className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
								>
									<XMarkIcon className="h-4 w-4" />
								</Button>
							)}
							{isEquipmentDropdownOpen && (
								<div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
									<div className="p-2">
										{equipmentCategories.length > 0 && (
											<div className="mb-2 pb-2 border-b">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={handleClearEquipmentCategories}
													className="w-full text-xs"
												>
													Clear all
												</Button>
											</div>
										)}
										{availableEquipmentCategories.map((category) => (
											<label
												key={category}
												className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
											>
												<input
													type="checkbox"
													checked={equipmentCategories.includes(category)}
													onChange={() => handleEquipmentCategoryToggle(category)}
													className="rounded border-gray-300"
												/>
												<span className="text-sm">{category}</span>
											</label>
										))}
									</div>
								</div>
							)}
						</div>

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
										: typeof error === 'object' && error !== null && 'message' in error
											? String((error as { message: unknown }).message)
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
								<Table className="border-collapse">
									<TableHeader>
										<TableRow
											className={`divide-x divide-border ${isArabic ? 'border-r border-border' : 'border-l border-border'
												}`}
										>
											<TableHead className={headerAlignmentClass}>
												{t('salesClients.name') || 'Name'}
											</TableHead>
											<TableHead className={headerAlignmentClass}>
												{t('salesClients.organization') ||
													'Organization'}
											</TableHead>
											<TableHead className={headerAlignmentClass}>
												{t('salesClients.phone') || 'Phone'}
											</TableHead>
											<TableHead className={headerAlignmentClass}>
												{t('salesClients.classification') ||
													'Classification'}
											</TableHead>
											<TableHead className={headerAlignmentClass}>
												{t('salesClients.clientCategory') ||
													'Category'}
											</TableHead>
											<TableHead className={headerAlignmentClass}>
												{t('salesClients.city') || 'City'}
											</TableHead>
											<TableHead className={headerAlignmentClass}>
												{t('salesClients.governorate') ||
													'Governorate'}
											</TableHead>
											<TableHead className={headerAlignmentClass}>
												{t('salesClients.assignedTo') ||
													'Assigned To'}
											</TableHead>
											<TableHead className={headerAlignmentClass}>
												{t('salesClients.createdAt') ||
													'Created At'}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{clients.map((client) => (
											<TableRow
												key={client.id}
												className={`cursor-pointer hover:bg-muted/50 transition-colors divide-x divide-border ${isArabic ? 'border-r border-border' : 'border-l border-border'
													}`}
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
													<Badge
														variant={client.clientCategory === 'Existing' ? 'default' : 'secondary'}
														className={client.clientCategory === 'Existing'
															? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
															: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}
													>
														{client.clientCategory === 'Existing'
															? (t('salesClients.existingClient') || 'Existing')
															: (t('salesClients.potentialClient') || 'Potential')}
													</Badge>
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
										hasPreviousPage={pagination.hasPreviousPage}
										hasNextPage={pagination.hasNextPage}
										onPageChange={handlePageChange}
										pageSize={pagination.pageSize}
										totalCount={pagination.totalCount}
									/>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* Client Details Modal */}
			{showClientDetails && selectedClientId && (
				<div
					className="fixed inset-0 left-[16rem] bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
					onClick={() => {
						setShowClientDetails(false);
						setSelectedClientId(null);
					}}
				>
					<div
						className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
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
								aria-label="Close modal"
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

