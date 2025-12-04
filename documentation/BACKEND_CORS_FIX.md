# Backend CORS Configuration Fix

## Problem

When connecting to SignalR, you're getting this error:

```
Access to fetch at 'http://localhost:5117/notificationHub/negotiate?negotiateVersion=1'
from origin 'http://localhost:5176' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
The value of the 'Access-Control-Allow-Origin' header in the response must not be the
wildcard '*' when the request's credentials mode is 'include'.
```

## Root Cause

The SignalR client sends a JWT token for authentication. When credentials (tokens, cookies) are included in the request, the CORS specification doesn't allow using the wildcard `*` for `Access-Control-Allow-Origin`. You must specify the exact origin.

## Solution for Backend Team

### Option 1: Allow Specific Origins (Recommended)

Update your CORS configuration in the backend to allow specific origins:

```csharp
// In Program.cs or Startup.cs

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5176",      // Vite dev server
                "http://localhost:5175",      // Alternative dev port
                "http://localhost:3000",      // Alternative dev port
                "https://your-production-domain.com"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()  // IMPORTANT: This is needed for JWT tokens
            .SetIsOriginAllowedToAllowWildcardSubdomains(false);
    });
});

// Apply to SignalR
builder.Services
    .AddSignalR()
    .AddJsonProtocol();

app.MapHub<NotificationHub>("/notificationHub");

// Apply CORS to SignalR
app.UseCors("AllowSpecificOrigins");
```

### Option 2: Allow Any Origin for Development Only

If you want to keep the wildcard for development:

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseCors(options =>
    {
        options
            .AllowAnyOrigin()    // Only for development
            .AllowAnyMethod()
            .AllowAnyHeader();
        // Note: AllowCredentials() is NOT allowed with AllowAnyOrigin()
    });
}
else
{
    // Production: Use specific origins
    app.UseCors("AllowSpecificOrigins");
}
```

**⚠️ Important:** When using `AllowCredentials()`, you **cannot** use `AllowAnyOrigin()`. You must specify exact origins.

### Complete Example for ASP.NET Core

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("SignalRCors", policy =>
    {
        policy
            .WithOrigins("http://localhost:5176")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Add SignalR
builder.Services.AddSignalR();

var app = builder.Build();

// Use CORS
app.UseCors("SignalRCors");

// Map SignalR hub
app.MapHub<NotificationHub>("/notificationHub");

app.Run();
```

## Alternative: Frontend Workaround (Temporary)

I've already added `withCredentials: false` to the SignalR connection in the frontend. However, this is **not recommended** for production as it may cause authentication issues.

If you need an immediate temporary fix while waiting for the backend update, the frontend change will allow the connection to proceed, but you should still fix CORS properly on the backend.

## Testing

After updating the backend:

1. Restart your backend server
2. Clear browser cache
3. Try logging in again
4. Check browser console - you should see:
      ```
      SignalR Connected!
      ```

## Production Considerations

For production, you should:

1. **Set specific origins** in CORS configuration
2. **Never use wildcards** (`*`) when credentials are involved
3. **Use HTTPS** for both frontend and backend
4. **Configure allowed origins** via environment variables:

```csharp
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("SignalRCors", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
```

### appsettings.Development.json

```json
{
	"Cors": {
		"AllowedOrigins": [
			"http://localhost:5176",
			"http://localhost:5175"
		]
	}
}
```

### appsettings.Production.json

```json
{
	"Cors": {
		"AllowedOrigins": ["https://your-production-domain.com"]
	}
}
```

## Verification

Check that CORS is working by looking at the Network tab in browser DevTools:

1. Open DevTools → Network tab
2. Try to connect to SignalR
3. Look for the `/negotiate` request
4. In the Response Headers, you should see:
      ```
      Access-Control-Allow-Origin: http://localhost:5176
      Access-Control-Allow-Credentials: true
      ```

## Summary

- ❌ **Don't use** `AllowAnyOrigin()` with `AllowCredentials()`
- **Do use** `WithOrigins([specific origins])` with `AllowCredentials()`
- **Frontend workaround** already applied as temporary fix
- 🔧 **Backend fix** is required for production

## Contact

If you have questions or need help implementing this fix, contact the backend team.
