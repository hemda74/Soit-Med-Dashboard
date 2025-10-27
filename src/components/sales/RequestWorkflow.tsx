import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import {
	PlusIcon,
	PaperAirplaneIcon,
	ClockIcon,
	ExclamationTriangleIcon,
	UserIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const requestWorkflowSchema = z.object({
	requestType: z.enum(['ClientVisit', 'ProductDemo', 'SupportRequest', 'QuoteRequest', 'Other']),
	priority: z.enum(['High', 'Medium', 'Low']),
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	clientId: z.string().min(1, 'Client ID is required'),
	assignedToId: z.number().optional(),
	dueDate: z.string().optional(),
	attachments: z.array(z.string()).optional(),
});

type RequestWorkflowFormValues = z.infer<typeof requestWorkflowSchema>;

const RequestWorkflow: React.FC = () => {
	const {
		createRequestWorkflow,
		getMyRequests,
		getAssignedRequests,
		updateRequestStatus,
		assignRequest,
		myRequests,
		assignedRequests,
		requestWorkflowsLoading,
		requestWorkflowsError,
		clearError,
		clients
	} = useSalesStore();

	const { user } = useAuthStore();
	const [activeTab, setActiveTab] = useState<'my-requests' | 'assigned-requests' | 'create'>('my-requests');
	const [selectedRequest, setSelectedRequest] = useState<any>(null);
	const [statusComment, setStatusComment] = useState('');
	const [showStatusModal, setShowStatusModal] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(requestWorkflowSchema),
		defaultValues: {
			requestType: 'SupportRequest',
			priority: 'Medium',
			title: '',
			description: '',
			clientId: '',
			assignedToId: undefined,
			dueDate: '',
			attachments: [],
		},
	});

	useEffect(() => {
		getMyRequests();
		getAssignedRequests();
	}, [getMyRequests, getAssignedRequests]);

	useEffect(() => {
		if (requestWorkflowsError) {
			toast.error(requestWorkflowsError);
			clearError('requestWorkflows');
		}
	}, [requestWorkflowsError, clearError]);

	const onSubmit = async (data: RequestWorkflowFormValues) => {
		try {
			await createRequestWorkflow(data);
			toast.success('Request created successfully');
			reset();
			setActiveTab('my-requests');
			getMyRequests();
		} catch (error) {
			console.error('Error creating request:', error);
		}
	};

	const handleStatusUpdate = async (requestId: string, status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled') => {
		try {
			await updateRequestStatus(requestId, status, statusComment);
			toast.success('Request status updated');
			setShowStatusModal(false);
			setStatusComment('');
			setSelectedRequest(null);
			getMyRequests();
			getAssignedRequests();
		} catch (error) {
			console.error('Error updating status:', error);
		}
	};

	const handleAssignRequest = async (requestId: string, assignedToId: string) => {
		try {
			await assignRequest(requestId, assignedToId);
			toast.success('Request assigned successfully');
			getMyRequests();
			getAssignedRequests();
		} catch (error) {
			console.error('Error assigning request:', error);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Completed':
				return 'bg-green-100 text-green-800';
			case 'InProgress':
				return 'bg-blue-100 text-blue-800';
			case 'Pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'Cancelled':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'High':
				return 'bg-red-100 text-red-800';
			case 'Medium':
				return 'bg-yellow-100 text-yellow-800';
			case 'Low':
				return 'bg-green-100 text-green-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getRequestTypeIcon = (type: string) => {
		switch (type) {
			case 'Support':
				return <ExclamationTriangleIcon className="h-5 w-5" />;
			case 'Technical':
				return <ClockIcon className="h-5 w-5" />;
			case 'Sales':
				return <UserIcon className="h-5 w-5" />;
			default:
				return <PaperAirplaneIcon className="h-5 w-5" />;
		}
	};

	const RequestCard: React.FC<{ request: any; showActions?: boolean }> = ({ request, showActions = true }) => (
		<div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
			<div className="flex justify-between items-start mb-3">
				<div className="flex items-start space-x-3">
					<div className="flex-shrink-0">
						{getRequestTypeIcon(request.requestType)}
					</div>
					<div>
						<h3 className="font-medium text-gray-900">
							{request.title}
						</h3>
						<p className="text-sm text-gray-600">
							{request.description}
						</p>
						<div className="flex items-center space-x-2 mt-1">
							<span
								className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
									request.status
								)}`}
							>
								{request.status}
							</span>
							<span
								className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
									request.priority
								)}`}
							>
								{request.priority}
							</span>
						</div>
					</div>
				</div>
				<div className="text-right text-sm text-gray-500">
					<p>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</p>
					<p className="text-xs">
						by {request.createdByName}
					</p>
				</div>
			</div>

			{request.clientName && (
				<div className="text-sm text-gray-600 mb-2">
					<span className="font-medium">Client:</span> {request.clientName}
				</div>
			)}

			{request.assignedToName && (
				<div className="text-sm text-gray-600 mb-2">
					<span className="font-medium">Assigned to:</span> {request.assignedToName}
				</div>
			)}

			{request.dueDate && (
				<div className="text-sm text-gray-600 mb-2">
					<span className="font-medium">Due:</span> {format(new Date(request.dueDate), 'MMM dd, yyyy')}
				</div>
			)}

			{request.comments && request.comments.length > 0 && (
				<div className="mt-3">
					<h4 className="text-sm font-medium text-gray-700 mb-2">Comments:</h4>
					<div className="space-y-2">
						{request.comments.map((comment: any, index: number) => (
							<div key={index} className="bg-gray-50 p-2 rounded text-sm">
								<div className="flex justify-between items-start">
									<p className="text-gray-700">{comment.comment}</p>
									<span className="text-xs text-gray-500">
										{format(new Date(comment.createdAt), 'MMM dd, HH:mm')}
									</span>
								</div>
								<p className="text-xs text-gray-500 mt-1">
									by {comment.createdByName}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{showActions && (
				<div className="flex justify-end space-x-2 mt-4">
					{request.status === 'Pending' && (
						<>
							<button
								onClick={() => {
									setSelectedRequest(request);
									setShowStatusModal(true);
								}}
								className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
							>
								Update Status
							</button>
							{user?.roles?.includes('SalesManager') && (
								<select
									onChange={(e) => {
										if (e.target.value) {
											handleAssignRequest(request.id, e.target.value);
										}
									}}
									className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
									defaultValue=""
								>
									<option value="">Assign to...</option>
									{/* TODO: Add user selection functionality */}
								</select>
							)}
						</>
					)}
					{request.status === 'InProgress' && (
						<button
							onClick={() => {
								setSelectedRequest(request);
								setShowStatusModal(true);
							}}
							className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
						>
							Complete
						</button>
					)}
				</div>
			)}
		</div>
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Request Workflow
						</h1>
						<p className="text-gray-600">
							Manage and track support requests
						</p>
					</div>
					<button
						onClick={() => setActiveTab('create')}
						className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						<PlusIcon className="h-5 w-5 mr-2" />
						New Request
					</button>
				</div>
			</div>

			{/* Tabs */}
			<div className="bg-white rounded-lg shadow">
				<div className="border-b border-gray-200">
					<nav className="flex space-x-8 px-6">
						<button
							onClick={() => setActiveTab('my-requests')}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'my-requests'
									? 'border-blue-500 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
						>
							My Requests ({myRequests.length})
						</button>
						<button
							onClick={() => setActiveTab('assigned-requests')}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'assigned-requests'
									? 'border-blue-500 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
						>
							Assigned to Me ({assignedRequests.length})
						</button>
						<button
							onClick={() => setActiveTab('create')}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'create'
									? 'border-blue-500 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
						>
							Create Request
						</button>
					</nav>
				</div>

				<div className="p-6">
					{activeTab === 'my-requests' && (
						<div className="space-y-4">
							{requestWorkflowsLoading ? (
								<div className="text-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
								</div>
							) : myRequests.length > 0 ? (
								myRequests.map((request) => (
									<RequestCard key={request.id} request={request} showActions={false} />
								))
							) : (
								<div className="text-center py-8 text-gray-500">
									No requests found
								</div>
							)}
						</div>
					)}

					{activeTab === 'assigned-requests' && (
						<div className="space-y-4">
							{requestWorkflowsLoading ? (
								<div className="text-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
								</div>
							) : assignedRequests.length > 0 ? (
								assignedRequests.map((request) => (
									<RequestCard key={request.id} request={request} showActions={true} />
								))
							) : (
								<div className="text-center py-8 text-gray-500">
									No assigned requests
								</div>
							)}
						</div>
					)}

					{activeTab === 'create' && (
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-1">
										Request Type
									</label>
									<select
										id="requestType"
										{...register('requestType')}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="Support">Support</option>
										<option value="Technical">Technical</option>
										<option value="Sales">Sales</option>
										<option value="Other">Other</option>
									</select>
									{errors.requestType && (
										<p className="mt-1 text-sm text-red-600">{errors.requestType.message}</p>
									)}
								</div>

								<div>
									<label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
										Priority
									</label>
									<select
										id="priority"
										{...register('priority')}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="Low">Low</option>
										<option value="Medium">Medium</option>
										<option value="High">High</option>
									</select>
									{errors.priority && (
										<p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
									)}
								</div>
							</div>

							<div>
								<label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
									Title
								</label>
								<input
									id="title"
									type="text"
									{...register('title')}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
								{errors.title && (
									<p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
								)}
							</div>

							<div>
								<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
									Description
								</label>
								<textarea
									id="description"
									{...register('description')}
									rows={4}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
								{errors.description && (
									<p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
										Client (Optional)
									</label>
									<select
										id="clientId"
										{...register('clientId', { valueAsNumber: true })}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="">Select a client</option>
										{clients.map((client) => (
											<option key={client.id} value={client.id}>
												{client.name}
											</option>
										))}
									</select>
								</div>

								<div>
									<label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
										Due Date (Optional)
									</label>
									<input
										id="dueDate"
										type="date"
										{...register('dueDate')}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							</div>

							<div className="flex justify-end space-x-3">
								<button
									type="button"
									onClick={() => setActiveTab('my-requests')}
									className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={requestWorkflowsLoading}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
								>
									{requestWorkflowsLoading ? 'Creating...' : 'Create Request'}
								</button>
							</div>
						</form>
					)}
				</div>
			</div>

			{/* Status Update Modal */}
			{showStatusModal && selectedRequest && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg w-full max-w-md">
						<div className="px-6 py-4 border-b border-gray-200">
							<h3 className="text-lg font-semibold text-gray-900">
								Update Request Status
							</h3>
							<p className="text-sm text-gray-600">
								{selectedRequest.title}
							</p>
						</div>

						<div className="p-6">
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Status
									</label>
									<select
										value={selectedRequest.status}
										onChange={(e) => setSelectedRequest({ ...selectedRequest, status: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="Pending">Pending</option>
										<option value="InProgress">In Progress</option>
										<option value="Completed">Completed</option>
										<option value="Cancelled">Cancelled</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Comment
									</label>
									<textarea
										value={statusComment}
										onChange={(e) => setStatusComment(e.target.value)}
										placeholder="Add a comment about the status update..."
										rows={3}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							</div>
						</div>

						<div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
							<div className="flex justify-end space-x-3">
								<button
									onClick={() => {
										setShowStatusModal(false);
										setSelectedRequest(null);
										setStatusComment('');
									}}
									className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={() => handleStatusUpdate(selectedRequest.id, selectedRequest.status)}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									Update Status
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RequestWorkflow;

