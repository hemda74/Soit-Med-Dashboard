# Role-Specific User Creation

This document describes the new role-specific user creation system that matches the API specification provided.

## Overview

The role-specific user creation system provides a streamlined way to create users with specific roles using dedicated API endpoints. This approach replaces the complex dynamic form system with simple, role-specific forms.

## Features

### Supported Roles

1. **Doctor** - Medical staff including doctors and technicians

      - Requires: email, password, firstName, lastName, specialty, hospitalId
      - Endpoint: `POST /api/RoleSpecificUser/doctor`

2. **Engineer** - Technical and engineering staff

      - Requires: email, password, firstName, lastName, departmentId
      - Endpoint: `POST /api/RoleSpecificUser/engineer`

3. **Technician** - Medical technicians

      - Requires: email, password, firstName, lastName, hospitalId
      - Endpoint: `POST /api/RoleSpecificUser/technician`

4. **Admin** - Administrative and management roles

      - Requires: email, password, firstName, lastName, departmentId
      - Endpoint: `POST /api/RoleSpecificUser/admin`

5. **Finance Manager** - Financial management and accounting

      - Requires: email, password, firstName, lastName, departmentId
      - Endpoint: `POST /api/RoleSpecificUser/finance-manager`

6. **Legal Manager** - Legal affairs and compliance

      - Requires: email, password, firstName, lastName, departmentId
      - Endpoint: `POST /api/RoleSpecificUser/legal-manager`

7. **Salesman** - Sales team and customer relations
      - Requires: email, password, firstName, lastName, departmentId
      - Endpoint: `POST /api/RoleSpecificUser/salesman`

### Department Mapping

The system includes a department mapping that converts department IDs to readable names:

- ID 1 → Administration
- ID 2 → Medical
- ID 3 → Sales
- ID 4 → Engineering
- ID 5 → Finance
- ID 6 → Legal
- ID 7 → NewOne

## Components

### 1. RoleSpecificUserCreation.tsx

Main component for creating users with specific roles. Features:

- Role selection interface
- Dynamic form based on selected role
- Form validation
- Success/error handling
- Integration with department and hospital data

### 2. UserCreationTest.tsx

Testing component that allows testing all role-specific user creation endpoints with sample data. Features:

- Pre-configured test data for each role
- Real-time API testing
- Results tracking and display
- Performance metrics

## API Integration

### Request Format

All role-specific user creation requests follow this pattern:

```typescript
interface BaseUserRequest {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

// Role-specific extensions
interface DoctorUserRequest extends BaseUserRequest {
	specialty: string;
	hospitalId: string;
}

interface EngineerUserRequest extends BaseUserRequest {
	departmentId: string;
}
```

### Response Format

All responses follow this structure:

```typescript
interface RoleSpecificUserResponse {
	success: boolean;
	message: string;
	data: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		role: string;
		// Role-specific fields...
	};
}
```

## Password Requirements

All passwords must meet these requirements:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## User ID Format

The system automatically generates user IDs in the following format:

- **Doctors & Technicians:** `FirstName_Lastname_Hospitalname_001`
- **All Other Roles:** `FirstName_Lastname_Departmentname_001`

## Usage

### Accessing the Feature

1. Navigate to the Dashboard
2. Click on "Create User" (for role-specific creation)
3. Select the desired role
4. Fill in the required information
5. Submit the form

### Testing the APIs

1. Navigate to the Dashboard
2. Click on "API Testing"
3. Select a role to test
4. Click "Test User Creation"
5. View results in the test results panel

## Error Handling

The system handles various error scenarios:

- **Validation Errors**: Form validation before submission
- **API Errors**: Network and server errors
- **Permission Errors**: Access control validation
- **Duplicate User Errors**: Email already exists

## Security

- All requests require authentication tokens
- Role-based access control (Admin/SuperAdmin only)
- Password complexity validation
- Input sanitization and validation

## Future Enhancements

- Bulk user creation
- User import from CSV/Excel
- Advanced role management
- Audit logging
- Email notifications

## Migration from Legacy System

The new role-specific system runs alongside the existing dynamic form system. To migrate:

1. Use the new system for all new user creation
2. Gradually phase out the legacy system
3. Update documentation and training materials
4. Monitor usage and gather feedback

## Troubleshooting

### Common Issues

1. **"No authentication token found"**

      - Ensure user is logged in
      - Check token expiration

2. **"Admin access required"**

      - Verify user has Admin or SuperAdmin role
      - Check role assignment

3. **"Failed to load reference data"**

      - Check API connectivity
      - Verify department/hospital endpoints

4. **"Password does not meet complexity requirements"**
      - Ensure password meets all requirements
      - Use the password validation helper

### Debug Mode

Enable debug mode by checking browser console for detailed API request/response logs.

