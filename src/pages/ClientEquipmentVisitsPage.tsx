import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientEquipmentApi, type Client, type Equipment, type MaintenanceVisit } from '@/services/maintenance/clientEquipmentApi';
import { contractApi, type CustomerMachinesResponse, type CustomerMachine, type CustomerMachinesMediaFile } from '@/services/contracts/contractApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
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
	ArrowRight,
	Image as ImageIcon,
	FileText,
	File,
	Eye,
	X,
	ChevronLeft as ChevronLeftIcon,
	ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import Pagination from '@/components/Pagination';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { getStaticFileUrl } from '@/utils/apiConfig';

const ClientEquipmentVisitsPage: React.FC = () => {
	const { t, language } = useTranslation();
	const isRTL = language === 'ar';

	const [selectedClient, setSelectedClient] = useState<Client | null>(null);
	const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
	const [selectedMachine, setSelectedMachine] = useState<CustomerMachine | null>(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [pageSize] = useState(25);
	const [searchTerm, setSearchTerm] = useState('');
	const [showMediaModal, setShowMediaModal] = useState(false);
	const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
	const [selectedMediaFiles, setSelectedMediaFiles] = useState<CustomerMachinesMediaFile[]>([]);

	// Fetch clients
	const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useQuery({
		queryKey: ['clients', pageNumber, pageSize, searchTerm],
		queryFn: async () => {
			try {
				// Pass searchTerm to API for server-side filtering
				const response = await clientEquipmentApi.getAllClients(pageNumber, pageSize, searchTerm || undefined);
				return response;
			} catch (error) {
				console.error('Error fetching clients:', error);
				throw error;
			}
		},
		retry: 2,
	});

	// Fetch customer machines for selected client (using new API)
	const { data: customerMachinesData, isLoading: customerMachinesLoading } = useQuery({
		queryKey: ['customer-machines', selectedClient?.id],
		queryFn: async () => {
			if (!selectedClient) return null;
			try {
				return await contractApi.getCustomerMachines(selectedClient.id);
			} catch (error) {
				console.error('Error fetching customer machines:', error);
				toast.error(isRTL ? 'حدث خطأ في تحميل بيانات المعدات' : 'Error loading machines data');
				throw error;
			}
		},
		enabled: !!selectedClient,
	});

	// Fallback: Fetch equipment for selected client (old API - kept for compatibility)
	const { data: equipmentData, isLoading: equipmentLoading } = useQuery({
		queryKey: ['client-equipment', selectedClient?.id],
		queryFn: async () => {
			if (!selectedClient) return null;
			return await clientEquipmentApi.getClientEquipment(selectedClient.id);
		},
		enabled: !!selectedClient && !customerMachinesData,
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
		setSelectedMachine(null);
	};

	const handleEquipmentSelect = (equipment: Equipment) => {
		setSelectedEquipment(equipment);
		setSelectedMachine(null);
	};

	const handleMachineSelect = (machine: CustomerMachine) => {
		setSelectedMachine(machine);
		setSelectedEquipment(null);
	};

	const handleViewMedia = (machine: CustomerMachine, mediaIndex: number = 0) => {
		setSelectedMediaFiles(machine.mediaFiles);
		setSelectedMediaIndex(mediaIndex);
		setShowMediaModal(true);
	};

	const handleNextMedia = () => {
		if (selectedMediaFiles.length > 0) {
			setSelectedMediaIndex((prev) => (prev + 1) % selectedMediaFiles.length);
		}
	};

	const handlePreviousMedia = () => {
		if (selectedMediaFiles.length > 0) {
			setSelectedMediaIndex((prev) => (prev - 1 + selectedMediaFiles.length) % selectedMediaFiles.length);
		}
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
							onClick={() => {
								setSelectedMachine(null);
								setSelectedEquipment(null);
							}}
							disabled={!selectedMachine && !selectedEquipment}
							className="h-auto p-1"
						>
							{isRTL ? 'المعدات' : 'Machines/Equipment'}
						</Button>
					</>
				)}
				{selectedEquipment && (
					<>
						<ChevronRight className="h-4 w-4" />
						<span>{isRTL ? 'الزيارات' : 'Visits'}</span>
					</>
				)}
				{selectedMachine && (
					<>
						<ChevronRight className="h-4 w-4" />
						<span>{isRTL ? 'تفاصيل المعدة' : 'Machine Details'}</span>
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
													{isRTL ? 'الفئة' : 'Category'}
												</TableHead>
												<TableHead className={cn(isRTL && 'text-right')}>
													{isRTL ? 'الإجراءات' : 'Actions'}
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{clientsData?.clients.length === 0 ? (
												<TableRow>
													<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
															<Badge
																variant={client.clientCategory === 'Existing' ? 'default' : 'secondary'}
																className={client.clientCategory === 'Existing'
																	? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
																	: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}
															>
																{client.clientCategory === 'Existing'
																	? (isRTL ? 'عميل حالي' : 'Existing')
																	: (isRTL ? 'عميل محتمل' : 'Potential')}
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

			{/* Customer Machines List (New API) */}
			{selectedClient && !selectedEquipment && !selectedMachine && customerMachinesData && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Wrench className="h-5 w-5" />
								<span>
									{isRTL ? 'معدات العميل' : 'Client Machines'}: {customerMachinesData.customerName}
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

						{customerMachinesLoading ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						) : customerMachinesData.machines.length === 0 ? (
							<div className="text-center py-12 text-muted-foreground">
								{isRTL ? 'لا توجد معدات لهذا العميل' : 'No machines found for this client'}
							</div>
						) : (
							<div className="space-y-4">
								{customerMachinesData.machines.map((machine) => (
									<Card key={machine.machineId} className="hover:shadow-md transition-shadow">
										<CardContent className="pt-6">
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-2">
														<h3 className="font-semibold text-lg">
															{isRTL ? machine.modelName : machine.modelNameEn || machine.modelName || `Machine #${machine.machineId}`}
														</h3>
													</div>
													<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
														<div>
															<span className="font-medium text-muted-foreground">{isRTL ? 'الرقم التسلسلي' : 'Serial Number'}: </span>
															<span>{machine.serialNumber || '-'}</span>
														</div>
														<div>
															<span className="font-medium text-muted-foreground">{isRTL ? 'رمز الصنف' : 'Item Code'}: </span>
															<span>{machine.itemCode || '-'}</span>
														</div>
														<div>
															<span className="font-medium text-muted-foreground">{isRTL ? 'عدد الزيارات' : 'Visit Count'}: </span>
															<Badge variant="secondary">{machine.visitCount}</Badge>
														</div>
														<div>
															<span className="font-medium text-muted-foreground">{isRTL ? 'الملفات' : 'Media Files'}: </span>
															<Badge variant="outline">{machine.mediaFiles.length}</Badge>
														</div>
													</div>

													{/* Media Files Preview */}
													{machine.mediaFiles.length > 0 && (
														<div className="mt-4">
															<p className="text-sm font-medium text-muted-foreground mb-2">
																{isRTL ? 'الملفات المرفقة' : 'Media Files'}
															</p>
															<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
																{machine.mediaFiles.slice(0, 4).map((mediaFile, idx) => (
																	<div
																		key={idx}
																		className="relative border rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
																		onClick={() => handleViewMedia(machine, idx)}
																	>
																		{mediaFile.isImage ? (
																			<img
																				src={getStaticFileUrl(mediaFile.fileUrl)}
																				alt={mediaFile.fileName}
																				className="w-full h-24 object-cover"
																				onError={(e) => {
																					const target = e.target as HTMLImageElement;
																					target.style.display = 'none';
																				}}
																			/>
																		) : (
																			<div className="w-full h-24 bg-muted flex items-center justify-center">
																				{mediaFile.isPdf ? (
																					<FileText className="h-8 w-8 text-red-500" />
																				) : (
																					<File className="h-8 w-8 text-gray-500" />
																				)}
																			</div>
																		)}
																		<div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
																			{mediaFile.fileName}
																		</div>
																	</div>
																))}
																{machine.mediaFiles.length > 4 && (
																	<div
																		className="border rounded-lg bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
																		onClick={() => handleViewMedia(machine, 0)}
																	>
																		<span className="text-sm text-muted-foreground">
																			+{machine.mediaFiles.length - 4} {isRTL ? 'المزيد' : 'more'}
																		</span>
																	</div>
																)}
															</div>
														</div>
													)}

													{/* Actions */}
													<div className="mt-4 flex gap-2">
														{machine.mediaFiles.length > 0 && (
															<Button
																variant="outline"
																size="sm"
																onClick={() => handleViewMedia(machine, 0)}
															>
																<Eye className="h-4 w-4 mr-2" />
																{isRTL ? 'عرض جميع الملفات' : 'View All Media'}
															</Button>
														)}
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Equipment List (Fallback - Old API) */}
			{selectedClient && !selectedEquipment && !selectedMachine && !customerMachinesData && (
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

			{/* Media Files Viewer Modal */}
			<Dialog open={showMediaModal} onOpenChange={setShowMediaModal}>
				<DialogContent className="max-w-6xl max-h-[95vh] p-0">
					<DialogHeader className="px-6 pt-6 pb-4 border-b">
						<DialogTitle className="flex items-center justify-between">
							<span>{isRTL ? 'عرض الملفات' : 'Media Files Viewer'}</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowMediaModal(false)}
								className="h-8 w-8 p-0"
							>
								<X className="h-4 w-4" />
							</Button>
						</DialogTitle>
					</DialogHeader>
					<div className="relative flex-1 overflow-hidden">
						{selectedMediaFiles.length > 0 && (
							<>
								{/* Media Display */}
								<div className="relative w-full h-[70vh] bg-black flex items-center justify-center">
									{selectedMediaFiles[selectedMediaIndex]?.isImage ? (
										<img
											src={getStaticFileUrl(selectedMediaFiles[selectedMediaIndex].fileUrl)}
											alt={selectedMediaFiles[selectedMediaIndex].fileName}
											className="max-w-full max-h-full object-contain"
											onError={(e) => {
												const target = e.target as HTMLImageElement;
												target.style.display = 'none';
												const errorDiv = target.nextElementSibling as HTMLElement;
												if (errorDiv) errorDiv.style.display = 'flex';
											}}
										/>
									) : selectedMediaFiles[selectedMediaIndex]?.isPdf ? (
										<iframe
											src={getStaticFileUrl(selectedMediaFiles[selectedMediaIndex].fileUrl)}
											className="w-full h-full"
											title={selectedMediaFiles[selectedMediaIndex].fileName}
										/>
									) : (
										<div className="flex flex-col items-center justify-center text-white">
											<File className="h-16 w-16 mb-4" />
											<p className="text-lg">{selectedMediaFiles[selectedMediaIndex].fileName}</p>
											<a
												href={getStaticFileUrl(selectedMediaFiles[selectedMediaIndex].fileUrl)}
												target="_blank"
												rel="noopener noreferrer"
												className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
											>
												{isRTL ? 'فتح الملف' : 'Open File'}
											</a>
										</div>
									)}
									<div className="hidden flex-col items-center justify-center text-white">
										<File className="h-16 w-16 mb-4" />
										<p className="text-lg">{selectedMediaFiles[selectedMediaIndex]?.fileName}</p>
										<p className="text-sm text-gray-400 mt-2">{isRTL ? 'فشل تحميل الصورة' : 'Failed to load image'}</p>
									</div>

									{/* Navigation Buttons */}
									{selectedMediaFiles.length > 1 && (
										<>
											<Button
												variant="ghost"
												size="icon"
												className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
												onClick={handlePreviousMedia}
											>
												<ChevronLeftIcon className="h-6 w-6" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
												onClick={handleNextMedia}
											>
												<ChevronRightIcon className="h-6 w-6" />
											</Button>
										</>
									)}
								</div>

								{/* Thumbnail Strip */}
								<div className="px-6 py-4 border-t bg-muted/50">
									<div className="flex items-center gap-2 overflow-x-auto pb-2">
										{selectedMediaFiles.map((file, index) => (
											<div
												key={index}
												className={cn(
													"flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden cursor-pointer transition-all",
													index === selectedMediaIndex
														? "border-primary scale-105"
														: "border-transparent hover:border-primary/50"
												)}
												onClick={() => setSelectedMediaIndex(index)}
											>
												{file.isImage ? (
													<img
														src={getStaticFileUrl(file.fileUrl)}
														alt={file.fileName}
														className="w-full h-full object-cover"
													/>
												) : (
													<div className="w-full h-full bg-muted flex items-center justify-center">
														{file.isPdf ? (
															<FileText className="h-8 w-8 text-red-500" />
														) : (
															<File className="h-8 w-8 text-gray-500" />
														)}
													</div>
												)}
											</div>
										))}
									</div>
									<div className="mt-2 text-sm text-muted-foreground text-center">
										{selectedMediaFiles[selectedMediaIndex]?.fileName} ({selectedMediaIndex + 1} / {selectedMediaFiles.length})
									</div>
								</div>
							</>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ClientEquipmentVisitsPage;

