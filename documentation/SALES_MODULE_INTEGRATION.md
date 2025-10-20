# Sales Module Integration Guide

## Overview

This document provides a comprehensive guide for the sales module integration into the Soit-Med Dashboard. The sales module includes client management, visit tracking, interaction logging, analytics, and role-based dashboards for sales managers and salesmen.

## Features Implemented

### 1. Client Management

- **Client Search**: Advanced search with filters (type, status, location, specialization)
- **Client Details**: Comprehensive client information with contact details, business info, and analytics
- **Client CRUD**: Create, read, update, and delete client records
- **Client Types**: Doctor, Hospital, Clinic, Pharmacy, Other
- **Client Status**: Active, Inactive, Prospect, Lost

### 2. Visit Management

- **Visit Scheduling**: Schedule client visits with different types
- **Visit Tracking**: Track visit status (Scheduled, Completed, Cancelled, Postponed)
- **Visit Types**: Initial, Follow-up, Maintenance, Support, Presentation, Negotiation, Closing
- **Visit Analytics**: Duration tracking, travel distance, costs, outcomes

### 3. Interaction Management

- **Interaction Logging**: Log all client interactions (calls, emails, meetings, etc.)
- **Interaction Types**: Call, Email, Meeting, Video Call, WhatsApp, Other
- **Follow-up Tracking**: Track required follow-ups and next steps
- **Outcome Tracking**: Positive, Neutral, Negative outcomes

### 4. Analytics & Reporting

- **Sales Analytics**: Comprehensive performance metrics
- **Team Performance**: Sales manager view of team performance
- **Personal Metrics**: Individual salesman performance tracking
- **Trends Analysis**: Visit trends, client trends, conversion rates
- **Export Functionality**: Export reports in PDF, Excel, CSV formats

### 5. Role-Based Dashboards

#### Sales Manager Dashboard

- Team overview and performance metrics
- Client management across the team
- Visit management and scheduling
- Team performance analytics
- Sales reports and trends
- Overdue items and follow-ups

#### Salesman Dashboard

- Personal client portfolio
- Individual visit management
- Personal performance metrics
- Today's schedule and upcoming visits
- Client interaction tracking
- Personal analytics and trends

## Technical Implementation

### 1. Type Definitions (`src/types/sales.types.ts`)

Comprehensive TypeScript types for:

- Client management (Client, CreateClientDto, UpdateClientDto)
- Visit management (ClientVisit, CreateClientVisitDto, UpdateClientVisitDto)
- Interaction management (ClientInteraction, CreateClientInteractionDto)
- Analytics (SalesAnalytics, SalesPerformanceMetrics, SalesDashboardData)
- API responses and pagination

### 2. API Service (`src/services/sales/salesApi.ts`)

RESTful API service following existing patterns:

- Client CRUD operations
- Visit management
- Interaction logging
- Analytics and reporting
- Export functionality
- Error handling and authentication

### 3. State Management (`src/stores/salesStore.ts`)

Zustand store for sales module state:

- Client state management
- Visit and interaction tracking
- Analytics data caching
- UI state management
- Error handling and loading states

### 4. Components

#### ClientSearch (`src/components/sales/ClientSearch.tsx`)

- Advanced search with filters
- Real-time search results
- Client type and status badges
- Responsive design with mobile support

#### ClientDetails (`src/components/sales/ClientDetails.tsx`)

- Comprehensive client information display
- Tabbed interface (Overview, Visits, Interactions, Analytics)
- Visit and interaction management
- Client editing and deletion

#### SalesManagerDashboard (`src/components/sales/SalesManagerDashboard.tsx`)

- Team overview and metrics
- Client management interface
- Visit management and scheduling
- Team performance analytics
- Sales reports and trends

#### SalesmanDashboard (`src/components/sales/SalesmanDashboard.tsx`)

- Personal dashboard for individual salesmen
- Client portfolio management
- Visit scheduling and tracking
- Personal performance metrics
- Today's schedule and upcoming visits

### 5. Navigation Integration

- Role-based navigation in sidebar
- Sales Manager specific menu items
- Salesman specific menu items
- Dashboard integration with role-based content

### 6. Translations

Comprehensive translation support for:

- All UI elements and labels
- Client types and statuses
- Visit types and statuses
- Interaction types
- Error messages and notifications

## API Endpoints

### Client Management

- `GET /api/Client/search` - Search clients with filters
- `POST /api/Client` - Create new client
- `GET /api/Client/{id}` - Get client by ID
- `PUT /api/Client/{id}` - Update client
- `DELETE /api/Client/{id}` - Delete client
- `GET /api/Client/my-clients` - Get current user's clients
- `GET /api/Client/follow-up-needed` - Get clients needing follow-up
- `GET /api/Client/statistics` - Get client statistics

### Visit Management

- `POST /api/ClientVisit` - Create client visit
- `GET /api/ClientVisit/client/{clientId}` - Get client visits
- `PUT /api/ClientVisit/{id}` - Update visit
- `DELETE /api/ClientVisit/{id}` - Delete visit
- `GET /api/ClientVisit/overdue` - Get overdue visits
- `GET /api/ClientVisit/upcoming` - Get upcoming visits

### Interaction Management

- `POST /api/ClientInteraction` - Create interaction
- `GET /api/ClientInteraction/client/{clientId}` - Get client interactions
- `PUT /api/ClientInteraction/{id}` - Update interaction
- `DELETE /api/ClientInteraction/{id}` - Delete interaction

### Analytics & Reporting

- `GET /api/SalesAnalytics/dashboard` - Get dashboard data
- `GET /api/SalesAnalytics/performance` - Get performance metrics
- `GET /api/SalesAnalytics/trends` - Get sales trends
- `POST /api/SalesAnalytics/export` - Export sales data
- `POST /api/SalesReport/generate` - Generate sales report
- `GET /api/SalesReport/{id}/export` - Export sales report

## Usage Examples

### 1. Client Search

```tsx
import { ClientSearch } from '@/components/sales';

<ClientSearch
	onClientSelect={(client) => {
		console.log('Selected client:', client);
	}}
	placeholder="Search clients..."
	showFilters={true}
/>;
```

### 2. Client Details

```tsx
import { ClientDetails } from '@/components/sales';

<ClientDetails
	clientId="client-123"
	onEdit={(client) => {
		// Handle client edit
	}}
	onDelete={(clientId) => {
		// Handle client deletion
	}}
/>;
```

### 3. Sales Dashboard

```tsx
import { SalesManagerDashboard, SalesmanDashboard } from '@/components/sales';

// For Sales Manager
<SalesManagerDashboard />

// For Salesman
<SalesmanDashboard />
```

### 4. Using Sales Store

```tsx
import {
	useSalesStore,
	useClients,
	useClientVisits,
} from '@/stores/salesStore';

function MyComponent() {
	const { searchClients, createClient } = useSalesStore();
	const clients = useClients();
	const visits = useClientVisits();

	// Use the store methods and selectors
}
```

## Role-Based Access

### Sales Manager

- Access to team management dashboard
- View all team members' clients and visits
- Team performance analytics
- Sales reports and trends
- Client management across the team

### Salesman

- Personal dashboard with own clients
- Individual visit management
- Personal performance metrics
- Client interaction tracking
- Personal analytics

### SuperAdmin

- Access to all sales features
- Both manager and salesman dashboards
- Full system analytics
- All reporting capabilities

## Configuration

### Environment Variables

```env
VITE_API_BASE_URL=https://your-api-url.com
```

### API Configuration

The sales module uses the existing API configuration in `src/config/api.ts` and follows the same authentication patterns.

## Error Handling

The sales module includes comprehensive error handling:

- API error handling with user-friendly messages
- Loading states for all operations
- Toast notifications for success/error feedback
- Graceful fallbacks for missing data

## Performance Considerations

- Lazy loading of dashboard components
- Pagination for large datasets
- Debounced search to reduce API calls
- Caching of frequently accessed data
- Optimized re-renders with proper state management

## Testing

The sales module is designed to be easily testable:

- Isolated components with clear props interfaces
- Mockable API service
- Testable store with pure functions
- Comprehensive type definitions for better testing

## Future Enhancements

Potential future improvements:

- Real-time notifications for visits and interactions
- Advanced analytics with charts and graphs
- Mobile app integration
- CRM integration
- Advanced reporting with custom templates
- Workflow automation
- Integration with calendar systems

## Troubleshooting

### Common Issues

1. **Client search not working**

      - Check API endpoint configuration
      - Verify authentication token
      - Check network connectivity

2. **Dashboard not loading**

      - Verify user role permissions
      - Check API responses
      - Review browser console for errors

3. **Visit creation failing**
      - Validate required fields
      - Check date format
      - Verify client ID exists

### Debug Mode

Enable debug mode by setting:

```env
VITE_DEBUG_SALES=true
```

This will log additional information to the console for debugging purposes.

## Support

For technical support or questions about the sales module:

1. Check the browser console for error messages
2. Review the API responses in the Network tab
3. Verify user permissions and role assignments
4. Check the store state using Redux DevTools (if available)

## Conclusion

The sales module provides a comprehensive solution for managing sales operations within the Soit-Med Dashboard. It follows existing patterns and conventions while providing powerful features for both sales managers and individual salesmen. The modular design allows for easy maintenance and future enhancements.

