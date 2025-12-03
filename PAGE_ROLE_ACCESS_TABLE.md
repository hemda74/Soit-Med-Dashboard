# Page Access Control - Quick Reference Table

## All Pages and Their Allowed Roles

| #   | Page Route                       | Page Name                     | Allowed Roles                                                                  | Guard Type     |
| --- | -------------------------------- | ----------------------------- | ------------------------------------------------------------------------------ | -------------- |
| 1   | `/dashboard`                     | Dashboard                     | **All authenticated users** (except Doctor, Engineer, Technician, Salesman)    | No Guard       |
| 2   | `/profile`                       | User Profile                  | **All authenticated users**                                                    | No Guard       |
| 3   | `/reports`                       | Reports                       | SalesManager, SuperAdmin                                                       | Internal Check |
| 4   | `/weekly-plans`                  | Weekly Plans                  | **All authenticated users**                                                    | No Guard       |
| 5   | `/notifications`                 | Notifications                 | **All authenticated users**                                                    | No Guard       |
| 6   | `/performance`                   | Performance                   | **All authenticated users**                                                    | No Guard       |
| 7   | `/sales-manager`                 | Sales Manager Dashboard       | SalesManager, **SuperAdmin**                                                   | RoleGuard      |
| 8   | `/sales-manager/targets`         | Sales Targets                 | SalesManager, **SuperAdmin**                                                   | RoleGuard      |
| 9   | `/sales-manager/reports-review`  | Reports Review                | SalesManager, **SuperAdmin**                                                   | RoleGuard      |
| 10  | `/sales-manager/deals`           | Deals Management              | SalesManager, **SuperAdmin**                                                   | RoleGuard      |
| 11  | `/sales-manager/deal-approvals`  | Deal Approvals                | SalesManager, **SuperAdmin**                                                   | RoleGuard      |
| 12  | `/sales-manager/offer-approvals` | Offer Approvals               | SalesManager, **SuperAdmin**                                                   | RoleGuard      |
| 13  | `/sales-manager/clients`         | Sales Clients                 | SalesManager, SalesSupport, **SuperAdmin**                                     | RoleGuard      |
| 14  | `/sales-manager/offers`          | Offers Management             | SalesManager, **SuperAdmin**                                                   | RoleGuard      |
| 15  | `/sales-manager/offers/:id/edit` | Edit Offer                    | SalesManager, **SuperAdmin**                                                   | RoleGuard      |
| 16  | `/sales-statistics`              | Sales Statistics              | SalesManager, **SuperAdmin**                                                   | RoleGuard      |
| 17  | `/sales-analytics`               | Sales Analytics               | SalesManager, **SuperAdmin**                                                   | RoleGuard      |
| 18  | `/sales-support/offer`           | Offer Creation                | SalesSupport, **SuperAdmin**                                                   | RoleGuard      |
| 20  | `/sales-support/requests`        | Requests Inbox                | SalesSupport, **SuperAdmin**                                                   | RoleGuard      |
| 21  | `/sales-support/products`        | Products Catalog              | SalesSupport, SalesManager, **SuperAdmin**                                     | RoleGuard      |
| 22  | `/chat`                          | Chat                          | Admin, admin, **SuperAdmin**, superadmin, SalesManager, SalesSupport, Customer | RoleGuard      |
| 23  | `/super-admin/deal-approvals`    | Super Admin Deal Approvals    | **SuperAdmin**                                                                 | RoleGuard      |
| 24  | `/legal/deals`                   | Legal Deals                   | LegalManager, LegalEmployee                                                    | RoleGuard      |
| 25  | `/admin/users`                   | Users List                    | Admin, admin, **SuperAdmin**, superadmin                                       | RoleGuard      |
| 26  | `/admin/create-role-user`        | Create Role User              | Admin, admin, **SuperAdmin**, superadmin                                       | RoleGuard      |
| 27  | `/admin/create-sales-support`    | Create Sales Support          | Admin, admin, **SuperAdmin**, superadmin                                       | RoleGuard      |
| 28  | `/admin/client-accounts`         | Client Account Creation       | Admin, admin, **SuperAdmin**, superadmin                                       | RoleGuard      |
| 29  | `/maintenance-support`           | Maintenance Support Dashboard | MaintenanceSupport, MaintenanceManager, **SuperAdmin**                         | RoleGuard      |
| 30  | `/maintenance/requests/:id`      | Maintenance Request Details   | MaintenanceSupport, MaintenanceManager, Engineer, **SuperAdmin**               | RoleGuard      |
| 31  | `/maintenance/visits`            | Maintenance Visits            | Engineer, MaintenanceManager, **SuperAdmin**                                   | RoleGuard      |
| 32  | `/maintenance/spare-parts`       | Spare Parts Requests          | SparePartsCoordinator, InventoryManager, Doctor, HospitalAdmin, **SuperAdmin** | RoleGuard      |
| 33  | `/spare-parts-coordinator`       | Spare Parts Coordinator       | SparePartsCoordinator, **SuperAdmin**                                          | RoleGuard      |
| 34  | `/inventory-manager`             | Inventory Manager             | InventoryManager, **SuperAdmin**                                               | RoleGuard      |
| 35  | `/accounting`                    | Accounting Dashboard          | FinanceManager, FinanceEmployee, **SuperAdmin**                                | RoleGuard      |
| 36  | `/accounting/reports`            | Financial Reports             | FinanceManager, FinanceEmployee, **SuperAdmin**                                | RoleGuard      |
| 37  | `/payments/:id`                  | Payment Details               | FinanceManager, FinanceEmployee, Doctor, HospitalAdmin, **SuperAdmin**         | RoleGuard      |

---

## Role Access Summary

### SuperAdmin

✅ **Can access ALL pages** (bypasses all RoleGuards)

### Admin / admin

✅ Dashboard, Profile, Notifications, Performance  
✅ `/admin/users`  
✅ `/admin/create-role-user`  
✅ `/admin/create-sales-support`  
✅ `/admin/client-accounts`  
✅ `/chat`  
❌ All other pages

### SalesManager

✅ Dashboard, Profile, Notifications, Performance  
✅ All `/sales-manager/*` pages  
✅ `/sales-statistics`, `/sales-analytics`  
✅ `/sales-support/products`  
✅ `/weekly-plans`  
✅ `/reports`  
✅ `/chat`  
❌ Admin pages, Super Admin pages, Finance, Legal, Maintenance

### Salesman

❌ **BLOCKED FROM APPLICATION** - Cannot login

### SalesSupport

✅ Dashboard, Profile, Notifications, Performance  
✅ `/sales-support/offer`  
✅ `/sales-support/requests`  
✅ `/sales-support/products`  
✅ `/sales-manager/clients`  
✅ `/chat`  
❌ All other pages

### FinanceManager / FinanceEmployee

✅ Dashboard, Profile, Notifications, Performance  
✅ `/accounting`  
✅ `/accounting/reports`  
✅ `/payments/:id`  
❌ All other pages

### LegalManager / LegalEmployee

✅ Dashboard, Profile, Notifications, Performance  
✅ `/legal/deals`  
❌ All other pages

### MaintenanceSupport / MaintenanceManager

✅ Dashboard, Profile, Notifications, Performance  
✅ `/maintenance-support`  
✅ `/maintenance/requests/:id`  
❌ All other pages

### Engineer

✅ Dashboard, Profile, Notifications, Performance  
✅ `/maintenance/requests/:id`  
✅ `/maintenance/visits`  
❌ All other pages

### SparePartsCoordinator

✅ Dashboard, Profile, Notifications, Performance  
✅ `/spare-parts-coordinator`  
✅ `/maintenance/spare-parts`  
❌ All other pages

### InventoryManager

✅ Dashboard, Profile, Notifications, Performance  
✅ `/inventory-manager`  
✅ `/maintenance/spare-parts`  
❌ All other pages

### Salesman / Doctor / Engineer / Technician

❌ **BLOCKED FROM APPLICATION** - Cannot login

---

## Authentication & Authorization Flow

1. **Login** → User submits credentials
2. **Backend Validation** → JWT token issued with roles
3. **Role Check** → Restricted roles (Doctor, Engineer, Technician, Salesman) blocked
4. **Route Access** → RoleGuard checks user roles against required roles
5. **SuperAdmin Bypass** → SuperAdmin can access any route
6. **Access Denied** → Redirect to `/not-found` if role check fails

---

## Key Security Features

- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Case-insensitive role matching
- ✅ SuperAdmin bypass mechanism
- ✅ Account lockout (5 failed attempts, 1-minute lockout)
- ✅ Session expiry tracking
- ✅ Automatic logout on 401/403 errors
- ✅ Restricted roles blocked at login

---

**Note**: SuperAdmin is shown in **bold** in the "Allowed Roles" column to indicate it can access that page regardless of other restrictions.
