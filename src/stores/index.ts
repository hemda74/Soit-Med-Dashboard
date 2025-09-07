// Export all stores and their types
export * from './authStore';
export * from './themeStore';
export * from './appStore';
export * from './notificationStore';
export * from './apiStore';

// Re-export commonly used hooks for convenience
export { useAuthStore } from './authStore';
export { useThemeStore } from './themeStore';
export { useAppStore } from './appStore';
export { useNotificationStore } from './notificationStore';
export {
	useApiStore,
	useApiLoading,
	useApiError,
	useGlobalLoading,
	useApiCallHistory,
} from './apiStore';

// Store types for external use
export type { User } from './authStore';
export type { Theme, Language } from './themeStore';
export type { AppState } from './appStore';
export type { Notification, NotificationType } from './notificationStore';
export type { ApiCall, ApiState } from './apiStore';
