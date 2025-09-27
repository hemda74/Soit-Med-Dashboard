// Development tools configuration for Zustand stores
import { devtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand';

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

// Extend Window interface for devtools
declare global {
	interface Window {
		__ZUSTAND_DEVTOOLS__?: {
			getState?: (storeName: string) => any;
		};
		__STORE_DEBUG__?: any;
	}
}

// Devtools configuration
export const createDevtools = (name: string) =>
	isDevelopment
		? <T extends object>(config: StateCreator<T, [], [], T>) =>
				devtools(config, { name })
		: <T extends object>(config: T) => config;

// Store names for devtools
export const STORE_NAMES = {
	AUTH: 'AuthStore',
	THEME: 'ThemeStore',
	APP: 'AppStore',
	NOTIFICATION: 'NotificationStore',
	API: 'ApiStore',
} as const;

// Development utilities
export const logStoreAction = (
	storeName: string,
	action: string,
	payload?: any
) => {
	if (isDevelopment) {
		console.group(`🏪 ${storeName} - ${action}`);
		if (payload) {
			console.log('Payload:', payload);
		}
		console.trace('Stack trace');
		console.groupEnd();
	}
};

// Performance monitoring for stores
export const measureStorePerformance = <T extends any[], R>(
	storeName: string,
	actionName: string,
	fn: (...args: T) => R
) => {
	return (...args: T): R => {
		if (isDevelopment) {
			const start = performance.now();
			const result = fn(...args);
			const end = performance.now();

			if (end - start > 5) {
				// Log if action takes more than 5ms
				console.warn(
					`⚠️ Slow store action: ${storeName}.${actionName} took ${(
						end - start
					).toFixed(2)}ms`
				);
			}

			return result;
		}
		return fn(...args);
	};
};

// Store debugging helpers
export const debugStore = {
	// Log all store states
	logAllStates: () => {
		if (isDevelopment) {
			console.group('🏪 All Store States');
			// This would be populated with actual store references in a real implementation
			console.log(
				'Auth Store:',
				window.__ZUSTAND_DEVTOOLS__?.getState?.(
					'AuthStore'
				)
			);
			console.log(
				'Theme Store:',
				window.__ZUSTAND_DEVTOOLS__?.getState?.(
					'ThemeStore'
				)
			);
			console.log(
				'App Store:',
				window.__ZUSTAND_DEVTOOLS__?.getState?.(
					'AppStore'
				)
			);
			console.log(
				'Notification Store:',
				window.__ZUSTAND_DEVTOOLS__?.getState?.(
					'NotificationStore'
				)
			);
			console.log(
				'API Store:',
				window.__ZUSTAND_DEVTOOLS__?.getState?.(
					'ApiStore'
				)
			);
			console.groupEnd();
		}
	},

	// Reset all stores (useful for testing)
	resetAllStores: () => {
		if (isDevelopment) {
			console.warn('🔄 Resetting all stores...');
			// This would be implemented with actual store reset methods
			localStorage.removeItem('auth-storage');
			localStorage.removeItem('theme-storage');
			localStorage.removeItem('app-storage');
			window.location.reload();
		}
	},

	// Export store states for debugging
	exportStates: () => {
		if (isDevelopment) {
			const states = {
				timestamp: new Date().toISOString(),
				stores: {
					// This would be populated with actual store states
				},
			};

			const blob = new Blob(
				[JSON.stringify(states, null, 2)],
				{ type: 'application/json' }
			);
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `store-states-${Date.now()}.json`;
			a.click();
			URL.revokeObjectURL(url);
		}
	},
};

// Make debug utilities available globally in development
if (isDevelopment) {
	(window as any).__STORE_DEBUG__ = debugStore;
}
