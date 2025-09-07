# Zustand State Management Guide

This project uses Zustand for comprehensive state management across the application. Below is a guide on how to use each store effectively.

## 📚 Available Stores

### 1. AuthStore (`useAuthStore`)

Manages user authentication, session, and permissions.

```typescript
import { useAuthStore } from '@/stores';

// Basic usage
const { user, isAuthenticated, login, logout } = useAuthStore();

// Advanced features
const { hasRole, hasPermission, checkTokenExpiry } = useAuthStore();

// Check permissions
if (hasRole('SuperAdmin')) {
	// Show admin features
}

// Session management
useEffect(() => {
	const checkSession = setInterval(() => {
		if (checkTokenExpiry()) {
			logout();
		}
	}, 60000); // Check every minute

	return () => clearInterval(checkSession);
}, []);
```

### 2. ThemeStore (`useThemeStore`)

Manages theme (light/dark) and language (en/ar) preferences.

```typescript
import { useThemeStore } from '@/stores';

const { theme, language, toggleTheme, setLanguage } = useThemeStore();

// Theme switching
<button onClick={toggleTheme}>
  {theme === 'light' ? '🌙' : '☀️'}
</button>

// Language switching
<button onClick={() => setLanguage('ar')}>
  العربية
</button>
```

### 3. AppStore (`useAppStore`)

Manages global UI state, navigation, modals, and search.

```typescript
import { useAppStore } from '@/stores';

// Modal management
const { openModal, closeModal, modals } = useAppStore();

<button onClick={() => openModal('userProfile')}>Open Profile</button>;

{
	modals.userProfile && <ProfileModal />;
}

// Global loading
const { setLoading, loading } = useAppStore();

// Search functionality
const { searchQuery, setSearchQuery, searchResults } = useAppStore();
```

### 4. NotificationStore (`useNotificationStore`)

Manages notifications and toast messages.

```typescript
import { useNotificationStore } from '@/stores';

const { success, error, warning, info } = useNotificationStore();

// Show notifications
success('Profile updated successfully!');
error('Failed to save changes', 'Please try again later');
warning('Session expires in 5 minutes');
info('New features available');

// Access notification history
const { notifications, clearAllNotifications } = useNotificationStore();
```

### 5. ApiStore (`useApiStore`)

Manages API loading states, errors, and call tracking.

```typescript
import { useApiStore, useApiLoading, useApiError } from '@/stores';

// Component-level usage
const isLoading = useApiLoading('fetchUsers');
const error = useApiError('fetchUsers');

// Manual state management
const { setLoading, setError, startApiCall, finishApiCall } = useApiStore();

// Track API calls
const callId = startApiCall('/api/users', 'GET');
try {
	const response = await fetch('/api/users');
	finishApiCall(callId, true);
} catch (error) {
	finishApiCall(callId, false, error.message);
}
```

## 🚀 Advanced Usage Patterns

### 1. Store Composition

Combine multiple stores for complex functionality:

```typescript
const useAuthenticatedUser = () => {
	const { user, isAuthenticated } = useAuthStore();
	const { setError } = useNotificationStore();

	useEffect(() => {
		if (!isAuthenticated && user) {
			setError('Session expired', 'Please log in again');
		}
	}, [isAuthenticated, user]);

	return { user, isAuthenticated };
};
```

### 2. Store Subscriptions

Listen to specific store changes:

```typescript
import { useAuthStore } from '@/stores';

useEffect(() => {
	const unsubscribe = useAuthStore.subscribe(
		(state) => state.user,
		(user, previousUser) => {
			if (user && !previousUser) {
				console.log('User logged in:', user.firstName);
			}
		}
	);

	return unsubscribe;
}, []);
```

### 3. Selective Subscriptions

Only re-render when specific values change:

```typescript
// Only re-render when loading state changes
const isLoading = useAuthStore((state) => state.isLoading);

// Multiple values with shallow comparison
const { user, isAuthenticated } = useAuthStore(
	(state) => ({
		user: state.user,
		isAuthenticated: state.isAuthenticated,
	}),
	shallow
);
```

## 🛠️ Development Tools

### Debug Utilities

In development mode, access debug utilities via the browser console:

```javascript
// Log all store states
__STORE_DEBUG__.logAllStates();

// Reset all stores
__STORE_DEBUG__.resetAllStores();

// Export store states
__STORE_DEBUG__.exportStates();
```

### Performance Monitoring

Store actions are automatically monitored for performance in development mode. Slow actions (>5ms) will be logged to the console.

## 📋 Best Practices

### 1. Store Organization

- Keep stores focused on specific domains
- Use composition for complex state interactions
- Avoid deeply nested state structures

### 2. Performance

- Use selective subscriptions to minimize re-renders
- Batch related updates when possible
- Use `useCallback` for store actions in components

### 3. Error Handling

- Always handle async action errors
- Use the notification store for user feedback
- Implement proper loading states

### 4. TypeScript

- Always type your store state and actions
- Use the provided type helpers
- Leverage TypeScript's strict mode

## 🔧 Store Configuration

### Persistence

Stores are configured with different persistence strategies:

- **AuthStore**: Persists user data and session info
- **ThemeStore**: Persists theme and language preferences
- **AppStore**: Persists UI preferences (sidebar state, etc.)
- **NotificationStore**: No persistence (session-only)
- **ApiStore**: No persistence (runtime-only)

### Middleware Stack

Each store uses appropriate middleware:

- `persist`: For data persistence
- `subscribeWithSelector`: For granular subscriptions
- `devtools`: For development debugging (dev only)

## 🚨 Common Pitfalls

1. **Overusing Global State**: Not everything needs to be in a store
2. **Mutating State Directly**: Always use store actions
3. **Ignoring Loading States**: Always handle async operations properly
4. **Memory Leaks**: Remember to unsubscribe from store subscriptions
5. **Performance Issues**: Use selective subscriptions to avoid unnecessary re-renders

## 📖 Further Reading

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Performance Patterns](https://react.dev/learn/render-and-commit)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
