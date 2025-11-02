import React, { useEffect, useState } from 'react';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import ClientSearch from './ClientSearch';
import SalesSupportClientDetails from './SalesSupportClientDetails';
import OfferRequestForm from './OfferRequestForm';
import {
	UserGroupIcon,
	CalendarIcon,
	ExclamationTriangleIcon,
	CheckCircleIcon,
	ClockIcon,
	PlusIcon,
	ArchiveBoxIcon,
	CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

const SalesSupportDashboard: React.FC = () => {
	const { t } = useTranslation();
	const {
		getAssignedRequests,
		updateRequestStatus,
		getMyOffers,
		searchClients,
		getOffersByClient,
		assignedRequests,
		offers,
		requestWorkflowsLoading,
		clientsLoading,
		offersLoading,
		clients,
		clientsError,
		requestWorkflowsError,
		offersError,
		pagination,
		offersByClient
	} = useSalesStore();

	const { user } = useAuthStore();
	const [selectedClient, setSelectedClient] = useState<any>(null);
	const [selectedRequest, setSelectedRequest] = useState<any>(null);
	const [selectedOffer, setSelectedOffer] = useState<any>(null);
	const [showOfferForm, setShowOfferForm] = useState(false);
	const [activeTab, setActiveTab] = useState('overview');
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		getAssignedRequests();
		getMyOffers();
	}, [getAssignedRequests, getMyOffers]);

	// Load all clients when clients tab is opened
	useEffect(() => {
		if (activeTab === 'clients') {
			searchClients({ page: currentPage, pageSize: 20 });
		}
	}, [activeTab, currentPage, searchClients]);

	// Load client offers when a client is selected
	useEffect(() => {
		if (selectedClient?.id) {
			getOffersByClient(selectedClient.id);
		}
	}, [selectedClient, getOffersByClient]);

	const handleStatusUpdate = async (requestId: string, status: string, comment: string = '') => {
		try {
			await updateRequestStatus(requestId, status as any, comment);
			getAssignedRequests();
		} catch (error) {
			console.error('Error updating request status:', error);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Completed':
				return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
			case 'InProgress':
				return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
			case 'Pending':
				return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
			case 'Assigned':
				return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700';
			case 'Cancelled':
				return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
			default:
				return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'High':
				return 'bg-red-500 text-white';
			case 'Medium':
				return 'bg-yellow-500 text-white';
			case 'Low':
				return 'bg-green-500 text-white';
			default:
				return 'bg-gray-500 text-white';
		}
	};

	const getOfferStatusColor = (status: string) => {
		switch (status) {
			case 'Draft':
				return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700';
			case 'Sent':
				return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700';
			case 'Accepted':
				return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700';
			case 'Rejected':
				return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700';
			default:
				return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700';
		}
	};

	const getRequestTypeIcon = (requestType: string) => {
		const iconClasses = "h-5 w-5 text-gray-600 dark:text-gray-400";
		switch (requestType) {
			case 'ClientVisit':
				return <CalendarIcon className={iconClasses} />;
			case 'ProductDemo':
				return <UserGroupIcon className={iconClasses} />;
			case 'SupportRequest':
				return <ExclamationTriangleIcon className={iconClasses} />;
			case 'QuoteRequest':
				return <CurrencyDollarIcon className={iconClasses} />;
			default:
				return <ClockIcon className={iconClasses} />;
		}
	};

	// Filter offers based on search query
	const filteredOffers = offers?.filter(offer =>
		offer.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		offer.products?.toLowerCase().includes(searchQuery.toLowerCase())
	) || [];

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Enhanced Header */}
				<div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl shadow-lg p-8 text-white">
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-3xl font-bold mb-2 text-white">{t('salesSupport')} Dashboard</h1>
							<p className="text-blue-100 dark:text-blue-200 text-lg">
								{t('welcomeBack')}, {user?.firstName} {user?.lastName}
							</p>
							<p className="text-blue-200 dark:text-blue-300 text-sm mt-2">
								{t('manageOffersAndRequests')}
							</p>
						</div>
						<div className="flex space-x-3">
							<Button
								onClick={() => setShowOfferForm(true)}
								className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 shadow-md"
								size="lg"
							>
								<PlusIcon className="h-5 w-5 mr-2" />
								{t('createNewOffer')}
							</Button>
						</div>
					</div>
				</div>

				{/* Quick Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 dark:border-l-blue-400">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('myOffers')}</p>
									<p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
										{offers?.length || 0}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										{offers?.filter(o => o.status === 'Sent').length || 0} {t('sent')}
									</p>
								</div>
								<div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
									<ArchiveBoxIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500 dark:border-l-green-400">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
									<p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
										{offers?.filter(o => o.status === 'Accepted').length || 0}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Accepted</p>
								</div>
								<div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
									<CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500 dark:border-l-yellow-400">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('inProgress')}</p>
									<p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
										{offers?.filter(o => o.status === 'Draft').length || 0}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('draft')}</p>
								</div>
								<div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-full">
									<ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 dark:border-l-purple-400">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('assignedRequests')}</p>
									<p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
										{assignedRequests?.length || 0}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('requests')}</p>
								</div>
								<div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full">
									<ExclamationTriangleIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 gap-2 bg-white dark:bg-gray-800 shadow-sm">
						<TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
							{t('overview')}
						</TabsTrigger>
						<TabsTrigger value="my-offers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
							{t('myOffers')}
						</TabsTrigger>
						<TabsTrigger value="requests" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
							{t('requests')}
						</TabsTrigger>
						<TabsTrigger value="clients" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
							{t('clients')}
						</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value="overview" className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Recent Offers */}
							<Card className="shadow-md">
								<CardHeader>
									<CardTitle>Recent {t('offers')}</CardTitle>
									<CardDescription>Your latest created {t('offers').toLowerCase()}</CardDescription>
								</CardHeader>
								<CardContent>
									{offersLoading ? (
										<div className="text-center py-8">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
										</div>
									) : offers && offers.length > 0 ? (
										<div className="space-y-3">
											{offers.slice(0, 5).map((offer) => (
												<div
													key={offer.id}
													className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
													onClick={() => setSelectedOffer(offer)}
												>
													<div className="flex justify-between items-start mb-2">
														<h4 className="font-medium text-gray-900 dark:text-gray-100">
															{offer.clientName || `Client ${offer.clientId}`}
														</h4>
														<Badge className={getOfferStatusColor(offer.status)}>
															{offer.status}
														</Badge>
													</div>
													<p className="text-sm text-gray-600 dark:text-gray-400 truncate">
														{offer.products || 'N/A'}
													</p>
													<p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
														{offer.totalAmount ? `EGP ${offer.totalAmount.toLocaleString()}` : 'N/A'}
													</p>
												</div>
											))}
										</div>
									) : (
										<div className="text-center py-8 text-gray-500 dark:text-gray-400">
											{t('noOffersFound')}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Pending Requests */}
							<Card className="shadow-md">
								<CardHeader>
									<CardTitle>{t('pending')} {t('requests')}</CardTitle>
									<CardDescription>{t('assignedRequests')} waiting for action</CardDescription>
								</CardHeader>
								<CardContent>
									{requestWorkflowsLoading ? (
										<div className="text-center py-8">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
										</div>
									) : assignedRequests && assignedRequests.length > 0 ? (
										<div className="space-y-3">
											{assignedRequests.slice(0, 5).map((request) => (
												<div
													key={request.id}
													className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
													onClick={() => setSelectedRequest(request)}
												>
													<div className="flex justify-between items-start mb-2">
														<div className="flex items-center space-x-2">
															{getRequestTypeIcon(request.requestType)}
															<h4 className="font-medium text-gray-900 dark:text-gray-100">
																{request.title || request.clientName}
															</h4>
														</div>
														<Badge className={getStatusColor(request.status)}>
															{request.status}
														</Badge>
													</div>
													<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
														{request.description}
													</p>
													<div className="flex items-center justify-between mt-2">
														<span className="text-xs text-gray-500 dark:text-gray-400">
															{request.clientName}
														</span>
														<Badge variant="outline" className={getPriorityColor(request.priority)}>
															{request.priority}
														</Badge>
													</div>
												</div>
											))}
										</div>
									) : (
										<div className="text-center py-8 text-gray-500 dark:text-gray-400">
											No pending requests
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* My Offers Tab */}
					<TabsContent value="my-offers" className="space-y-6">
						<Card className="shadow-md">
							<CardHeader>
								<div className="flex justify-between items-center">
									<div>
										<CardTitle>My Created Offers</CardTitle>
										<CardDescription>All offers you've created</CardDescription>
									</div>
									<div className="w-64">
										<Input
											placeholder="Search offers..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								{offersLoading ? (
									<div className="text-center py-12">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
										<p className="text-gray-500 dark:text-gray-400 mt-4">Loading offers...</p>
									</div>
								) : offersError ? (
									<div className="text-center py-12 text-red-500 dark:text-red-400">
										{offersError}
									</div>
								) : filteredOffers.length > 0 ? (
									<div className="space-y-4">
										{filteredOffers.map((offer) => (
											<div
												key={offer.id}
												className="border-2 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-gray-800"
												onClick={() => setSelectedOffer(offer)}
											>
												<div className="flex justify-between items-start mb-4">
													<div className="flex-1">
														<h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
															{offer.clientName || `Client ${offer.clientId}`}
														</h3>
														<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
															{offer.products || 'N/A'}
														</p>
														<div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
															<span>Created: {offer.createdAt ? format(new Date(offer.createdAt), 'MMM dd, yyyy') : 'N/A'}</span>
															{offer.validUntil && (
																<span>Valid Until: {format(new Date(offer.validUntil), 'MMM dd, yyyy')}</span>
															)}
														</div>
													</div>
													<Badge className={`${getOfferStatusColor(offer.status)} px-3 py-1`}>
														{offer.status}
													</Badge>
												</div>

												<Separator className="my-3" />

												<div className="flex justify-between items-center">
													<div className="flex items-center space-x-6">
														{offer.totalAmount && (
															<div className="flex items-center space-x-2">
																<CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
																<span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
																	EGP {offer.totalAmount.toLocaleString()}
																</span>
															</div>
														)}
													</div>
													<Button variant="outline" size="sm" onClick={(e) => {
														e.stopPropagation();
														setSelectedOffer(offer);
													}}>
														View Details
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-16">
										<ArchiveBoxIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
										<p className="text-gray-500 dark:text-gray-400 text-lg">No offers found</p>
										{searchQuery && (
											<p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Try adjusting your search</p>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Assigned Requests Tab */}
					<TabsContent value="requests" className="space-y-6">
						<Card className="shadow-md">
							<CardHeader>
								<CardTitle>Assigned Requests</CardTitle>
								<CardDescription>Requests assigned to you</CardDescription>
							</CardHeader>
							<CardContent>
								{requestWorkflowsLoading ? (
									<div className="text-center py-12">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
										<p className="text-gray-500 dark:text-gray-400 mt-4">Loading requests...</p>
									</div>
								) : requestWorkflowsError ? (
									<div className="text-center py-12 text-red-500 dark:text-red-400">
										{requestWorkflowsError}
									</div>
								) : assignedRequests && assignedRequests.length > 0 ? (
									<div className="space-y-4">
										{assignedRequests.map((request) => (
											<div
												key={request.id}
												className="border-2 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
											>
												<div className="flex justify-between items-start mb-4">
													<div className="flex items-start space-x-3 flex-1">
														<div className="mt-1">
															{getRequestTypeIcon(request.requestType)}
														</div>
														<div className="flex-1">
															<h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
																{request.title || request.clientName}
															</h3>
															<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
																{request.description}
															</p>
															<div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
																<span>Client: {request.clientName}</span>
																<span>Requested by: {request.requestedByName}</span>
																<span>{request.createdAt ? format(new Date(request.createdAt), 'MMM dd, yyyy') : 'N/A'}</span>
															</div>
														</div>
													</div>
													<div className="flex items-center space-x-2">
														<Badge className={getPriorityColor(request.priority)} variant="outline">
															{request.priority}
														</Badge>
														<Badge className={getStatusColor(request.status)}>
															{request.status}
														</Badge>
													</div>
												</div>

												{request.dueDate && (
													<div className="mb-3 text-xs text-gray-500 dark:text-gray-500">
														Due: {request.dueDate ? format(new Date(request.dueDate), 'MMM dd, yyyy') : 'N/A'}
													</div>
												)}

												<Separator className="my-3" />

												<div className="flex justify-end space-x-2">
													{request.status === 'Pending' && (
														<Button
															onClick={() => handleStatusUpdate(request.id, 'InProgress', 'Started working on request')}
															size="sm"
															className="bg-blue-600 hover:bg-blue-700"
														>
															Start Work
														</Button>
													)}
													{request.status === 'InProgress' && (
														<Button
															onClick={() => handleStatusUpdate(request.id, 'Completed', 'Request completed')}
															size="sm"
															className="bg-green-600 hover:bg-green-700"
														>
															Complete
														</Button>
													)}
													<Button
														variant="outline"
														size="sm"
														onClick={() => setSelectedRequest(request)}
													>
														View Details
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-16">
										<CheckCircleIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
										<p className="text-gray-500 dark:text-gray-400 text-lg">No requests assigned</p>
										<p className="text-sm text-gray-400 dark:text-gray-500 mt-2">All caught up!</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Clients Tab */}
					<TabsContent value="clients" className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<Card className="lg:col-span-1 shadow-md">
								<CardHeader>
									<CardTitle>Search Clients</CardTitle>
									<CardDescription>Find and manage clients</CardDescription>
								</CardHeader>
								<CardContent>
									<ClientSearch
										onClientSelect={setSelectedClient}
										placeholder="Search by name, type, or location..."
										className="mb-4"
									/>
									<Separator />
									<div className="mt-4">
										<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Clients</h3>
										{clientsLoading ? (
											<div className="text-center py-4">
												<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
											</div>
										) : clientsError ? (
											<div className="text-center py-4 text-red-500 dark:text-red-400 text-sm">
												{clientsError}
											</div>
										) : clients && clients.length > 0 ? (
											<>
												<div className="space-y-2 max-h-96 overflow-y-auto">
													{clients.slice(0, 10).map((client) => (
														<div
															key={client.id}
															onClick={() => setSelectedClient(client)}
															className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedClient?.id === client.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'
																}`}
														>
															<div className="font-medium text-gray-900 dark:text-gray-100">{client.name}</div>
															<div className="text-sm text-gray-500 dark:text-gray-400">
																{client.type} • {client.specialization || 'N/A'}
															</div>
															<div className="text-xs text-gray-400 dark:text-gray-500">{client.location}</div>
														</div>
													))}
												</div>
												{/* Pagination */}
												{pagination && pagination.totalPages > 1 && (
													<div className="mt-4 flex items-center justify-between border-t pt-4">
														<Button
															variant="outline"
															size="sm"
															onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
															disabled={!pagination.hasPreviousPage || clientsLoading}
														>
															Previous
														</Button>
														<span className="text-sm text-gray-600 dark:text-gray-400">
															Page {pagination.page} of {pagination.totalPages}
														</span>
														<Button
															variant="outline"
															size="sm"
															onClick={() => setCurrentPage(p => p + 1)}
															disabled={!pagination.hasNextPage || clientsLoading}
														>
															Next
														</Button>
													</div>
												)}
											</>
										) : (
											<div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
												No clients found
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Client Details - Simplified for Sales Support */}
							<div className="lg:col-span-2">
								{selectedClient ? (
									<SalesSupportClientDetails
										client={selectedClient}
										offers={offersByClient[selectedClient.id] || []}
										offersLoading={offersLoading}
									/>
								) : (
									<Card className="shadow-md">
										<CardContent className="flex items-center justify-center h-96">
											<div className="text-center">
												<UserGroupIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
												<p className="text-gray-500 dark:text-gray-400">Select a client to view details</p>
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						</div>
					</TabsContent>
				</Tabs>

				{/* Offer Request Form Modal */}
				{showOfferForm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
							<OfferRequestForm
								clientId={selectedClient?.id || ''}
								onSuccess={() => {
									setShowOfferForm(false);
									getMyOffers();
								}}
								onCancel={() => setShowOfferForm(false)}
							/>
						</div>
					</div>
				)}

				{/* Offer Details Modal */}
				{selectedOffer && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl shadow-2xl">
							<div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
								<div className="flex justify-between items-start">
									<div>
										<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
											Offer Details
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
											{selectedOffer.clientName}
										</p>
									</div>
									<Button
										onClick={() => setSelectedOffer(null)}
										variant="destructive"
										size="sm"
										className="h-8 w-8 p-0"
									>
										×
									</Button>
								</div>
							</div>

							<div className="p-6 space-y-4">
								<div>
									<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
										Products
									</label>
									<p className="text-base text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
										{selectedOffer.products || 'N/A'}
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
											Status
										</label>
										<Badge className={`${getOfferStatusColor(selectedOffer.status)}`}>
											{selectedOffer.status}
										</Badge>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
											Value
										</label>
										<p className="text-base text-gray-900 dark:text-gray-100">
											{selectedOffer.totalAmount !== undefined ? `EGP ${selectedOffer.totalAmount.toLocaleString()}` : 'N/A'}
										</p>
									</div>
								</div>

								<div className="text-xs text-gray-500 dark:text-gray-500 pt-4 border-t dark:border-gray-700">
									Created: {selectedOffer.createdAt ? format(new Date(selectedOffer.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
									{selectedOffer.validUntil && (
										<span className="ml-4">
											Valid Until: {format(new Date(selectedOffer.validUntil), 'MMM dd, yyyy HH:mm')}
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Request Details Modal */}
				{selectedRequest && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl shadow-2xl">
							<div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
								<div className="flex justify-between items-start">
									<div>
										<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
											{selectedRequest.title || selectedRequest.clientName}
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
											{selectedRequest.requestType} • {selectedRequest.clientName}
										</p>
									</div>
									<Button
										onClick={() => setSelectedRequest(null)}
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0"
									>
										×
									</Button>
								</div>
							</div>

							<div className="p-6 space-y-4">
								<div>
									<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
										Description
									</label>
									<p className="text-base text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
										{selectedRequest.description}
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
											Status
										</label>
										<Badge className={getStatusColor(selectedRequest.status)}>
											{selectedRequest.status}
										</Badge>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
											Priority
										</label>
										<Badge className={getPriorityColor(selectedRequest.priority)}>
											{selectedRequest.priority}
										</Badge>
									</div>
								</div>

								{selectedRequest.notes && (
									<div>
										<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
											Notes
										</label>
										<p className="text-base text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
											{selectedRequest.notes}
										</p>
									</div>
								)}

								{selectedRequest?.comments && selectedRequest.comments.length > 0 && (
									<div>
										<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
											Comments
										</label>
										<div className="space-y-2 max-h-48 overflow-y-auto">
											{selectedRequest.comments.map((comment: any, index: number) => (
												<div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
													<p className="text-sm text-gray-900 dark:text-gray-100">{comment.comment}</p>
													<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
														{comment.commentedByName} • {comment.createdAt ? format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
													</p>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SalesSupportDashboard;
