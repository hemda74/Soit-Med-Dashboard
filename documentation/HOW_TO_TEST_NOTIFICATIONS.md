# How to Test Notifications

## Overview

This guide shows multiple ways to test the SignalR notification system.

## Method 1: Using the Test Component (Recommended)

### Add to Your Admin Page

```tsx
import SendTestNotification from '@/components/admin/SendTestNotification';
import SignalRTestPanel from '@/components/admin/SignalRTestPanel';

const AdminPage = () => {
	return (
		<div className="space-y-6">
			<SendTestNotification />
			<SignalRTestPanel />
		</div>
	);
};
```

### How to Use

1. **Quick Send Options:**

      - **Send to Me**: Sends a test notification to your current user
      - **Send to SuperAdmins**: Sends notification to all SuperAdmins
      - **Broadcast to All**: Sends notification to all connected users

2. **Custom Notification:**
      - Select target type (User or Role)
      - Enter User ID or Role name
      - Choose notification type (success, error, warning, info)
      - Enter title and message
      - Click "Send Notification"

## Method 2: Backend API (Manual Testing)

### Using cURL

```bash
# Send to specific user
curl -X POST http://localhost:5117/api/Notification/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "targetType": "user",
    "target": "Ahmed_Hemdan_Sales_002",
    "title": "Test Notification",
    "message": "This is a test notification",
    "type": "info"
  }'

# Send to role
curl -X POST http://localhost:5117/api/Notification/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "targetType": "role",
    "target": "SuperAdmin",
    "title": "Role Notification",
    "message": "Test message for all SuperAdmins",
    "type": "success"
  }'
```

### Using Postman or Thunder Client

**Endpoint:** `POST http://localhost:5117/api/Notification/send`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (JSON):**

```json
{
	"targetType": "user",
	"target": "Ahmed_Hemdan_Sales_002",
	"title": "Test Notification",
	"message": "This is a test notification message",
	"type": "info"
}
```

## Method 3: Browser Console (For Developers)

Open browser console and run:

```javascript
// Get your token
const token = localStorage.getItem('auth-storage');
const parsed = JSON.parse(token);
const userToken = parsed.state.user.token;

// Get your user ID
const userId = parsed.state.user.id;

// Send notification to yourself
fetch('http://localhost:5117/api/Notification/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    targetType: 'user',
    target: userId,
    title: 'Console Test',
    message: 'Notification sent from browser console!',
    type: 'success'
  })
behavior.then(response => response.json())
  .then(data => console.log('Notification sent:', data))
  .catch(error => console.error('Error:', error));
```

## Method 4: Direct SignalR Test (Advanced)

```javascript
// In browser console
const connection = signalR
	.HubConnectionBuilder()
	.withUrl('http://localhost:5117/notificationHub', {
		accessTokenFactory: () => {
			const storage = JSON.parse(
				localStorage.getItem('auth-storage')
			);
			return storage.state.user.token;
		},
	})
	.build();

connection.on('ReceiveNotification', (data) => {
	console.log('Received:', data);
	alert(data.message);
});

connection
	.start()
	.then(() => {
		console.log('Connected!');

		// Now send a test notification from backend
		// (You still need the backend endpoint)
	})
	.catch((err) => console.error('Connection error:', err));
```

## Notification Types

| Type      | Badge Color | Use Case                        |
| --------- | ----------- | ------------------------------- |
| `success` | Green       | Success messages, confirmations |
| `error`   | Red         | Errors, failures                |
| `warning` | Yellow      | Warnings, cautions              |
| `info`    | Blue        | General information             |

## Target Types

### User

```json
{
	"targetType": "user",
	"target": "Ahmed_Hemdan_Sales_002"
}
```

Sends to a specific user by ID.

### Role

```json
{
	"targetType": "role",
	"target": "SuperAdmin"
}
```

Sends to all users with that role.

### Broadcast

```json
{
	"targetType": "broadcast",
	"target": "all"
}
```

Sends to all connected users.

## Backend Implementation

If you haven't implemented the backend endpoint yet, here's what you need:

### Create the Endpoint

```csharp
[HttpPost("send")]
public async Task<IActionResult> SendNotification([FromBody] SendNotificationRequest request)
{
    try
    {
        var hubContext = _hubContext as IHubContext<NotificationHub>;

        if (request.TargetType == "user")
        {
            // Send to specific user
            await hubContext.Clients.Group($"User_{request.Target}")
                .SendAsync("ReceiveNotification", new
                {
                    title = request.Title,
                    message = request.Message,
                    type = request.Type,
                    timestamp = DateTime.UtcNow
                });
        }
        else if (request.TargetType == "role")
        {
            // Send to role
            await hubContext.Clients.Group($"Role_{request.Target}")
                .SendAsync("ReceiveNotification", new
                {
                    title = request.Title,
                    message = request.Message,
                    type = request.Type,
                    timestamp = DateTime.UtcNow
                });
        }
        else if (request.TargetType == "broadcast")
        {
            // Send to all
            await hubContext.Clients.All
                .SendAsync("ReceiveNotification", new
                {
                    title = request.Title,
                    message = request.Message,
                    type = request.Type,
                    timestamp = DateTime.UtcNow
                });
        }

        return Ok(new { success = true, message = "Notification sent" });
    }
    catch (Exception ex)
    {
        return BadRequest(new { success = false, message = ex.Message });
    }
}
```

### Request Model

```csharp
public class SendNotificationRequest
{
    public string TargetType { get; set; } // "user", "role", or "broadcast"
    public string Target { get; set; } // User ID, Role name, or "all"
    public string Title { get; set; }
    public string Message { get; set; }
    public string Type { get; set; } // "success", "error", "warning", "info"
}
```

## Testing Checklist

- [ ] User receives notification in toast
- [ ] Notification appears in notification store
- [ ] Notification badge updates with count
- [ ] Browser notification appears (if permission granted)
- [ ] Notification persists in notification log
- [ ] Role-based notifications work correctly
- [ ] User-specific notifications work correctly
- [ ] Broadcast notifications work correctly

## Troubleshooting

### Notification Not Received

1. **Check Connection**: Verify SignalR is connected in test panel
2. **Check Groups**: User must be in correct group
3. **Check Backend**: Backend must be running and endpoint accessible
4. **Check Token**: JWT token must be valid
5. **Check Console**: Look for errors in browser console

### Backend Errors

1. Check backend logs for errors
2. Verify hub context is injected correctly
3. Ensure groups exist and users are in them
4. Check CORS configuration

## Quick Test Script

Save this as `test-notification.js`:

```javascript
async function sendTestNotification(token, userId) {
	const response = await fetch(
		'http://localhost:5117/api/Notification/send',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				targetType: 'user',
				target: userId,
				title: 'Quick Test',
				message: 'This is a quick test notification!',
				type: 'info',
			}),
		}
	);

	const data = await response.json();
	console.log('Result:', data);
}

// Usage
const authStorage = JSON.parse(localStorage.getItem('auth-storage'));
const token = authStorage.state.user.token;
const userId = authStorage.state.user.id;

sendTestNotification(token, userId);
```

Then run in browser console:

```javascript
// Copy and paste the entire file content here
```
