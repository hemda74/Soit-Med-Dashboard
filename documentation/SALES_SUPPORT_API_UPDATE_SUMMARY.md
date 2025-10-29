# Sales Support API Update Summary

## Overview

This document summarizes all changes needed to update the Sales Support module to match the new backend API documentation.

**Date:** October 27, 2025  
**Status:** In Progress

---

## Changes Made

### 1. Type Definitions Updated ✅

#### `src/types/sales.types.ts`

**OfferRequest Interface:**

- Changed `id` from `string` to `number`
- Changed `clientId` from `string` to `number`
- Removed: `priority`, `createdAt`, `updatedAt`, `assignedAt`, `assignedBy`, `assignedByName`, `offerDescription`, `offerValue`, `offerValidUntil`, `completedAt`, `completedBy`, `completedByName`, `completionNotes`, `taskProgressId`
- Added: `specialNotes`, `requestDate`, `createdOfferId`
- Simplified field structure to match API response

**Offer Interface:**

- Changed `id` from `string` to `number`
- Changed `offerRequestId` from `string` to `number`
- Changed `clientId` from `string` to `number`
- Removed: `updatedAt`, `documents`
- Added: `paymentType`, `finalPrice`, `offerDuration` fields
- Simplified status enum to: `'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'UnderReview' | 'Expired'`
- Changed `sentToClientAt` and `clientResponse` to nullable

**OfferEquipment Interface:**

- Changed `offerId` from `string` to `number`
- Changed `imagePath` to nullable

**OfferTerms Interface:**

- Changed `offerId` from `string` to `number`

**InstallmentPlan Interface:**

- Changed `offerId` from `string` to `number`
- Removed: `paymentFrequency` (this is now only in the DTO for creation)
- Changed `notes` to nullable

**CreateOfferDto Interface:**

- Changed `offerRequestId` from `string` to `number`
- Changed `clientId` from `string` to `number`
- Added: `paymentType`, `finalPrice`, `offerDuration` fields

---

## Still Needed

### 2. Endpoints Configuration ⏳

**File:** `src/services/shared/endpoints.ts`

**Changes Needed:**

```typescript
// Update OfferRequest endpoints
OFFER_REQUESTS: {
    BASE: '/api/OfferRequest', // Changed from '/api/offerrequest'
    BY_ID: (id: number) => `/api/OfferRequest/${id}`, // Changed from string
    ASSIGN: (id: number) => `/api/OfferRequest/${id}/assign`,
    STATUS: (id: number) => `/api/OfferRequest/${id}/status`,
    ASSIGNED: (supportId: string) => `/api/OfferRequest/assigned/${supportId}`,
},

// Update Offer endpoints
OFFERS: {
    BASE: '/api/Offer',
    BY_ID: (id: number) => `/api/Offer/${id}`, // Changed from string
    MY_OFFERS: '/api/Offer/my-offers',
    EQUIPMENT: (id: number) => `/api/Offer/${id}/equipment`, // Changed from string
    EQUIPMENT_BY_ID: (id: number, equipmentId: number) =>
        `/api/Offer/${id}/equipment/${equipmentId}`,
    UPLOAD_IMAGE: (id: number, equipmentId: number) =>
        `/api/Offer/${id}/equipment/${equipmentId}/upload-image`,
    TERMS: (id: number) => `/api/Offer/${id}/terms`,
    INSTALLMENTS: (id: number) => `/api/Offer/${id}/installments`,
    SEND_TO_SALESMAN: (id: number) =>
        `/api/Offer/${id}/send-to-salesman`, // Changed from string
},
```

---

### 3. API Service Methods ⏳

**File:** `src/services/sales/salesApi.ts`

**Methods to Update:**

1. **`getOfferRequests()`**

      - Update to handle `id` as `number`
      - Update response type to match new API structure

2. **`getOfferRequest(id: string)`**

      - Change parameter to `id: number`
      - Update response handling

3. **`assignOfferRequest(id: string, data)`**

      - Change parameter to `id: number`
      - Update DTO structure

4. **`updateOfferRequestStatus(id: string, data)`**

      - Change parameter to `id: number`
      - Add new endpoint mapping for status update

5. **`getOffers()`**

      - Update to handle IDs as `number`

6. **`getMyOffers()`**

      - Already updated to use proper endpoint

7. **`getOffer(id: string)`**

      - Change parameter to `id: number`

8. **`createOffer(data)`**

      - Update DTO structure to include new fields
      - Change ID types to number

9. **`sendOfferToSalesman(id: string)`**

      - Change parameter to `id: number`
      - Already updated signature

10. **All Equipment methods**

       - Update to use `number` for offerId

11. **All Terms methods**

       - Update to use `number` for offerId

12. **All Installment methods**
       - Update to use `number` for offerId
       - DTO already updated

---

### 4. Store Methods ⏳

**File:** `src/stores/salesStore.ts`

**Changes Needed:**

1. **State Interfaces**

      - Update `OfferRequest` type references
      - Update `Offer` type references
      - Update all related types

2. **Action Methods**
      - Update all methods that use string IDs to use number IDs
      - Update parameter types throughout
      - Handle new response structures

---

### 5. UI Components ⏳

**Files to Update:**

1. **`src/components/sales/SalesSupportDashboard.tsx`**

      - Update OfferRequest display components
      - Update ID rendering (no longer strings)

2. **`src/components/salesSupport/OfferCreationPage.tsx`**

      - Add new fields: `paymentType`, `finalPrice`, `offerDuration`
      - Update form validation
      - Update submit handler

3. **`src/components/salesSupport/RequestsInboxPage.tsx`**

      - Update OfferRequest list rendering
      - Update ID handling

4. **All Offer-related components**
      - Update ID handling
      - Update display logic for new fields

---

## New API Features

### 1. OfferRequest Status Update

**New Endpoint:**

```
PUT /api/OfferRequest/{id}/status
```

**Request Body:**

```json
{
	"status": "Ready",
	"notes": "Offer is being prepared"
}
```

**Implementation Needed:** Add method to update offer request status with notes.

---

### 2. Enhanced Offer Creation

**New Fields:**

- `paymentType`: 'Cash' | 'Installments' | 'Other'
- `finalPrice`: number (required for installment plans)
- `offerDuration`: string

**Implementation Needed:** Add these fields to the offer creation form.

---

### 3. Simplified Installment Plan

**Response Structure:**

```json
[
  {
    "id": 1,
    "offerId": 8,
    "installmentNumber": 1,
    "amount": 416666.67,
    "dueDate": "2025-12-01T00:00:00Z",
    "status": "Pending",
    "notes": null
  },
  ...
]
```

**Implementation Needed:** Update installment plan display to show array directly (not wrapped in object).

---

## Testing Checklist

- [ ] OfferRequest list loads correctly
- [ ] OfferRequest details display correctly
- [ ] Offer creation with new fields works
- [ ] Equipment management works
- [ ] Terms management works
- [ ] Installment plan creation works
- [ ] Sending offer to salesman works
- [ ] All ID lookups work with number type
- [ ] Type conversions handled properly
- [ ] Error handling works for all endpoints

---

## Breaking Changes Summary

1. **ID Types:** All IDs are now `number` instead of `string`
2. **OfferRequest Structure:** Significant simplification
3. **Offer Fields:** Added new optional fields
4. **Status Updates:** New dedicated endpoint for status updates
5. **Installment Plans:** Removed paymentFrequency from response

---

## Migration Notes

### For Developers:

1. **Type Safety:** TypeScript will catch most issues during compilation
2. **String to Number Conversion:** May need to use `parseInt()` or `Number()` in some places
3. **Optional Fields:** New fields are optional, so existing code should continue to work
4. **Null Handling:** Some fields are now nullable; add proper null checks

### For API Calls:

1. **Change base URLs:** `/api/offerrequest` → `/api/OfferRequest`
2. **Use number for IDs:** `id="123"` → `id=123`
3. **Handle array responses:** Installment plans are returned as arrays

---

## Next Steps

1. ✅ Update type definitions
2. ⏳ Update endpoints configuration
3. ⏳ Update API service methods
4. ⏳ Update store methods
5. ⏳ Update UI components
6. ⏳ Test all functionality
7. ⏳ Fix any runtime errors
8. ⏳ Verify translations work correctly

---

**Last Updated:** October 27, 2025  
**Status:** In Progress - Types Complete, Need to update services and UI

