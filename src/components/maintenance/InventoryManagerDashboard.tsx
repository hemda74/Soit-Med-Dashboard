// Inventory Manager Dashboard Component

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { usePerformance } from '@/hooks/usePerformance';
import { Warehouse } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SparePartRequestManagement from './SparePartRequestManagement';

const InventoryManagerDashboard: React.FC = () => {
	usePerformance('InventoryManagerDashboard');
	const { t } = useTranslation();
	const { user } = useAuthStore();

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 rounded-xl shadow-lg p-8 text-white">
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-3xl font-bold mb-2 text-white">
								{t('inventoryManagerDashboard') || 'Inventory Manager Dashboard'}
							</h1>
							<p className="text-green-100 dark:text-green-200 text-lg">
								{t('welcomeBack')}, {user?.firstName} {user?.lastName}
							</p>
							<p className="text-green-200 dark:text-green-300 text-sm mt-2">
								{t('manageInventoryAndPricing') || 'Manage inventory, set prices, and track spare parts'}
							</p>
						</div>
						<div className="flex items-center gap-3">
							<Warehouse className="h-12 w-12 text-white opacity-80" />
						</div>
					</div>
				</div>

				{/* Quick Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								{t('pendingPricing') || 'Pending Pricing'}
							</CardTitle>
							<Warehouse className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">-</div>
							<p className="text-xs text-muted-foreground">
								{t('requestsNeedingPrice') || 'Requests needing price setting'}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								{t('pricedRequests') || 'Priced Requests'}
							</CardTitle>
							<Warehouse className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">-</div>
							<p className="text-xs text-muted-foreground">
								{t('requestsWithPricesSet') || 'Requests with prices set'}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								{t('totalInventory') || 'Total Inventory'}
							</CardTitle>
							<Warehouse className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">-</div>
							<p className="text-xs text-muted-foreground">
								{t('itemsInInventory') || 'Items in inventory'}
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Main Content */}
				<Card>
					<CardHeader>
						<CardTitle>{t('sparePartRequests') || 'Spare Part Requests'}</CardTitle>
						<CardDescription>
							{t('manageInventoryAndSetPrices') || 'Manage inventory and set prices for spare part requests'}
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

export default InventoryManagerDashboard;

