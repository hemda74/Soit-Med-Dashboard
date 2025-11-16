// Spare Parts Coordinator Dashboard Component

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { usePerformance } from '@/hooks/usePerformance';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SparePartRequestManagement from './SparePartRequestManagement';

const SparePartsCoordinatorDashboard: React.FC = () => {
	usePerformance('SparePartsCoordinatorDashboard');
	const { t } = useTranslation();
	const { user } = useAuthStore();

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 rounded-xl shadow-lg p-8 text-white">
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-3xl font-bold mb-2 text-white">
								{t('sparePartsCoordinatorDashboard') || 'Spare Parts Coordinator Dashboard'}
							</h1>
							<p className="text-purple-100 dark:text-purple-200 text-lg">
								{t('welcomeBack')}, {user?.firstName} {user?.lastName}
							</p>
							<p className="text-purple-200 dark:text-purple-300 text-sm mt-2">
								{t('manageSparePartRequests') || 'Manage spare part requests and coordinate with inventory'}
							</p>
						</div>
						<div className="flex items-center gap-3">
							<Package className="h-12 w-12 text-white opacity-80" />
						</div>
					</div>
				</div>

				{/* Quick Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								{t('pendingRequests') || 'Pending Requests'}
							</CardTitle>
							<Package className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">-</div>
							<p className="text-xs text-muted-foreground">
								{t('requestsAwaitingAction') || 'Requests awaiting your action'}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								{t('inProgress') || 'In Progress'}
							</CardTitle>
							<Package className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">-</div>
							<p className="text-xs text-muted-foreground">
								{t('requestsBeingProcessed') || 'Requests being processed'}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								{t('completed') || 'Completed'}
							</CardTitle>
							<Package className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">-</div>
							<p className="text-xs text-muted-foreground">
								{t('successfullyCompleted') || 'Successfully completed requests'}
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Main Content */}
				<Card>
					<CardHeader>
						<CardTitle>{t('sparePartRequests') || 'Spare Part Requests'}</CardTitle>
						<CardDescription>
							{t('manageAllSparePartRequests') || 'Manage and coordinate all spare part requests'}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<SparePartRequestManagement />
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default SparePartsCoordinatorDashboard;

