# Users Module Documentation

## Overview

The Users page has been transformed into a modular system that allows users to view either all users or filter by specific departments. This provides a more organized and efficient way to manage user data.

## Features

### **Two View Modes**

- **All Users**: View all users across all departments
- **Department Users**: View users filtered by specific department

### **Interactive Controls**

- **All Users Button**: Switches to view all users
- **Department Selector**: Dropdown to select specific departments
- **Refresh Button**: Reloads current view data

### **Smart Data Display**

- Dynamic table that adapts to the selected view
- Department names are properly displayed based on the API response
- User count and department information shown in descriptions

## Components

### DepartmentSelector Component

- **Location**: `src/components/DepartmentSelector.tsx`
- **Purpose**: Dropdown component for selecting departments
- **Features**:
     - Fetches departments from API automatically
     - Shows department name, description, and user count
     - Handles loading states and errors
     - Responsive design with hover effects

### Updated UsersList Component

- **Location**: `src/components/UsersList.tsx`
- **Purpose**: Main users management interface
- **Features**:
     - Modular view switching
     - Integrated department selector
     - Smart data handling for both view modes
     - Loading states for all operations

## API Integration

### New API Endpoints

#### 1. Fetch All Departments

```typescript
GET / api / Department;
```

- **Purpose**: Get list of all departments
- **Response**: Array of Department objects
- **Loading**: Integrated with global loading system

#### 2. Fetch Users by Department

```typescript
GET / api / User / department / { departmentId };
```

- **Purpose**: Get users for specific department
- **Parameters**: `departmentId` (number)
- **Response**: DepartmentUsersResponse object
- **Loading**: Integrated with global loading system

### API Functions

#### `fetchDepartments(token, setLoading)`

- Fetches all departments
- Returns `Department[]`
- Handles loading state automatically

#### `fetchUsersByDepartment(departmentId, token, setLoading)`

- Fetches users for specific department
- Returns `DepartmentUsersResponse`
- Handles loading state automatically

## Type Definitions

### Department Interface

```typescript
interface Department {
	id: number;
	name: string;
	description: string;
	createdAt: string;
	userCount: number;
}
```

### DepartmentUsersResponse Interface

```typescript
interface DepartmentUsersResponse {
	department: string;
	departmentId: number;
	userCount: number;
	users: DepartmentUser[];
}
```

### DepartmentUser Interface

```typescript
interface DepartmentUser {
	id: string;
	userName: string;
	email: string;
	firstName: string;
	lastName: string;
	fullName: string;
	isActive: boolean;
	createdAt: string;
	lastLoginAt: string | null;
	roles: string[];
	departmentId: number;
	departmentName: string;
	departmentDescription: string;
}
```

## Usage Flow

### 1. Initial Load

- Component loads with "All Users" view by default
- Fetches all users from `/api/User` endpoint
- Department selector loads available departments

### 2. View All Users

- Click "All Users" button
- Loads all users across all departments
- Shows department names using internal mapping

### 3. View Department Users

- Select department from dropdown
- Automatically switches to department view
- Fetches users for selected department
- Shows department-specific information

### 4. Refresh Data

- Click "Refresh" button
- Reloads current view (all users or selected department)
- Maintains current view mode

## UI/UX Features

### Responsive Design

- Mobile-friendly layout
- Flexible button arrangement
- Responsive table with horizontal scroll

### Visual Indicators

- Active button highlighting
- Loading states with Logo Loader.gif
- Error handling with clear messages
- Department user count display

### Smart Data Handling

- Automatic department name resolution
- Fallback to internal mapping when needed
- Proper handling of empty states

## Loading States

All operations are integrated with the global loading system:

- **Department Loading**: Shows loading when fetching departments
- **User Loading**: Shows loading when fetching users
- **Department User Loading**: Shows loading when fetching department users
- **Refresh Loading**: Shows loading when refreshing data

## Error Handling

- **API Errors**: Clear error messages for failed requests
- **No Data**: Appropriate messages for empty states
- **Network Issues**: Graceful handling of connection problems
- **Invalid Data**: Fallback mechanisms for missing information

## Performance Optimizations

- **Efficient Re-renders**: Only updates necessary components
- **Smart State Management**: Minimal state updates
- **API Caching**: Reuses department data when possible
- **Loading Optimization**: Global loading prevents multiple spinners

## Future Enhancements

### Potential Improvements

1. **Search Functionality**: Add search within current view
2. **Pagination**: Handle large user lists efficiently
3. **Sorting**: Add column sorting capabilities
4. **Export**: Export user data to CSV/Excel
5. **Bulk Actions**: Select multiple users for actions
6. **Advanced Filtering**: Filter by role, status, etc.

### API Enhancements

1. **Caching**: Implement client-side caching
2. **Pagination**: Add pagination support
3. **Search**: Add search parameters
4. **Sorting**: Add sorting parameters

## Troubleshooting

### Common Issues

#### Department Selector Not Loading

- Check API endpoint accessibility
- Verify authentication token
- Check browser console for errors

#### Users Not Displaying

- Verify API response format
- Check data mapping logic
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

## Code Examples

### Using the Department Selector

```tsx
<DepartmentSelector
	onDepartmentSelect={handleDepartmentSelect}
	selectedDepartment={selectedDepartment}
/>
```

### Loading Department Users

```tsx
const loadDepartmentUsers = async (department: Department) => {
	const departmentData = await fetchUsersByDepartment(
		department.id,
		user.token,
		setLoading
	);
	setDepartmentUsers(departmentData);
};
```

### Switching Views

```tsx
const switchToAllUsers = () => {
	setViewMode('all');
	setDepartmentUsers(null);
	setSelectedDepartment(null);
};
```

This modular approach provides a much more organized and user-friendly way to manage users, with clear separation between different data views and intuitive controls for switching between them.
