import React, { useEffect, useState } from 'react';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import {
	ChartBarIcon,
	UserGroupIcon,
	CalendarIcon,
	// ExclamationTriangleIcon,
	HandRaisedIcon as HandshakeIconOutline,
	// ClipboardDocumentListIcon,
	// CheckCircleIcon,
	// XCircleIcon,
	// ClockIcon,
	CurrencyDollarIcon as DollarSignIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DealApprovalForm from './DealApprovalForm';
import type { Deal } from '@/types/sales.types';

// Helper function to safely format dates
const safeFormatDate = (date: any, fallback: string = 'N/A'): string => {
	if (!date) return fallback;
	try {
		const parsed = new Date(date);
		if (isNaN(parsed.getTime())) return fallback;
		return format(parsed, 'MMM dd, yyyy');
	} catch {
		return fallback;
	}
};

const SalesManagerDashboard: React.FC = () => {
	const {
		getSalesManagerDashboard,
		getSalesReports,
		getWeeklyPlans,
		reviewWeeklyPlan,
		getDeals,
		getPendingApprovals,
		// approveDeal,
		// failDeal,
		salesDashboard,
		salesReports,
		weeklyPlans,
		deals,
		// pendingApprovals,
		analyticsLoading,
		reportsLoading,
		weeklyPlansLoading,
		dealsLoading,
		reportsError,
		weeklyPlansError,
		dealsError
	} = useSalesStore();

	const { user } = useAuthStore();
	const [selectedPlan, setSelectedPlan] = useState<any>(null);
	const [reviewComment, setReviewComment] = useState('');
	const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
	const [showDealApproval, setShowDealApproval] = useState(false);
	const [activeTab, setActiveTab] = useState('overview');

	useEffect(() => {
		getSalesManagerDashboard();
		getSalesReports();
		getWeeklyPlans();
		getDeals({ status: 'PendingManagerApproval' });
		getPendingApprovals();
	}, [getSalesManagerDashboard, getSalesReports, getWeeklyPlans, getDeals, getPendingApprovals]);

	const handlePlanReview = async (planId: number, status: 'Approved' | 'Rejected') => {
		try {
			await reviewWeeklyPlan(planId, {
				status,
				reviewNotes: reviewComment,
			});
			setSelectedPlan(null);
			setReviewComment('');
			// Refresh plans after review
			getWeeklyPlans();
		} catch (error) {
			console.error('Error reviewing plan:', error);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Approved':
				return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
			case 'Rejected':
				return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
			case 'Submitted':
				return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
			case 'Draft':
				return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
			default:
				return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
		}
	};

	const getDealStatusColor = (status: string) => {
		switch (status) {
			case 'PendingManagerApproval':
				return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
			case 'PendingSuperAdminApproval':
				return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
			case 'Approved':
				return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
			case 'Success':
				return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
			case 'Failed':
				return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
			case 'Rejected':
				return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
			default:
				return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
		}
	};

	const handleDealApproval = (deal: Deal) => {
		setSelectedDeal(deal);
		setShowDealApproval(true);
	};


	if (analyticsLoading && reportsLoading && weeklyPlansLoading) {
		return (
			<div className="text-center py-8">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
				<p className="mt-4 text-gray-600">Loading dashboard...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
							Sales Manager Dashboard
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Welcome back, {user?.firstName} {user?.lastName}
						</p>
					</div>
					<div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">
						Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
					</div>
				</div>
			</div>

			{/* Main Content Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="deals">Deal Approvals</TabsTrigger>
					<TabsTrigger value="plans">Weekly Plans</TabsTrigger>
					<TabsTrigger value="reports">Reports</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">

					{/* Key Metrics */}
					{salesDashboard && (
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
							<Card>
								<CardContent className="p-6">
									<div className="flex items-center">
										<div className="flex-shrink-0">
											<ChartBarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
										</div>
										<div className="ml-4">
											<h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">
												Total Clients
											</h3>
											<p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
												{salesDashboard.overview?.totalClients?.toLocaleString() || 0}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-6">
									<div className="flex items-center">
										<div className="flex-shrink-0">
											<HandshakeIconOutline className="h-8 w-8 text-green-600 dark:text-green-400" />
										</div>
										<div className="ml-4">
											<h3 className="text-sm font-medium text-green-600 dark:text-green-400">
												Pending Deals
											</h3>
											<p className="text-2xl font-bold text-green-900 dark:text-green-100">
												{deals.filter(d => d.status === 'PendingManagerApproval').length}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-6">
									<div className="flex items-center">
										<div className="flex-shrink-0">
											<DollarSignIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
										</div>
										<div className="ml-4">
											<h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
												Total Revenue
											</h3>
											<p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
												EGP {deals.filter(d => d.status === 'Success').reduce((sum, deal) => sum + deal.dealValue, 0).toLocaleString()}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-6">
									<div className="flex items-center">
										<div className="flex-shrink-0">
											<UserGroupIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
										</div>
										<div className="ml-4">
											<h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">
												Team Performance
											</h3>
											<p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
												{salesDashboard.overview?.teamPerformance || 0}%
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Team Performance Overview */}
					{salesDashboard?.teamPerformance && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<UserGroupIcon className="h-5 w-5 mr-2" />
									Team Performance
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{salesDashboard.teamPerformance.map((member, index) => (
										<div
											key={index}
											className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
										>
											<div className="flex items-center justify-between mb-2">
												<h3 className="font-medium text-gray-900 dark:text-gray-100">
													{member.salesmanName}
												</h3>
												<span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">
													{member.successRate}% success
												</span>
											</div>
											<div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
												<div>
													<span className="font-medium">{member.clientsCount}</span> clients
												</div>
												<div>
													<span className="font-medium">{member.visitsCount}</span> visits
												</div>
											</div>
											<div className="mt-2 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">
												Last activity: {member.lastActivity ? format(new Date(member.lastActivity), 'MMM dd') : 'N/A'}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Deal Approvals Tab */}
				<TabsContent value="deals" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<HandshakeIconOutline className="h-5 w-5 mr-2" />
								Pending Deal Approvals
							</CardTitle>
						</CardHeader>
						<CardContent>
							{dealsLoading ? (
								<div className="text-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
								</div>
							) : dealsError ? (
								<div className="text-center py-8 text-red-500 dark:text-red-400">
									{dealsError}
								</div>
							) : deals.filter(d => d.status === 'PendingManagerApproval').length > 0 ? (
								<div className="space-y-4">
									{deals
										.filter(deal => deal.status === 'PendingManagerApproval')
										.map((deal) => (
											<div
												key={deal.id}
												className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
											>
												<div className="flex justify-between items-start mb-3">
													<div>
														<h3 className="font-medium text-gray-900 dark:text-gray-100">
															{deal.clientName}
														</h3>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															{deal.dealDescription}
														</p>
														<p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">
															Created by: {deal.createdByName} • {deal.createdAt ? format(new Date(deal.createdAt), 'MMM dd, yyyy') : 'N/A'}
														</p>
													</div>
													<Badge className={getDealStatusColor(deal.status)}>
														{deal.status.replace(/([A-Z])/g, ' $1').trim()}
													</Badge>
												</div>

												<div className="flex justify-between items-center">
													<div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">
														<strong>Deal Value:</strong> EGP {deal.dealValue.toLocaleString()}
													</div>
													<div className="flex space-x-2">
														<Button
															onClick={() => handleDealApproval(deal)}
															className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
														>
															Review Deal
														</Button>
													</div>
												</div>
											</div>
										))}
								</div>
							) : (
								<div className="text-center py-8 text-gray-500 dark:text-gray-400 dark:text-gray-400">
									No deals pending approval
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Weekly Plans Tab */}
				<TabsContent value="plans" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Weekly Plans Approval */}
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow">
							<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
								<h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
									<CalendarIcon className="h-5 w-5 mr-2" />
									Weekly Plans Pending Approval
								</h2>
							</div>
							<div className="p-6">
								{weeklyPlansLoading ? (
									<div className="text-center py-8">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
									</div>
								) : weeklyPlansError ? (
									<div className="text-center py-8 text-red-500 dark:text-red-400 dark:text-red-400">
										{weeklyPlansError}
									</div>
								) : weeklyPlans.filter(plan => plan.status === 'Submitted').length > 0 ? (
									<div className="space-y-4">
										{weeklyPlans
											.filter(plan => plan.status === 'Submitted')
											.map((plan) => (
												<div
													key={plan.id}
													className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
												>
													<div className="flex justify-between items-start mb-3">
														<div>
															<h3 className="font-medium text-gray-900 dark:text-gray-100">
																{plan.planTitle}
															</h3>
															<p className="text-sm text-gray-600 dark:text-gray-400">
																{plan.employeeName}
															</p>
															<p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">
																{plan.weekStartDate ? format(new Date(plan.weekStartDate), 'MMM dd') : 'N/A'} - {plan.weekEndDate ? format(new Date(plan.weekEndDate), 'MMM dd, yyyy') : 'N/A'}
															</p>
														</div>
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
																plan.status
															)}`}
														>
															{plan.status}
														</span>
													</div>

													<div className="flex justify-between items-center">
														<div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">
															{plan.tasks?.length || 0} tasks
														</div>
														<div className="flex space-x-2">
															<button
																onClick={() => setSelectedPlan(plan)}
																className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
															>
																Review
															</button>
														</div>
													</div>
												</div>
											))}
									</div>
								) : (
									<div className="text-center py-8 text-gray-500 dark:text-gray-400">
										No plans pending approval
									</div>
								)}
							</div>
						</div>

						{/* Recent Sales Reports */}
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow">
							<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
								<h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
									<ChartBarIcon className="h-5 w-5 mr-2" />
									Recent Sales Reports
								</h2>
							</div>
							<div className="p-6">
								{reportsLoading ? (
									<div className="text-center py-8">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
									</div>
								) : reportsError ? (
									<div className="text-center py-8 text-red-500 dark:text-red-400">
										{reportsError}
									</div>
								) : salesReports.length > 0 ? (
									<div className="space-y-4">
										{salesReports.slice(0, 5).map((report) => (
											<div
												key={report.id}
												className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
											>
												<div className="flex justify-between items-start mb-2">
													<div>
														<h3 className="font-medium text-gray-900 dark:text-gray-100">
															{report.title}
														</h3>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															{report.reportType} Report
														</p>
													</div>
													<span
														className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
													>
														Completed
													</span>
												</div>

												<div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
													<span>
														{safeFormatDate(report.generatedAt)}
													</span>
													<span>
														{report.generatedByName}
													</span>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8 text-gray-500 dark:text-gray-400">
										No recent reports
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Weekly Plans Approval */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<CalendarIcon className="h-5 w-5 mr-2" />
								Weekly Plans Pending Approval
							</CardTitle>
						</CardHeader>
						<CardContent>
							{weeklyPlansLoading ? (
								<div className="text-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
								</div>
							) : weeklyPlansError ? (
								<div className="text-center py-8 text-red-500 dark:text-red-400">
									{weeklyPlansError}
								</div>
							) : weeklyPlans.filter(plan => plan.status === 'Submitted').length > 0 ? (
								<div className="space-y-4">
									{weeklyPlans
										.filter(plan => plan.status === 'Submitted')
										.map((plan) => (
											<div
												key={plan.id}
												className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
											>
												<div className="flex justify-between items-start mb-3">
													<div>
														<h3 className="font-medium text-gray-900">
															{plan.planTitle}
														</h3>
														<p className="text-sm text-gray-600">
															{plan.employeeName}
														</p>
														<p className="text-xs text-gray-500 dark:text-gray-400">
															{plan.weekStartDate ? format(new Date(plan.weekStartDate), 'MMM dd') : 'N/A'} - {plan.weekEndDate ? format(new Date(plan.weekEndDate), 'MMM dd, yyyy') : 'N/A'}
														</p>
													</div>
													<Badge className={getStatusColor(plan.status)}>
														{plan.status}
													</Badge>
												</div>

												<div className="flex justify-between items-center">
													<div className="text-sm text-gray-500 dark:text-gray-400">
														{plan.tasks?.length || 0} tasks
													</div>
													<div className="flex space-x-2">
														<Button
															onClick={() => setSelectedPlan(plan)}
															className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
														>
															Review
														</Button>
													</div>
												</div>
											</div>
										))}
								</div>
							) : (
								<div className="text-center py-8 text-gray-500 dark:text-gray-400">
									No plans pending approval
								</div>
							)}
						</CardContent>
					</Card>

					{/* Recent Sales Reports */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<ChartBarIcon className="h-5 w-5 mr-2" />
								<span>Recent Sales Reports</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{reportsLoading ? (
								<div className="text-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
								</div>
							) : reportsError ? (
								<div className="text-center py-8 text-red-500 dark:text-red-400">
									{reportsError}
								</div>
							) : salesReports.length > 0 ? (
								<div className="space-y-4">
									{salesReports.slice(0, 5).map((report) => (
										<div
											key={report.id}
											className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
										>
											<div className="flex justify-between items-start mb-2">
												<div>
													<h3 className="font-medium text-gray-900">
														{report.title}
													</h3>
													<p className="text-sm text-gray-600">
														{report.reportType} Report
													</p>
												</div>
												<Badge className="bg-green-100 text-green-800">
													Completed
												</Badge>
											</div>

											<div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
												<span>
													{safeFormatDate(report.generatedAt)}
												</span>
												<span>
													{report.generatedByName}
												</span>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-gray-500 dark:text-gray-400">
									No recent reports
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Reports Tab */}
				<TabsContent value="reports" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<ChartBarIcon className="h-5 w-5 mr-2" />
								Sales Reports
							</CardTitle>
						</CardHeader>
						<CardContent>
							{reportsLoading ? (
								<div className="text-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
								</div>
							) : reportsError ? (
								<div className="text-center py-8 text-red-500 dark:text-red-400">
									{reportsError}
								</div>
							) : salesReports.length > 0 ? (
								<div className="space-y-4">
									{salesReports.map((report) => (
										<div
											key={report.id}
											className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
										>
											<div className="flex justify-between items-start mb-2">
												<div>
													<h3 className="font-medium text-gray-900">
														{report.title}
													</h3>
													<p className="text-sm text-gray-600">
														{report.reportType} Report
													</p>
													<p className="text-xs text-gray-500 dark:text-gray-400">
														{report.description}
													</p>
												</div>
												<Badge className="bg-green-100 text-green-800">
													Completed
												</Badge>
											</div>

											<div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
												<span>
													Generated: {safeFormatDate(report.generatedAt)}
												</span>
												<span>
													By: {report.generatedByName}
												</span>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-gray-500 dark:text-gray-400">
									No reports available
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Deal Approval Modal */}
			{
				showDealApproval && selectedDeal && (
					<DealApprovalForm
						deal={selectedDeal}
						onSuccess={() => {
							setShowDealApproval(false);
							setSelectedDeal(null);
							getDeals({ status: 'PendingManagerApproval' });
						}}
						onCancel={() => {
							setShowDealApproval(false);
							setSelectedDeal(null);
						}}
					/>
				)
			}

			{/* Plan Review Modal */}
			{
				selectedPlan && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
							<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
									Review Weekly Plan
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{selectedPlan.planTitle} by {selectedPlan.employeeName}
								</p>
							</div>

							<div className="p-6">
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Review Comment
										</label>
										<textarea
											value={reviewComment}
											onChange={(e) => setReviewComment(e.target.value)}
											placeholder="Add your review comments..."
											rows={4}
											className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
										/>
									</div>

									{selectedPlan.tasks && selectedPlan.tasks.length > 0 && (
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Tasks ({selectedPlan.tasks.length})
											</label>
											<div className="space-y-2 max-h-40 overflow-y-auto">
												{selectedPlan.tasks.map((task: any, index: number) => (
													<div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
														<div className="flex justify-between items-start">
															<div>
																<p className="font-medium text-sm dark:text-gray-100">{task.title}</p>
																<p className="text-xs text-gray-600 dark:text-gray-400">{task.description}</p>
															</div>
															<span
																className={`px-2 py-1 rounded-full text-xs ${task.priority === 'High'
																	? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
																	: task.priority === 'Medium'
																		? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
																		: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
																	}`}
															>
																{task.priority}
															</span>
														</div>
														<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
															Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'N/A'}
														</p>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>

							<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
								<div className="flex justify-end space-x-3">
									<Button
										onClick={() => {
											setSelectedPlan(null);
											setReviewComment('');
										}}
										variant="outline"
									>
										Cancel
									</Button>
									<Button
										onClick={() => handlePlanReview(selectedPlan.id, 'Rejected')}
										variant="destructive"
									>
										Reject
									</Button>
									<Button
										onClick={() => handlePlanReview(selectedPlan.id, 'Approved')}
										className="bg-green-600 hover:bg-green-700"
									>
										Approve
									</Button>
								</div>
							</div>
						</div>
					</div>
				)
			}
		</div>
	);
};

export default SalesManagerDashboard;