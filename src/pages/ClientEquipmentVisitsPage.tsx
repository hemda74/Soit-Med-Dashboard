import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientEquipmentApi, type Client, type Equipment, type MaintenanceVisit } from '@/services/maintenance/clientEquipmentApi';
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
	ChevronLeft, 
	ChevronRight, 
	Building2, 
	Wrench, 
	Calendar,
	Search,
	Loader2,
	ArrowLeft,
	ArrowRight
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import Pagination from '@/components/Pagination';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const ClientEquipmentVisitsPage: React.FC = () => {
	const { t, language } = useTranslation();
	const isRTL = language === 'ar';

	const [selectedClient, setSelectedClient] = useState<Client | null>(null);
	const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [pageSize] = useState(25);
	const [searchTerm, setSearchTerm] = useState('');

	// Fetch clients
	const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useQuery({
		queryKey: ['clients', pageNumber, pageSize, searchTerm],
		queryFn: async () => {
			try {
				const response = await clientEquipmentApi.getAllClients(pageNumber, pageSize);
				// Filter by search term if provided
				if (searchTerm && response.clients) {
					const filtered = response.clients.filter(client =>
						client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
						client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
						client.phone?.includes(searchTerm)
					);
					return { ...response, clients: filtered, totalCount: filtered.length };
				}
				return response;
			} catch (error) {
				console.error('Error fetching clients:', error);
				throw error;
			}
		},
		retry: 2,
	});

	// Fetch equipment for selected client
	const { data: equipmentData, isLoading: equipmentLoading } = useQuery({
		queryKey: ['client-equipment', selectedClient?.id],
		queryFn: async () => {
			if (!selectedClient) return null;
			return await clientEquipmentApi.getClientEquipment(selectedClient.id);
		},
		enabled: !!selectedClient,
	});

	// Fetch visits for selected equipment
	const { data: visitsData, isLoading: visitsLoading } = useQuery({
		queryKey: ['equipment-visits', selectedEquipment?.id],
		queryFn: async () => {
			if (!selectedEquipment) return null;
			return await clientEquipmentApi.getEquipmentVisits(selectedEquipment.id);
		},
		enabled: !!selectedEquipment,
	});

	const handleClientSelect = (client: Client) => {
		setSelectedClient(client);
		setSelectedEquipment(null);
	};

	const handleEquipmentSelect = (equipment: Equipment) => {
		setSelectedEquipment(equipment);
	};

	const handleBackToClients = () => {
		setSelectedClient(null);
		setSelectedEquipment(null);
	};

	const handleBackToEquipment = () => {
		setSelectedEquipment(null);
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
					{isRTL ? 'العملاء والمعدات والزيارات' : 'Clients, Equipment & Visits'}
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
							onClick={handleBackToEquipment}
							disabled={!selectedEquipment}
							className="h-auto p-1"
						>
							{isRTL ? 'المعدات' : 'Equipment'}
						</Button>
					</>
				)}
				{selectedEquipment && (
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
							{isRTL ? 'قائمة العملاء' : 'Clients List'}
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
													{isRTL ? 'النوع' : 'Type'}
												</TableHead>
												<TableHead className={cn(isRTL && 'text-right')}>
													{isRTL ? 'البريد الإلكتروني' : 'Email'}
												</TableHead>
												<TableHead className={cn(isRTL && 'text-right')}>
													{isRTL ? 'الهاتف' : 'Phone'}
												</TableHead>
												<TableHead className={cn(isRTL && 'text-right')}>
													{isRTL ? 'الحالة' : 'Status'}
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
													<TableRow key={client.id}>
														<TableCell className={cn('font-medium', isRTL && 'text-right')}>
															{client.name}
														</TableCell>
														<TableCell className={cn(isRTL && 'text-right')}>
															{client.type || '-'}
														</TableCell>
														<TableCell className={cn(isRTL && 'text-right')}>
															{client.email || '-'}
														</TableCell>
														<TableCell className={cn(isRTL && 'text-right')}>
															{client.phone || '-'}
														</TableCell>
														<TableCell className={cn(isRTL && 'text-right')}>
															<Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
																{client.status || 'Unknown'}
															</Badge>
														</TableCell>
														<TableCell className={cn(isRTL && 'text-right')}>
															<Button
																variant="outline"
																size="sm"
																onClick={() => handleClientSelect(client)}
															>
																{isRTL ? 'عرض المعدات' : 'View Equipment'}
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
								{clientsData && clientsData.totalCount > pageSize && (
									<div className="mt-4">
										<Pagination
											currentPage={pageNumber}
											totalPages={Math.ceil(clientsData.totalCount / pageSize)}
											onPageChange={setPageNumber}
										/>
									</div>
								)}
							</>
						)}
					</CardContent>
				</Card>
			)}

			{/* Equipment List */}
			{selectedClient && !selectedEquipment && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Wrench className="h-5 w-5" />
								<span>
									{isRTL ? 'معدات العميل' : 'Client Equipment'}: {selectedClient.name}
								</span>
							</div>
							<Button variant="outline" size="sm" onClick={handleBackToClients}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								{isRTL ? 'رجوع' : 'Back'}
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{equipmentLoading ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						) : equipmentData?.equipment.length === 0 ? (
							<div className="text-center py-12 text-muted-foreground">
								{isRTL ? 'لا توجد معدات لهذا العميل' : 'No equipment found for this client'}
							</div>
						) : (
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'الاسم' : 'Name'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'النموذج' : 'Model'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'الشركة المصنعة' : 'Manufacturer'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'رمز QR' : 'QR Code'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'عدد الزيارات' : 'Visit Count'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'الإجراءات' : 'Actions'}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{equipmentData?.equipment.map((equipment) => (
											<TableRow key={equipment.id}>
												<TableCell className={cn('font-medium', isRTL && 'text-right')}>
													{equipment.name}
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													{equipment.model || '-'}
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													{equipment.manufacturer || '-'}
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													<Badge variant="outline">{equipment.qrCode}</Badge>
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													{equipment.repairVisitCount || 0}
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleEquipmentSelect(equipment)}
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

			{/* Visits List */}
			{selectedEquipment && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								<span>
									{isRTL ? 'زيارات المعدات' : 'Equipment Visits'}: {selectedEquipment.name}
								</span>
							</div>
							<Button variant="outline" size="sm" onClick={handleBackToEquipment}>
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
						) : visitsData?.length === 0 ? (
							<div className="text-center py-12 text-muted-foreground">
								{isRTL ? 'لا توجد زيارات لهذه المعدات' : 'No visits found for this equipment'}
							</div>
						) : (
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'رقم التذكرة' : 'Ticket Number'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'تاريخ الزيارة' : 'Visit Date'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'الحالة' : 'Status'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'النتيجة' : 'Outcome'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'المهندس' : 'Engineer'}
											</TableHead>
											<TableHead className={cn(isRTL && 'text-right')}>
												{isRTL ? 'التقرير' : 'Report'}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{visitsData?.map((visit) => (
											<TableRow key={visit.id}>
												<TableCell className={cn('font-medium', isRTL && 'text-right')}>
													{visit.ticketNumber}
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													{visit.visitDate
														? format(new Date(visit.visitDate), 'yyyy-MM-dd HH:mm')
														: visit.scheduledDate
														? format(new Date(visit.scheduledDate), 'yyyy-MM-dd HH:mm')
														: '-'}
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													<Badge variant="outline">{visit.status}</Badge>
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													<Badge variant="secondary">{visit.outcome}</Badge>
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													{visit.engineerName || '-'}
												</TableCell>
												<TableCell className={cn(isRTL && 'text-right')}>
													{visit.report ? (
														<span className="text-sm text-muted-foreground line-clamp-2">
															{visit.report}
														</span>
													) : (
														'-'
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

