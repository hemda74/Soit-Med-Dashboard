# Services Refactoring Migration Guide

## Overview

The services have been refactored from a single large `roleSpecificUserApi.ts` file (1100+ lines) into smaller, focused modules for better maintainability and organization.

## New Structure

```
src/services/
├── shared/
│   ├── apiClient.ts          # Shared API request utilities
│   ├── validation.ts         # Shared validation functions
│   └── endpoints.ts          # Centralized API endpoints
├── user/
│   ├── userApi.ts           # User CRUD operations
│   ├── userProfileApi.ts    # Profile image management
│   └── userDeletionApi.ts   # User deletion
├── auth/
│   └── authApi.ts           # Authentication services
├── roleSpecific/
│   ├── baseRoleSpecificApi.ts    # Base role creation logic
│   ├── medicalRoleApi.ts         # Doctor, Technician
│   ├── technicalRoleApi.ts       # Engineer
│   ├── adminRoleApi.ts           # Admin
│   ├── financeRoleApi.ts         # Finance Manager, Finance Employee
│   ├── legalRoleApi.ts           # Legal Manager, Legal Employee
│   └── salesRoleApi.ts           # Salesman, Sales Manager
├── sales/
│   └── salesReportApi.ts     # Sales reports API
├── dashboard/
│   └── dashboardApi.ts       # Dashboard statistics
└── index.ts                  # Main exports
```

## Migration Steps

### 1. Update Imports

**Old:**

```typescript
import {
	createSalesman,
	createSalesManager,
} from '@/services/roleSpecificUserApi';
```

**New:**

```typescript
import {
	createSalesman,
	createSalesManager,
} from '@/services/roleSpecific/salesRoleApi';
// OR
import { createSalesman, createSalesManager } from '@/services'; // Uses main index
```

### 2. Role-Specific User Creation

**Old:**

```typescript
import {
	createDoctor,
	createEngineer,
	createTechnician,
	createAdmin,
	createFinanceManager,
	createFinanceEmployee,
	createLegalManager,
	createLegalEmployee,
	createSalesman,
	createSalesManager,
} from '@/services/roleSpecificUserApi';
```

**New:**

```typescript
// Option 1: Import from specific modules
import {
	createDoctor,
	createTechnician,
} from '@/services/roleSpecific/medicalRoleApi';
import { createEngineer } from '@/services/roleSpecific/technicalRoleApi';
import { createAdmin } from '@/services/roleSpecific/adminRoleApi';
import {
	createFinanceManager,
	createFinanceEmployee,
} from '@/services/roleSpecific/financeRoleApi';
import {
	createLegalManager,
	createLegalEmployee,
} from '@/services/roleSpecific/legalRoleApi';
import {
	createSalesman,
	createSalesManager,
} from '@/services/roleSpecific/salesRoleApi';

// Option 2: Import from main index (recommended)
import {
	createDoctor,
	createEngineer,
	createTechnician,
	createAdmin,
	createFinanceManager,
	createFinanceEmployee,
	createLegalManager,
	createLegalEmployee,
	createSalesman,
	createSalesManager,
} from '@/services';
```

### 3. User Management

**Old:**

```typescript
import { fetchUsers, updateUserStatus } from '@/services/api';
```

**New:**

```typescript
import { fetchUsers, updateUserStatus } from '@/services/user/userApi';
// OR
import { fetchUsers, updateUserStatus } from '@/services';
```

### 4. Authentication

**Old:**

```typescript
import { loginUser, getCurrentUser } from '@/services/authApi';
```

**New:**

```typescript
import { loginUser, getCurrentUser } from '@/services/auth/authApi';
// OR
import { loginUser, getCurrentUser } from '@/services';
```

### 5. Sales Reports

**Old:**

```typescript
import { salesReportApi } from '@/services/salesReportApi';
```

**New:**

```typescript
import { salesReportApi } from '@/services/sales/salesReportApi';
// OR
import { salesReportApi } from '@/services';
```

## Benefits of New Structure

1. **Better Organization**: Related functionality is grouped together
2. **Smaller Files**: Each file is focused and manageable (50-200 lines vs 1100+)
3. **Easier Maintenance**: Changes to specific roles don't affect others
4. **Better Tree Shaking**: Only import what you need
5. **Clearer Dependencies**: Easy to see what each module depends on
6. **Shared Utilities**: Common functionality is centralized

## Backward Compatibility

The main `index.ts` file exports everything, so existing imports using `@/services` will continue to work. However, it's recommended to update imports to be more specific for better performance.

## Testing

All existing functionality has been preserved. The refactoring only changes the file organization, not the actual API logic or behavior.

## Next Steps

1. Update imports in your components to use the new structure
2. Remove the old large service files once migration is complete
3. Consider further splitting if any files grow too large again
