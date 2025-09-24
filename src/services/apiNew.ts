// New consolidated API service - uses the refactored structure

// Re-export everything from the new structure
export * from './index';

// Legacy compatibility - keep the old apiClient export
export { userApiClient as apiClient } from './user/userApi';
