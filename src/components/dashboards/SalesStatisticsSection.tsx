import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllSalesManStatistics } from '@/hooks/useSalesManStatistics';
import SalesManCard from '@/components/sales/statistics/SalesManCard';
import ProgressChart from '@/components/sales/statistics/ProgressChart';
import PerformanceChart from '@/components/sales/statistics/PerformanceChart';
import { TotalDealsChart, RevenueTrendChart } from '@/components/charts';
import { BarChart3, TrendingUp, Users, Target, DollarSign, CheckCircle } from 'lucide-react';
import type { SalesManStatisticsDTO } from '@/types/sales.types';
import { useTranslation } from '@/hooks/useTranslation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SalesStatisticsSection: React.FC = () => {
	const { t } = useTranslation();
	const currentYear = new Date().getFullYear();
	const [selectedYear, setSelectedYear] = useState<number>(currentYear);
	const [selectedQuarter, setSelectedQuarter] = useState<number | undefined>(undefined);
	const [selectedSalesMan, setSelectedSalesMan] = useState<SalesManStatisticsDTO | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);

	const { data: statistics = [], isLoading, error } = useAllSalesManStatistics(selectedYear, selectedQuarter);

	// Calculate aggregate statistics
	const aggregateStats = useMemo(() => {
		if (statistics.length === 0) {
			return {
				totalVisits: 0,
				totalOffers: 0,
				totalDeals: 0,
				totalRevenue: 0,
				averageSuccessRate: 0,
				averageOfferAcceptanceRate: 0,
			};
		}

		const totals = statistics.reduce(
			(acc, stat) => ({
				totalVisits: acc.totalVisits + stat.totalVisits,
				totalOffers: acc.totalOffers + stat.totalOffers,
				totalDeals: acc.totalDeals + stat.totalDeals,
				totalRevenue: acc.totalRevenue + stat.totalDealValue,
				successRates: acc.successRates + stat.successRate,
				offerAcceptanceRates: acc.offerAcceptanceRates + stat.offerAcceptanceRate,
			}),
			{
				totalVisits: 0,
				totalOffers: 0,
				totalDeals: 0,
				totalRevenue: 0,
				successRates: 0,
				offerAcceptanceRates: 0,
			}
		);

		return {
			totalVisits: totals.totalVisits,
			totalOffers: totals.totalOffers,
			totalDeals: totals.totalDeals,
			totalRevenue: totals.totalRevenue,
			averageSuccessRate: totals.successRates / statistics.length,
			averageOfferAcceptanceRate: totals.offerAcceptanceRates / statistics.length,
		};
	}, [statistics]);

	const handleSalesManClick = (salesman: SalesManStatisticsDTO) => {
		setSelectedSalesMan(salesman);
		setIsDetailsOpen(true);
	};

	const closeDetails = () => {
		setIsDetailsOpen(false);
		// Delay clearing to allow dialog close animation
		setTimeout(() => setSelectedSalesMan(null), 150);
	};

	// Generate year options (current year and 2 previous years)
	const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

	return (
		<div className="space-y-6">
			{/* Header with Filters */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<BarChart3 className="w-6 h-6 text-primary" />
							<CardTitle className="text-2xl font-bold">Sales Statistics</CardTitle>
						</div>
						<div className="flex items-center gap-3">
							<Select
								value={selectedYear.toString()}
								onValueChange={(value) => setSelectedYear(parseInt(value))}
							>
								<SelectTrigger className="w-[120px]">
									<SelectValue placeholder="Year" />
								</SelectTrigger>
								<SelectContent>
									{yearOptions.map((year) => (
										<SelectItem key={year} value={year.toString()}>
											{year}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={selectedQuarter?.toString() || 'all'}
								onValueChange={(value) =>
									setSelectedQuarter(value === 'all' ? undefined : parseInt(value))
								}
							>
								<SelectTrigger className="w-[120px]">
									<SelectValue placeholder="Quarter" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Quarters</SelectItem>
									<SelectItem value="1">Q1</SelectItem>
									<SelectItem value="2">Q2</SelectItem>
									<SelectItem value="3">Q3</SelectItem>
									<SelectItem value="4">Q4</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Aggregate Statistics Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card className="border-l-4 border-l-blue-500">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Visits</p>
								<p className="text-3xl font-bold text-foreground mt-2">
									{aggregateStats.totalVisits.toLocaleString()}
								</p>
							</div>
							<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
								<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-green-500">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Offers</p>
								<p className="text-3xl font-bold text-foreground mt-2">
									{aggregateStats.totalOffers.toLocaleString()}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									{aggregateStats.averageOfferAcceptanceRate.toFixed(1)}% avg acceptance
								</p>
							</div>
							<div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
								<Target className="w-6 h-6 text-green-600 dark:text-green-400" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-purple-500">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Deals</p>
								<p className="text-3xl font-bold text-foreground mt-2">
									{aggregateStats.totalDeals.toLocaleString()}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									{aggregateStats.averageSuccessRate.toFixed(1)}% avg success
								</p>
							</div>
							<div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
								<CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-orange-500 md:col-span-2 lg:col-span-3">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
								<p className="text-3xl font-bold text-foreground mt-2">
									EGP {aggregateStats.totalRevenue.toLocaleString()}
								</p>
							</div>
							<div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
								<DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Performance Charts */}
			<div className="grid gap-4 md:grid-cols-2">
				<PerformanceChart
					title="Average Success Rate"
					value={aggregateStats.averageSuccessRate}
					percentage={0}
					isGood={aggregateStats.averageSuccessRate >= 70}
					icon={<TrendingUp className="w-5 h-5 text-primary" />}
				/>
				<PerformanceChart
					title="Average Offer Acceptance Rate"
					value={aggregateStats.averageOfferAcceptanceRate}
					percentage={0}
					isGood={aggregateStats.averageOfferAcceptanceRate >= 50}
					icon={<Target className="w-5 h-5 text-primary" />}
				/>
			</div>

			{/* Sales Statistics Charts - Real Data */}
			<div className="grid gap-6 lg:grid-cols-2">
				<TotalDealsChart
					data={statistics}
					year={selectedYear}
					quarter={selectedQuarter}
				/>
				<RevenueTrendChart
					data={statistics}
					year={selectedYear}
					quarter={selectedQuarter}
				/>
			</div>

			{/* Salesmen Statistics */}
			<Card>
				<CardHeader>
					<CardTitle>Team Performance</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
							<p className="text-muted-foreground mt-4">Loading statistics...</p>
						</div>
					) : error ? (
						<div className="text-center py-12">
							<p className="text-destructive">Failed to load statistics</p>
							<p className="text-sm text-muted-foreground mt-2">
								{error instanceof Error ? error.message : 'Unknown error'}
							</p>
						</div>
					) : statistics.length === 0 ? (
						<div className="text-center py-12">
							<BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
							<p className="text-muted-foreground text-lg">No statistics available for this period</p>
							<p className="text-muted-foreground text-sm mt-1">
								Try selecting a different year or quarter
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{statistics.map((salesman) => (
								<SalesManCard
									key={salesman.salesmanId}
									salesman={salesman}
									onViewDetails={handleSalesManClick}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Selected SalesMan Details */}
			<Dialog open={isDetailsOpen} onOpenChange={(open) => (open ? setIsDetailsOpen(true) : closeDetails())}>
				<DialogContent className="max-w-3xl">
					{selectedSalesMan && (
						<>
							<DialogHeader>
								<DialogTitle>{selectedSalesMan.salesmanName} - Detailed Statistics</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2">
									<ProgressChart
										title="Visits Progress"
										current={selectedSalesMan.totalVisits}
										target={100}
										progress={(selectedSalesMan.totalVisits / 100) * 100}
									/>
									<ProgressChart
										title="Offers Progress"
										current={selectedSalesMan.totalOffers}
										target={50}
										progress={(selectedSalesMan.totalOffers / 50) * 100}
									/>
									<ProgressChart
										title="Deals Progress"
										current={selectedSalesMan.totalDeals}
										target={20}
										progress={(selectedSalesMan.totalDeals / 20) * 100}
									/>
									<ProgressChart
										title="Revenue Progress"
										current={selectedSalesMan.totalDealValue}
										target={1000000}
										progress={(selectedSalesMan.totalDealValue / 1000000) * 100}
										unit=" EGP"
									/>
								</div>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default SalesStatisticsSection;

