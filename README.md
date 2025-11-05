# SoitMed Dashboard

## Overview

SoitMed Dashboard is a modern web application built with React and TypeScript, providing a comprehensive interface for managing the SoitMed Hospital Management System. The dashboard serves multiple user roles including administrators, sales managers, sales support, engineers, and finance staff.

## Business Value

### For Administrators
- **Complete System Control**: Manage users, roles, departments, and system settings
- **Real-Time Monitoring**: Monitor system activity and notifications in real-time
- **Data Analytics**: Access comprehensive reports and analytics
- **User Management**: Create and manage user accounts across all departments

### For Sales Team
- **Client Management**: Complete CRM functionality for client lifecycle management
- **Offer Management**: Create, approve, and manage sales offers
- **Deal Tracking**: Track deals through approval workflow
- **Performance Metrics**: View sales statistics and target progress
- **Real-Time Updates**: Instant notifications for offers, deals, and client updates

### For Sales Support
- **Offer Creation**: Create detailed offers with equipment, terms, and installments
- **Task Management**: Manage offer requests from salesmen
- **Client Information**: Access complete client history and details
- **Notification System**: Receive real-time notifications for new requests

### For Engineers
- **Repair Request Management**: View and manage repair requests
- **Equipment Tracking**: Access equipment information and history
- **Status Updates**: Update repair request status
- **Real-Time Notifications**: Get notified about new assignments

## Key Features

### Real-Time Notifications
- **Instant Delivery**: Receive notifications instantly via SignalR WebSocket connection
- **Notification Bell**: Badge showing unread notification count
- **Notification Dropdown**: Quick access to recent notifications
- **Notification Panel**: Full notification history with filtering
- **Notification Types**: Offers, deals, tasks, clients, workflows, and system notifications

### Multi-Role Support
- **Role-Based Access**: Different interfaces based on user role
- **Department Management**: Support for 6 departments (Administration, Medical, Sales, Engineering, Finance, Legal)
- **Permission System**: Fine-grained access control

### Sales Module (Complete CRM)
- **Client Management**: Full client lifecycle tracking
- **Weekly Planning**: Salesmen create and track weekly plans
- **Task Progress**: Record visits, calls, and meetings
- **Offer System**: Complete offer creation and approval workflow
- **Deal Management**: Multi-level approval (Salesman → Manager → SuperAdmin)
- **Statistics & Reporting**: Performance tracking and analytics
- **Target Management**: Set and track quarterly/yearly targets

### Equipment Management
- **Equipment Tracking**: View equipment status and history
- **Repair Requests**: Manage repair request workflow
- **QR Code Integration**: Equipment identification system
- **Maintenance History**: Complete maintenance records

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running and accessible
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. **Install Dependencies**
```bash
npm install
# or
yarn install
```

2. **Configure Environment**
   - Create `.env` file with backend API URL:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

3. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

4. **Access Dashboard**
   - Open browser to `http://localhost:5173`
   - Login with your credentials

## Notification System

### How It Works

1. **On Page Load**:
   - Dashboard connects to SignalR hub
   - Retrieves notification history
   - Displays unread count badge
   - Listens for real-time notifications

2. **When Notification Arrives**:
   - SignalR delivers notification instantly
   - Notification appears in dropdown
   - Badge count updates
   - User can click to view details

3. **Notification Display**:
   - **Bell Icon**: Shows unread count badge
   - **Dropdown**: Lists recent notifications
   - **Full Panel**: Complete notification history
   - **Mark as Read**: Mark individual or all as read

### Notification Types

- **Offer Notifications**: New offers, approvals, rejections
- **Deal Notifications**: Deal status changes, approvals
- **Task Notifications**: Task assignments, completions
- **Client Notifications**: Client updates, new clients
- **Workflow Notifications**: Request approvals, status changes
- **System Notifications**: System updates, maintenance notices

📖 **Technical Details**: See [NOTIFICATION.md](../NOTIFICATION.md) for complete notification system documentation

## Project Structure

```
Soit-Med-Dashboard/
├── src/
│   ├── components/         # Reusable UI components
│   ├── contexts/            # React contexts (Auth, Notifications)
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript types
├── public/                  # Static assets
└── package.json             # Dependencies
```

## Key Components

### NotificationContext
- Manages SignalR connection
- Handles notification state
- Provides notification count
- Handles real-time updates

### API Service
- Centralized API calls
- Authentication handling
- Error handling
- Request/response interceptors

## Authentication

The dashboard uses JWT authentication:
- Tokens stored in localStorage
- Automatic token refresh
- Secure logout
- Session management

## API Integration

### Base URL Configuration
Set in `.env` file:
```env
VITE_API_URL=https://your-backend-url.com
```

### Key Endpoints
- `/api/Account/login` - User authentication
- `/api/Notification` - Notification management
- `/api/SalesOffer` - Offer management
- `/api/SalesDeal` - Deal management
- `/api/Client` - Client management
- `/notificationHub` - SignalR real-time connection

## Building for Production

### Build
```bash
npm run build
# or
yarn build
```

### Preview
```bash
npm run preview
# or
yarn preview
```

### Deploy
The `dist` folder contains the production build. Deploy to:
- Static hosting (Netlify, Vercel, GitHub Pages)
- Web server (Nginx, Apache)
- CDN

## Role-Specific Features

### Salesman
- Weekly plan creation
- Task progress tracking
- Offer requests
- Client management
- Deal creation

### Sales Manager
- Team performance overview
- Deal approvals
- Target management
- Sales analytics

### Sales Support
- Offer creation
- Client information
- Request management
- Offer details

### Super Admin
- Complete system access
- User management
- Deal approvals
- System configuration

## Troubleshooting

### Notifications Not Working
- **Check**: SignalR connection established
- **Check**: Authentication token valid
- **Check**: Backend is running
- **Solution**: Check browser console and network tab

### Connection Issues
- **Check**: Backend URL is correct
- **Check**: CORS configuration
- **Check**: Network connectivity
- **Solution**: Verify API configuration

### Build Errors
- **Check**: All dependencies installed
- **Check**: Node.js version (18+)
- **Check**: TypeScript errors
- **Solution**: Run `npm install` and check TypeScript

## Support

For technical questions:
- Review [NOTIFICATION.md](../NOTIFICATION.md) for notification system details
- Check backend API documentation
- Review component documentation
- Check React and TypeScript documentation

## License

This project is licensed under the MIT License.

---

**Built for comprehensive hospital management**

*Last Updated: November 2025*

