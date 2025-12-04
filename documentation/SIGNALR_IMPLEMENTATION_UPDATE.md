# SignalR Notification System Update

## Overview

This document describes the updates made to the SignalR notification system to align with the backend implementation.

## Changes Made

### 1. Updated SignalR Service (`src/services/signalRService.ts`)

#### Key Changes:

- **Hub URL**: Updated to use `http://localhost:5117/notificationHub` (configurable via `VITE_SIGNALR_URL`)
- **Connection Method**: Changed from `withAutomaticReconnect({ nextRetryDelayInMilliseconds })` to `withAutomaticReconnect([0, 2000, 10000, 30000])`
- **Notification Signature**: Updated `ReceiveNotification` handler to accept a single `data` parameter instead of `(message, link, data)`
- **Group Management**: Added `joinGroup()` and `leaveGroup()` methods
- **Error Handling**: Improved error handling for authentication (401) and connection failures
- **localStorage Key**: Fixed to use `auth-storage` instead of `auth-store`

#### New Methods:

```typescript
async joinGroup(groupName: string): Promise<void>
async leaveGroup(groupName: string): Promise<void>
```

### 2. Created New SignalR Hook (`src/hooks/useSignalR.ts`)

Created a new React hook that provides:

- Connection management
- Status tracking
- Group join/leave functionality
- Event listeners

#### Usage Example:

```typescript
const { connectionStatus, joinGroup, leaveGroup, isConnected } = useSignalR({
	onConnected: () => console.log('Connected'),
	onDisconnected: () => console.log('Disconnected'),
	onNotification: (data) => console.log('Notification:', data),
});
```

### 3. Updated Notification Store (`src/stores/notificationStore.ts`)

#### Changes:

- Added automatic group joining on connection
- Users automatically join:
     - `User_{userId}` - Personal notifications
     - `Role_{roleName}` - Role-based notifications (for each role)

#### Implementation:

```typescript
// When connected, join automatic groups
if (status.isConnected) {
	const user = authState.user;

	if (user) {
		await signalRService.joinGroup(`User_${user.id}`);

		if (user.roles && user.roles.length > 0) {
			for (const role of user.roles) {
				await signalRService.joinGroup(`Role_${role}`);
			}
		}
	}
}
```

### 4. Simplified Notification Service (`src/services/notificationService.ts`)

#### Changes:

- Removed multiple event listeners (only uses `ReceiveNotification` now)
- Simplified `handleNotification` to accept backend's notification data format
- Backend handles filtering, so client-side filtering is minimal
- Automatically shows toast notifications based on type

#### New Handler:

```typescript
private handleNotification(data: any): void {
  const notification: NotificationData = {
    id: data.id || generateId(),
    type: data.type || 'info',
    title: data.title || 'New Notification',
    message: data.message || String(data),
    link: data.link,
    data: data.data || data,
    timestamp: data.timestamp || Date.now(),
    isRead: data.isRead || false,
    roles: data.roles,
    departments: data.departments,
    userIds: data.userIds,
  };

  this.addNotification(notification);
  // Show toast based on type
}
```

## Backend Integration

### Authentication

- Uses JWT token from `auth-storage` localStorage
- Token is sent via `accessTokenFactory: () => token` in hub connection
- Automatic token expiration handling

### Connection States

The system handles these connection states:

- `Connected` - Connected and authenticated
- `Connecting` - 🔄 Attempting to connect
- `Reconnecting` - 🔄 Lost connection, reconnecting
- `Disconnected` - ❌ Not connected

### Reconnection Behavior

- Automatic reconnection with intervals: [0, 2000, 10000, 30000] milliseconds
- Maximum 5 reconnection attempts
- Exponential backoff for retries

### Error Handling

#### Authentication Errors (401)

```typescript
if (error instanceof Error && error.message.includes('401')) {
	console.error('Authentication failed - token may be invalid');
	// Notify listeners about auth failure
}
```

#### Connection Errors

```typescript
if (error.message.includes('Failed to connect')) {
	console.error('Connection failed - check server status');
	// Notify listeners about connection failure
}
```

## Environment Configuration

### Development

```env
VITE_API_BASE_URL=http://localhost:5117/api
VITE_SIGNALR_URL=http://localhost:5117
```

### Production

Update environment variables accordingly:

```env
VITE_API_BASE_URL=https://your-production-domain.com/api
VITE_SIGNALR_URL=https://your-production-domain.com
```

## Automatic Groups

When users connect, they're automatically added to:

1. **Personal Group**: `User_{userId}`

      - Receives notifications specific to that user
      - Example: Task assignments, personal messages

2. **Role Groups**: `Role_{roleName}`
      - Receives notifications for their role(s)
      - Example: `Role_Salesman`, `Role_SalesManager`, `Role_SuperAdmin`

## Testing

### Manual Testing

1. Log in to the application
2. Check console for "SignalR Connected" message
3. Backend should send a test notification
4. Verify toast notification appears
5. Check browser developer tools for any errors

### Browser Console Test

```javascript
// Get connection status
const status = signalRService.getConnectionStatus();
console.log('Connection Status:', status);

// Manually test group joining
await signalRService.joinGroup('TestGroup');

// Leave a group
await signalRService.leaveGroup('TestGroup');
```

## Migration Notes

### Breaking Changes

1. **Notification Handler Signature**: Changed from 3 parameters to 1
2. **Reconnection Configuration**: Changed from function-based to array-based
3. **Hub URL**: Updated to include `/notificationHub` endpoint

### Compatibility

- All existing notification functionality is preserved
- Toast notifications continue to work
- Browser notifications continue to work
- Notification store maintains the same API

## Troubleshooting

### Connection Issues

1. **Check Server**: Ensure backend is running on `http://localhost:5117`
2. **Verify Token**: Check if JWT token is valid in localStorage
3. **CORS**: Ensure backend CORS is configured for your frontend URL
4. **Network**: Check browser Network tab for failed WebSocket connections

### Authentication Issues

1. **Token Expiration**: Tokens expire in 5 years, but may be invalidated server-side
2. **Invalid Token**: Check console for 401 errors
3. **Token Format**: Ensure token is in localStorage under `auth-storage`

### Notification Not Received

1. **Check Groups**: Verify user has joined relevant groups
2. **Backend Logs**: Check backend logs for notification sending
3. **Permissions**: Ensure user has correct role/permissions
4. **Filtering**: Check if client-side filtering is blocking notifications

## Future Enhancements

1. **Offline Queue**: Store notifications when disconnected
2. **Notification Persistence**: Save notifications to localStorage
3. **Rich Notifications**: Support for images, actions, and buttons
4. **Notification Settings**: User preferences for notification types
5. **Read Receipts**: Mark notifications as read server-side

## References

- Backend Quick Start Guide: `# Quick Start Guide - React & React Native Teams`
- SignalR Documentation: https://docs.microsoft.com/en-us/aspnet/core/signalr/introduction
- Zustand Docs: https://github.com/pmndrs/zustand
