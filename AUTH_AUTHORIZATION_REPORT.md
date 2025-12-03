# Authentication & Authorization Report

## Soit-Med Web Application

---

## Executive Summary

This report documents the complete authentication and authorization cycle in the Soit-Med web application, including role-based access control (RBAC) for all pages.

---

## 1. Authentication Flow

### 1.1 Login Process

1. User submits credentials via `/login` endpoint
2. Backend validates credentials and returns JWT token
3. Frontend fetches complete user data including roles
4. Token and user data stored in Zustand store (persisted)
5. Session expiry calculated (5 years from backend, 24 hours frontend default)

### 1.2 Authentication Store (`authStore.ts`)

- **Location**: `Web/src/stores/authStore.ts`
- **State Management**: Zustand with persistence
- **Key Features**:
     - JWT token management
     - Session expiry tracking
     - Login attempt limiting (5 attempts, 1-minute lockout)
     - Role-based permission checking
     - Case-insensitive role matching

### 1.3 Restricted Roles (Cannot Access Application)

The following roles are **completely blocked** from accessing the web application:

- **Doctor**
- **Engineer**
- **Technician**

These roles are checked during login and will receive an error: _"Access denied. Your role is not authorized to access this application."_

---

## 2. Authorization System

### 2.1 RoleGuard Component

- **Location**: `Web/src/components/shared/RoleGuard.tsx`
- **Functionality**:
     - Wraps protected routes
     - Checks authentication status
     - Validates user roles against required roles
     - **SuperAdmin bypass**: SuperAdmin/superadmin can access ANY route (case-insensitive)
     - Case-insensitive role matching
     - Redirects to `/login` if not authenticated
     - Redirects to `/not-found` if role check fails

### 2.2 Role Checking Logic

```typescript
// SuperAdmin can access any route
if (hasAnyRoleCaseInsensitive(['SuperAdmin', 'superadmin'])) return children;

// Check if user has any of the required roles
if (requiredAnyRoles && !hasAnyRoleCaseInsensitive(requiredAnyRoles)) {
	return (
		<Navigate
			to="/not-found"
			replace
		/>
	);
}
```

---

## 3. Available Roles in System

Based on backend definitions (`UserRoles.cs`):

### Administrative

- **SuperAdmin** - Full system access
- **Admin** / **admin** - Administrative access

### Sales Department

- **SalesManager** - Sales management
- **Salesman** - Sales personnel
- **SalesSupport** - Sales support staff

### Finance Department

- **FinanceManager** - Finance management
- **FinanceEmployee** - Finance staff

### Legal Department

- **LegalManager** - Legal management
- **LegalEmployee** - Legal staff

### Engineering/Maintenance

- **MaintenanceManager** - Maintenance management
- **MaintenanceSupport** - Maintenance support
- **SparePartsCoordinator** - Spare parts coordination
- **InventoryManager** - Inventory management

### Other

- **Customer** - Customer access
- **HospitalAdmin** - Hospital administration

---

## 4. Page Access Control Table

### Pages with RoleGuard (Explicit Role Restrictions)

| Page/Route                       | Component                      | Allowed Roles                                                              | Notes                             |
| -------------------------------- | ------------------------------ | -------------------------------------------------------------------------- | --------------------------------- |
| `/sales-manager`                 | UnifiedSalesManagerDashboard   | SalesManager, SuperAdmin                                                   | Sales Manager Dashboard           |
| `/sales-manager/targets`         | SalesTargetsPage               | SalesManager, SuperAdmin                                                   | Sales Targets Management          |
| `/sales-manager/reports-review`  | ManagerReportsReviewPage       | SalesManager, SuperAdmin                                                   | Reports Review                    |
| `/sales-manager/deals`           | DealsManagementPage            | SalesManager, SuperAdmin                                                   | Deals Management                  |
| `/sales-manager/deal-approvals`  | DealApprovalsPage              | SalesManager, SuperAdmin                                                   | Deal Approvals                    |
| `/sales-manager/offer-approvals` | OfferApprovalsPage             | SalesManager, SuperAdmin                                                   | Offer Approvals                   |
| `/sales-manager/clients`         | SalesClientsPage               | SalesManager, SalesSupport, SuperAdmin                                     | Sales Clients                     |
| `/sales-manager/offers`          | OffersManagementPage           | SalesManager, SuperAdmin                                                   | Offers Management                 |
| `/sales-manager/offers/:id/edit` | EditOfferPage                  | SalesManager, SuperAdmin                                                   | Edit Offer                        |
| `/chat`                          | ChatPage                       | Admin, admin, SuperAdmin, superadmin, SalesManager, SalesSupport, Customer | Chat System                       |
| `/sales-statistics`              | SalesStatisticsPage            | SalesManager, SuperAdmin                                                   | Sales Statistics                  |
| `/sales-analytics`               | SalesAnalyticsPage             | SalesManager, SuperAdmin                                                   | Sales Analytics                   |
| `/super-admin/deal-approvals`    | SuperAdminDealApprovalsPage    | SuperAdmin                                                                 | Super Admin Deal Approvals        |
| `/salesman/deal-reports`         | DealReportsPage                | Salesman                                                                   | Salesman Deal Reports             |
| `/legal/deals`                   | LegalDealsPage                 | LegalManager, LegalEmployee                                                | Legal Deals                       |
| `/sales-support/offer`           | OfferCreationPage              | SalesSupport, SuperAdmin                                                   | Offer Creation                    |
| `/sales-support/requests`        | RequestsInboxPage              | SalesSupport, SuperAdmin                                                   | Requests Inbox                    |
| `/sales-support/products`        | ProductsCatalogPage            | SalesSupport, SalesManager, SuperAdmin                                     | Products Catalog                  |
| `/admin/create-role-user`        | RoleSpecificUserCreation       | Admin, admin, SuperAdmin, superadmin                                       | Create Role User                  |
| `/admin/create-sales-support`    | SalesSupportUserCreation       | Admin, admin, SuperAdmin, superadmin                                       | Create Sales Support              |
| `/admin/users`                   | UsersList                      | Admin, admin, SuperAdmin, superadmin                                       | Users List                        |
| `/admin/client-accounts`         | ClientAccountCreationPage      | Admin, admin, SuperAdmin, superadmin                                       | Client Account Creation           |
| `/maintenance-support`           | MaintenanceSupportDashboard    | MaintenanceSupport, MaintenanceManager, SuperAdmin                         | Maintenance Support Dashboard     |
| `/maintenance/requests/:id`      | MaintenanceRequestDetails      | MaintenanceSupport, MaintenanceManager, Engineer, SuperAdmin               | Maintenance Request Details       |
| `/maintenance/visits`            | MaintenanceVisitManagement     | Engineer, MaintenanceManager, SuperAdmin                                   | Maintenance Visits                |
| `/maintenance/spare-parts`       | SparePartRequestManagement     | SparePartsCoordinator, InventoryManager, Doctor, HospitalAdmin, SuperAdmin | Spare Parts Requests              |
| `/spare-parts-coordinator`       | SparePartsCoordinatorDashboard | SparePartsCoordinator, SuperAdmin                                          | Spare Parts Coordinator Dashboard |
| `/inventory-manager`             | InventoryManagerDashboard      | InventoryManager, SuperAdmin                                               | Inventory Manager Dashboard       |
| `/accounting`                    | AccountingDashboard            | FinanceManager, FinanceEmployee, SuperAdmin                                | Accounting Dashboard              |
| `/accounting/reports`            | FinancialReportsScreen         | FinanceManager, FinanceEmployee, SuperAdmin                                | Financial Reports                 |
| `/payments/:id`                  | PaymentDetailsView             | FinanceManager, FinanceEmployee, Doctor, HospitalAdmin, SuperAdmin         | Payment Details                   |

### Pages WITHOUT RoleGuard (Accessible to All Authenticated Users)

| Page/Route       | Component         | Access Control                                         | Notes                             |
| ---------------- | ----------------- | ------------------------------------------------------ | --------------------------------- |
| `/dashboard`     | Dashboard         | All authenticated users (except restricted roles)      | Main Dashboard                    |
| `/profile`       | UserProfile       | All authenticated users                                | User Profile                      |
| `/reports`       | ReportsScreen     | **Internal check**: SalesManager, Salesman, SuperAdmin | Reports (has internal role check) |
| `/weekly-plans`  | WeeklyPlansScreen | All authenticated users                                | Weekly Plans                      |
| `/notifications` | NotificationsPage | All authenticated users                                | Notifications                     |
| `/performance`   | PerformancePage   | All authenticated users                                | Performance Monitor               |

### Public Pages (No Authentication Required)

| Page/Route         | Component      | Access Control    |
| ------------------ | -------------- | ----------------- |
| `/login`           | LoginForm      | Public            |
| `/forgot-password` | ForgotPassword | Public            |
| `/verify-code`     | VerifyCode     | Public            |
| `/reset-password`  | ResetPassword  | Public            |
| `/not-found`       | NotFound       | Public (404 page) |

---

## 5. Special Access Rules

### 5.1 SuperAdmin Privileges

- **SuperAdmin** can access **ALL** routes regardless of RoleGuard restrictions
- This is enforced in the RoleGuard component itself
- Case-insensitive matching: `SuperAdmin` or `superadmin` both work

### 5.2 Reports Page Internal Check

The `/reports` route has **internal role checking** (not using RoleGuard):

- **Required roles**: SalesManager, Salesman, SuperAdmin
- If user doesn't have access, redirects to `/dashboard`
- Additional internal checks for financial vs sales reports

### 5.3 Weekly Plans

- No RoleGuard on route
- Navigation config shows: Salesman, SalesManager, SuperAdmin
- **Note**: May need RoleGuard if navigation config is the source of truth

---

## 6. Role Access Summary by Role

### SuperAdmin

- ✅ **Access to ALL pages** (bypasses all guards)
- ✅ Can access any route in the application

### Admin / admin

- ✅ Dashboard, Profile, Notifications, Performance
- ✅ All Admin pages (users, create users, client accounts)
- ✅ Chat
- ❌ Sales Manager pages
- ❌ Sales Support pages
- ❌ Finance pages
- ❌ Legal pages
- ❌ Maintenance pages

### SalesManager

- ✅ Dashboard, Profile, Notifications, Performance
- ✅ All Sales Manager pages
- ✅ Sales Statistics, Analytics
- ✅ Sales Support Products Catalog
- ✅ Weekly Plans
- ✅ Reports (via internal check)
- ✅ Chat
- ❌ Admin pages
- ❌ Super Admin specific pages
- ❌ Finance pages
- ❌ Legal pages

### Salesman

- ✅ Dashboard, Profile, Notifications, Performance
- ✅ Deal Reports (`/salesman/deal-reports`)
- ✅ Weekly Plans
- ✅ Reports (via internal check)
- ❌ Sales Manager pages
- ❌ Admin pages
- ❌ Chat (not in allowed roles)

### SalesSupport

- ✅ Dashboard, Profile, Notifications, Performance
- ✅ Offer Creation
- ✅ Requests Inbox
- ✅ Products Catalog
- ✅ Sales Manager Clients
- ✅ Chat
- ❌ Sales Manager dashboard and management pages
- ❌ Admin pages

### FinanceManager / FinanceEmployee

- ✅ Dashboard, Profile, Notifications, Performance
- ✅ Accounting Dashboard
- ✅ Financial Reports
- ✅ Payment Details
- ❌ Sales pages
- ❌ Admin pages
- ❌ Maintenance pages

### LegalManager / LegalEmployee

- ✅ Dashboard, Profile, Notifications, Performance
- ✅ Legal Deals
- ❌ Sales pages
- ❌ Admin pages
- ❌ Finance pages

### MaintenanceSupport / MaintenanceManager

- ✅ Dashboard, Profile, Notifications, Performance
- ✅ Maintenance Support Dashboard
- ✅ Maintenance Request Details
- ❌ Sales pages
- ❌ Admin pages
- ❌ Finance pages

### Engineer

- ✅ Dashboard, Profile, Notifications, Performance
- ✅ Maintenance Request Details
- ✅ Maintenance Visits
- ❌ Sales pages
- ❌ Admin pages
- ❌ Finance pages

### SparePartsCoordinator

- ✅ Dashboard, Profile, Notifications, Performance
- ✅ Spare Parts Coordinator Dashboard
- ✅ Spare Parts Requests
- ❌ Sales pages
- ❌ Admin pages

### InventoryManager

- ✅ Dashboard, Profile, Notifications, Performance
- ✅ Inventory Manager Dashboard
- ✅ Spare Parts Requests
- ❌ Sales pages
- ❌ Admin pages

### Doctor / Engineer / Technician

- ❌ **BLOCKED FROM APPLICATION** - Cannot login at all

---

## 7. Security Implementation Details

### 7.1 Authentication Store Security

- JWT token stored in persisted Zustand store
- Session expiry tracking
- Account lockout after 5 failed login attempts (1-minute lockout)
- Automatic logout on 401/403 errors
- Role validation on login

### 7.2 Route Protection

- **RoleGuard** component wraps protected routes
- Checks authentication before role validation
- Case-insensitive role matching
- SuperAdmin bypass mechanism
- Redirects to appropriate pages on failure

### 7.3 Authorization Checks

- **App-level check**: `isAuthorizedToAccess()` runs on mount and auth state change
- **Route-level check**: RoleGuard validates roles per route
- **Component-level check**: Some components have internal role checks (e.g., ReportsScreen)

---

## 8. Recommendations

### 8.1 Potential Issues

1. **Weekly Plans** - No RoleGuard but navigation config restricts to Salesman, SalesManager, SuperAdmin

      - **Recommendation**: Add RoleGuard to match navigation config

2. **Reports Page** - Uses internal check instead of RoleGuard

      - **Recommendation**: Use RoleGuard for consistency

3. **Performance Page** - No RoleGuard, accessible to all

      - **Recommendation**: Consider if this should be restricted

4. **Notifications Page** - No RoleGuard, accessible to all
      - **Recommendation**: This is likely intentional, but verify

### 8.2 Consistency Improvements

- Standardize on RoleGuard for all protected routes
- Remove internal role checks in favor of RoleGuard
- Ensure navigation config matches route guards

---

## 9. Testing Checklist

- [ ] Verify restricted roles (Doctor, Engineer, Technician) cannot login
- [ ] Verify SuperAdmin can access all routes
- [ ] Test each role against their allowed pages
- [ ] Test unauthorized access redirects to /not-found
- [ ] Test unauthenticated access redirects to /login
- [ ] Verify case-insensitive role matching
- [ ] Test session expiry handling
- [ ] Test account lockout after 5 failed attempts

---

## 10. Files Referenced

- `Web/src/App.tsx` - Route definitions
- `Web/src/components/shared/RoleGuard.tsx` - Role guard component
- `Web/src/stores/authStore.ts` - Authentication store
- `Web/src/config/navigation.config.tsx` - Navigation configuration
- `Backend/SoitMed/Models/Core/UserRoles.cs` - Backend role definitions
- `Web/src/components/finance/ReportsScreen.tsx` - Reports with internal check

---

**Report Generated**: $(date)
**Application**: Soit-Med Web Dashboard
**Version**: Current
