// Financial Reports Screen Component

import React, { useState } from 'react';
import {
	useDailyReport,
	useMonthlyReport,
	useYearlyReport,
	usePaymentMethodStatistics,
} from '@/hooks/usePaymentQueries';
import { usePerformance } from '@/hooks/usePerformance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';

const FinancialReportsScreen: React.FC = () => {
	usePerformance('FinancialReportsScreen');
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly' | 'statistics'>('daily');

	// Daily report state
	const [selectedDate, setSelectedDate] = useState<string>(
		format(new Date(), 'yyyy-MM-dd')
	);
	const { data: dailyReport, isLoading: loadingDaily } = useDailyReport(selectedDate);

	// Monthly report state
	const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
	const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
	const { data: monthlyReport, isLoading: loadingMonthly } = useMonthlyReport(
		selectedYear,
		selectedMonth
	);

	// Yearly report state
	const [selectedYearForYearly, setSelectedYearForYearly] = useState<number>(
		new Date().getFullYear()
	);
	const { data: yearlyReport, isLoading: loadingYearly } = useYearlyReport(selectedYearForYearly);

	// Statistics state
	const [statsFromDate, setStatsFromDate] = useState<string>(
		format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd')
	);
	const [statsToDate, setStatsToDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
	const { data: paymentMethodStats, isLoading: loadingStats } = usePaymentMethodStatistics(
		statsFromDate,
		statsToDate
	);

	// Generate year options
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

	// Generate month options
	const months = [
		{ value: 1, label: 'January' },
		{ value: 2, label: 'February' },
		{ value: 3, label: 'March' },
		{ value: 4, label: 'April' },
		{ value: 5, label: 'May' },
		{ value: 6, label: 'June' },
		{ value: 7, label: 'July' },
		{ value: 8, label: 'August' },
		{ value: 9, label: 'September' },
		{ value: 10, label: 'October' },
		{ value: 11, label: 'November' },
		{ value: 12, label: 'December' },
	];

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Financial Reports
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-2">
						View comprehensive financial reports and analytics
					</p>
				</div>
			</div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="daily">Daily Report</TabsTrigger>
					<TabsTrigger value="monthly">Monthly Report</TabsTrigger>
					<TabsTrigger value="yearly">Yearly Report</TabsTrigger>
					<TabsTrigger value="statistics">Payment Statistics</TabsTrigger>
				</TabsList>

				{/* Daily Report */}
				<TabsContent value="daily" className="space-y-4">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>{t('dailyReport')}</CardTitle>
									<CardDescription>{t('financialSummaryForSpecificDate')}</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<Label htmlFor="daily-date">Date</Label>
									<Input
										id="daily-date"
										type="date"
										value={selectedDate}
										onChange={(e) => setSelectedDate(e.target.value)}
										className="w-48"
									/>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{loadingDaily ? (
								<div className="text-center py-8">
									<p className="text-gray-500">{t('loadingReport')}</p>
								</div>
							) : dailyReport ? (
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">{t('totalRevenue')}</p>
											<p className="text-2xl font-bold text-green-600">
												{dailyReport.totalRevenue.toLocaleString()} EGP
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">{t('totalPayments')}</p>
											<p className="text-2xl font-bold text-blue-600">
												{dailyReport.totalPayments.toLocaleString()} EGP
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">{t('outstanding')}</p>
											<p className="text-2xl font-bold text-red-600">
												{dailyReport.outstandingPayments.toLocaleString()} EGP
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">{t('transactions')}</p>
											<p className="text-2xl font-bold">{dailyReport.totalTransactions}</p>
										</CardContent>
									</Card>
								</div>
							) : (
								<div className="text-center py-8">
									<p className="text-gray-500">{t('noDataAvailableForSelectedDate')}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Monthly Report */}
				<TabsContent value="monthly" className="space-y-4">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>{t('monthlyReport')}</CardTitle>
									<CardDescription>{t('financialSummaryForSpecificMonth')}</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<Select
										value={selectedYear.toString()}
										onValueChange={(v) => setSelectedYear(parseInt(v, 10))}
									>
										<SelectTrigger className="w-32">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{years.map((year) => (
												<SelectItem key={year} value={year.toString()}>
													{year}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Select
										value={selectedMonth.toString()}
										onValueChange={(v) => setSelectedMonth(parseInt(v, 10))}
									>
										<SelectTrigger className="w-40">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{months.map((month) => (
												<SelectItem key={month.value} value={month.value.toString()}>
													{month.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{loadingMonthly ? (
								<div className="text-center py-8">
									<p className="text-gray-500">{t('loadingReport')}</p>
								</div>
							) : monthlyReport ? (
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">{t('totalRevenue')}</p>
											<p className="text-2xl font-bold text-green-600">
												{monthlyReport.totalRevenue.toLocaleString()} EGP
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">{t('totalPayments')}</p>
											<p className="text-2xl font-bold text-blue-600">
												{monthlyReport.totalPayments.toLocaleString()} EGP
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">{t('outstanding')}</p>
											<p className="text-2xl font-bold text-red-600">
												{monthlyReport.outstandingPayments.toLocaleString()} EGP
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">{t('transactions')}</p>
											<p className="text-2xl font-bold">{monthlyReport.totalTransactions}</p>
										</CardContent>
									</Card>
								</div>
							) : (
								<div className="text-center py-8">
									<p className="text-gray-500">{t('noDataAvailableForSelectedMonth')}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Yearly Report */}
				<TabsContent value="yearly" className="space-y-4">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>{t('yearlyReport')}</CardTitle>
									<CardDescription>{t('financialSummaryForSpecificYear')}</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<Label htmlFor="yearly-year">Year</Label>
									<Select
										value={selectedYearForYearly.toString()}
										onValueChange={(v) => setSelectedYearForYearly(parseInt(v, 10))}
									>
										<SelectTrigger className="w-32" id="yearly-year">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{years.map((year) => (
												<SelectItem key={year} value={year.toString()}>
													{year}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{loadingYearly ? (
								<div className="text-center py-8">
									<p className="text-gray-500">{t('loadingReport')}</p>
								</div>
							) : yearlyReport ? (
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">{t('totalRevenue')}</p>
											<p className="text-2xl font-bold text-green-600">
												{yearlyReport.totalRevenue.toLocaleString()} EGP
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">{t('totalPayments')}</p>
											<p className="text-2xl font-bold text-blue-600">
												{yearlyReport.totalPayments.toLocaleString()} EGP
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">{t('outstanding')}</p>
											<p className="text-2xl font-bold text-red-600">
												{yearlyReport.outstandingPayments.toLocaleString()} EGP
											</p>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<p className="text-sm text-gray-500 dark:text-gray-400">{t('transactions')}</p>
											<p className="text-2xl font-bold">{yearlyReport.totalTransactions}</p>
										</CardContent>
									</Card>
								</div>
							) : (
								<div className="text-center py-8">
									<p className="text-gray-500">{t('noDataAvailableForSelectedYear')}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Payment Statistics */}
				<TabsContent value="statistics" className="space-y-4">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Payment Method Statistics</CardTitle>
									<CardDescription>
										Statistics for payment methods within a date range
									</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<Label htmlFor="stats-from">From</Label>
									<Input
										id="stats-from"
										type="date"
										value={statsFromDate}
										onChange={(e) => setStatsFromDate(e.target.value)}
										className="w-40"
									/>
									<Label htmlFor="stats-to">To</Label>
									<Input
										id="stats-to"
										type="date"
										value={statsToDate}
										onChange={(e) => setStatsToDate(e.target.value)}
										className="w-40"
									/>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{loadingStats ? (
								<div className="text-center py-8">
									<p className="text-gray-500">{t('loadingStatistics')}</p>
								</div>
							) : paymentMethodStats && paymentMethodStats.length > 0 ? (
								<div className="space-y-4">
									{paymentMethodStats.map((stat) => (
										<Card key={stat.paymentMethod}>
											<CardContent className="p-4">
												<div className="flex items-center justify-between mb-4">
													<h3 className="text-lg font-semibold">{stat.paymentMethodName}</h3>
													<Badge variant="outline">
														{stat.successRate.toFixed(1)}% Success Rate
													</Badge>
												</div>
												<div className="grid grid-cols-4 gap-4">
													<div>
														<p className="text-sm text-gray-500">Total Amount</p>
														<p className="text-xl font-bold text-green-600">
															{stat.totalAmount.toLocaleString()} EGP
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-500">Count</p>
														<p className="text-xl font-bold">{stat.count}</p>
													</div>
													<div>
														<p className="text-sm text-gray-500">Average</p>
														<p className="text-xl font-bold">
															{stat.averageAmount.toLocaleString()} EGP
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-500">Success/Failed</p>
														<p className="text-xl font-bold">
															{stat.successCount}/{stat.failedCount}
														</p>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<p className="text-gray-500">{t('noStatisticsAvailable')}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default FinancialReportsScreen;


