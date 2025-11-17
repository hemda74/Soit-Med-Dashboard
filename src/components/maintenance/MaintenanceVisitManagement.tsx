// Maintenance Visit Management Component

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	useVisitsByEngineer,
	useCreateMaintenanceVisit,
	useVisitsByRequest,
} from '@/hooks/useMaintenanceQueries';
import { useAuthStore } from '@/stores/authStore';
import { usePerformance } from '@/hooks/usePerformance';
import {
	PlusIcon,
	CalendarIcon,
	WrenchScrewdriverIcon,
	CheckCircleIcon,
	ClockIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import type { CreateMaintenanceVisitDTO, MaintenanceVisitOutcome } from '@/types/maintenance.types';
import { MaintenanceVisitOutcome as VisitOutcome } from '@/types/maintenance.types';
import { useTranslation } from '@/hooks/useTranslation';

const MaintenanceVisitManagement: React.FC = () => {
	usePerformance('MaintenanceVisitManagement');
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const navigate = useNavigate();
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
	const [filterRequestId, setFilterRequestId] = useState<string>('');

	// Form state
	const [formData, setFormData] = useState<CreateMaintenanceVisitDTO>({
		maintenanceRequestId: 0,
		qrCode: '',
		serialCode: '',
		report: '',
		actionsTaken: '',
		partsUsed: '',
		serviceFee: undefined,
		outcome: VisitOutcome.Completed,
		notes: '',
	});

	const engineerId = user?.id || '';
	const { data: visits = [], isLoading } = useVisitsByEngineer(engineerId);
	const createMutation = useCreateMaintenanceVisit();

	// Filter visits
	const filteredVisits = visits.filter((visit) => {
		if (!filterRequestId) return true;
		return visit.maintenanceRequestId.toString().includes(filterRequestId);
	});

	// Handle create visit
	const handleCreate = async () => {
		if (!formData.maintenanceRequestId) {
			alert(t('pleaseSelectMaintenanceRequest'));
			return;
		}

		try {
			await createMutation.mutateAsync(formData);
			setShowCreateDialog(false);
			setFormData({
				maintenanceRequestId: 0,
				qrCode: '',
				serialCode: '',
				report: '',
				actionsTaken: '',
				partsUsed: '',
				serviceFee: undefined,
				outcome: VisitOutcome.Completed,
				notes: '',
			});
		} catch (error) {
			// Error handled by mutation
		}
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Maintenance Visits Management
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-2">
						Manage and track maintenance visits
					</p>
				</div>
				<Button onClick={() => setShowCreateDialog(true)}>
					<PlusIcon className="h-4 w-4 mr-2" />
					Create Visit
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="p-4">
					<div className="flex gap-4">
						<div className="flex-1">
							<Label>{t('filterByRequestId')}</Label>
							<Input
								placeholder={t('enterRequestId')}
								value={filterRequestId}
								onChange={(e) => setFilterRequestId(e.target.value)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Visits List */}
			<Card>
				<CardHeader>
					<CardTitle>{t('myVisits')} ({filteredVisits.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8">
							<p className="text-gray-500">{t('loadingVisits')}</p>
						</div>
					) : filteredVisits.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">{t('noVisitsFound')}</p>
						</div>
					) : (
						<div className="space-y-4">
							{filteredVisits.map((visit) => (
								<Card key={visit.id} className="hover:shadow-md transition-shadow">
									<CardContent className="p-6">
										<div className="flex items-start justify-between">
											<div className="flex-1 space-y-3">
												<div className="flex items-center gap-3">
													<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
														{t('visitNumber')}{visit.id}
													</h3>
													<Badge variant="outline">{visit.outcome}</Badge>
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															navigate(`/maintenance/requests/${visit.maintenanceRequestId}`)
														}
													>
														{t('requestNumber')}{visit.maintenanceRequestId}
													</Button>
												</div>

												<div className="grid grid-cols-2 gap-4 text-sm">
													<div>
														<p className="text-gray-500 dark:text-gray-400">{t('visitDate')}</p>
														<p className="font-medium">
															{format(new Date(visit.visitDate), 'MMM dd, yyyy HH:mm')}
														</p>
													</div>
													{visit.serviceFee && (
														<div>
															<p className="text-gray-500 dark:text-gray-400">{t('serviceFee')}</p>
															<p className="font-medium text-green-600">
																{visit.serviceFee.toLocaleString()} EGP
															</p>
														</div>
													)}
												</div>

												{visit.report && (
													<div>
														<p className="text-sm font-medium text-gray-500 mb-1">{t('report')}</p>
														<p className="text-sm">{visit.report}</p>
													</div>
												)}

												{visit.actionsTaken && (
													<div>
														<p className="text-sm font-medium text-gray-500 mb-1">{t('actionsTaken')}</p>
														<p className="text-sm">{visit.actionsTaken}</p>
													</div>
												)}

												{visit.notes && (
													<div>
														<p className="text-sm font-medium text-gray-500 mb-1">{t('notes')}</p>
														<p className="text-sm">{visit.notes}</p>
													</div>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create Visit Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{t('createMaintenanceVisit')}</DialogTitle>
						<DialogDescription>
							{t('recordNewMaintenanceVisit')}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="requestId">{t('maintenanceRequestId')} *</Label>
							<Input
								id="requestId"
								type="number"
								value={formData.maintenanceRequestId || ''}
								onChange={(e) =>
									setFormData({
										...formData,
										maintenanceRequestId: parseInt(e.target.value, 10) || 0,
									})
								}
								placeholder={t('enterRequestIdPlaceholder')}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="qrCode">{t('equipmentQrCode')}</Label>
								<Input
									id="qrCode"
									value={formData.qrCode || ''}
									onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
									placeholder={t('equipmentQrCode')}
								/>
							</div>
							<div>
								<Label htmlFor="serialCode">{t('serialCode')}</Label>
								<Input
									id="serialCode"
									value={formData.serialCode || ''}
									onChange={(e) => setFormData({ ...formData, serialCode: e.target.value })}
									placeholder={t('serialCode')}
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="outcome">{t('outcome')} *</Label>
							<Select
								value={formData.outcome}
								onValueChange={(value) =>
									setFormData({ ...formData, outcome: value as MaintenanceVisitOutcome })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={VisitOutcome.Completed}>{t('completed')}</SelectItem>
									<SelectItem value={VisitOutcome.NeedsSecondVisit}>{t('needsSecondVisit')}</SelectItem>
									<SelectItem value={VisitOutcome.NeedsSparePart}>{t('needsSparePart')}</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="report">{t('report')}</Label>
							<Textarea
								id="report"
								value={formData.report || ''}
								onChange={(e) => setFormData({ ...formData, report: e.target.value })}
								placeholder={t('visitReportPlaceholder')}
								rows={4}
							/>
						</div>

						<div>
							<Label htmlFor="actionsTaken">{t('actionsTaken')}</Label>
							<Textarea
								id="actionsTaken"
								value={formData.actionsTaken || ''}
								onChange={(e) => setFormData({ ...formData, actionsTaken: e.target.value })}
								placeholder={t('describeActionsTaken')}
								rows={3}
							/>
						</div>

						<div>
							<Label htmlFor="partsUsed">{t('listPartsUsed')}</Label>
							<Textarea
								id="partsUsed"
								value={formData.partsUsed || ''}
								onChange={(e) => setFormData({ ...formData, partsUsed: e.target.value })}
								placeholder={t('listPartsUsed')}
								rows={2}
							/>
						</div>

						<div>
							<Label htmlFor="serviceFee">{t('serviceFeeEgp')}</Label>
							<Input
								id="serviceFee"
								type="number"
								value={formData.serviceFee || ''}
								onChange={(e) =>
									setFormData({
										...formData,
										serviceFee: parseFloat(e.target.value) || undefined,
									})
								}
								placeholder="0.00"
							/>
						</div>

						<div>
							<Label htmlFor="notes">{t('notes')}</Label>
							<Textarea
								id="notes"
								value={formData.notes || ''}
								onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
								placeholder={t('additionalNotes')}
								rows={3}
							/>
						</div>

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setShowCreateDialog(false)}>
								{t('common.cancel')}
							</Button>
							<Button onClick={handleCreate} disabled={createMutation.isPending}>
								{createMutation.isPending ? t('creating') : t('createVisit')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default MaintenanceVisitManagement;


