# Complete Development Guide - Maintenance & Payment Modules

## 📋 Table of Contents

1. [Overview](#overview)
2. [Backend Implementation](#backend-implementation)
      - [Database Models & Relationships](#database-models--relationships)
      - [Business Logic Workflows](#business-logic-workflows)
      - [API Endpoints Documentation](#api-endpoints-documentation)
      - [Error Handling & Validation](#error-handling--validation)
3. [Frontend Implementation](#frontend-implementation)
      - [Component Architecture](#component-architecture)
      - [State Management](#state-management)
      - [API Integration](#api-integration)
4. [Integration Points](#integration-points)
5. [Security & Authorization](#security--authorization)
6. [Testing Notes](#testing-notes)
7. [Deployment Considerations](#deployment-considerations)

---

## Overview

This document provides a **comprehensive guide** for understanding and working with the Maintenance and Payment modules. It covers both backend (ASP.NET Core) and frontend (React/TypeScript) implementations, including detailed workflows, API contracts, component structures, and integration points.

**Project Structure:**

- **Backend**: ASP.NET Core 8.0, Entity Framework Core, Repository Pattern, Service Layer
- **Frontend**: React 18, TypeScript, React Query, Zustand, Radix UI, Tailwind CSS
- **Database**: SQL Server with Entity Framework Core Migrations

---

# Backend Implementation

## Database Models & Relationships

### Entity Relationship Diagram

```
ApplicationUser (AspNetUsers)
├── MaintenanceRequest (CustomerId)
│   ├── MaintenanceRequestAttachment (1:N)
│   ├── MaintenanceVisit (1:N)
│   ├── SparePartRequest (1:N)
│   ├── Payment (1:N)
│   └── MaintenanceRequestRating (1:N)
│
├── MaintenanceRequest (AssignedToEngineerId) [Engineer]
├── MaintenanceVisit (EngineerId) [Engineer]
│   └── SparePartRequest (MaintenanceVisitId)
│
├── SparePartRequest (AssignedToCoordinatorId) [SparePartsCoordinator]
├── SparePartRequest (AssignedToInventoryManagerId) [InventoryManager]
├── SparePartRequest (PriceSetByManagerId) [InventoryManager]
│
├── Payment (CustomerId)
├── Payment (ProcessedByAccountantId) [FinanceManager/FinanceEmployee]
│   └── PaymentTransaction (1:N)
│
Equipment
└── MaintenanceRequest (EquipmentId)

Hospital
└── MaintenanceRequest (HospitalId) [Optional]
```

### Model Details

#### 1. MaintenanceRequest

**Properties:**

```csharp
public int Id { get; set; }
public string CustomerId { get; set; }              // Required, FK to AspNetUsers
public string CustomerType { get; set; }             // "Doctor", "Technician", "Customer"
public string? HospitalId { get; set; }              // Optional, FK to Hospital
public int EquipmentId { get; set; }                 // Required, FK to Equipment
public string Description { get; set; }              // Required, MaxLength(2000)
public string? Symptoms { get; set; }                // Optional, MaxLength(2000)
public MaintenanceRequestStatus Status { get; set; }  // Enum, Default: Pending
public string? AssignedToEngineerId { get; set; }    // Optional, FK to AspNetUsers (Engineer)
public string? AssignedByMaintenanceSupportId { get; set; } // Optional
public DateTime? AssignedAt { get; set; }
public PaymentStatus PaymentStatus { get; set; }     // Enum, Default: NotRequired
public decimal? TotalAmount { get; set; }            // decimal(18,2)
public decimal? PaidAmount { get; set; }             // decimal(18,2)
public decimal? RemainingAmount { get; set; }        // decimal(18,2)
public DateTime CreatedAt { get; set; }               // Default: DateTime.UtcNow
public DateTime? StartedAt { get; set; }
public DateTime? CompletedAt { get; set; }
public string? Notes { get; set; }                    // MaxLength(2000)
public bool IsActive { get; set; }                    // Default: true
```

**Navigation Properties:**

- `Customer` (ApplicationUser)
- `Hospital` (Hospital)
- `Equipment` (Equipment)
- `AssignedToEngineer` (ApplicationUser)
- `AssignedByMaintenanceSupport` (ApplicationUser)
- `Attachments` (ICollection<MaintenanceRequestAttachment>)
- `Visits` (ICollection<MaintenanceVisit>)
- `SparePartRequests` (ICollection<SparePartRequest>)
- `Payments` (ICollection<Payment>)
- `Ratings` (ICollection<MaintenanceRequestRating>)

**Status Workflow:**

```
Pending → Assigned → InProgress → [NeedsSecondVisit | NeedsSparePart | Completed]
         ↓
    WaitingForSparePart → WaitingForCustomerApproval → Completed
         ↓
    Cancelled / OnHold (can occur at any stage)
```

#### 2. MaintenanceVisit

**Properties:**

```csharp
public int Id { get; set; }
public int MaintenanceRequestId { get; set; }       // Required, FK
public string EngineerId { get; set; }               // Required, FK to AspNetUsers
public string? QRCode { get; set; }                   // Optional, MaxLength(100)
public string? SerialCode { get; set; }              // Optional, MaxLength(100)
public string? Report { get; set; }                  // Optional, MaxLength(5000)
public string? ActionsTaken { get; set; }            // Optional, MaxLength(2000)
public string? PartsUsed { get; set; }               // Optional, MaxLength(1000)
public decimal? ServiceFee { get; set; }              // decimal(18,2)
public MaintenanceVisitOutcome Outcome { get; set; } // Enum: Completed, NeedsSecondVisit, NeedsSparePart
public int? SparePartRequestId { get; set; }        // Optional, FK (if outcome = NeedsSparePart)
public DateTime VisitDate { get; set; }              // Default: DateTime.UtcNow
public DateTime? StartedAt { get; set; }
public DateTime? CompletedAt { get; set; }
public string? Notes { get; set; }                    // MaxLength(2000)
```

**Outcome Logic:**

- `Completed`: Request status → `Completed` (if all work done)
- `NeedsSecondVisit`: Request status → `NeedsSecondVisit`
- `NeedsSparePart`: Request status → `NeedsSparePart`, creates SparePartRequest

#### 3. SparePartRequest

**Properties:**

```csharp
public int Id { get; set; }
public int MaintenanceRequestId { get; set; }       // Required, FK
public int? MaintenanceVisitId { get; set; }         // Optional, FK
public string PartName { get; set; }                 // Required, MaxLength(200)
public string? PartNumber { get; set; }              // Optional, MaxLength(100)
public string? Description { get; set; }             // Optional, MaxLength(1000)
public string? Manufacturer { get; set; }           // Optional, MaxLength(200)
public decimal? OriginalPrice { get; set; }          // decimal(18,2)
public decimal? CompanyPrice { get; set; }           // decimal(18,2)
public decimal? CustomerPrice { get; set; }           // decimal(18,2)
public SparePartAvailabilityStatus Status { get; set; } // Enum, Default: Pending
public string? AssignedToCoordinatorId { get; set; } // Optional, FK (SparePartsCoordinator)
public string? AssignedToInventoryManagerId { get; set; } // Optional, FK (InventoryManager)
public string? PriceSetByManagerId { get; set; }     // Optional, FK (InventoryManager)
public bool? CustomerApproved { get; set; }          // Nullable bool
public DateTime? CustomerApprovedAt { get; set; }
public string? CustomerRejectionReason { get; set; } // MaxLength(1000)
public DateTime CreatedAt { get; set; }              // Default: DateTime.UtcNow
public DateTime? CheckedAt { get; set; }
public DateTime? PriceSetAt { get; set; }
public DateTime? ReadyAt { get; set; }
public DateTime? DeliveredToEngineerAt { get; set; }
```

**Status Workflow:**

```
Pending → AvailableLocally → PriceSet → WaitingForCustomerApproval → CustomerApproved → ReadyForEngineer → DeliveredToEngineer
       ↓
   GlobalOrderRequired → PriceSet → WaitingForCustomerApproval → CustomerApproved → Ordered → ReadyForEngineer → DeliveredToEngineer
       ↓
   CustomerRejected (can occur at WaitingForCustomerApproval)
       ↓
   Cancelled (can occur at any stage)
```

#### 4. Payment

**Properties:**

```csharp
public int Id { get; set; }
public int? MaintenanceRequestId { get; set; }       // Optional, FK
public int? SparePartRequestId { get; set; }         // Optional, FK
public string CustomerId { get; set; }               // Required, FK to AspNetUsers
public decimal Amount { get; set; }                  // Required, decimal(18,2)
public PaymentMethod PaymentMethod { get; set; }     // Enum: Cash, BankTransfer, Stripe, PayPal, LocalGateway, Other
public PaymentStatus Status { get; set; }             // Enum, Default: Pending
public string? TransactionId { get; set; }           // Optional, MaxLength(100) - Gateway transaction ID
public string? PaymentReference { get; set; }        // Optional, MaxLength(500) - Bank reference, receipt number, etc.
public string? PaymentMetadata { get; set; }          // Optional, nvarchar(max) - JSON for gateway-specific data
public string? ProcessedByAccountantId { get; set; } // Optional, FK (FinanceManager/FinanceEmployee)
public DateTime? ProcessedAt { get; set; }
public string? AccountingNotes { get; set; }         // MaxLength(1000)
public DateTime CreatedAt { get; set; }              // Default: DateTime.UtcNow
public DateTime? PaidAt { get; set; }
public DateTime? ConfirmedAt { get; set; }
```

**Status Workflow:**

```
Pending → Processing → Completed
       ↓
    Failed (can occur during Processing)
       ↓
    Refunded (can occur after Completed)
       ↓
    Rejected (can occur at Pending/Processing by Accounting)
```

### Database Configuration

**Foreign Key Constraints:**

- All foreign keys to `AspNetUsers` use `DeleteBehavior.NoAction` or `DeleteBehavior.Restrict` to prevent cascade cycles
- Equipment → MaintenanceRequest: `DeleteBehavior.Restrict`
- MaintenanceRequest → MaintenanceVisit: `DeleteBehavior.Cascade`
- MaintenanceRequest → SparePartRequest: `DeleteBehavior.Cascade`
- MaintenanceRequest → Payment: `DeleteBehavior.Restrict`

**Indexes:**

- `MaintenanceRequest.CustomerId`
- `MaintenanceRequest.EquipmentId`
- `MaintenanceRequest.Status`
- `MaintenanceRequest.AssignedToEngineerId`
- `Payment.CustomerId`
- `Payment.Status`
- `Payment.MaintenanceRequestId`
- `Payment.SparePartRequestId`

---

## Business Logic Workflows

### 1. Maintenance Request Creation Workflow

**Endpoint:** `POST /api/MaintenanceRequest`

**Steps:**

1. **Validation:**

      - Customer exists and is valid
      - Equipment exists and belongs to customer (or hospital)
      - Description is provided

2. **Request Creation:**

      ```csharp
      var request = new MaintenanceRequest
      {
          CustomerId = customerId,
          CustomerType = DetermineCustomerType(customerRoles), // "Doctor", "Technician", "Customer"
          HospitalId = GetHospitalId(equipment, customer),
          EquipmentId = dto.EquipmentId,
          Description = dto.Description,
          Symptoms = dto.Symptoms,
          Status = MaintenanceRequestStatus.Pending,
          PaymentStatus = PaymentStatus.NotRequired
      };
      ```

3. **Auto-Assignment Attempt:**

      - Calls `TryAutoAssignToEngineerAsync(requestId, equipment)`
      - Algorithm:
           ```
           a. Get equipment location (Hospital.GovernorateId or Customer location)
           b. Find engineers in same governorate
           c. Filter engineers with active status
           d. Count pending requests per engineer
           e. Assign to engineer with:
              - Same governorate
              - Fewest pending requests
              - Active status
           f. If assigned:
              - Set Status = Assigned
              - Set AssignedAt = DateTime.UtcNow
              - Send notification to engineer
           g. If not assigned:
              - Status remains Pending
              - Notification sent to Maintenance Support
           ```

4. **Notifications:**

      - To Maintenance Support: "New maintenance request from {customer}"
      - To Assigned Engineer (if auto-assigned): "New maintenance request assigned to you"

5. **Response:**
      - Returns `MaintenanceRequestResponseDTO` with all related data

**Error Cases:**

- Customer not found → `ArgumentException`
- Equipment not found → `ArgumentException`
- Equipment doesn't belong to customer → `UnauthorizedAccessException`

### 2. Engineer Assignment Workflow

**Endpoint:** `POST /api/MaintenanceRequest/{id}/assign`

**Steps:**

1. **Validation:**

      - Request exists and is in `Pending` or `OnHold` status
      - Engineer exists and has `Engineer` role
      - User has `MaintenanceSupport` or `MaintenanceManager` role

2. **Assignment:**

      ```csharp
      request.AssignedToEngineerId = dto.EngineerId;
      request.AssignedByMaintenanceSupportId = maintenanceSupportId;
      request.AssignedAt = DateTime.UtcNow;
      request.Status = MaintenanceRequestStatus.Assigned;
      request.StartedAt = DateTime.UtcNow;
      ```

3. **Notification:**

      - To Engineer: "Maintenance request #{id} assigned to you"
      - To Customer: "Engineer {engineerName} assigned to your request"

4. **Response:**
      - Returns updated `MaintenanceRequestResponseDTO`

### 3. Maintenance Visit Creation Workflow

**Endpoint:** `POST /api/MaintenanceVisit`

**Steps:**

1. **Validation:**

      - Maintenance request exists
      - Engineer is assigned to the request
      - Engineer matches current user (or user is MaintenanceManager)

2. **Visit Creation:**

      ```csharp
      var visit = new MaintenanceVisit
      {
          MaintenanceRequestId = dto.MaintenanceRequestId,
          EngineerId = engineerId,
          QRCode = dto.QRCode,
          SerialCode = dto.SerialCode,
          Report = dto.Report,
          ActionsTaken = dto.ActionsTaken,
          PartsUsed = dto.PartsUsed,
          ServiceFee = dto.ServiceFee,
          Outcome = dto.Outcome,
          Notes = dto.Notes,
          VisitDate = DateTime.UtcNow,
          StartedAt = DateTime.UtcNow,
          CompletedAt = DateTime.UtcNow
      };
      ```

3. **Status Update Based on Outcome:**

      - `Completed`:
           - If service fee > 0: Update payment status
           - Request status → `Completed`
           - Request.CompletedAt = DateTime.UtcNow
      - `NeedsSecondVisit`:
           - Request status → `NeedsSecondVisit`
      - `NeedsSparePart`:
           - Request status → `NeedsSparePart`
           - Create SparePartRequest (if not exists)

4. **Payment Calculation:**

      - If ServiceFee > 0:
           - Update MaintenanceRequest.TotalAmount
           - Update MaintenanceRequest.PaymentStatus = `Pending`
           - Create Payment record (optional, can be created separately)

5. **Notification:**
      - To Customer: "Maintenance visit completed for request #{id}"
      - To Maintenance Support: "Visit completed, outcome: {outcome}"

### 4. Spare Part Request Workflow

**Workflow Steps:**

#### Step 1: Create Spare Part Request

**Endpoint:** `POST /api/SparePartRequest`

- Created by Engineer during visit (outcome = `NeedsSparePart`)
- Status: `Pending`

#### Step 2: Check Availability

**Endpoint:** `POST /api/SparePartRequest/{id}/check-availability`
**Role:** `SparePartsCoordinator`

- Coordinator checks local inventory
- Updates status:
     - `AvailableLocally` → Proceed to pricing
     - `GlobalOrderRequired` → Proceed to pricing (after ordering)

#### Step 3: Set Price

**Endpoint:** `PUT /api/SparePartRequest/{id}/set-price`
**Role:** `InventoryManager`

```csharp
request.CompanyPrice = dto.CompanyPrice;      // Internal cost
request.CustomerPrice = dto.CustomerPrice;    // Price to customer
request.PriceSetByManagerId = inventoryManagerId;
request.PriceSetAt = DateTime.UtcNow;
request.Status = SparePartAvailabilityStatus.PriceSet;
```

- Status → `WaitingForCustomerApproval`

#### Step 4: Customer Approval

**Endpoint:** `POST /api/SparePartRequest/{id}/customer-approval`
**Role:** `Doctor` or `HospitalAdmin`

```csharp
if (dto.Approved)
{
    request.CustomerApproved = true;
    request.CustomerApprovedAt = DateTime.UtcNow;
    request.Status = SparePartAvailabilityStatus.CustomerApproved;
    // Create Payment record
}
else
{
    request.CustomerApproved = false;
    request.CustomerRejectionReason = dto.RejectionReason;
    request.Status = SparePartAvailabilityStatus.CustomerRejected;
}
```

#### Step 5: Order & Delivery

- If `GlobalOrderRequired`: Status → `Ordered` (after ordering)
- When ready: Status → `ReadyForEngineer`
- When delivered: Status → `DeliveredToEngineer`

### 5. Payment Processing Workflow

#### Step 1: Create Payment

**Endpoint:** `POST /api/Payment`

```csharp
var payment = new Payment
{
    MaintenanceRequestId = dto.MaintenanceRequestId,
    SparePartRequestId = dto.SparePartRequestId,
    CustomerId = customerId,
    Amount = dto.Amount,
    PaymentMethod = dto.PaymentMethod,
    Status = PaymentStatus.Pending
};
```

#### Step 2: Process Payment (Based on Method)

**Cash Payment:**

- **Endpoint:** `POST /api/Payment/{id}/cash`
- Records receipt number
- Status → `Processing` → `Completed` (after accounting confirmation)

**Bank Transfer:**

- **Endpoint:** `POST /api/Payment/{id}/bank-transfer`
- Records bank name, reference, account number
- Status → `Processing` → `Completed` (after accounting confirmation)

**Stripe Payment:**

- **Endpoint:** `POST /api/Payment/{id}/stripe`
- Processes token with Stripe API (placeholder)
- Status → `Processing` → `Completed` (if successful) or `Failed`

**PayPal Payment:**

- **Endpoint:** `POST /api/Payment/{id}/paypal`
- Processes PayPal payment ID (placeholder)
- Status → `Processing` → `Completed` (if successful) or `Failed`

**Local Gateway:**

- **Endpoint:** `POST /api/Payment/{id}/local-gateway`
- Processes with local payment gateway (placeholder)
- Status → `Processing` → `Completed` (if successful) or `Failed`

#### Step 3: Accounting Confirmation

**Endpoint:** `POST /api/Accounting/payments/{id}/confirm`
**Role:** `FinanceManager` or `FinanceEmployee`

```csharp
payment.Status = PaymentStatus.Completed;
payment.ProcessedByAccountantId = accountantId;
payment.ProcessedAt = DateTime.UtcNow;
payment.ConfirmedAt = DateTime.UtcNow;
payment.AccountingNotes = dto.Notes;
```

- Updates MaintenanceRequest.PaidAmount
- Updates MaintenanceRequest.PaymentStatus
- Sends notification to customer

#### Step 4: Rejection (if needed)

**Endpoint:** `POST /api/Accounting/payments/{id}/reject`
**Role:** `FinanceManager` or `FinanceEmployee`

```csharp
payment.Status = PaymentStatus.Rejected;
payment.ProcessedByAccountantId = accountantId;
payment.ProcessedAt = DateTime.UtcNow;
payment.AccountingNotes = dto.Reason;
```

### 6. Financial Reporting Workflow

**Daily Report:**

- **Endpoint:** `GET /api/Accounting/reports/daily?date=2025-01-27`
- Calculates:
     - Total Revenue (sum of completed payments)
     - Total Payments (count of completed payments)
     - Outstanding Payments (sum of pending payments)
     - Total Transactions (count of all payments)
     - Revenue by Payment Method (grouped)
     - Count by Payment Method (grouped)

**Monthly Report:**

- **Endpoint:** `GET /api/Accounting/reports/monthly?year=2025&month=1`
- Same calculations for the entire month

**Yearly Report:**

- **Endpoint:** `GET /api/Accounting/reports/yearly?year=2025`
- Same calculations for the entire year

**Payment Method Statistics:**

- **Endpoint:** `GET /api/Accounting/statistics/payment-methods?from=2025-01-01&to=2025-01-31`
- Returns statistics per payment method:
     - Count
     - Total Amount
     - Average Amount
     - Success Count
     - Failed Count
     - Success Rate

---

## API Endpoints Documentation

### Maintenance Request Endpoints

#### 1. Create Maintenance Request

```http
POST /api/MaintenanceRequest
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "equipmentId": 123,
  "description": "Equipment not working properly",
  "symptoms": "No power, strange noise"
}

Response: 200 OK
{
  "success": true,
  "message": "Maintenance request created successfully",
  "data": {
    "id": 456,
    "customerId": "user-id",
    "customerName": "Dr. Ahmed",
    "equipmentId": 123,
    "equipmentName": "Ultrasound Machine",
    "status": "Assigned",
    "assignedToEngineerId": "engineer-id",
    "assignedToEngineerName": "Engineer Name",
    "createdAt": "2025-01-27T10:00:00Z",
    ...
  }
}
```

#### 2. Get Maintenance Request

```http
GET /api/MaintenanceRequest/{id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 456,
    "customerId": "user-id",
    "customerName": "Dr. Ahmed",
    "equipmentId": 123,
    "equipmentName": "Ultrasound Machine",
    "status": "InProgress",
    "attachments": [...],
    "visits": [...],
    "payments": [...],
    ...
  }
}
```

#### 3. Get Customer Requests

```http
GET /api/MaintenanceRequest/customer/my-requests?status=Pending&page=1&pageSize=10
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "data": [...],
    "page": 1,
    "pageSize": 10,
    "totalCount": 25,
    "totalPages": 3,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

#### 4. Assign Engineer

```http
POST /api/MaintenanceRequest/{id}/assign
Authorization: Bearer {token} (MaintenanceSupport role)
Content-Type: application/json

Request Body:
{
  "engineerId": "engineer-user-id"
}

Response: 200 OK
{
  "success": true,
  "message": "Engineer assigned successfully",
  "data": { ... }
}
```

### Payment Endpoints

#### 1. Create Payment

```http
POST /api/Payment
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "maintenanceRequestId": 456,
  "amount": 1500.00,
  "paymentMethod": "BankTransfer"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 789,
    "amount": 1500.00,
    "paymentMethod": "BankTransfer",
    "status": "Pending",
    ...
  }
}
```

#### 2. Record Bank Transfer

```http
POST /api/Payment/{id}/bank-transfer
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "bankName": "National Bank of Egypt",
  "bankReference": "TXN123456789",
  "accountNumber": "1234567890",
  "paymentReference": "REF-2025-001"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 789,
    "status": "Processing",
    "paymentReference": "REF-2025-001",
    ...
  }
}
```

### Accounting Endpoints

#### 1. Get Pending Payments

```http
GET /api/Accounting/payments/pending
Authorization: Bearer {token} (Finance role)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 789,
      "customerName": "Dr. Ahmed",
      "amount": 1500.00,
      "paymentMethod": "BankTransfer",
      "status": "Processing",
      ...
    },
    ...
  ]
}
```

#### 2. Confirm Payment

```http
POST /api/Accounting/payments/{id}/confirm
Authorization: Bearer {token} (Finance role)
Content-Type: application/json

Request Body:
{
  "notes": "Payment confirmed, bank transfer received"
}

Response: 200 OK
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "id": 789,
    "status": "Completed",
    "confirmedAt": "2025-01-27T12:00:00Z",
    ...
  }
}
```

#### 3. Get Daily Report

```http
GET /api/Accounting/reports/daily?date=2025-01-27
Authorization: Bearer {token} (Finance role)

Response: 200 OK
{
  "success": true,
  "data": {
    "reportDate": "2025-01-27",
    "totalRevenue": 50000.00,
    "totalPayments": 25,
    "outstandingPayments": 10000.00,
    "totalTransactions": 30,
    "revenueByPaymentMethod": {
      "Cash": 20000.00,
      "BankTransfer": 25000.00,
      "Stripe": 5000.00
    },
    "countByPaymentMethod": {
      "Cash": 10,
      "BankTransfer": 12,
      "Stripe": 3
    }
  }
}
```

---

## Error Handling & Validation

### Validation Rules

**Maintenance Request:**

- `EquipmentId`: Required, must exist
- `Description`: Required, MaxLength(2000)
- `Symptoms`: Optional, MaxLength(2000)

**Maintenance Visit:**

- `MaintenanceRequestId`: Required, must exist
- `Outcome`: Required, must be valid enum value
- `ServiceFee`: Optional, must be >= 0 if provided

**Spare Part Request:**

- `PartName`: Required, MaxLength(200)
- `MaintenanceRequestId`: Required, must exist

**Payment:**

- `Amount`: Required, must be > 0, decimal(18,2)
- `PaymentMethod`: Required, must be valid enum value
- Either `MaintenanceRequestId` or `SparePartRequestId` must be provided

### Error Responses

**400 Bad Request:**

```json
{
	"success": false,
	"message": "Validation failed",
	"errors": {
		"equipmentId": ["Equipment is required"],
		"description": ["Description cannot be empty"]
	}
}
```

**401 Unauthorized:**

```json
{
	"success": false,
	"message": "Unauthorized. Please login."
}
```

**403 Forbidden:**

```json
{
	"success": false,
	"message": "You don't have permission to perform this action."
}
```

**404 Not Found:**

```json
{
	"success": false,
	"message": "Maintenance request not found"
}
```

**500 Internal Server Error:**

```json
{
	"success": false,
	"message": "An error occurred while processing your request"
}
```

---

# Frontend Implementation

## Component Architecture

### Component Hierarchy

```
App
├── AppLayout
│   ├── AppSidebar
│   │   ├── Maintenance Module Menu (for MaintenanceSupport, MaintenanceManager, SuperAdmin)
│   │   └── Finance Module Menu (for FinanceManager, FinanceEmployee, SuperAdmin)
│   └── AppContent
│       ├── MaintenanceSupportDashboard
│       │   ├── Tabs (Pending Requests, All Requests, Spare Part Requests, Engineers)
│       │   ├── RequestList
│       │   ├── RequestCard
│       │   ├── AssignEngineerDialog
│       │   └── StatusBadge
│       ├── MaintenanceRequestDetails
│       │   ├── StatusTimeline
│       │   ├── RequestInformation
│       │   ├── MaintenanceVisits
│       │   ├── Attachments
│       │   └── PaymentInformation
│       ├── MaintenanceVisitManagement
│       │   ├── VisitList
│       │   └── CreateVisitDialog
│       ├── SparePartRequestManagement
│       │   ├── SparePartList
│       │   ├── SetPriceDialog
│       │   └── CustomerApprovalDialog
│       ├── AccountingDashboard
│       │   ├── Tabs (Pending Payments, All Payments, Reports, Statistics)
│       │   ├── PaymentList
│       │   ├── ConfirmPaymentDialog
│       │   └── RejectPaymentDialog
│       ├── FinancialReportsScreen
│       │   ├── DailyReport
│       │   ├── MonthlyReport
│       │   ├── YearlyReport
│       │   └── PaymentStatistics
│       └── PaymentDetailsView
│           ├── PaymentInformation
│           ├── CustomerInformation
│           └── ProcessingInformation
```

### Component Details

#### 1. MaintenanceSupportDashboard

**Location:** `Web/src/components/maintenance/MaintenanceSupportDashboard.tsx`

**Props:** None (uses hooks for data)

**State:**

```typescript
const [activeTab, setActiveTab] = useState<
	'pending' | 'all' | 'spare-parts' | 'engineers'
>('pending');
const [selectedRequest, setSelectedRequest] =
	useState<MaintenanceRequestResponseDTO | null>(null);
const [showAssignDialog, setShowAssignDialog] = useState(false);
const [filters, setFilters] = useState<MaintenanceRequestFilters>({
	status: MaintenanceRequestStatus.Pending,
	page: 1,
	pageSize: 10,
});
```

**Hooks Used:**

- `usePendingMaintenanceRequests(filters)` - React Query hook
- `useAssignEngineerMutation()` - React Query mutation
- `useAuthStore()` - Zustand store for user info

**Features:**

- Tab navigation for different views
- Real-time request list with pagination
- Engineer assignment dialog
- Status filtering
- Search functionality
- Statistics display (Total, Assigned, Unassigned)

**API Calls:**

- `GET /api/MaintenanceRequest/pending` - Fetch pending requests
- `GET /api/MaintenanceRequest` - Fetch all requests with filters
- `POST /api/MaintenanceRequest/{id}/assign` - Assign engineer

#### 2. MaintenanceRequestDetails

**Location:** `Web/src/components/maintenance/MaintenanceRequestDetails.tsx`

**Props:** Uses `useParams()` to get `id` from route

**State:**

```typescript
const { id } = useParams<{ id: string }>();
const requestId = id ? parseInt(id, 10) : 0;
```

**Hooks Used:**

- `useMaintenanceRequest(requestId)` - Fetch request details
- `useVisitsByRequest(requestId)` - Fetch visits
- `useAttachmentsByRequest(requestId)` - Fetch attachments

**Features:**

- Comprehensive request information display
- Status timeline visualization
- Customer and equipment information sidebar
- Maintenance visits history
- Attachments gallery
- Payment information display
- Navigation back button

**API Calls:**

- `GET /api/MaintenanceRequest/{id}` - Fetch request
- `GET /api/MaintenanceVisit/request/{requestId}` - Fetch visits
- `GET /api/MaintenanceAttachment/request/{requestId}` - Fetch attachments

#### 3. AccountingDashboard

**Location:** `Web/src/components/accounting/AccountingDashboard.tsx`

**State:**

```typescript
const [activeTab, setActiveTab] = useState<
	'pending' | 'all' | 'reports' | 'statistics'
>('pending');
const [selectedPayment, setSelectedPayment] =
	useState<PaymentResponseDTO | null>(null);
const [showConfirmDialog, setShowConfirmDialog] = useState(false);
const [showRejectDialog, setShowRejectDialog] = useState(false);
```

**Hooks Used:**

- `usePendingPayments()` - Fetch pending payments
- `useConfirmPaymentMutation()` - Confirm payment
- `useRejectPaymentMutation()` - Reject payment
- `useDailyReport(selectedDate)` - Fetch daily report

**Features:**

- Tab navigation
- Pending payments list with actions
- Payment confirmation/rejection dialogs
- Daily financial report
- Outstanding payments display
- Statistics cards

**API Calls:**

- `GET /api/Accounting/payments/pending` - Fetch pending
- `POST /api/Accounting/payments/{id}/confirm` - Confirm
- `POST /api/Accounting/payments/{id}/reject` - Reject
- `GET /api/Accounting/reports/daily?date={date}` - Daily report

---

## State Management

### React Query Configuration

**Query Client Setup:**

```typescript
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			cacheTime: 10 * 60 * 1000, // 10 minutes
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});
```

### Custom Hooks

#### useMaintenanceQueries.ts

**Query Hooks:**

```typescript
// Fetch maintenance request by ID
export const useMaintenanceRequest = (id: number) => {
	return useQuery({
		queryKey: ['maintenanceRequest', id],
		queryFn: () => maintenanceApi.getMaintenanceRequest(id),
		enabled: id > 0,
	});
};

// Fetch customer requests
export const useCustomerMaintenanceRequests = (
	filters: MaintenanceRequestFilters
) => {
	return useQuery({
		queryKey: ['customerMaintenanceRequests', filters],
		queryFn: () =>
			maintenanceApi.getCustomerMaintenanceRequests(filters),
	});
};

// Fetch pending requests
export const usePendingMaintenanceRequests = (
	filters: MaintenanceRequestFilters
) => {
	return useQuery({
		queryKey: ['pendingMaintenanceRequests', filters],
		queryFn: () =>
			maintenanceApi.getPendingMaintenanceRequests(filters),
	});
};
```

**Mutation Hooks:**

```typescript
// Assign engineer
export const useAssignEngineerMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			requestId,
			data,
		}: {
			requestId: number;
			data: AssignMaintenanceRequestDTO;
		}) => maintenanceApi.assignEngineerToRequest(requestId, data),
		onSuccess: (data, variables) => {
			// Invalidate and refetch
			queryClient.invalidateQueries({
				queryKey: [
					'maintenanceRequest',
					variables.requestId,
				],
			});
			queryClient.invalidateQueries({
				queryKey: ['pendingMaintenanceRequests'],
			});
			toast.success('Engineer assigned successfully');
		},
		onError: (error) => {
			toast.error('Failed to assign engineer');
		},
	});
};
```

#### usePaymentQueries.ts

**Query Hooks:**

```typescript
// Fetch payment by ID
export const usePayment = (id: number) => {
	return useQuery({
		queryKey: ['payment', id],
		queryFn: () => paymentApi.getPayment(id),
		enabled: id > 0,
	});
};

// Fetch daily report
export const useDailyReport = (date: string) => {
	return useQuery({
		queryKey: ['dailyReport', date],
		queryFn: () => accountingApi.getDailyReport(date),
		enabled: !!date,
	});
};
```

**Mutation Hooks:**

```typescript
// Confirm payment
export const useConfirmPaymentMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: ConfirmPaymentDTO;
		}) => accountingApi.confirmPayment(id, data),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['payment', variables.id],
			});
			queryClient.invalidateQueries({
				queryKey: ['pendingPayments'],
			});
			queryClient.invalidateQueries({
				queryKey: ['dailyReport'],
			});
			toast.success('Payment confirmed successfully');
		},
	});
};
```

### Zustand Stores

**Auth Store** (existing):

```typescript
interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	hasAnyRole: (roles: string[]) => boolean;
	// ... other methods
}
```

**Usage in Components:**

```typescript
const { user, hasAnyRole } = useAuthStore();
const isMaintenanceSupport = hasAnyRole([
	'MaintenanceSupport',
	'MaintenanceManager',
	'SuperAdmin',
]);
```

---

## API Integration

### API Service Pattern

**Base API Request Function:**

```typescript
// Web/src/utils/apiRequest.ts
export async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	const token = getAuthToken(); // From localStorage or Zustand store
	const baseUrl = import.meta.env.VITE_API_BASE_URL;

	const response = await fetch(`${baseUrl}${endpoint}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
			...options.headers,
		},
	});

	if (!response.ok) {
		throw new Error(`API Error: ${response.statusText}`);
	}

	return response.json();
}
```

**Service Class Example:**

```typescript
// Web/src/services/maintenance/maintenanceApi.ts
class MaintenanceApiService {
	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		return apiRequest<T>(endpoint, options);
	}

	async createMaintenanceRequest(
		data: CreateMaintenanceRequestDTO
	): Promise<ApiResponse<MaintenanceRequestResponseDTO>> {
		return this.makeRequest(
			API_ENDPOINTS.MAINTENANCE.REQUEST.BASE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	async getMaintenanceRequest(
		id: number
	): Promise<ApiResponse<MaintenanceRequestResponseDTO>> {
		return this.makeRequest(
			API_ENDPOINTS.MAINTENANCE.REQUEST.BY_ID(id)
		);
	}

	// ... more methods
}

export const maintenanceApi = new MaintenanceApiService();
```

### Error Handling

**Global Error Handler:**

```typescript
// Web/src/utils/errorHandler.ts
export function handleApiError(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return 'An unexpected error occurred';
}

// Usage in components
try {
	await mutation.mutateAsync(data);
} catch (error) {
	const errorMessage = handleApiError(error);
	toast.error(errorMessage);
}
```

---

## Integration Points

### 1. Notification Integration

**Backend:**

- Uses `INotificationService` to send notifications
- Notifications sent for:
     - Maintenance request creation
     - Engineer assignment
     - Status updates
     - Spare part price set
     - Payment created/confirmed/rejected

**Frontend:**

- Notifications displayed via existing notification system
- Real-time updates using SignalR (if configured)

### 2. File Upload Integration

**Backend:**

- Files stored in `wwwroot/uploads/maintenance-attachments/`
- File validation: type and size checks
- Returns file path for frontend access

**Frontend:**

- Uses `FormData` for file uploads
- Displays attachments in gallery
- Supports image, video, audio, document types

### 3. Payment Gateway Integration

**Current Status:** Placeholders implemented

**Stripe Integration (TODO):**

```csharp
// Backend/SoitMed/Services/PaymentService.cs
public async Task<PaymentResponseDTO> ProcessStripePaymentAsync(int paymentId, StripePaymentDTO dto)
{
    // TODO: Integrate with Stripe SDK
    // var stripeService = new StripeService(_configuration);
    // var result = await stripeService.ProcessPayment(dto.Token, amount);
    // Update payment with transaction ID
}
```

**PayPal Integration (TODO):**

```csharp
// Similar placeholder for PayPal
```

### 4. Reporting Integration

**Backend:**

- Financial reports calculated from Payment entities
- Aggregations by date range, payment method
- Statistics calculated on-the-fly

**Frontend:**

- Reports displayed in tabbed interface
- Date range selectors
- Export functionality (TODO: PDF/Excel)

---

## Security & Authorization

### Role-Based Access Control

**Backend Authorization:**

```csharp
[Authorize(Roles = "MaintenanceSupport,MaintenanceManager,SuperAdmin")]
[HttpPost("{id}/assign")]
public async Task<IActionResult> AssignEngineer(int id, AssignMaintenanceRequestDTO dto)
{
    // Only authorized roles can access
}
```

**Frontend Authorization:**

```typescript
<Route
	path="maintenance-support"
	element={
		<RoleGuard
			requiredAnyRoles={[
				'MaintenanceSupport',
				'MaintenanceManager',
				'SuperAdmin',
			]}
		>
			<MaintenanceSupportDashboard />
		</RoleGuard>
	}
/>
```

### Data Access Control

**Customer Data:**

- Customers can only view their own requests
- Engineers can only view assigned requests
- Maintenance Support can view all requests

**Payment Data:**

- Customers can view their own payments
- Finance roles can view all payments
- Accounting actions require Finance roles

### Input Validation

**Backend:**

- Data annotations on DTOs
- Model validation in controllers
- Business rule validation in services

**Frontend:**

- Form validation using React Hook Form (if used)
- TypeScript type checking
- API error handling

---

## Testing Notes

### Backend Testing

**Unit Tests (TODO):**

- Service layer business logic
- Repository data access
- DTO mapping

**Integration Tests (TODO):**

- API endpoint testing
- Database operations
- Authentication/Authorization

### Frontend Testing

**Component Tests (TODO):**

- React component rendering
- User interactions
- State management

**E2E Tests (TODO):**

- Complete workflows
- Cross-browser testing

---

## Deployment Considerations

### Backend

**Environment Variables:**

- Database connection string
- JWT secret key
- Payment gateway API keys (when integrated)
- File upload path configuration

**Database Migrations:**

```bash
dotnet ef migrations add InitialMaintenancePaymentModules
dotnet ef database update
```

### Frontend

**Environment Variables:**

- `VITE_API_BASE_URL` - Backend API URL
- `VITE_APP_NAME` - Application name

**Build:**

```bash
npm run build
```

**Deployment:**

- Static files served from `dist/` folder
- API proxy configuration (if needed)

---

## Next Steps & TODOs

### Backend TODOs:

- [ ] Implement Stripe payment gateway integration
- [ ] Implement PayPal payment gateway integration
- [ ] Implement local payment gateway integration
- [ ] Add unit tests for services
- [ ] Add integration tests for controllers
- [ ] Implement payment webhook handling
- [ ] Add email notifications
- [ ] Implement PDF report generation

### Frontend TODOs:

- [ ] Add form validation using React Hook Form
- [ ] Implement file upload progress indicator
- [ ] Add export to PDF/Excel for reports
- [ ] Implement real-time notifications (SignalR)
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Add unit tests for components
- [ ] Add E2E tests

### Mobile Apps (Future):

- [ ] Customer App - Maintenance Request creation
- [ ] Customer App - Payment screen
- [ ] Employee App - Engineer dashboard
- [ ] Employee App - QR code scanner
- [ ] Employee App - Visit report creation

---

**Last Updated:** 2025-01-27
**Status:** Backend & Frontend Core Implementation Complete ✅
**Next Phase:** Mobile Apps Development
