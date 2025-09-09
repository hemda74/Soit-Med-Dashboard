# Loading System Documentation

## Overview

This application now includes a comprehensive loading system that displays the Logo Loader.gif for all page transitions and API calls.

## Components

### LoadingScreen Component

- **Location**: `src/components/LoadingScreen.tsx`
- **Purpose**: Displays the Logo Loader.gif overlay when loading is active
- **Features**:
     - Fixed overlay that covers the entire screen
     - Backdrop blur effect
     - Centered logo with loading text
     - Error handling for image loading

### Navigation Loading Hook

- **Location**: `src/hooks/useNavigationLoading.ts`
- **Purpose**: Automatically shows loading during page navigation
- **Usage**: Automatically applied in the Layout component

### API Loading Hook

- **Location**: `src/hooks/useApiLoading.ts`
- **Purpose**: Wraps API calls with loading state management
- **Usage**: Can be used in components that make API calls

### Loading Utilities

- **Location**: `src/utils/loadingUtils.ts`
- **Purpose**: Convenient utilities for managing loading states
- **Features**:
     - `showLoading()` - Show the loading screen
     - `hideLoading()` - Hide the loading screen
     - `withLoading(asyncFn)` - Wrap async functions with loading

## Integration Points

### App Store

The loading state is managed centrally in the app store (`src/stores/appStore.ts`):

- `loading: boolean` - Current loading state
- `setLoading(loading: boolean)` - Function to update loading state

### API Services

All API services have been updated to accept an optional `setLoading` parameter:

- `src/services/api.ts` - General API client
- `src/services/authApi.ts` - Authentication API calls

### Components Updated

- **App.tsx**: Includes the LoadingScreen component
- **Layout.tsx**: Uses navigation loading hook
- **LoginForm.tsx**: Uses app store loading state
- **UsersList.tsx**: Uses app store loading state for API calls

## Usage Examples

### Basic Usage

```tsx
import { useAppStore } from '@/stores/appStore';

function MyComponent() {
	const { setLoading, loading } = useAppStore();

	const handleAction = async () => {
		setLoading(true);
		try {
			await someAsyncOperation();
		} finally {
			setLoading(false);
		}
	};
}
```

### Using the Loading Utility

```tsx
import { useLoading } from '@/utils/loadingUtils';

function MyComponent() {
	const { withLoading, loading } = useLoading();

	const handleAction = async () => {
		await withLoading(async () => {
			await someAsyncOperation();
		});
	};
}
```

### API Calls with Loading

```tsx
import { fetchUsers } from '@/services/api';
import { useAppStore } from '@/stores/appStore';

function MyComponent() {
	const { setLoading } = useAppStore();

	const loadData = async () => {
		const users = await fetchUsers(token, setLoading);
		// Loading is automatically managed
	};
}
```

## Features

### Automatic Loading States

- **Page Navigation**: Loading shows automatically when navigating between pages
- **API Calls**: Loading shows during all API operations
- **Login Process**: Loading shows during authentication

### Visual Design

- **Logo**: Uses the Logo Loader.gif from assets
- **Overlay**: Semi-transparent background with blur effect
- **Positioning**: Fixed overlay covering the entire screen
- **Responsive**: Works on all screen sizes

### Error Handling

- **Image Fallback**: If the GIF fails to load, it gracefully hides
- **API Errors**: Loading state is properly cleared on errors
- **Navigation Errors**: Loading state is cleared on navigation errors

## Configuration

### Loading Duration

The navigation loading duration can be adjusted in `src/hooks/useNavigationLoading.ts`:

```tsx
const timer = setTimeout(() => {
	setLoading(false);
}, 500); // Adjust this value (in milliseconds)
```

### Image Path

The logo path is configured in `src/components/LoadingScreen.tsx`:

```tsx
src = '/src/assets/Logo Loader.gif';
```

## Best Practices

1. **Always clear loading state**: Use try/finally blocks or the `withLoading` utility
2. **Don't show loading for very quick operations**: Consider a minimum duration
3. **Use the centralized loading state**: Avoid creating separate loading states
4. **Handle errors properly**: Always clear loading state in error cases

## Troubleshooting

### Logo Not Showing

- Check that the file exists at `src/assets/Logo Loader.gif`
- Verify the file name matches exactly (case-sensitive)
- Check browser console for 404 errors

### Loading Not Clearing

- Ensure `setLoading(false)` is called in all code paths
- Use try/finally blocks for async operations
- Check for unhandled promise rejections

### Performance Issues

- Loading state changes are optimized with Zustand
- The loading screen only renders when needed
- Image loading is handled efficiently
