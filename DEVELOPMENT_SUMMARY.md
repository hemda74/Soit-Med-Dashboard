# Complete Development Summary - Maintenance & Payment Modules

## Overview

This document summarizes the **complete backend and frontend development work** completed for the Maintenance and Payment modules. The backend implementation is the foundation and is documented first, followed by the frontend implementation.

---

# Backend Implementation ✅

## Overview

Complete backend implementation of Maintenance and Payment modules following Repository Pattern, Service Layer Pattern, and RESTful API design. All modules are fully integrated with the existing codebase, including database context, dependency injection, notifications, and authorization.

---

## Phase 1: Database Models & Enums ✅

### New Models Created:

#### Maintenance Module Models:

1. **`Backend/SoitMed/Models/Equipment/MaintenanceRequest.cs`**

      - Core entity for maintenance requests
      - Properties: Customer, Equipment, Status, Assigned Engineer, Payment info, Timestamps
      - Navigation: Attachments, Visits, Payments, Ratings

2. **`Backend/SoitMed/Models/Equipment/MaintenanceVisit.cs`**

      - Records maintenance visits by engineers
      - Properties: QR Code, Serial Code, Report, Actions Taken, Service Fee, Outcome
      - Links to MaintenanceRequest and SparePartRequest

3. **`Backend/SoitMed/Models/Equipment/MaintenanceRequestAttachment.cs`**

      - File attachments for maintenance requests
      - Properties: File Path, File Name, File Type, Attachment Type, Description

4. **`Backend/SoitMed/Models/Equipment/SparePartRequest.cs`**

      - Spare part requests workflow
      - Properties: Part details, Pricing (Original, Company, Customer), Status, Approval workflow
      - Links to MaintenanceRequest and MaintenanceVisit

5. **`Backend/SoitMed/Models/Equipment/MaintenanceRequestRating.cs`**
      - Customer ratings for completed maintenance requests
      - Properties: Rating (1-5), Comment, Customer, Engineer

#### Payment Module Models:

1. **`Backend/SoitMed/Models/Payment/Payment.cs`**

      - Core payment entity
      - Properties: Amount, Payment Method, Status, Transaction ID, Payment Reference
      - Links to MaintenanceRequest and SparePartRequest
      - Accounting fields: ProcessedBy, ProcessedAt, AccountingNotes

2. **`Backend/SoitMed/Models/Payment/PaymentTransaction.cs`**

      - Audit trail for payment activities
      - Properties: Transaction Type, Amount, Status, Description, Metadata

3. **`Backend/SoitMed/Models/Payment/PaymentGatewayConfig.cs`**
      - Configuration for payment gateways (Stripe, PayPal, Local)
      - Properties: Gateway Name, API Keys, Configuration (JSON)

### Enums Created/Updated:

- **`Backend/SoitMed/Models/Enums/MaintenanceRequestStatus.cs`**

     - Pending, Assigned, InProgress, NeedsSecondVisit, NeedsSparePart, WaitingForSparePart, WaitingForCustomerApproval, Completed, Cancelled, OnHold

- **`Backend/SoitMed/Models/Enums/MaintenanceVisitOutcome.cs`**

     - Completed, NeedsSecondVisit, NeedsSparePart

- **`Backend/SoitMed/Models/Enums/SparePartAvailabilityStatus.cs`**

     - Pending, AvailableLocally, GlobalOrderRequired, PriceSet, WaitingForCustomerApproval, CustomerApproved, CustomerRejected, Ordered, ReadyForEngineer, DeliveredToEngineer, Cancelled

- **`Backend/SoitMed/Models/Enums/PaymentMethod.cs`**

     - Cash, BankTransfer, Stripe, PayPal, LocalGateway, Other

- **`Backend/SoitMed/Models/Enums/PaymentStatus.cs`**
     - Pending, Processing, Completed, Failed, Refunded, Rejected

### Model Updates:

- **`Backend/SoitMed/Models/Context.cs`**

     - Added DbSet properties for all new entities
     - Configured relationships with proper foreign keys
     - Set decimal precision for financial fields
     - Configured OnDelete behaviors to prevent cascade cycles (NoAction/Restrict for AspNetUsers relationships)

- **`Backend/SoitMed/Models/Core/UserRoles.cs`**

     - Added new roles: `SparePartsCoordinator`, `InventoryManager`

- **`Backend/SoitMed/Models/Equipment/Equipment.cs`**
     - Made `HospitalId` nullable
     - Added `CustomerId` (nullable) for direct customer equipment ownership

---

## Phase 2: Repositories ✅

### Repository Pattern Implementation:

#### Maintenance Module Repositories:

1. **`Backend/SoitMed/Repositories/IMaintenanceRequestRepository.cs`**

      - Interface for maintenance request data operations
      - Methods: `GetByQRCodeAsync`, `GetByHospitalIdAsync`, `GetByStatusAsync`, `GetByCustomerIdAsync`, `GetByEngineerIdAsync`, `GetPendingRequestsAsync`

2. **`Backend/SoitMed/Repositories/MaintenanceRequestRepository.cs`**

      - Implementation of `IMaintenanceRequestRepository`
      - Extends `BaseRepository<MaintenanceRequest>`
      - Custom queries for filtering and searching

3. **`Backend/SoitMed/Repositories/IMaintenanceVisitRepository.cs`**

      - Interface for maintenance visit operations
      - Methods: `GetByRequestIdAsync`, `GetByEngineerIdAsync`

4. **`Backend/SoitMed/Repositories/MaintenanceVisitRepository.cs`**

      - Implementation of `IMaintenanceVisitRepository`

5. **`Backend/SoitMed/Repositories/ISparePartRequestRepository.cs`**

      - Interface for spare part request operations
      - Methods: `GetByMaintenanceRequestIdAsync`, `GetByStatusAsync`

6. **`Backend/SoitMed/Repositories/SparePartRequestRepository.cs`**

      - Implementation of `ISparePartRequestRepository`

7. **`Backend/SoitMed/Repositories/IMaintenanceRequestAttachmentRepository.cs`**

      - Interface for attachment operations
      - Methods: `GetByRequestIdAsync`, `GetByAttachmentTypeAsync`

8. **`Backend/SoitMed/Repositories/MaintenanceRequestAttachmentRepository.cs`**
      - Implementation of `IMaintenanceRequestAttachmentRepository`

#### Payment Module Repositories:

1. **`Backend/SoitMed/Repositories/IPaymentRepository.cs`**

      - Interface for payment operations
      - Methods: `GetByCustomerIdAsync`, `GetByStatusAsync`, `GetByMaintenanceRequestIdAsync`, `GetBySparePartRequestIdAsync`, `GetPendingPaymentsAsync`, `GetOutstandingPaymentsAsync`

2. **`Backend/SoitMed/Repositories/PaymentRepository.cs`**
      - Implementation of `IPaymentRepository`

### UnitOfWork Updates:

- **`Backend/SoitMed/Repositories/IUnitOfWork.cs`**

     - Added properties: `MaintenanceRequests`, `MaintenanceVisits`, `SparePartRequests`, `Payments`, `MaintenanceRequestAttachments`

- **`Backend/SoitMed/Repositories/UnitOfWork.cs`**
     - Initialized all new repositories with `_context`
     - Ensured proper transaction management

---

## Phase 3: DTOs (Data Transfer Objects) ✅

### Maintenance DTOs (`Backend/SoitMed/DTO/MaintenanceDTOs.cs`):

1. **`CreateMaintenanceRequestDTO`**

      - EquipmentId, Description, Symptoms

2. **`MaintenanceRequestResponseDTO`**

      - Complete request details with customer, equipment, engineer, payment info, attachments, visits

3. **`CreateMaintenanceVisitDTO`**

      - MaintenanceRequestId, QR Code, Serial Code, Report, Actions Taken, Parts Used, Service Fee, Outcome, Notes

4. **`MaintenanceVisitResponseDTO`**

      - Complete visit details with engineer info and timestamps

5. **`CreateSparePartRequestDTO`**

      - MaintenanceRequestId, MaintenanceVisitId, Part Name, Part Number, Description, Manufacturer

6. **`SparePartRequestResponseDTO`**

      - Complete spare part details with pricing, status, approval workflow

7. **`UpdateSparePartPriceDTO`**

      - CompanyPrice, CustomerPrice

8. **`CustomerSparePartDecisionDTO`**

      - Approved (bool), RejectionReason

9. **`MaintenanceRequestAttachmentDTO`** & **`CreateMaintenanceRequestAttachmentDTO`**

      - File upload and retrieval DTOs

10. **`AssignMaintenanceRequestDTO`**
       - EngineerId

### Payment DTOs (`Backend/SoitMed/DTO/PaymentDTOs.cs`):

1. **`CreatePaymentDTO`**

      - MaintenanceRequestId, SparePartRequestId, Amount, PaymentMethod

2. **`PaymentResponseDTO`**

      - Complete payment details with customer, status, transaction info, accounting info

3. **`ProcessPaymentDTO`** (Base)

      - PaymentReference

4. **`CashPaymentDTO`** : `ProcessPaymentDTO`

      - ReceiptNumber

5. **`BankTransferDTO`** : `ProcessPaymentDTO`

      - BankName, BankReference, AccountNumber

6. **`StripePaymentDTO`**

      - Token, Description

7. **`PayPalPaymentDTO`**

      - PaymentId, Description

8. **`LocalGatewayPaymentDTO`**

      - GatewayName, PaymentToken, Description

9. **`ConfirmPaymentDTO`**

      - Notes

10. **`RejectPaymentDTO`**

       - Reason

11. **`RefundDTO`**

       - Amount (optional, null = full refund), Reason

12. **`FinancialReportDTO`**

       - ReportDate, TotalRevenue, TotalPayments, OutstandingPayments, TotalTransactions, RevenueByPaymentMethod, CountByPaymentMethod

13. **`PaymentMethodStatisticsDTO`**

       - PaymentMethod, Count, TotalAmount, AverageAmount, SuccessCount, FailedCount, SuccessRate

14. **`PaymentFiltersDTO`**
       - Status, PaymentMethod, CustomerId, FromDate, ToDate, MaintenanceRequestId, SparePartRequestId, Pagination

---

## Phase 4: Services (Business Logic) ✅

### Maintenance Services:

1. **`Backend/SoitMed/Services/IMaintenanceRequestService.cs`**

      - Interface for maintenance request business logic

2. **`Backend/SoitMed/Services/MaintenanceRequestService.cs`**

      - **Key Methods:**
           - `CreateMaintenanceRequestAsync` - Creates request, auto-assigns if possible, sends notifications
           - `GetMaintenanceRequestAsync` - Gets request with all related data
           - `GetCustomerRequestsAsync` - Customer's requests with filtering
           - `GetEngineerRequestsAsync` - Engineer's assigned requests
           - `GetMaintenanceSupportRequestsAsync` - All requests for support team
           - `AssignEngineerToRequestAsync` - Manual assignment with notifications
           - `UpdateStatusAsync` - Status updates with workflow logic
           - `TryAutoAssignToEngineerAsync` - **Auto-assignment logic** based on equipment location and engineer workload
      - **Features:**
           - Auto-assignment based on location proximity
           - Workload balancing (assigns to engineer with fewer pending requests)
           - Notification integration
           - Payment status tracking

3. **`Backend/SoitMed/Services/IMaintenanceVisitService.cs`**

      - Interface for maintenance visit operations

4. **`Backend/SoitMed/Services/MaintenanceVisitService.cs`**

      - **Key Methods:**
           - `CreateMaintenanceVisitAsync` - Creates visit, updates request status
           - `GetMaintenanceVisitAsync` - Gets visit details
           - `GetVisitsByRequestAsync` - All visits for a request
           - `UpdateMaintenanceVisitAsync` - Updates visit details
           - `DeleteMaintenanceVisitAsync` - Soft delete
      - **Features:**
           - Automatic status updates based on visit outcome
           - Spare part request creation trigger

5. **`Backend/SoitMed/Services/ISparePartRequestService.cs`**

      - Interface for spare part operations

6. **`Backend/SoitMed/Services/SparePartRequestService.cs`**

      - **Key Methods:**
           - `CreateSparePartRequestAsync` - Creates spare part request
           - `ProcessSparePartAvailabilityAsync` - Checks availability (local/global)
           - `SetSparePartPriceAsync` - Sets company and customer prices (Inventory Manager)
           - `CustomerDecisionAsync` - Handles customer approval/rejection
           - `MarkAsReadyForEngineerAsync` - Marks as ready for pickup
           - `MarkAsDeliveredToEngineerAsync` - Marks as delivered
      - **Features:**
           - Complete workflow from request to delivery
           - Price setting with approval workflow
           - Customer decision handling

7. **`Backend/SoitMed/Services/IMaintenanceAttachmentService.cs`**

      - Interface for file operations

8. **`Backend/SoitMed/Services/MaintenanceAttachmentService.cs`**
      - **Key Methods:**
           - `UploadAttachmentAsync` - Uploads file, validates type and size
           - `DeleteAttachmentAsync` - Deletes file and database record
           - `GetAttachmentAsync` - Gets attachment details
           - `GetAttachmentsByRequestAsync` - All attachments for a request
      - **Features:**
           - File validation (type, size)
           - Secure file storage using `IWebHostEnvironment`
           - File type detection

### Payment Services:

1. **`Backend/SoitMed/Services/IPaymentService.cs`**

      - Interface for payment operations

2. **`Backend/SoitMed/Services/PaymentService.cs`**

      - **Key Methods:**
           - `CreatePaymentAsync` - Creates payment record
           - `ProcessPaymentAsync` - Generic payment processing
           - `ProcessStripePaymentAsync` - Stripe integration (placeholder)
           - `ProcessPayPalPaymentAsync` - PayPal integration (placeholder)
           - `ProcessLocalGatewayPaymentAsync` - Local gateway integration (placeholder)
           - `RecordCashPaymentAsync` - Records cash payment
           - `RecordBankTransferAsync` - Records bank transfer
           - `ProcessRefundAsync` - Processes refunds
           - `GetPaymentAsync` - Gets payment details
           - `GetCustomerPaymentsAsync` - Customer's payment history
           - `CreatePaymentTransactionAsync` - **Private method** for audit trail
      - **Features:**
           - Multiple payment method support
           - Payment gateway integration placeholders
           - Transaction audit trail
           - Notification integration

3. **`Backend/SoitMed/Services/IAccountingService.cs`**

      - Interface for accounting operations

4. **`Backend/SoitMed/Services/AccountingService.cs`**
      - **Key Methods:**
           - `ConfirmPaymentAsync` - Confirms payment (Finance Manager/Employee)
           - `RejectPaymentAsync` - Rejects payment with reason
           - `GetPendingPaymentsAsync` - All pending payments
           - `GetPaymentsByDateRangeAsync` - Filtered payments
           - `GetPaymentDetailsAsync` - Detailed payment info
           - `GetDailyReportAsync` - Daily financial report
           - `GetMonthlyReportAsync` - Monthly financial report
           - `GetYearlyReportAsync` - Yearly financial report
           - `GetPaymentMethodStatsAsync` - Payment method statistics
           - `GetOutstandingPaymentsAsync` - Outstanding payments list
           - `GetMaintenancePaymentsAsync` - Maintenance-related payments
           - `GetSparePartsPaymentsAsync` - Spare parts-related payments
      - **Features:**
           - Comprehensive financial reporting
           - Payment method analytics
           - Outstanding payment tracking
           - Revenue analytics

### Service Registration:

- **`Backend/SoitMed/Extensions/ServiceCollectionExtensions.cs`**
     - Registered all new services in DI container:
          - `IMaintenanceRequestService` → `MaintenanceRequestService`
          - `IMaintenanceVisitService` → `MaintenanceVisitService`
          - `ISparePartRequestService` → `SparePartRequestService`
          - `IMaintenanceAttachmentService` → `MaintenanceAttachmentService`
          - `IPaymentService` → `PaymentService`
          - `IAccountingService` → `AccountingService`

---

## Phase 5: Controllers (API Endpoints) ✅

### Maintenance Controllers:

1. **`Backend/SoitMed/Controllers/MaintenanceRequestController.cs`**

      - **Endpoints:**
           - `POST /api/MaintenanceRequest` - Create request (Customer)
           - `GET /api/MaintenanceRequest/{id}` - Get request details
           - `GET /api/MaintenanceRequest/customer/my-requests` - Customer's requests
           - `GET /api/MaintenanceRequest/engineer/my-assigned` - Engineer's assigned requests
           - `GET /api/MaintenanceRequest/pending` - Pending requests (Maintenance Support)
           - `POST /api/MaintenanceRequest/{id}/assign` - Assign engineer
           - `PUT /api/MaintenanceRequest/{id}/status` - Update status
      - **Authorization:** Role-based using `[Authorize(Roles = "...")]`

2. **`Backend/SoitMed/Controllers/MaintenanceVisitController.cs`**

      - **Endpoints:**
           - `POST /api/MaintenanceVisit` - Create visit (Engineer)
           - `GET /api/MaintenanceVisit/{id}` - Get visit details
           - `GET /api/MaintenanceVisit/request/{requestId}` - Visits by request
           - `GET /api/MaintenanceVisit/engineer/{engineerId}` - Visits by engineer
           - `PUT /api/MaintenanceVisit/{id}` - Update visit
           - `DELETE /api/MaintenanceVisit/{id}` - Delete visit
      - **Authorization:** Engineer, MaintenanceManager, SuperAdmin

3. **`Backend/SoitMed/Controllers/SparePartRequestController.cs`**

      - **Endpoints:**
           - `POST /api/SparePartRequest` - Create spare part request
           - `GET /api/SparePartRequest/{id}` - Get request details
           - `POST /api/SparePartRequest/{id}/check-availability` - Check availability (Coordinator)
           - `PUT /api/SparePartRequest/{id}/set-price` - Set price (Inventory Manager)
           - `POST /api/SparePartRequest/{id}/customer-approval` - Customer approval/rejection
      - **Authorization:** Role-based for each operation

4. **`Backend/SoitMed/Controllers/MaintenanceAttachmentController.cs`** (Implied)
      - **Endpoints:**
           - `POST /api/MaintenanceAttachment/upload` - Upload attachment
           - `GET /api/MaintenanceAttachment/{id}` - Get attachment
           - `GET /api/MaintenanceAttachment/request/{requestId}` - Attachments by request
           - `DELETE /api/MaintenanceAttachment/{id}` - Delete attachment

### Payment Controllers:

1. **`Backend/SoitMed/Controllers/PaymentController.cs`**

      - **Endpoints:**
           - `POST /api/Payment` - Create payment (Customer)
           - `GET /api/Payment/{id}` - Get payment details
           - `GET /api/Payment/customer/my-payments` - Customer's payments
           - `POST /api/Payment/{id}/stripe` - Process Stripe payment
           - `POST /api/Payment/{id}/paypal` - Process PayPal payment
           - `POST /api/Payment/{id}/cash` - Record cash payment
           - `POST /api/Payment/{id}/bank-transfer` - Record bank transfer
           - `POST /api/Payment/{id}/refund` - Process refund
      - **Authorization:** Customer, Finance roles, SuperAdmin

2. **`Backend/SoitMed/Controllers/AccountingController.cs`**
      - **Endpoints:**
           - `GET /api/Accounting/payments/pending` - Pending payments
           - `GET /api/Accounting/payments` - All payments (filtered)
           - `GET /api/Accounting/payments/{id}` - Payment details
           - `POST /api/Accounting/payments/{id}/confirm` - Confirm payment
           - `POST /api/Accounting/payments/{id}/reject` - Reject payment
           - `GET /api/Accounting/reports/daily` - Daily report
           - `GET /api/Accounting/reports/monthly` - Monthly report
           - `GET /api/Accounting/reports/yearly` - Yearly report
           - `GET /api/Accounting/statistics/payment-methods` - Payment method statistics
           - `GET /api/Accounting/statistics/outstanding` - Outstanding payments
           - `GET /api/Accounting/maintenance/payments` - Maintenance payments
           - `GET /api/Accounting/spare-parts/payments` - Spare parts payments
      - **Authorization:** FinanceManager, FinanceEmployee, SuperAdmin

---

## Phase 6: Database Migrations & Configuration ✅

### Migration Issues Resolved:

1. **Foreign Key Cascade Cycles:**

      - **Problem:** Multiple cascade paths detected for AspNetUsers relationships
      - **Solution:** Changed `OnDelete` behavior to `DeleteBehavior.NoAction` or `DeleteBehavior.Restrict` for:
           - `MaintenanceRequest.AssignedToEngineerId`
           - `SparePartRequest.AssignedToCoordinatorId`
           - `SparePartRequest.AssignedToInventoryManagerId`
           - `SparePartRequest.PriceSetByManagerId`
           - `MaintenanceVisit.SparePartRequestId`
           - `Payment.SparePartRequestId`

2. **Decimal Precision:**

      - Configured `decimal(18,2)` for all financial fields (Amount, Price, Service Fee)

3. **Nullable Fields:**
      - Properly configured nullable foreign keys for optional relationships

### Database Schema:

- All new tables created with proper indexes
- Foreign key relationships configured
- Cascade delete behaviors set appropriately
- Timestamps and audit fields included

---

## Phase 7: Integration & Notifications ✅

### Notification Service Integration:

- **`Backend/SoitMed/Services/NotificationService.cs`** (Updated)
     - Modified `SendNotificationAsync` to support role-based notifications
     - Added metadata support for notifications
     - Integrated with all new services:
          - Maintenance request creation → Customer & Support notifications
          - Engineer assignment → Engineer notification
          - Status updates → Customer notifications
          - Spare part price set → Customer notification
          - Payment created → Customer & Finance notifications
          - Payment confirmed/rejected → Customer notification

### File Upload Service:

- **`Backend/SoitMed/Services/MaintenanceAttachmentService.cs`**
     - Uses `IWebHostEnvironment` for file storage
     - Validates file types and sizes
     - Stores files in `wwwroot/uploads/maintenance-attachments/`
     - Returns file paths for API responses

---

## Backend Features Summary ✅

### Maintenance Module:

✅ Complete CRUD operations for maintenance requests
✅ Auto-assignment algorithm (location-based, workload-balanced)
✅ Manual engineer assignment
✅ Maintenance visit tracking with outcomes
✅ Spare part request workflow (request → availability check → pricing → approval → delivery)
✅ File attachment management
✅ Status workflow management
✅ Payment integration
✅ Notification integration
✅ Role-based authorization

### Payment Module:

✅ Multiple payment methods (Cash, Bank Transfer, Stripe, PayPal, Local Gateway)
✅ Payment gateway integration placeholders
✅ Payment processing and status tracking
✅ Refund processing
✅ Transaction audit trail
✅ Notification integration
✅ Role-based authorization

### Accounting Module:

✅ Payment confirmation/rejection workflow
✅ Financial reporting (Daily, Monthly, Yearly)
✅ Payment method statistics
✅ Outstanding payment tracking
✅ Revenue analytics
✅ Maintenance vs Spare Parts payment categorization
✅ Role-based authorization

---

## Backend File Structure

```
Backend/SoitMed/
├── Models/
│   ├── Equipment/
│   │   ├── MaintenanceRequest.cs
│   │   ├── MaintenanceVisit.cs
│   │   ├── MaintenanceRequestAttachment.cs
│   │   ├── SparePartRequest.cs
│   │   └── MaintenanceRequestRating.cs
│   ├── Payment/
│   │   ├── Payment.cs
│   │   ├── PaymentTransaction.cs
│   │   └── PaymentGatewayConfig.cs
│   ├── Enums/
│   │   ├── MaintenanceRequestStatus.cs
│   │   ├── MaintenanceVisitOutcome.cs
│   │   ├── SparePartAvailabilityStatus.cs
│   │   ├── PaymentMethod.cs
│   │   └── PaymentStatus.cs
│   ├── Context.cs (Modified)
│   ├── Core/UserRoles.cs (Modified)
│   └── Equipment/Equipment.cs (Modified)
├── Repositories/
│   ├── IMaintenanceRequestRepository.cs
│   ├── MaintenanceRequestRepository.cs
│   ├── IMaintenanceVisitRepository.cs
│   ├── MaintenanceVisitRepository.cs
│   ├── ISparePartRequestRepository.cs
│   ├── SparePartRequestRepository.cs
│   ├── IMaintenanceRequestAttachmentRepository.cs
│   ├── MaintenanceRequestAttachmentRepository.cs
│   ├── IPaymentRepository.cs
│   ├── PaymentRepository.cs
│   ├── IUnitOfWork.cs (Modified)
│   └── UnitOfWork.cs (Modified)
├── Services/
│   ├── IMaintenanceRequestService.cs
│   ├── MaintenanceRequestService.cs
│   ├── IMaintenanceVisitService.cs
│   ├── MaintenanceVisitService.cs
│   ├── ISparePartRequestService.cs
│   ├── SparePartRequestService.cs
│   ├── IMaintenanceAttachmentService.cs
│   ├── MaintenanceAttachmentService.cs
│   ├── IPaymentService.cs
│   ├── PaymentService.cs
│   ├── IAccountingService.cs
│   ├── AccountingService.cs
│   └── NotificationService.cs (Modified)
├── Controllers/
│   ├── MaintenanceRequestController.cs
│   ├── MaintenanceVisitController.cs
│   ├── SparePartRequestController.cs
│   ├── PaymentController.cs
│   └── AccountingController.cs
├── DTO/
│   ├── MaintenanceDTOs.cs
│   └── PaymentDTOs.cs
└── Extensions/
    └── ServiceCollectionExtensions.cs (Modified)
```

---

# Frontend Implementation ✅

## Overview

This document summarizes the frontend development work completed for the Maintenance and Payment modules in the Web App.

---

## Phase 1: TypeScript Types & API Services ✅

### Files Created:

#### Type Definitions:

- `Web/src/types/maintenance.types.ts`

     - Enums: `MaintenanceRequestStatus`, `MaintenanceVisitOutcome`, `SparePartAvailabilityStatus`, `AttachmentType`
     - DTOs: `CreateMaintenanceRequestDTO`, `MaintenanceRequestResponseDTO`, `CreateMaintenanceVisitDTO`, `MaintenanceVisitResponseDTO`, `CreateSparePartRequestDTO`, `SparePartRequestResponseDTO`, `UpdateSparePartPriceDTO`, `CustomerSparePartDecisionDTO`, `MaintenanceRequestAttachmentResponseDTO`, `CreateMaintenanceRequestAttachmentDTO`, `AssignMaintenanceRequestDTO`
     - Filter interfaces and paginated response types

- `Web/src/types/payment.types.ts`
     - Enums: `PaymentMethod`, `PaymentStatus`
     - DTOs: `CreatePaymentDTO`, `PaymentResponseDTO`, `ProcessPaymentDTO`, `CashPaymentDTO`, `BankTransferDTO`, `StripePaymentDTO`, `PayPalPaymentDTO`, `LocalGatewayPaymentDTO`, `ConfirmPaymentDTO`, `RejectPaymentDTO`, `RefundDTO`, `FinancialReportDTO`, `PaymentMethodStatisticsDTO`
     - Filter interfaces and paginated response types

#### API Services:

- `Web/src/services/maintenance/maintenanceApi.ts`

     - Methods for Maintenance Requests (create, get, assign, filter)
     - Methods for Maintenance Visits (create, get, list by request)
     - Methods for Spare Part Requests (create, check availability, set price, customer decision)
     - Methods for Attachments (upload, get, delete, list by request)

- `Web/src/services/payment/paymentApi.ts`

     - Methods for Payments (create, get, process various payment methods, refund)

- `Web/src/services/accounting/accountingApi.ts`
     - Methods for Accounting (pending payments, confirm/reject, reports, statistics)

#### React Query Hooks:

- `Web/src/hooks/useMaintenanceQueries.ts`

     - Hooks for fetching maintenance data
     - Mutation hooks for creating/updating maintenance records

- `Web/src/hooks/usePaymentQueries.ts`
     - Hooks for fetching payment data
     - Mutation hooks for processing payments and generating reports

#### Service Exports:

- `Web/src/services/maintenance/index.ts`
- `Web/src/services/payment/index.ts`
- `Web/src/services/accounting/index.ts`

---

## Phase 2: Web App Components ✅

### Dashboard Components:

#### Maintenance Module:

1. **MaintenanceSupportDashboard** (`Web/src/components/maintenance/MaintenanceSupportDashboard.tsx`)

      - Tabs: Pending Requests, All Requests, Spare Part Requests, Engineers
      - Features:
           - View and filter maintenance requests
           - Assign engineers to requests
           - View request statistics
           - Search and filter functionality

2. **MaintenanceRequestDetails** (`Web/src/components/maintenance/MaintenanceRequestDetails.tsx`)

      - Comprehensive view of maintenance request details
      - Status timeline visualization
      - Customer and equipment information
      - Maintenance visits history
      - Attachments gallery
      - Payment information sidebar

3. **MaintenanceVisitManagement** (`Web/src/components/maintenance/MaintenanceVisitManagement.tsx`)

      - Engineer's view of their maintenance visits
      - Create new maintenance visits
      - Filter visits by request ID
      - View visit details (report, actions taken, service fee)

4. **SparePartRequestManagement** (`Web/src/components/maintenance/SparePartRequestManagement.tsx`)
      - View all spare part requests
      - Set prices (Inventory Manager role)
      - Customer approval/rejection (Customer roles)
      - Status tracking with badges

#### Reusable Components:

- **StatusBadge** (`Web/src/components/maintenance/StatusBadge.tsx`)

     - Displays maintenance request status with appropriate styling

- **StatusTimeline** (`Web/src/components/maintenance/StatusTimeline.tsx`)
     - Visual timeline showing status progression
     - Delivery-style tracking interface

#### Accounting Module:

1. **AccountingDashboard** (`Web/src/components/accounting/AccountingDashboard.tsx`)

      - Tabs: Pending Payments, All Payments, Financial Reports, Payment Statistics
      - Features:
           - View pending payments
           - Confirm/reject payments
           - View outstanding payments
           - Daily financial reports
           - Payment statistics

2. **FinancialReportsScreen** (`Web/src/components/accounting/FinancialReportsScreen.tsx`)
      - Daily Report: Financial summary for a specific date
      - Monthly Report: Financial summary for a specific month
      - Yearly Report: Financial summary for a specific year
      - Payment Statistics: Payment method statistics within a date range

#### Payment Module:

1. **PaymentDetailsView** (`Web/src/components/payment/PaymentDetailsView.tsx`)
      - Comprehensive payment details view
      - Customer information
      - Payment method and status
      - Transaction details
      - Related maintenance/spare part request links
      - Processing information

---

## Phase 3: Routes & Navigation ✅

### Routes Added (`Web/src/App.tsx`):

```tsx
// Maintenance Routes
/maintenance-support                    // Maintenance Support Dashboard
/maintenance/requests/:id              // Maintenance Request Details
/maintenance/visits                    // Maintenance Visit Management
/maintenance/spare-parts               // Spare Part Request Management

// Accounting Routes
/accounting                            // Accounting Dashboard
/accounting/reports                    // Financial Reports Screen

// Payment Routes
/payments/:id                          // Payment Details View
```

### Navigation Updates (`Web/src/components/layout/AppSidebar.tsx`):

- Added Maintenance Module menu items:
     - Maintenance Support Dashboard (for MaintenanceSupport, MaintenanceManager, SuperAdmin)
- Added Finance Module menu items:

     - Accounting Dashboard (for FinanceManager, FinanceEmployee, SuperAdmin)
     - Financial Reports (for SuperAdmin in categorized view)

- Organized menu structure:
     - SuperAdmin: Categorized modules (Admin, Sales, Maintenance, Finance)
     - Other roles: Flat menu structure with role-specific items

---

## Component Exports

### Maintenance Components (`Web/src/components/maintenance/index.ts`):

```typescript
export { default as MaintenanceSupportDashboard };
export { default as MaintenanceRequestDetails };
export { default as MaintenanceVisitManagement };
export { default as SparePartRequestManagement };
export { StatusBadge };
export { StatusTimeline };
```

### Accounting Components (`Web/src/components/accounting/index.ts`):

```typescript
export { default as AccountingDashboard };
export { default as FinancialReportsScreen };
```

### Payment Components (`Web/src/components/payment/index.ts`):

```typescript
export { default as PaymentDetailsView };
```

---

## API Endpoints Configuration

### Endpoints Added (`Web/src/services/shared/endpoints.ts`):

#### Maintenance Module:

- `/api/MaintenanceRequest` - Base endpoint for maintenance requests
- `/api/MaintenanceRequest/{id}` - Get request by ID
- `/api/MaintenanceRequest/customer/my-requests` - Customer's requests
- `/api/MaintenanceRequest/engineer/my-assigned` - Engineer's assigned requests
- `/api/MaintenanceRequest/pending` - Pending requests
- `/api/MaintenanceRequest/{id}/assign` - Assign engineer

- `/api/MaintenanceVisit` - Base endpoint for visits
- `/api/MaintenanceVisit/request/{requestId}` - Visits by request
- `/api/MaintenanceVisit/engineer/{engineerId}` - Visits by engineer

- `/api/MaintenanceAttachment/upload` - Upload attachment
- `/api/MaintenanceAttachment/{id}` - Get attachment
- `/api/MaintenanceAttachment/request/{requestId}` - Attachments by request
- `/api/MaintenanceAttachment/{id}` - Delete attachment

- `/api/SparePartRequest` - Base endpoint for spare parts
- `/api/SparePartRequest/{id}/check-availability` - Check availability
- `/api/SparePartRequest/{id}/set-price` - Set price
- `/api/SparePartRequest/{id}/customer-approval` - Customer approval

#### Payment Module:

- `/api/Payment` - Base endpoint for payments
- `/api/Payment/{id}` - Get payment by ID
- `/api/Payment/customer/my-payments` - Customer's payments
- `/api/Payment/{id}/stripe` - Process Stripe payment
- `/api/Payment/{id}/paypal` - Process PayPal payment
- `/api/Payment/{id}/cash` - Record cash payment
- `/api/Payment/{id}/bank-transfer` - Record bank transfer
- `/api/Payment/{id}/refund` - Process refund

#### Accounting Module:

- `/api/Accounting/payments/pending` - Pending payments
- `/api/Accounting/payments` - All payments with filters
- `/api/Accounting/payments/{id}` - Payment details
- `/api/Accounting/payments/{id}/confirm` - Confirm payment
- `/api/Accounting/payments/{id}/reject` - Reject payment
- `/api/Accounting/reports/daily` - Daily report
- `/api/Accounting/reports/monthly` - Monthly report
- `/api/Accounting/reports/yearly` - Yearly report
- `/api/Accounting/statistics/payment-methods` - Payment method statistics
- `/api/Accounting/statistics/outstanding` - Outstanding payments
- `/api/Accounting/maintenance/payments` - Maintenance payments
- `/api/Accounting/spare-parts/payments` - Spare parts payments

---

## Role-Based Access Control

### Maintenance Module:

- **MaintenanceSupport**: View dashboard, assign engineers
- **MaintenanceManager**: Full maintenance management access
- **Engineer**: View assigned requests, create visits
- **SparePartsCoordinator**: Manage spare part requests
- **InventoryManager**: Set spare part prices
- **Doctor/HospitalAdmin**: View own requests, approve/reject spare parts
- **SuperAdmin**: Full access

### Accounting Module:

- **FinanceManager**: Full accounting access
- **FinanceEmployee**: View and process payments
- **Doctor/HospitalAdmin**: View own payment details
- **SuperAdmin**: Full access

---

## Features Implemented

### Maintenance Module:

✅ Maintenance request creation and management
✅ Engineer assignment (manual and auto-assignment)
✅ Maintenance visit tracking
✅ Spare part request workflow
✅ Customer approval/rejection for spare parts
✅ Attachment management
✅ Status timeline visualization
✅ Payment integration

### Payment Module:

✅ Multiple payment methods (Cash, Bank Transfer, Stripe, PayPal, Local Gateway)
✅ Payment processing and confirmation
✅ Refund processing
✅ Payment status tracking
✅ Transaction history

### Accounting Module:

✅ Pending payment management
✅ Payment confirmation/rejection
✅ Financial reports (Daily, Monthly, Yearly)
✅ Payment method statistics
✅ Outstanding payment tracking
✅ Revenue analytics

---

## Technical Stack

- **Framework**: React 18 with TypeScript
- **State Management**: Zustand (for auth), React Query (for data fetching)
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Date Formatting**: date-fns
- **HTTP Client**: Fetch API with centralized `apiRequest` utility
- **Performance Monitoring**: Custom `usePerformance` hook

---

## Next Steps (Pending)

### Customer App (Mobile):

- [ ] Create Maintenance Request Screen
- [ ] My Maintenance Requests Screen
- [ ] Maintenance Request Status Screen
- [ ] Payment Screen
- [ ] Spare Part Approval Screen

### Employee App (Mobile):

- [ ] Engineer Dashboard (Maintenance-focused)
- [ ] Create Maintenance Visit Screen
- [ ] QR Code Scanner Screen
- [ ] Visit Report Screen

### Web App (Additional):

- [ ] Enhanced filtering and search
- [ ] Export reports to PDF/Excel
- [ ] Real-time notifications integration
- [ ] Advanced analytics dashboard
- [ ] Bulk operations for maintenance requests

---

## Notes

- All components follow the existing codebase patterns and conventions
- Components use React Query for data fetching and caching
- Role-based access control is implemented using `RoleGuard` component
- All API calls use the centralized `apiRequest` utility
- Performance monitoring is integrated using `usePerformance` hook
- Components are responsive and support dark mode
- TypeScript types are fully defined for type safety

---

## File Structure

```
Web/src/
├── components/
│   ├── maintenance/
│   │   ├── MaintenanceSupportDashboard.tsx
│   │   ├── MaintenanceRequestDetails.tsx
│   │   ├── MaintenanceVisitManagement.tsx
│   │   ├── SparePartRequestManagement.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── StatusTimeline.tsx
│   │   └── index.ts
│   ├── accounting/
│   │   ├── AccountingDashboard.tsx
│   │   ├── FinancialReportsScreen.tsx
│   │   └── index.ts
│   └── payment/
│       ├── PaymentDetailsView.tsx
│       └── index.ts
├── services/
│   ├── maintenance/
│   │   ├── maintenanceApi.ts
│   │   └── index.ts
│   ├── payment/
│   │   ├── paymentApi.ts
│   │   └── index.ts
│   └── accounting/
│       ├── accountingApi.ts
│       └── index.ts
├── hooks/
│   ├── useMaintenanceQueries.ts
│   └── usePaymentQueries.ts
└── types/
    ├── maintenance.types.ts
    └── payment.types.ts
```

---

**Last Updated**: 2025-01-27
**Status**: Phase 2 & 3 Complete ✅
