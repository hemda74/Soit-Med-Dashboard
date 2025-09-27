export interface DashboardStats {
	totalUsers: number;
	activeUsers: number;
	inactiveUsers: number;
	totalReports: number;
	pendingReports: number;
	completedReports: number;
}

export interface DashboardData {
	stats: DashboardStats;
	recentActivity: any[];
	charts: any[];
}