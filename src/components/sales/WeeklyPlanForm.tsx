import React, { useState, useEffect } from 'react';
import { useSalesStore } from '@/stores/salesStore';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import {
	PlusIcon,
	TrashIcon,
	CheckCircleIcon,
	ClockIcon,
	ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface WeeklyPlanFormProps {
	onClose: () => void;
	onSuccess?: () => void;
	planId?: number;
	initialData?: any;
}

interface PlanItem {
	id?: number;
	title: string;
	description: string;
	priority: 'High' | 'Medium' | 'Low';
	dueDate: string;
	notes: string;
}

const WeeklyPlanForm: React.FC<WeeklyPlanFormProps> = ({
	onClose,
	onSuccess,
	planId,
	initialData
}) => {
	const {
		createWeeklyPlan,
		updateWeeklyPlan,
		weeklyPlansLoading,
		weeklyPlansError
	} = useSalesStore();

	const [formData, setFormData] = useState({
		planTitle: '',
		weekStartDate: '',
		weekEndDate: '',
	});

	const [planItems, setPlanItems] = useState<PlanItem[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		// Set default week dates (current week)
		const today = new Date();
		const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
		const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

		setFormData({
			planTitle: initialData?.planTitle || `Weekly Plan - ${format(weekStart, 'MMM dd')} to ${format(weekEnd, 'MMM dd, yyyy')}`,
			weekStartDate: initialData?.weekStartDate || format(weekStart, 'yyyy-MM-dd'),
			weekEndDate: initialData?.weekEndDate || format(weekEnd, 'yyyy-MM-dd'),
		});

		if (initialData?.tasks) {
			setPlanItems(initialData.tasks);
		} else {
			// Add a default empty task
			addNewItem();
		}
	}, [initialData]);

	const addNewItem = () => {
		const newItem: PlanItem = {
			title: '',
			description: '',
			priority: 'Medium',
			dueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
			notes: '',
		};
		setPlanItems([...planItems, newItem]);
	};

	const updateItem = (index: number, field: keyof PlanItem, value: string) => {
		const updatedItems = [...planItems];
		updatedItems[index] = { ...updatedItems[index], [field]: value };
		setPlanItems(updatedItems);
	};

	const removeItem = (index: number) => {
		if (planItems.length > 1) {
			const updatedItems = planItems.filter((_, i) => i !== index);
			setPlanItems(updatedItems);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const planData = {
				...formData,
				tasks: planItems.filter(item => item.title.trim() !== ''),
			};

			if (planId) {
				await updateWeeklyPlan(planId, planData);
			} else {
				await createWeeklyPlan(planData);
			}

			onSuccess?.();
			onClose();
		} catch (error) {
			console.error('Error saving weekly plan:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'High':
				return 'text-red-600 bg-red-100';
			case 'Medium':
				return 'text-yellow-600 bg-yellow-100';
			case 'Low':
				return 'text-green-600 bg-green-100';
			default:
				return 'text-gray-600 bg-gray-100';
		}
	};

	const getPriorityIcon = (priority: string) => {
		switch (priority) {
			case 'High':
				return <ExclamationTriangleIcon className="h-4 w-4" />;
			case 'Medium':
				return <ClockIcon className="h-4 w-4" />;
			case 'Low':
				return <CheckCircleIcon className="h-4 w-4" />;
			default:
				return <ClockIcon className="h-4 w-4" />;
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-semibold">
						{planId ? 'Edit Weekly Plan' : 'Create Weekly Plan'}
					</h3>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col h-full">
					<div className="flex-1 overflow-y-auto p-6">
						{/* Plan Details */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Plan Title
								</label>
								<input
									type="text"
									value={formData.planTitle}
									onChange={(e) =>
										setFormData({ ...formData, planTitle: e.target.value })
									}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Week Start Date
								</label>
								<input
									type="date"
									value={formData.weekStartDate}
									onChange={(e) =>
										setFormData({ ...formData, weekStartDate: e.target.value })
									}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Week End Date
								</label>
								<input
									type="date"
									value={formData.weekEndDate}
									onChange={(e) =>
										setFormData({ ...formData, weekEndDate: e.target.value })
									}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>

						{/* Plan Items */}
						<div>
							<div className="flex justify-between items-center mb-4">
								<h4 className="text-md font-medium text-gray-900">Tasks</h4>
								<button
									type="button"
									onClick={addNewItem}
									className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									<PlusIcon className="h-4 w-4 mr-1" />
									Add Task
								</button>
							</div>

							<div className="space-y-4">
								{planItems.map((item, index) => (
									<div
										key={index}
										className="border border-gray-200 rounded-lg p-4 bg-gray-50"
									>
										<div className="flex justify-between items-start mb-3">
											<div className="flex items-center space-x-2">
												<span className="text-sm font-medium text-gray-700">
													Task {index + 1}
												</span>
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
														item.priority
													)}`}
												>
													{getPriorityIcon(item.priority)}
													<span className="ml-1">{item.priority}</span>
												</span>
											</div>
											{planItems.length > 1 && (
												<button
													type="button"
													onClick={() => removeItem(index)}
													className="text-red-600 hover:text-red-800 transition-colors"
												>
													<TrashIcon className="h-4 w-4" />
												</button>
											)}
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Task Title
												</label>
												<input
													type="text"
													value={item.title}
													onChange={(e) =>
														updateItem(index, 'title', e.target.value)
													}
													placeholder="Enter task title"
													className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Priority
												</label>
												<select
													value={item.priority}
													onChange={(e) =>
														updateItem(index, 'priority', e.target.value)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												>
													<option value="Low">Low</option>
													<option value="Medium">Medium</option>
													<option value="High">High</option>
												</select>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Due Date
												</label>
												<input
													type="date"
													value={item.dueDate}
													onChange={(e) =>
														updateItem(index, 'dueDate', e.target.value)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Description
												</label>
												<input
													type="text"
													value={item.description}
													onChange={(e) =>
														updateItem(index, 'description', e.target.value)
													}
													placeholder="Brief description"
													className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												/>
											</div>
										</div>

										<div className="mt-3">
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Notes
											</label>
											<textarea
												value={item.notes}
												onChange={(e) =>
													updateItem(index, 'notes', e.target.value)
												}
												placeholder="Additional notes..."
												rows={2}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											/>
										</div>
									</div>
								))}
							</div>
						</div>

						{weeklyPlansError && (
							<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-600">{weeklyPlansError}</p>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
						<div className="flex justify-end space-x-3">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={isSubmitting || weeklyPlansLoading}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{isSubmitting || weeklyPlansLoading ? (
									<div className="flex items-center">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Saving...
									</div>
								) : (
									planId ? 'Update Plan' : 'Create Plan'
								)}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default WeeklyPlanForm;

