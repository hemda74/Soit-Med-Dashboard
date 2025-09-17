# Role Filtering Feature Documentation

## Overview

The Users module now includes comprehensive role-based filtering functionality that allows users to filter and view users by their specific roles. This feature integrates seamlessly with the existing modular system alongside department filtering and username search.

## Features

### **Role-Based Filtering**

- **Role Selection**: Dropdown to select specific roles
- **API Integration**: Uses `GET /api/Role` and `GET /api/User/role/{role}` endpoints
- **Loading States**: Integrated with global Logo Loader.gif system
- **Error Handling**: Clear error messages for failed operations

### **Four View Modes**

- **All Users**: View all users across all departments and roles
- **Department Users**: Filter by specific department
- **Role Users**: Filter by specific role
- **Search Results**: Search by username

### **Seamless Integration**

- **Smart Navigation**: Easy switching between all view modes
- **Consistent UI**: Maintains the same design language
- **Responsive Design**: Works on all screen sizes
- **Unified Controls**: All filtering options in one interface

## Components

### RoleSelector Component

- **Location**: `src/components/RoleSelector.tsx`
- **Purpose**: Dropdown component for selecting roles
- **Features**:
     - Fetches roles from API automatically
     - Shows role name and normalized name
     - Handles loading states and errors
     - Responsive design with hover effects
     - Shield icon for visual identification

### Updated UsersList Component

- **Location**: `src/components/UsersList.tsx`
- **Purpose**: Main users management with role filtering
- **New Features**:
     - Role view mode support
     - Role user handling
     - Four-way view switching
     - Smart refresh functionality

## API Integration

### Role Endpoints

#### 1. Fetch All Roles

```typescript
GET / api / Role;
```

- **Purpose**: Get list of all available roles
- **Response**: Array of Role objects
- **Loading**: Integrated with global loading system

#### 2. Fetch Users by Role

```typescript
GET / api / User / role / { role };
```

- **Purpose**: Get users for specific role
- **Parameters**: `role` (string, required)
- **Response**: RoleUsersResponse object
- **Loading**: Integrated with global loading system

### API Functions

#### `fetchRoles(token, setLoading)`

- Fetches all available roles
- Returns `Role[]`
- Handles loading state automatically

#### `fetchUsersByRole(role, token, setLoading)`

- Fetches users for specific role
- Returns `RoleUsersResponse`
- Handles loading state automatically

## Type Definitions

### Role Interface

```typescript
interface Role {
	id: string;
	name: string;
	normalizedName: string;
	concurrencyStamp: string | null;
}
```

### RoleUsersResponse Interface

```typescript
interface RoleUsersResponse {
	role: string;
	userCount: number;
	users: DepartmentUser[];
}
```

### ViewMode Type

```typescript
type ViewMode = 'all' | 'department' | 'role' | 'search';
```

## Usage Flow

### 1. View All Users

- Click "All Users" button
- Shows all users across all departments and roles
- Default view when component loads

### 2. Filter by Department

- Select department from department dropdown
- Shows users in selected department
- Displays department name and user count

### 3. Filter by Role

- Select role from role dropdown
- Shows users with selected role
- Displays role name and user count

### 4. Search by Username

- Enter username in search input
- Shows specific user details
- Displays comprehensive user information

### 5. Switch Between Views

- Easy switching between all four view modes
- Smart refresh button for current view
- Clear visual indicators for active view

## UI/UX Features

### Role Selector Design

- **Shield Icon**: Visual identifier for role selection
- **Role Names**: Clear display of role names
- **Normalized Names**: Shows technical role identifiers
- **Hover Effects**: Interactive feedback on hover

### Layout Design

- **Responsive Grid**: Adapts to different screen sizes
- **Four-Column Layout**: All controls in one row on large screens
- **Stacked Layout**: Vertical stacking on mobile devices
- **Consistent Spacing**: Uniform gaps between elements

### Visual Indicators

- **Active States**: Clear indication of current view mode
- **Loading States**: Logo Loader.gif during API calls
- **Error Handling**: Red-themed error messages
- **Success States**: Green-themed success indicators

## State Management

### Role State

- **roleUsers**: Stores users with selected role
- **selectedRole**: Currently selected role
- **viewMode**: Tracks current view ('role' for role filtering)
- **error**: Handles role-related errors

### State Transitions

1. **All Users** → **Role**: Select role from dropdown
2. **Department Users** → **Role**: Select role from dropdown
3. **Role** → **All Users**: Click "All Users" button
4. **Role** → **Department Users**: Select department
5. **Role** → **Search**: Use search functionality
6. **Search** → **Role**: Select role from dropdown

## Error Handling

### Common Error Scenarios

1. **Role Not Found**: Clear error message
2. **Network Error**: Connection issue handling
3. **Invalid Role**: Empty or invalid role selection
4. **Authentication Error**: Token issues

### Error Display

- **Inline Errors**: Shown in role selector area
- **Clear Messages**: User-friendly error descriptions
- **Recovery Options**: Easy ways to retry or clear

## Performance Optimizations

### Efficient API Calls

- **Loading States**: Clear feedback during operations
- **Error Recovery**: Quick retry mechanisms
- **Smart Caching**: Reuses role data when possible

### State Management

- **Minimal Re-renders**: Only updates necessary components
- **Efficient Updates**: Targeted state changes
- **Memory Management**: Proper cleanup of unused data

## Available Roles

Based on the API response, the following roles are available:

- **SuperAdmin**: System administrators
- **admin**: Regular administrators
- **Doctor**: Medical professionals
- **Technician**: Technical staff
- **Engineer**: Engineering staff
- **Salesman**: Sales team members
- **FinanceEmployee**: Finance staff
- **FinanceManager**: Finance managers
- **LegalEmployee**: Legal staff
- **LegalManager**: Legal managers
- **user**: Regular users
- **Hello**: Custom role

## Code Examples

### Basic Role Filtering

```tsx
const loadRoleUsers = async (role: Role) => {
	try {
		const roleData = await fetchUsersByRole(
			role.name,
			user.token,
			setLoading
		);
		setRoleUsers(roleData);
		setSelectedRole(role);
		setViewMode('role');
	} catch (err) {
		setError(err.message);
	}
};
```

### Role Selector Component

```tsx
<RoleSelector
	onRoleSelect={handleRoleSelect}
	selectedRole={selectedRole}
/>
```

### View Mode Switching

```tsx
const switchToRole = (roleData: RoleUsersResponse) => {
	setRoleUsers(roleData);
	setViewMode('role');
	setDepartmentUsers(null);
	setSearchResult(null);
};
```

## Future Enhancements

### Potential Improvements

1. **Multi-Role Filtering**: Filter by multiple roles simultaneously
2. **Role Hierarchy**: Show role hierarchy and permissions
3. **Role Statistics**: Display role distribution charts
4. **Advanced Filters**: Combine role and department filters
5. **Role Management**: Add/edit/delete roles
6. **Bulk Role Actions**: Assign roles to multiple users

### API Enhancements

1. **Role Permissions**: API endpoint for role permissions
2. **Role Hierarchy**: Backend support for role hierarchy
3. **Role Analytics**: Track role usage patterns
4. **Caching**: Server-side role data caching

## Troubleshooting

### Common Issues

#### Role Selector Not Loading

- Check API endpoint accessibility
- Verify authentication token
- Check browser console for errors

#### Role Users Not Displaying

- Verify API response format
- Check role name encoding
- Ensure proper error handling

#### Loading States Not Working

- Verify global loading integration
- Check setLoading function calls
- Ensure proper cleanup

### Debug Tips

1. Check browser console for API errors
2. Verify network requests in DevTools
3. Check component state in React DevTools
4. Verify API response format matches types
5. Test with known roles first

## Best Practices

### Role Implementation

1. **Validate Roles**: Check for valid role names
2. **Handle Errors**: Provide clear error messages
3. **Loading States**: Show feedback during operations
4. **Clear Selection**: Easy way to reset role filter

### User Experience

1. **Clear Labels**: Helpful role names and descriptions
2. **Visual Feedback**: Loading and success states
3. **Easy Navigation**: Simple view switching
4. **Consistent Design**: Maintain UI consistency

## Integration with Existing Features

### Department Filtering

- **Complementary**: Works alongside department filtering
- **Independent**: Can be used separately or together
- **Consistent**: Same UI patterns and behavior

### Username Search

- **Overrides**: Search takes precedence over role filtering
- **Resets**: Role filter is cleared when searching
- **Restores**: Role filter can be restored after clearing search

### All Users View

- **Default**: Shows all users regardless of role
- **Reset**: Clears all filters and shows complete user list
- **Baseline**: Reference point for all other views

This role filtering functionality provides a powerful and intuitive way to filter users by their roles, enhancing the overall user management experience with comprehensive filtering capabilities.
