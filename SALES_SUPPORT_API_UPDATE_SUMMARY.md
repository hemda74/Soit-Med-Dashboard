# Sales Support API Update Summary

## Overview

Updated the Sales Support functionality to match the new API documentation provided. The changes ensure alignment between the frontend implementation and the backend API specifications.

## Changes Made

### 1. Type Updates (`src/types/sales.types.ts`)

#### OfferEquipment Interface

- **Added**: `inStock: boolean` field to track equipment availability

#### CreateEquipmentDto Interface

- **Added**: `inStock: boolean` field

#### InstallmentPlan Interface

- **Added**: `paymentFrequency?: 'Monthly' | 'Weekly' | 'Quarterly'` field

#### CreateInstallmentDto Interface

- **Changed**: Updated structure to match API documentation:
     - `numberOfInstallments: number` (was `installmentNumber`)
     - `startDate: string` (new)
     - `paymentFrequency: 'Monthly' | 'Weekly' | 'Quarterly'` (new)

#### New Interface Added

- `InstallmentPlanItem`: Represents individual installment items with details

### 2. API Endpoints (`src/services/shared/endpoints.ts`)

#### Offers Endpoints

- **Changed**: All endpoints from `/api/offer` to `/api/Offer` (capitalized)
- **Added**: `MY_OFFERS: '/api/Offer/my-offers'` endpoint for getting current user's offers
- **Added**: `SEND_TO_SALESMAN: (id: string) => \`/api/ tulEndpoint/\${id}/send-to-salesman\`` endpoint

### 3. API Service Methods (`src/services/sales/salesApi.ts`)

#### Updated Methods

1. **`getMyOffers`**

      - Now uses `/api/Offer/my-offers` endpoint
      - Returns `PaginatedApiResponseWithMeta<any[]>` (was `ApiResponse<any[]>`)
      - Updated parameter types to accept: `status`, `clientId`, `startDate`, `endDate`

2. **`sendOfferToSalesman`**

      - Removed `salesmanId` parameter
      - Now sends to the assigned salesman from the offer
      - Uses correct endpoint: `API_ENDPOINTS.SALES.OFFERS.SEND_TO_SALESMAN(offerId)`

3. **`createInstallmentPlan`**
      - Updated to accept new data structure:
           ```typescript
           {
           	numberOfInstallments, startDate, paymentFrequency;
           }
           ```
      - Removed requirement for array of installment details

### 4. API Compatibility

All endpoints now match the documentation:

- ✅ GET `/api/Offer` - Get all offers
- ✅ GET `/api/Offer/my-offers` - Get my created offers
- ✅ POST `/api/Offer` - Create new offer
- ✅ GET `/api/Offer/{offerId}` - View offer details
- ✅ POST `/api/Offer/{offerId}/equipment` - Add equipment
- ✅ GET `/api/Offer/{offerId}/equipment` - Get equipment list
- ✅ DELETE `/api/Offer/{offerId}/equipment/{equipmentId}` - Delete equipment
- ✅ POST `/api/Offer/{offerId}/equipment/{equipmentId}/upload-image` - Upload equipment image
- ✅ POST `/api/Offer/{offerId}/terms` - Add/Update terms
- ✅ POST `/api/Offer/{offerId}/installments` - Create installment plan
- ✅ POST `/api/Offer/{offerId}/send-to-salesman` - Send offer to salesman

## Key Features from Documentation

### Equipment Management

- Equipment items now track `inStock` status
- Image upload supported (max 5MB)
- Complete CRUD operations for equipment

### Terms Management

- Support for warranty, delivery time, maintenance terms
- Add/update terms via single endpoint

### Installment Plans

- Simplified creation with automatic schedule generation
- Support for Monthly, Weekly, Quarterly frequencies
- Backend generates individual installment items

## Usage Examples

### Create Offer

```typescript
const offerData = {
	offerRequestId: '123',
	clientId: '456',
	assignedTo: 'salesman-id',
	products: 'Medical equipment package',
	totalAmount: 175000.0,
	paymentTerms: '30% down payment',
	deliveryTerms: 'FOB port',
	validUntil: '2025-12-31T00:00:00Z',
	notes: 'Special discount applied',
};

await salesApi.createOffer(offerData);
```

### Add Equipment

```typescript
const equipmentData = {
	name: 'CT Scanner',
	model: 'CT-3000',
	provider: 'ScanTech',
	country: 'Germany',
	price: 150000.0,
	description: '64-slice CT scanner',
	inStock: true,
};

await salesApi.addOfferEquipment(offerId, equipmentData);
```

### Create Installment Plan

```typescript
const installmentData = {
	numberOfInstallments: 6,
	startDate: '2025-11-01T00:00:00Z',
	paymentFrequency: 'Monthly',
};

await salesApi.createInstallmentPlan(offerId, installmentData);
```

### Send Offer to Salesman

```typescript
await salesApi.sendOfferToSalesman(offerId);
```

### Get My Offers

```typescript
const myOffers = await salesApi.getMyOffers({
	status: 'Draft',
	clientId: '123',
});
```

## Existing Components

The following existing components already work with the updated API:

- `OfferRequestForm.tsx` - For creating offer requests
- `SalesSupportDashboard.tsx` - Shows assigned requests and offers
- `ClientDetails.tsx` - Displays offer requests
- `RequestWorkflow.tsx` - General request management

## Notes

- All endpoints now use consistent capitalization (`/api/Offer`)
- Equipment tracking includes stock status
- Installment plan creation is simplified
- Send to salesman functionality is streamlined
- Pagination support added for my offers endpoint

## Testing Recommendations

1. Test equipment CRUD operations with stock status
2. Verify installment plan creation generates correct schedule
3. Test sending offers to salesman
4. Verify my offers filtering works correctly
5. Test equipment image upload
