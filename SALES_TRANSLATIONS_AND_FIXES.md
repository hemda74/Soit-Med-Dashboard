# Sales Module Translations and API Fixes

## Summary of Changes

This document outlines the translations added for the Sales module and the API error fix implemented.

## 1. Translations Added

### English Translations (`src/lib/translations.ts`)

Added comprehensive translations for:

- **Sales Roles**: Sales Support, Sales Manager, Salesman
- **Entities**: Clients, Offers, Requests, Visits, Interactions, Deals, Equipment, Terms, Installments
- **Statuses**: Draft, Sent, Accepted, Rejected, Under Review, Expired, In Progress, Completed, Pending
- **Actions**: Create Offer, View Offer, Edit Offer, Send Offer, Add Equipment, Update Terms
- **Fields**: Client Name, Products, Total Amount, Valid Until, Payment/Delivery Terms, etc.

### Arabic Translations

Added corresponding Arabic translations for all the above items, maintaining consistency with the existing translation structure.

## 2. API Fix - Client Search 400 Error

### Problem

When clicking "Create New Offer" in Sales Support dashboard, the application was making a GET request to `/api/client/search` without any query parameters, resulting in a 400 Bad Request error.

### Root Cause

The `getMyClients()` method was calling the search endpoint without checking if filters were provided. The API endpoint requires at least one filter parameter.

### Solution

Modified the `getMyClients()` method in `src/services/sales/salesApi.ts` to:

1. Check if any filters are provided
2. If no filters, return an empty result set immediately without making the API call
3. Only make the API call when filters are present

### Code Changes

```typescript
async getMyClients(
    filters: Omit<ClientSearchFilters, 'assigned দেওয়ানId'> = {}
): Promise<PaginatedApiResponse<ClientSearchResult>> {
    // For Sales Support, return empty result if no filters to avoid 400 error
    const hasAnyFilter = Object.keys(filters).length > 0;

    if (!hasAnyFilter) {
        return {
            success: true,
            message: 'No clients found',
            data: {
                clients: [],
                totalCount: 0,
                page: 1,
                pageSize: 20,
                totalPages: 0,
                hasNextPage: false,
                hasPreviousPage: false,
            },
            timestamp: new Date().toISOString(),
        };
    }
    // ... rest of the code
}
```

## 3. File Structure Recommendations

The current structure is already well-organized:

- `src/components/sales/` - Contains sales-related components
- `src/components/salesSupport/` - Contains sales support specific components
- `src/services/sales/` - Contains API services
- `src/types/sales.types.ts` - Contains type definitions
- `src/stores/salesStore.ts` - Contains state management

### Suggested Improvements (Optional)

For better organization in the future:

1. **Separate by Feature**:

      ```
      src/features/
        sales/
          components/
            dashboard/
            offers/
            clients/
            requests/
          services/
          types/
          hooks/
      ```

2. **Or Keep Current Structure**:
      - Current structure is fine and follows existing patterns
      - No changes needed unless specifically requested

## 4. Using Translations in Components

To use the new translations in components:

```typescript
import { useTranslation } from '@/hooks/useTranslation';

const MyComponent = () => {
	const { t } = useTranslation();

	return (
		<div>
			<h1>{t('salesSupport')}</h1>
			<button>{t('createNewOffer')}</button>
			<p>{t('manageOffersAndRequests')}</p>
		</div>
	);
};
```

## 5. Testing Recommendations

1. **Test Create New Offer**:

      - Click "Create New Offer" button
      - Verify no 400 error appears in console
      - Verify empty client list is shown initially

2. **Test Client Search**:

      - Enter search query
      - Verify API call is made with filters
      - Verify results are displayed

3. **Test Translations**:
      - Switch language between English and Arabic
      - Verify all sales-related text is translated
      - Verify status badges show correct translations

## 6. Benefits

1. **Better UX**: No more 400 errors when opening Sales Support dashboard
2. **Internationalization**: Full translation support for Sales module
3. **Consistency**: All sales-related terms are now centralized in translations
4. **Maintainability**: Easy to add more translations in the future

## 7. Future Enhancements

Consider adding:

- More detailed error messages in translations
- Tooltip translations
- Form validation messages in translations
- Export/import functionality translations
- Analytics dashboard translations
