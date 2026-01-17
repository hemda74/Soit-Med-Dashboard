import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { legacyClientApi, type LegacyClient, type LegacyMachine, type LegacyVisit } from '@/services/maintenance/legacyClientApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	ChevronRight,
	Building2,
	Wrench,
	Calendar,
	Search,
	Loader2,
	ArrowLeft,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const ClientEquipmentVisitsPage: React.FC = () => {
	const { language } = useTranslation();
	const isRTL = language === 'ar';

	const [selectedClient, setSelectedClient] = useState<LegacyClient | null>(null);
	const [selectedMachine, setSelectedMachine] = useState<LegacyMachine | null>(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [pageSize] = useState(25);
	const [searchTerm, setSearchTerm] = useState('');

	// Fetch clients from TBS Legacy database
	const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useQuery({
		queryKey: ['legacy-clients', pageNumber, pageSize, searchTerm],
		queryFn: async () => {
			try {
				if (searchTerm && searchTerm.trim()) {
					return await legacyClientApi.searchClients(searchTerm.trim(), pageNumber, pageSize);
				}
				return await legacyClientApi.getAllClients(pageNumber, pageSize);
			} catch (error) {
				console.error('Error fetching clients:', error);
				throw error;
			}
		},
		retry: 2,
	});

	// Fetch customer machines from TBS Legacy database
	const { data: customerMachinesData, isLoading: customerMachinesLoading } = useQuery({
		queryKey: ['legacy-customer-machines', selectedClient?.clientId],
		queryFn: async () => {
			if (!selectedClient) return null;
			try {
				return await legacyClientApi.getCustomerMachines(selectedClient.clientId);
			} catch (error) {
				console.error('Error fetching customer machines:', error);
				toast.error(isRTL ? 'حدث خطأ في تحميل بيانات المعدات' : 'Error loading machines data');
				throw error;
			}
		},
		enabled: !!selectedClient,
	});

	// Fetch visits for selected machine from TBS Legacy database
	const { data: visitsData, isLoading: visitsLoading } = useQuery({
		queryKey: ['legacy-machine-visits', selectedMachine?.machineId],
		queryFn: async () => {
			if (!selectedMachine) return null;
			return await legacyClientApi.getMachineVisits(selectedMachine.machineId);
		},
		enabled: !!selectedMachine,
	});

	const handleClientSelect = (client: LegacyClient) => {
		setSelectedClient(client);
		setSelectedMachine(null);
	};

	const handleMachineSelect = (machine: LegacyMachine) => {
		setSelectedMachine(machine);
	};

	const handleBackToClients = () => {
		setSelectedClient(null);
		setSelectedMachine(null);
	};

	const handleBackToMachines = () => {
		setSelectedMachine(null);
	};

	// Handle errors in useEffect to avoid React warning
	React.useEffect(() => {
		if (clientsError) {
			toast.error(isRTL ? 'حدث خطأ في تحميل البيانات' : 'Error loading data');
		}
	}, [clientsError, isRTL]);

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">
					{isRTL ? 'العملاء والمعدات والزيارات (TBS)' : 'Clients, Equipment & Visits (TBS)'}
				</h1>
			</div>

			{/* Breadcrumb */}
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Button
					variant="ghost"
					size="sm"
					onClick={handleBackToClients}
					disabled={!selectedClient}
					className="h-auto p-1"
				>
					{isRTL ? 'العملاء' : 'Clients'}
				</Button>
				{selectedClient && (
					<>
						<ChevronRight className="h-4 w-4" />
						<Button
							variant="ghost"
							size="sm"
							onClick={handleBackToMachines}
							disabled={!selectedMachine}
							className="h-auto p-1"
						>
							{isRTL ? 'المعدات' : 'Machines'}
						</Button>
					</>
				)}
				{selectedMachine && (
					<>
						<ChevronRight className="h-4 w-4" />
						<span>{isRTL ? 'الزيارات' : 'Visits'}</span>
					</>
				)}
			</div>

			{/* Clients List */}
			{!selectedClient && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							{isRTL ? 'قائمة العملاء (TBS)' : 'Clients List (TBS)'}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{/* Search */}
						<div className="mb-4">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder={isRTL ? 'ابحث عن عميل...' : 'Search for a client...'}
									value={searchTerm}
									onChange={(e) => {
										setSearchTerm(e.target.value);
										setPageNumber(1);
									}}
									className="pl-10"
								/>
							</div>
						</div>

						{/* Clients Table */}
						{clientsLoading ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						) : (
							<>
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className={cn(isRTL && 'text-right')}>
													{isRTL ? 'الاسم' : 'Name'}
												</TableHead>
												<TableHead className={cn(isRTL && 'text-right')}>
													{isRTL ? 'العنوان' : 'Address'}
												</TableHead>
												<TableHead className={cn(isRTL && 'text-right')}>
													{isRTL ? 'الهاتف' : 'Phone'}
												</TableHead>
												<TableHead className={cn(isRTL && 'text-right')}>
													{isRTL ? 'عدد المعدات' : 'Machines'}
												</TableHead>
												<TableHead className={cn(isRTL && 'text-right')}>
													{isRTL ? 'عدد العقود' : 'Contracts'}
												</TableHead>
												<TableHead className={cn(isRTL && 'text-right')}>
													{isRTL ? 'الإجراءات' : 'Actions'}
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{clientsData?.clients.length === 0 ? (
												<TableRow>
													<TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
														{isRTL ? 'لا توجد عملاء' : 'No clients found'}
													</TableCell>
												</TableRow>
											) : (
												clientsData?.clients.map((client) => (
													<TableRow key={client.clientId}>
														<TableCell className={cn('font-medium', isRTL && 'text-right')}>
															{client.clientName}
														</TableCell>
														<TableCell className={cn(isRTL && 'text-right')}>
															{client.address || '-'}
														</TableCell>
														<TableCell className={cn(isRTL && 'text-right')}>
															{client.phone || '-'}
														</TableCell>
														<TableCell className={cn(isRTL && 'text-right')}>
															<Badge variant="secondary">{client.machineCount}</Badge>
														</TableCell>
														<TableCell className={cn(isRTL && 'text-right')}>
															<Badge variant="outline">{client.contractCount}</Badge>
														</TableCell>
														<TableCell className={cn(isRTL && 'text-right')}>
															<Button
																variant="outline"
																size="sm"
																onClick={() => handleClientSelect(client)}
															>
																{isRTL ? 'عرض المعدات' : 'View Machines'}
																<ChevronRight className="ml-2 h-4 w-4" />
															</Button>
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>

								{/* Pagination */}
								{clientsData && clientsData.totalPages > 1 && (
									<div className="mt-4 flex items-center justify-between">
										<div className="text-sm text-muted-foreground">
											{isRTL
												? `صفحة ${clientsData.pageNumber} من ${clientsData.totalPages} (${clientsData.totalCount} عميل)`
												: `Page ${clientsData.pageNumber} of ${clientsData.totalPages} (${clientsData.totalCount} clients)`
											}
										</div>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setPageNumber(p => Math.max(1, p - 1))}
												disabled={!clientsData.hasPreviousPage}
											>
												{isRTL ? 'السابق' : 'Previous'}
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setPageNumber(p => p + 1)}
												disabled={!clientsData.hasNextPage}
											>
												{isRTL ? 'التالي' : 'Next'}
											</Button>
										</div>
									</div>
								)}
							</>
						)}
					</CardContent>
				</Card>
			)}

			{/* Customer Machines List */}
			{selectedClient && !selectedMachine && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Wrench className="h-5 w-5" />
								<span>
									{isRTL ? 'معدات العميل' : 'Client Machines'}: {customerMachinesData?.customerName || selectedClient.clientName}
								</span>
							</div>
							<Button variant="outline" size="sm" onClick={handleBackToClients}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								{isRTL ? 'رجوع' : 'Back'}
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{/* Customer Info */}
						{customerMachinesData && (
							<div className="mb-4 p-4 bg-muted rounded-lg">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
									<div>
										<span className="font-medium">{isRTL ? 'العنوان' : 'Address'}: </span>
										<span className="text-muted-foreground">{customerMachinesData.customerAddress || '-'}</span>
									</div>
									<div>
										<span className="font-medium">{isRTL ? 'الهاتف' : 'Phone'}: </span>
										<span className="text-muted-foreground">{customerMachinesData.customerPhone || '-'}</span>
									</div>
									<div>
										<span className="font-medium">{isRTL ? 'عدد المعدات' : 'Machine Count'}: </span>
										<Badge variant="default">{customerMachinesData.machineCount}</Badge>
									</div>
								</div>
							</div>
						)}

						{customerMachinesLoading ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						) : !customerMachinesData || customerMachinesData.machines.length === 0 ? (
							<div className="text-center py-12 text-muted-foreground">
								{isRTL ? 'لا توجد معدات لهذا العميل' : 'No machines found for this client'}
							</div>
						) : (
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'النموذج' : 'Model'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'الرقم التسلسلي' : 'Serial Number'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'رمز الصنف' : 'Item Code'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'عدد الزيارات' : 'Visits'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'حالة الضمان' : 'Warranty'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'الإجراءات' : 'Actions'}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{customerMachinesData.machines.map((machine) => (
											<TableRow key={machine.machineId}>
												<TableCell className={cn('font-medium', isRTL && 'text-right')}>
													{isRTL ? machine.modelName : machine.modelNameEn || machine.modelName || `#${machine.machineId}`}
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													{machine.serialNumber || '-'}
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													{machine.itemCode || '-'}
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													<Badge variant="secondary">{machine.visitCount}</Badge>
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													<Badge variant="outline">{machine.warrantyStatus || 'N/A'}</Badge>
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleMachineSelect(machine)}
													>
														{isRTL ? 'عرض الزيارات' : 'View Visits'}
														<ChevronRight className="ml-2 h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Machine Visits List */}
			{selectedMachine && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								<span>
									{isRTL ? 'زيارات المعدة' : 'Machine Visits'}: {selectedMachine.modelName || selectedMachine.serialNumber}
								</span>
							</div>
							<Button variant="outline" size="sm" onClick={handleBackToMachines}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								{isRTL ? 'رجوع' : 'Back'}
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{visitsLoading ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						) : !visitsData || visitsData.length === 0 ? (
							<div className="text-center py-12 text-muted-foreground">
								{isRTL ? 'لا توجد زيارات لهذه المعدة' : 'No visits found for this machine'}
							</div>
						) : (
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'رقم الزيارة' : 'Visit ID'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'تاريخ الزيارة' : 'Visit Date'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'نوع الزيارة' : 'Visit Type'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'الحالة' : 'Status'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'كود المهندس' : 'Engineer'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'التقرير' : 'Report'}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{visitsData.map((visit: LegacyVisit) => (
											<TableRow key={visit.visitId}>
												<TableCell className={cn('font-medium', isRTL && 'text-right')}>
													{visit.visitId}
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													{visit.visitDate
														? format(new Date(visit.visitDate), 'yyyy-MM-dd')
														: '-'}
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													<Badge variant="outline">{visit.visitTypeName || '-'}</Badge>
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													<Badge variant="secondary">{visit.visitStatusName || '-'}</Badge>
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													{visit.employeeCode || '-'}
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													{visit.reportDescription ? (
														<span className="text-sm text-muted-foreground line-clamp-2">
															{visit.reportDescription}
														</span>
													) : (
														visit.notes || '-'
													)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default ClientEquipmentVisitsPage;

