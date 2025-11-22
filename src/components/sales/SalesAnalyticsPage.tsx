import React, { useState, useEffect, useMemo } from 'react';
import { salesApi } from '@/services/sales/salesApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart3, TrendingUp, DollarSign, Users, Activity, Target, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { SalesmanStatisticsDTO } from '@/types/sales.types';
import { usePerformance } from '@/hooks/usePerformance';
import { useTranslation } from '@/hooks/useTranslation';
import {
	RevenueTrendChart,
	TotalDealsChart,
	VisitsTrendChart,
	OffersTrendChart,
	ConversionRateChart,
	DealStatusChart,
} from '@/components/charts/sales';
import SalesmanCard from './statistics/SalesmanCard';
import ProgressChart from './statistics/ProgressChart';
import PerformanceChart from './statistics/PerformanceChart';

// Reusable loading component
const LoadingState = ({ message }: { message?: string }) => (
	<div className="py-12 text-center">
		<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
		<p className="text-gray-500 dark:text-gray-400 mt-4">{message || 'Loading...'}</p>
	</div>
);

// Reusable empty state component
const EmptyState = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) => (
	<Card className="border-dashed">
		<CardContent className="py-16 text-center">
			<Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
			<p className="text-muted-foreground text-lg">{title}</p>
			{description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
		</CardContent>
	</Card>
);

// Statistics card component
const StatCard = ({
	title,
	value,
	subtitle,
	icon: Icon,
	borderColor,
	iconBgColor,
	iconColor
}: {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: React.ElementType;
	borderColor: string;
	iconBgColor: string;
	iconColor: string;
}) => (
	<Card className={`border-l-4 ${borderColor}`}>
		<CardContent className="p-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-muted-foreground">{title}</p>
					<p className="text-3xl font-bold text-foreground mt-2">
						{typeof value === 'number' ? value.toLocaleString() : value}
					</p>
					{subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
				</div>
				<div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
					<Icon className={`w-6 h-6 ${iconColor}`} />
				</div>
			</div>
		</CardContent>
	</Card>
);

export default function SalesAnalyticsPage() {
	usePerformance('SalesAnalyticsPage');
	const { t } = useTranslation();
	const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
	const [selectedQuarter, setSelectedQuarter] = useState<number | undefined>(undefined);
	const [statistics, setStatistics] = useState<SalesmanStatisticsDTO[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<string>('overview');
	const [selectedSalesman, setSelectedSalesman] = useState<SalesmanStatisticsDTO | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);

	useEffect(() => {
		loadStatistics();
	}, [selectedYear, selectedQuarter]);

	const loadStatistics = async () => {
		setLoading(true);
		try {
			const response = await salesApi.getAllSalesmanStatistics(selectedYear, selectedQuarter);
			if (response.success && Array.isArray(response.data)) {
				const salesmanStats = response.data.filter((stat: any) => {
					return stat && stat.salesmanId && typeof stat.salesmanId === 'string';
				});
				setStatistics(salesmanStats);
			} else {
				toast.error(response.message || t('failedToLoadStatistics'));
				setStatistics([]);
			}
		} catch (error: any) {
			console.error('Failed to load statistics:', error);
			toast.error(error.message || t('failedToLoadStatistics'));
			setStatistics([]);
		} finally {
			setLoading(false);
		}
	};

	// Calculate aggregate statistics
	const aggregateStats = useMemo(() => {
		if (statistics.length === 0) {
			return {
				totalVisits: 0,
				totalOffers: 0,
				totalDeals: 0,
				totalRevenue: 0,
				totalSuccessfulVisits: 0,
				totalAcceptedOffers: 0,
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
				totalSuccessfulVisits: acc.totalSuccessfulVisits + stat.successfulVisits,
				totalAcceptedOffers: acc.totalAcceptedOffers + stat.acceptedOffers,
				successRates: acc.successRates + stat.successRate,
				offerAcceptanceRates: acc.offerAcceptanceRates + stat.offerAcceptanceRate,
			}),
			{
				totalVisits: 0,
				totalOffers: 0,
				totalDeals: 0,
				totalRevenue: 0,
				totalSuccessfulVisits: 0,
				totalAcceptedOffers: 0,
				successRates: 0,
				offerAcceptanceRates: 0,
			}
		);

		return {
			totalVisits: totals.totalVisits,
			totalOffers: totals.totalOffers,
			totalDeals: totals.totalDeals,
			totalRevenue: totals.totalRevenue,
			totalSuccessfulVisits: totals.totalSuccessfulVisits,
			totalAcceptedOffers: totals.totalAcceptedOffers,
			averageSuccessRate: totals.successRates / statistics.length,
			averageOfferAcceptanceRate: totals.offerAcceptanceRates / statistics.length,
		};
	}, [statistics]);

	const handleSalesmanClick = (salesman: SalesmanStatisticsDTO) => {
		setSelectedSalesman(salesman);
		setIsDetailsOpen(true);
	};

	const closeDetails = () => {
		setIsDetailsOpen(false);
		setTimeout(() => setSelectedSalesman(null), 150);
	};

	// Chart props to avoid repetition
	const chartProps = { data: statistics, year: selectedYear, quarter: selectedQuarter };

	return (
		<div className="space-y-6 p-6">
			{/* Header with Filters */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<BarChart3 className="w-6 h-6 text-primary" />
							<CardTitle className="text-2xl font-bold">{t('salesStatistics')}</CardTitle>
						</div>
						<div className="flex items-center gap-3">
							<Select
								value={selectedYear.toString()}
								onValueChange={(value) => setSelectedYear(parseInt(value))}
							>
								<SelectTrigger className="w-[120px]">
									<SelectValue placeholder={t('year')} />
								</SelectTrigger>
								<SelectContent>
									{Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
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
									<SelectValue placeholder={t('quarter')} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t('allQuarters')}</SelectItem>
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
				<StatCard
					title={t('totalVisits')}
					value={aggregateStats.totalVisits}
					icon={Users}
					borderColor="border-l-blue-500"
					iconBgColor="bg-blue-100 dark:bg-blue-900/20"
					iconColor="text-blue-600 dark:text-blue-400"
				/>
				<StatCard
					title={t('totalOffers')}
					value={aggregateStats.totalOffers}
					subtitle={`${aggregateStats.averageOfferAcceptanceRate.toFixed(1)}% ${t('avgAcceptanceShort')}`}
					icon={Target}
					borderColor="border-l-green-500"
					iconBgColor="bg-green-100 dark:bg-green-900/20"
					iconColor="text-green-600 dark:text-green-400"
				/>
				<StatCard
					title={t('totalDeals')}
					value={aggregateStats.totalDeals}
					subtitle={`${aggregateStats.averageSuccessRate.toFixed(1)}% ${t('avgSuccessShort')}`}
					icon={CheckCircle}
					borderColor="border-l-purple-500"
					iconBgColor="bg-purple-100 dark:bg-purple-900/20"
					iconColor="text-purple-600 dark:text-purple-400"
				/>
				<Card className="border-l-4 border-l-orange-500 md:col-span-2 lg:col-span-3">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">{t('totalRevenue')}</p>
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
					title={t('averageSuccessRate')}
					value={aggregateStats.averageSuccessRate}
					percentage={0}
					isGood={aggregateStats.averageSuccessRate >= 70}
					icon={<TrendingUp className="w-5 h-5 text-primary" />}
				/>
				<PerformanceChart
					title={t('averageOfferAcceptanceRate')}
					value={aggregateStats.averageOfferAcceptanceRate}
					percentage={0}
					isGood={aggregateStats.averageOfferAcceptanceRate >= 50}
					icon={<Target className="w-5 h-5 text-primary" />}
				/>
			</div>

			{/* Sales Statistics Charts */}
			<div className="grid gap-6 lg:grid-cols-2">
				<TotalDealsChart {...chartProps} />
				<RevenueTrendChart {...chartProps} />
			</div>

			{/* Team Performance */}
			<Card>
				<CardHeader>
					<CardTitle>{t('teamPerformance')}</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<LoadingState message={t('loadingStatistics')} />
					) : statistics.length === 0 ? (
						<EmptyState
							icon={BarChart3}
							title={t('noStatisticsForPeriod')}
							description={t('tryDifferentYearQuarter')}
						/>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{statistics.map((salesman) => (
								<SalesmanCard
									key={salesman.salesmanId}
									salesman={salesman}
									onViewDetails={handleSalesmanClick}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Detailed Analytics Charts */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-4 mb-6">
					<TabsTrigger value="overview" className="text-xs sm:text-sm">
						{t('overview') || 'Overview'}
					</TabsTrigger>
					<TabsTrigger value="performance" className="text-xs sm:text-sm">
						{t('performance') || 'Performance'}
					</TabsTrigger>
					<TabsTrigger value="trends" className="text-xs sm:text-sm">
						{t('trends') || 'Trends'}
					</TabsTrigger>
					<TabsTrigger value="conversion" className="text-xs sm:text-sm">
						{t('conversion') || 'Conversion'}
					</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6 mt-0">
					{loading ? (
						<LoadingState message={t('loadingAnalyticsData')} />
					) : statistics.length > 0 ? (
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
							<VisitsTrendChart {...chartProps} />
							<OffersTrendChart {...chartProps} />
						</div>
					) : (
						<EmptyState
							icon={BarChart3}
							title={t('noAnalyticsDataAvailable')}
							description={t('tryDifferentYearQuarter')}
						/>
					)}
				</TabsContent>

				{/* Performance Tab */}
				<TabsContent value="performance" className="space-y-6 mt-0">
					{loading ? (
						<LoadingState message={t('loadingAnalyticsData')} />
					) : statistics.length > 0 ? (
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
							<DealStatusChart {...chartProps} />
							<RevenueTrendChart {...chartProps} />
						</div>
					) : (
						<EmptyState
							icon={TrendingUp}
							title={t('noPerformanceDataAvailable')}
						/>
					)}
				</TabsContent>

				{/* Trends Tab */}
				<TabsContent value="trends" className="space-y-6 mt-0">
					{loading ? (
						<LoadingState message={t('loadingAnalyticsData')} />
					) : statistics.length > 0 ? (
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
							<VisitsTrendChart {...chartProps} />
							<OffersTrendChart {...chartProps} />
						</div>
					) : (
						<EmptyState
							icon={Activity}
							title={t('noTrendsDataAvailable')}
						/>
					)}
				</TabsContent>

				{/* Conversion Tab */}
				<TabsContent value="conversion" className="space-y-6 mt-0">
					{loading ? (
						<LoadingState message={t('loadingAnalyticsData')} />
					) : statistics.length > 0 ? (
						<div className="grid grid-cols-1 gap-6">
							<ConversionRateChart {...chartProps} />
						</div>
					) : (
						<EmptyState
							icon={Target}
							title={t('noConversionDataAvailable')}
						/>
					)}
				</TabsContent>
			</Tabs>

			{/* Selected Salesman Details Dialog */}
			<Dialog open={isDetailsOpen} onOpenChange={(open) => (open ? setIsDetailsOpen(true) : closeDetails())}>
				<DialogContent className="max-w-3xl">
					{selectedSalesman && (
						<>
							<DialogHeader>
								<DialogTitle>{selectedSalesman.salesmanName} - {t('detailedStatistics')}</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2">
									<ProgressChart
										title="Visits Progress"
										current={selectedSalesman.totalVisits}
										target={100}
										progress={(selectedSalesman.totalVisits / 100) * 100}
									/>
									<ProgressChart
										title="Offers Progress"
										current={selectedSalesman.totalOffers}
										target={50}
										progress={(selectedSalesman.totalOffers / 50) * 100}
									/>
									<ProgressChart
										title="Deals Progress"
										current={selectedSalesman.totalDeals}
										target={20}
										progress={(selectedSalesman.totalDeals / 20) * 100}
									/>
									<ProgressChart
										title="Revenue Progress"
										current={selectedSalesman.totalDealValue}
										target={1000000}
										progress={(selectedSalesman.totalDealValue / 1000000) * 100}
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
}
