// Export all stores and their types
export * from './authStore';
export * from './themeStore';
export * from './appStore';
export * from './notificationStore';
export * from './apiStore';
export * from './statisticsStore';
export * from './salesStore';
export * from './chatStore';
export * from './maintenanceStore';
export * from './paymentStore';
export * from './accountingStore';

// Re-export commonly used hooks for convenience
export { useAuthStore } from './authStore';
export { useThemeStore } from './themeStore';
export { useAppStore } from './appStore';
export { useNotificationStore } from './notificationStore';
export {
	useApiStore,
	useApiError,
	useGlobalLoading,
	useApiCallHistory,
} from './apiStore';
export {
	useStatisticsStore,
	useStatistics,
	useStatisticsLoading,
	useStatisticsError,
	useFetchStatistics,
	useClearStatistics,
	useClearError,
	useStatisticsDebugInfo,
	useApiCallCount,
	useLastApiCallTime,
} from './statisticsStore';

// Sales store exports
export {
	useSalesStore,
	useClients,
	useSelectedClient,
	useClientSearchResults,
	useClientsLoading,
	useClientsError,
	useClientVisits,
	useUpcomingVisits,
	useOverdueVisits,
	useVisitsLoading,
	useVisitsError,
	useClientInteractions,
	useInteractionsLoading,
	useInteractionsError,
	useSalesAnalytics,
	useSalesPerformance,
	useSalesDashboard,
	useAnalyticsLoading,
	useAnalyticsError,
	useSelectedTab,
	useShowClientModal,
	useShowVisitModal,
	useShowInteractionModal,
	useShowReportModal,
	useSalesFilters,
	useSalesPagination,
} from './salesStore';

// Store types for external use
export type { User } from './authStore';
export type { Theme, Language } from './themeStore';
export type { AppState } from './appStore';
export type { Notification, NotificationType } from './notificationStore';
export type { ApiCall, ApiState } from './apiStore';
export type { StatisticsState } from './statisticsStore';
export type { SalesState, SalesActions, SalesStore } from './salesStore';
