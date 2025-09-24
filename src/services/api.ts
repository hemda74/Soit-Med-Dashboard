// Legacy API file - now uses the refactored structure
// This file is kept for backward compatibility

// Re-export everything from the new structure
export * from './index';

// Legacy exports for backward compatibility
export { userApiClient as apiClient } from './user/userApi';
