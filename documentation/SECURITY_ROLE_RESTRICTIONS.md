# Security Role Restrictions

## Overview

This document describes the role-based access control restrictions implemented in the Soit-Med Dashboard application to prevent unauthorized access by specific user roles.

## Restricted Roles

The following roles are **NOT** authorized to access the dashboard application:

- **Doctor**
- **Engineer** 
- **Technician**
- **Salesman**

Users with any of these roles will be denied access to the application, even if they have valid credentials.

## Implementation Details

### 1. Authentication Store (authStore.ts)

#### Restricted Roles List
```typescript
const RESTRICTED_ROLES = ['Doctor', 'Engineer', 'Technician', 'Salesman'];
```

#### Authorization Check Method
A new method `isAuthorizedToAccess()` has been added to the auth store:

```typescript
isAuthorizedToAccess: () => {
    const { user } = get();
    if (!user) return false;
    
    // Check if user has any restricted roles
    const hasRestrictedRole = user.roles.some(
        (role) => RESTRICTED_ROLES.includes(role)
    );
    
    return !hasRestrictedRole;
}
```

#### Login Process Enhancement
During the login process, after successful authentication with the backend, the application checks if the user has any restricted roles:

```typescript
// Check if user has authorization to access the application
const hasRestrictedRole = user.roles.some(
    (role) => RESTRICTED_ROLES.includes(role)
);

if (hasRestrictedRole) {
    setLoading(false);
    throw new Error(
        'Access denied. Your role is not authorized to access this application.'
    );
}
```

### 2. Application Router (App.tsx)

#### Route Guard Implementation
The main App component now includes an authorization check that runs on mount and when authentication state changes:

```typescript
if (isAuthenticated && !isAuthorizedToAccess()) {
    logout()
    return (
        // Redirect to login page
    )
}
```

This ensures that even if a restricted user somehow bypasses the login check, they will be immediately logged out and redirected to the login page.

## Security Flow

### Login Attempt by Restricted User

1. User enters valid credentials
2. Backend authenticates the user and returns token
3. Application fetches user data including roles
4. Application checks if user has any restricted roles
5. If restricted role detected:
   - Login process is aborted
   - Error message is displayed: "Access denied. Your role is not authorized to access this application."
   - User remains on login page
   - Login attempt is counted (for security lockout mechanism)

### Session Check

1. On application load, if user is authenticated
2. Application checks `isAuthorizedToAccess()`
3. If user has restricted role:
   - User is immediately logged out
   - Redirected to login page
   - Session is cleared from local storage

## Authorized Roles

The following roles **ARE** authorized to access the application:

- **SuperAdmin**
- **Admin**
- **SalesManager**
- **FinanceManager**
- **FinanceEmployee**
- **LegalManager**
- **LegalEmployee**
- **MaintenanceManager**
- **MaintenanceSupport**

## Error Messages

When a restricted user attempts to login, they will see:
```
Access denied. Your role is not authorized to access this application.
```

## Modifying Restricted Roles

To add or remove roles from the restriction list:

1. Open `src/stores/authStore.ts`
2. Locate the `RESTRICTED_ROLES` constant at the top of the file
3. Add or remove role names from the array
4. Ensure role names match exactly with the backend role definitions (case-sensitive)

Example:
```typescript
const RESTRICTED_ROLES = ['Doctor', 'Engineer', 'Technician', 'Salesman', 'NewRestrictedRole'];
```

## Testing

To test the restriction:

1. Attempt to login with a user account that has one of the restricted roles
2. Verify that login is denied with appropriate error message
3. Verify that the user cannot access any application routes
4. Verify that login attempts are counted for security lockout

## Security Considerations

- Role checks are performed both at login and at application load
- Multiple roles per user are supported - if ANY role is restricted, access is denied
- The restriction is enforced client-side but should also be enforced by backend API endpoints
- Session data is cleared when unauthorized access is detected
- Login attempt tracking continues to work for security lockout mechanism

## Backend Integration

This client-side restriction works in conjunction with backend authorization. Ensure that:

1. Backend API endpoints also enforce role-based access control
2. Backend validates user roles for each protected endpoint
3. Backend returns appropriate 401/403 status codes for unauthorized access
4. Token validation includes role verification

## Future Enhancements

Potential improvements to the security system:

1. Move restricted roles list to environment configuration
2. Add role-based route permissions (granular access control)
3. Implement role hierarchy system
4. Add audit logging for access denial attempts
5. Implement temporary access grants for restricted roles
6. Add admin interface to manage role restrictions dynamically
