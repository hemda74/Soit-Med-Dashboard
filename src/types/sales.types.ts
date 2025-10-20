// Sales Module Types - Comprehensive type definitions for sales management

// ==================== CLIENT MANAGEMENT ====================

export interface Client {
	id: string;
	name: string;
	type: 'Doctor' | 'Hospital' | 'Clinic' | 'Pharmacy' | 'Other';
	specialization?: string;
	location: string;
	phone?: string;
	email?: string;
	status: 'Active' | 'Inactive' | 'Prospect' | 'Lost';
	createdAt: string;
	updatedAt: string;
	lastVisitDate?: string;
	nextVisitDate?: string;
	notes?: string;
	assignedSalesmanId?: string;
	assignedSalesmanName?: string;
	// Additional client details
	address?: string;
	city?: string;
	governorate?: string;
	website?: string;
	contactPerson?: string;
	contactPersonTitle?: string;
	// Business information
	annualRevenue?: number;
	employeeCount?: number;
	establishedYear?: number;
	// Medical specific fields
	licenseNumber?: string;
	medicalSpecialties?: string[];
	bedCount?: number;
	// Sales tracking
	totalVisits: number;
	lastInteractionDate?: string;
	conversionRate?: number;
	potentialValue?: number;
}

export interface CreateClientDto {
	name: string;
	type: 'Doctor' | 'Hospital' | 'Clinic' | 'Pharmacy' | 'Other';
	specialization?: string;
	location: string;
	phone?: string;
	email?: string;
	notes?: string;
	address?: string;
	city?: string;
	governorate?: string;
	website?: string;
	contactPerson?: string;
	contactPersonTitle?: string;
	annualRevenue?: number;
	employeeCount?: number;
	establishedYear?: number;
	licenseNumber?: string;
	medicalSpecialties?: string[];
	bedCount?: number;
	potentialValue?: number;
}

export interface UpdateClientDto {
	name?: string;
	type?: 'Doctor' | 'Hospital' | 'Clinic' | 'Pharmacy' | 'Other';
	specialization?: string;
	location?: string;
	phone?: string;
	email?: string;
	status?: 'Active' | 'Inactive' | 'Prospect' | 'Lost';
	notes?: string;
	address?: string;
	city?: string;
	governorate?: string;
	website?: string;
	contactPerson?: string;
	contactPersonTitle?: string;
	annualRevenue?: number;
	employeeCount?: number;
	establishedYear?: number;
	licenseNumber?: string;
	medicalSpecialties?: string[];
	bedCount?: number;
	potentialValue?: number;
}

export interface ClientSearchFilters {
	query?: string;
	type?: string;
	specialization?: string;
	location?: string;
	status?: string;
	assignedSalesmanId?: string;
	createdFrom?: string;
	createdTo?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	page?: number;
	pageSize?: number;
}

export interface ClientSearchResult {
	clients: Client[];
	totalCount: number;
	page: number;
	pageSize: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

// ==================== CLIENT VISITS ====================

export interface ClientVisit {
	id: string;
	clientId: string;
	clientName: string;
	visitDate: string;
	visitType:
		| 'Initial'
		| 'Follow-up'
		| 'Maintenance'
		| 'Support'
		| 'Presentation'
		| 'Negotiation'
		| 'Closing';
	location: string;
	purpose: string;
	notes: string;
	results: string;
	nextVisitDate?: string;
	status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Postponed';
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	createdByName: string;
	// Visit outcomes
	outcome?:
		| 'Successful'
		| 'Unsuccessful'
		| 'Follow-up Required'
		| 'No Decision';
	productsDiscussed?: string[];
	quotesProvided?: boolean;
	quotesValue?: number;
	competitorsMentioned?: string[];
	decisionMakers?: string[];
	// Follow-up information
	followUpRequired?: boolean;
	followUpDate?: string;
	followUpNotes?: string;
	// Visit duration and logistics
	duration?: number; // in minutes
	travelDistance?: number; // in km
	travelCost?: number;
}

export interface CreateClientVisitDto {
	clientId: string;
	visitDate: string;
	visitType:
		| 'Initial'
		| 'Follow-up'
		| 'Maintenance'
		| 'Support'
		| 'Presentation'
		| 'Negotiation'
		| 'Closing';
	location: string;
	purpose: string;
	notes: string;
	results?: string;
	nextVisitDate?: string;
	outcome?:
		| 'Successful'
		| 'Unsuccessful'
		| 'Follow-up Required'
		| 'No Decision';
	productsDiscussed?: string[];
	quotesProvided?: boolean;
	quotesValue?: number;
	competitorsMentioned?: string[];
	decisionMakers?: string[];
	followUpRequired?: boolean;
	followUpDate?: string;
	followUpNotes?: string;
	duration?: number;
	travelDistance?: number;
	travelCost?: number;
}

export interface UpdateClientVisitDto {
	visitDate?: string;
	visitType?:
		| 'Initial'
		| 'Follow-up'
		| 'Maintenance'
		| 'Support'
		| 'Presentation'
		| 'Negotiation'
		| 'Closing';
	location?: string;
	purpose?: string;
	notes?: string;
	results?: string;
	nextVisitDate?: string;
	status?: 'Scheduled' | 'Completed' | 'Cancelled' | 'Postponed';
	outcome?:
		| 'Successful'
		| 'Unsuccessful'
		| 'Follow-up Required'
		| 'No Decision';
	productsDiscussed?: string[];
	quotesProvided?: boolean;
	quotesValue?: number;
	competitorsMentioned?: string[];
	decisionMakers?: string[];
	followUpRequired?: boolean;
	followUpDate?: string;
	followUpNotes?: string;
	duration?: number;
	travelDistance?: number;
	travelCost?: number;
}

// ==================== CLIENT INTERACTIONS ====================

export interface ClientInteraction {
	id: string;
	clientId: string;
	clientName: string;
	interactionType:
		| 'Call'
		| 'Email'
		| 'Meeting'
		| 'Video Call'
		| 'WhatsApp'
		| 'Other';
	subject: string;
	description: string;
	interactionDate: string;
	duration?: number; // in minutes
	status: 'Completed' | 'Scheduled' | 'Cancelled';
	createdAt: string;
	createdBy: string;
	createdByName: string;
	// Interaction details
	participants?: string[];
	location?: string;
	notes?: string;
	// Follow-up
	followUpRequired?: boolean;
	followUpDate?: string;
	followUpNotes?: string;
	// Outcome
	outcome?: 'Positive' | 'Neutral' | 'Negative';
	nextSteps?: string;
}

export interface CreateClientInteractionDto {
	clientId: string;
	interactionType:
		| 'Call'
		| 'Email'
		| 'Meeting'
		| 'Video Call'
		| 'WhatsApp'
		| 'Other';
	subject: string;
	description: string;
	interactionDate: string;
	duration?: number;
	participants?: string[];
	location?: string;
	notes?: string;
	followUpRequired?: boolean;
	followUpDate?: string;
	followUpNotes?: string;
	outcome?: 'Positive' | 'Neutral' | 'Negative';
	nextSteps?: string;
}

// ==================== SALES ANALYTICS ====================

export interface SalesAnalytics {
	period: string;
	totalClients: number;
	activeClients: number;
	newClients: number;
	lostClients: number;
	totalVisits: number;
	completedVisits: number;
	upcomingVisits: number;
	overdueVisits: number;
	conversionRate: number;
	averageVisitDuration: number;
	totalTravelDistance: number;
	totalTravelCost: number;
	// Performance metrics
	visitsPerClient: number;
	clientsPerSalesman: number;
	successRate: number;
	// Revenue metrics
	totalQuotesValue: number;
	quotesConversionRate: number;
	// Time-based metrics
	visitsThisWeek: number;
	visitsThisMonth: number;
	visitsThisQuarter: number;
	// Client status breakdown
	clientsByStatus: {
		Active: number;
		Inactive: number;
		Prospect: number;
		Lost: number;
	};
	// Visit type breakdown
	visitsByType: {
		Initial: number;
		'Follow-up': number;
		Maintenance: number;
		Support: number;
		Presentation: number;
		Negotiation: number;
		Closing: number;
	};
	// Top performing salesmen
	topSalesmen: Array<{
		salesmanId: string;
		salesmanName: string;
		visitsCount: number;
		clientsCount: number;
		successRate: number;
	}>;
	// Recent activity
	recentVisits: ClientVisit[];
	recentInteractions: ClientInteraction[];
}

export interface SalesPerformanceMetrics {
	salesmanId: string;
	salesmanName: string;
	period: string;
	// Client metrics
	totalClients: number;
	newClients: number;
	activeClients: number;
	lostClients: number;
	// Visit metrics
	totalVisits: number;
	completedVisits: number;
	upcomingVisits: number;
	overdueVisits: number;
	// Performance metrics
	conversionRate: number;
	successRate: number;
	averageVisitDuration: number;
	// Revenue metrics
	totalQuotesValue: number;
	quotesConversionRate: number;
	// Efficiency metrics
	visitsPerDay: number;
	clientsPerWeek: number;
	totalTravelDistance: number;
	totalTravelCost: number;
	// Goals and targets
	monthlyTarget: number;
	quarterlyTarget: number;
	yearlyTarget: number;
	targetAchievement: number;
}

// ==================== SALES DASHBOARD ====================

export interface SalesDashboardData {
	// Overview metrics
	overview: {
		totalClients: number;
		activeClients: number;
		newClientsThisMonth: number;
		totalVisitsThisMonth: number;
		conversionRate: number;
		teamPerformance: number;
	};
	// Recent activity
	recentActivity: Array<{
		id: string;
		type:
			| 'visit'
			| 'interaction'
			| 'client_created'
			| 'client_updated';
		description: string;
		timestamp: string;
		salesmanName: string;
		clientName?: string;
	}>;
	// Upcoming events
	upcomingVisits: Array<{
		id: string;
		clientName: string;
		visitDate: string;
		visitType: string;
		salesmanName: string;
		location: string;
	}>;
	// Overdue items
	overdueItems: Array<{
		id: string;
		type: 'visit' | 'follow_up';
		description: string;
		dueDate: string;
		clientName: string;
		salesmanName: string;
		priority: 'High' | 'Medium' | 'Low';
	}>;
	// Team performance
	teamPerformance: Array<{
		salesmanId: string;
		salesmanName: string;
		clientsCount: number;
		visitsCount: number;
		successRate: number;
		lastActivity: string;
	}>;
	// Charts data
	visitsTrend: Array<{
		date: string;
		visits: number;
		completed: number;
	}>;
	clientsTrend: Array<{
		date: string;
		total: number;
		new: number;
		active: number;
	}>;
}

// ==================== SALES REPORTS ====================

export interface SalesReport {
	id: string;
	title: string;
	description: string;
	reportType:
		| 'Daily'
		| 'Weekly'
		| 'Monthly'
		| 'Quarterly'
		| 'Yearly'
		| 'Custom';
	period: {
		startDate: string;
		endDate: string;
	};
	generatedAt: string;
	generatedBy: string;
	generatedByName: string;
	// Report data
	data: {
		summary: SalesAnalytics;
		performance: SalesPerformanceMetrics[];
		clients: Client[];
		visits: ClientVisit[];
		interactions: ClientInteraction[];
	};
	// Report settings
	settings: {
		includeCharts: boolean;
		includeDetails: boolean;
		groupBy: 'salesman' | 'client' | 'date' | 'type';
		filters: ClientSearchFilters;
	};
}

export interface CreateSalesReportDto {
	title: string;
	description?: string;
	reportType:
		| 'Daily'
		| 'Weekly'
		| 'Monthly'
		| 'Quarterly'
		| 'Yearly'
		| 'Custom';
	period: {
		startDate: string;
		endDate: string;
	};
	settings: {
		includeCharts: boolean;
		includeDetails: boolean;
		groupBy: 'salesman' | 'client' | 'date' | 'type';
		filters?: ClientSearchFilters;
	};
}

// ==================== API RESPONSES ====================

export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
	timestamp: string;
}

export interface PaginatedApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
	timestamp: string;
}

// ==================== FILTERS AND PAGINATION ====================

export interface PaginationParams {
	page: number;
	pageSize: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface DateRangeFilter {
	startDate?: string;
	endDate?: string;
}

export interface SalesmanFilter {
	salesmanId?: string;
	salesmanName?: string;
}

// ==================== EXPORT TYPES ====================

export interface ExportOptions {
	format: 'pdf' | 'excel' | 'csv';
	includeCharts: boolean;
	includeDetails: boolean;
	filters?: ClientSearchFilters;
}

export interface ExportResult {
	downloadUrl: string;
	fileName: string;
	fileSize: number;
	expiresAt: string;
}

