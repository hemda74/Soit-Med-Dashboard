import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ThemeProvider } from '@/components/ThemeProvider'
import AppLayout from '@/components/layout/AppLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import LoginForm from '@/components/LoginForm'
import ForgotPassword from '@/pages/ForgotPassword'
import VerifyCode from '@/pages/VerifyCode'
import ResetPassword from '@/pages/ResetPassword'
import NotFound from '@/pages/NotFound'
import Dashboard from '@/components/Dashboard'
import UserProfile from '@/components/UserProfile'
import RoleSpecificUserCreation from '@/components/admin/RoleSpecificUserCreation'
import SalesSupportUserCreation from '@/components/admin/SalesSupportUserCreation'
import UsersList from '@/components/UsersList'
import LoadingScreen from '@/components/LoadingScreen'
import ReportsScreen from '@/components/finance/ReportsScreen'
import SalesReportsScreen from '@/components/sales/SalesReportsScreen'
import { SalesManagerDashboard, SalesSupportDashboard } from '@/components/sales'
import SalesStatisticsPage from '@/components/sales/SalesStatisticsPage'
import SalesAnalyticsPage from '@/components/sales/SalesAnalyticsPage'
import RoleGuard from '@/components/shared/RoleGuard'
import SalesTargetsPage from '@/components/sales/SalesTargetsPage'
import ManagerReportsReviewPage from '@/components/sales/ManagerReportsReviewPage'
import OfferCreationPage from '@/components/salesSupport/OfferCreationPage'
import RequestsInboxPage from '@/components/salesSupport/RequestsInboxPage'
import ProductsCatalogPage from '@/components/salesSupport/ProductsCatalogPage'
import { WeeklyPlansScreen } from '@/components/weeklyPlan'
import NotificationsPage from '@/pages/NotificationsPage'
import OffersManagementPage from '@/pages/OffersManagementPage'
import TestEquipmentImagePage from '@/pages/TestEquipmentImagePage'
import PerformancePage from '@/pages/PerformancePage'
import DealsManagementPage from '@/pages/salesManager/DealsManagementPage'
import DealApprovalsPage from '@/pages/salesManager/DealApprovalsPage'
import SalesClientsPage from '@/pages/salesManager/SalesClientsPage'
import SuperAdminDealApprovalsPage from '@/pages/superAdmin/SuperAdminDealApprovalsPage'
import {
	MaintenanceSupportDashboard,
	MaintenanceRequestDetails,
	MaintenanceVisitManagement,
	SparePartRequestManagement,
	SparePartsCoordinatorDashboard,
	InventoryManagerDashboard,
} from '@/components/maintenance';
import { AccountingDashboard, FinancialReportsScreen } from '@/components/accounting';
import { PaymentDetailsView } from '@/components/payment';
import { useNotificationStore } from '@/stores/notificationStore'
import { useEffect } from 'react'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'

function App() {
  const { isAuthenticated, isAuthorizedToAccess, logout } = useAuthStore()
  const { initialize: initializeNotifications } = useNotificationStore()

  // Initialize notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializeNotifications()
    }
  }, [isAuthenticated, initializeNotifications])

  // Check authorization on mount and when authentication changes
  if (isAuthenticated && !isAuthorizedToAccess()) {
    logout()
    return (
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <LoadingScreen />
          {isAuthenticated ? (
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="reports" element={<ReportsScreen />} />
                <Route path="sales-reports" element={<SalesReportsScreen />} />
                <Route path="sales-manager" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><SalesManagerDashboard /></RoleGuard>} />
                <Route path="sales-manager/targets" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><SalesTargetsPage /></RoleGuard>} />
                <Route path="sales-manager/reports-review" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><ManagerReportsReviewPage /></RoleGuard>} />
                <Route path="sales-manager/deals" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><DealsManagementPage /></RoleGuard>} />
                <Route path="sales-manager/deal-approvals" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><DealApprovalsPage /></RoleGuard>} />
                <Route path="sales-manager/clients" element={<RoleGuard requiredAnyRoles={["SalesManager", "SalesSupport", "SuperAdmin"]}><SalesClientsPage /></RoleGuard>} />
                <Route path="sales-manager/offers" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><OffersManagementPage /></RoleGuard>} />
                <Route path="sales-statistics" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><SalesStatisticsPage /></RoleGuard>} />
                <Route path="sales-analytics" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><SalesAnalyticsPage /></RoleGuard>} />
                <Route path="super-admin/deal-approvals" element={<RoleGuard requiredAnyRoles={["SuperAdmin"]}><SuperAdminDealApprovalsPage /></RoleGuard>} />


                <Route path="sales-support" element={<RoleGuard requiredAnyRoles={["SalesSupport", "SuperAdmin"]}><SalesSupportDashboard /></RoleGuard>} />
                <Route path="sales-support/offer" element={<RoleGuard requiredAnyRoles={["SalesSupport", "SuperAdmin"]}><OfferCreationPage /></RoleGuard>} />
                <Route path="sales-support/requests" element={<RoleGuard requiredAnyRoles={["SalesSupport", "SuperAdmin"]}><RequestsInboxPage /></RoleGuard>} />
                <Route path="sales-support/products" element={<RoleGuard requiredAnyRoles={["SalesSupport", "SalesManager", "SuperAdmin"]}><ProductsCatalogPage /></RoleGuard>} />
                <Route path="weekly-plans" element={<WeeklyPlansScreen />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="admin/create-role-user" element={<RoleSpecificUserCreation />} />
                <Route path="admin/create-sales-support" element={<SalesSupportUserCreation />} />
                <Route path="admin/users" element={<RoleGuard requiredAnyRoles={["Admin", "SuperAdmin"]}><UsersList /></RoleGuard>} />
                <Route path="admin/test-equipment-image" element={<RoleGuard requiredAnyRoles={["SuperAdmin", "SalesSupport", "SalesManager"]}><TestEquipmentImagePage /></RoleGuard>} />
                <Route path="performance" element={<PerformancePage />} />
                <Route path="maintenance-support" element={<RoleGuard requiredAnyRoles={["MaintenanceSupport", "MaintenanceManager", "SuperAdmin"]}><MaintenanceSupportDashboard /></RoleGuard>} />
                <Route path="maintenance/requests/:id" element={<RoleGuard requiredAnyRoles={["MaintenanceSupport", "MaintenanceManager", "Engineer", "SuperAdmin"]}><MaintenanceRequestDetails /></RoleGuard>} />
                <Route path="maintenance/visits" element={<RoleGuard requiredAnyRoles={["Engineer", "MaintenanceManager", "SuperAdmin"]}><MaintenanceVisitManagement /></RoleGuard>} />
                <Route path="maintenance/spare-parts" element={<RoleGuard requiredAnyRoles={["SparePartsCoordinator", "InventoryManager", "Doctor", "HospitalAdmin", "SuperAdmin"]}><SparePartRequestManagement /></RoleGuard>} />
                <Route path="spare-parts-coordinator" element={<RoleGuard requiredAnyRoles={["SparePartsCoordinator", "SuperAdmin"]}><SparePartsCoordinatorDashboard /></RoleGuard>} />
                <Route path="inventory-manager" element={<RoleGuard requiredAnyRoles={["InventoryManager", "SuperAdmin"]}><InventoryManagerDashboard /></RoleGuard>} />
                <Route path="accounting" element={<RoleGuard requiredAnyRoles={["FinanceManager", "FinanceEmployee", "SuperAdmin"]}><AccountingDashboard /></RoleGuard>} />
                <Route path="accounting/reports" element={<RoleGuard requiredAnyRoles={["FinanceManager", "FinanceEmployee", "SuperAdmin"]}><FinancialReportsScreen /></RoleGuard>} />
                <Route path="payments/:id" element={<RoleGuard requiredAnyRoles={["FinanceManager", "FinanceEmployee", "Doctor", "HospitalAdmin", "SuperAdmin"]}><PaymentDetailsView /></RoleGuard>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<AuthLayout><LoginForm /></AuthLayout>} />
              <Route path="login" element={<AuthLayout><LoginForm /></AuthLayout>} />
              <Route path="forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
              <Route path="verify-code" element={<AuthLayout><VerifyCode /></AuthLayout>} />
              <Route path="reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </div>
        {/* Performance Monitor - Only visible in development */}
        <PerformanceMonitor />
      </Router>
    </ThemeProvider>
  )
}

export default App
