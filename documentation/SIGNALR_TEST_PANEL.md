# SignalR Test Panel

## Overview

The SignalR Test Panel is a diagnostic tool to test and verify the SignalR notification system is working correctly.

## Location

**File:** `src/components/admin/SignalRTestPanel.tsx`

## How to Use

### 1. Import and Add to Your Component

```tsx
import SignalRTestPanel from '@/components/admin/SignalRTestPanel';

// In your component:
<SignalRTestPanel />;
```

### 2. Features

The test panel provides:

#### Connection Status

- **Connected**: Shows green badge when SignalR is connected
- **Disconnected**: Shows red badge when not connected
- **Error Display**: Shows any connection errors

#### User Information

- Displays current user ID
- Shows user roles

#### Test Actions

- **Join Auto Groups**: Automatically joins `User_{userId}` and all `Role_{role}` groups
- **Join Custom Group**: Manually join a custom group (e.g., `SalesTeam`, `Admin`)
- **Leave Group**: Leave a specific group
- **Clear Log**: Clear the notification log

#### Notification Log

- Real-time display of notifications received
- Shows timestamp and notification type
- Displays full notification data in JSON format

#### Notification Store

- Shows notifications from the Zustand notification store
- Displays up to 10 most recent notifications
- Shows notification type, title, and message

## Example Usage

### Add to Admin Dashboard

```tsx
// In your admin dashboard component
import SignalRTestPanel from '@/components/admin/SignalRTestPanel';

const AdminDashboard = () => {
	return (
		<div className="p-6">
			<h1>Admin Dashboard</h1>

			{/* Your other admin components */}

			{/* SignalR Test Panel */}
			<div className="mt-8">
				<SignalRTestPanel />
			</div>
		</div>
	);
};
```

### Add to Dev Tools Page (Recommended)

Create a dev tools page for debugging:

```tsx
// pages/DevTools.tsx
import SignalRTestPanel from '@/components/admin/SignalRTestPanel';

const DevTools = () => {
	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">
				Development Tools
			</h1>
			<SignalRTestPanel />
		</div>
	);
};

export default DevTools;
```

Then add a route for it (development only):

```tsx
// In your App.tsx or router
{
	import.meta.env.DEV && (
		<Route
			path="/dev-tools"
			element={<DevTools />}
		/>
	);
}
```

## Testing Checklist

Use this checklist to verify SignalR is working:

- [ ] After login, check "Status: Connected" is green
- [ ] Click "Join Auto Groups" - should show success message
- [ ] Wait for test notification from backend
- [ ] Verify notification appears in "Notification Log"
- [ ] Verify notification appears in "Notification Store"
- [ ] Check browser console for "SignalR Connected!" message

## Expected Console Messages

When working correctly, you should see:

```
SignalR Connected!
Joined group: User_12345
Joined group: Role_SuperAdmin
Received Notification: { ... }
```

## Troubleshooting

### Connection Not Established

**Problem:** Status shows "Disconnected"

**Solutions:**

1. Check backend is running on `http://localhost:5117`
2. Verify user is logged in
3. Check browser console for errors
4. Verify JWT token in localStorage under `auth-storage`

### Notifications Not Received

**Problem:** No notifications appear in log

**Solutions:**

1. Verify you've joined the correct groups
2. Check backend is sending to the same groups
3. Verify user has correct role permissions
4. Check browser Network tab for WebSocket connection

### Groups Not Joined

**Problem:** Join Auto Groups doesn't work

**Solutions:**

1. Verify user object exists with ID and roles
2. Check connection is established first
3. Look for error messages in console
4. Try manually joining a group with "Join Custom Group"

## Removing in Production

To avoid exposing the test panel in production, you can:

1. **Conditional Rendering:**

```tsx
{
	import.meta.env.DEV && <SignalRTestPanel />;
}
```

2. **Feature Flag:**

```tsx
const FEATURES = {
	enableSignalRTestPanel: import.meta.env.DEV,
};

{
	FEATURES.enableSignalRTestPanel && <SignalRTestPanel />;
}
```

3. **Role-Based Access:**

```tsx
const { hasRole } = useAuthStore();

{
	(hasRole('SuperAdmin') || import.meta.env.DEV) && <SignalRTestPanel />;
}
```

## Additional Notes

- The panel automatically connects to SignalR on mount
- All notifications received are logged for debugging
- You can clear the log anytime to start fresh
- The panel provides real-time feedback on connection status
