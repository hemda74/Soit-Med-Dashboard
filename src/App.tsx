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
import UsersList from '@/components/UsersList'
import LoadingScreen from '@/components/LoadingScreen'
import ReportsScreen from '@/components/finance/ReportsScreen'
import UnifiedSalesManagerDashboard from '@/components/dashboards/UnifiedSalesManagerDashboard'
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
import ChatPage from '@/pages/ChatPage'
import PerformancePage from '@/pages/PerformancePage'
import DealsManagementPage from '@/pages/salesManager/DealsManagementPage'
import DealApprovalsPage from '@/pages/salesManager/DealApprovalsPage'
import OfferApprovalsPage from '@/pages/salesManager/OfferApprovalsPage'
import SalesClientsPage from '@/pages/salesManager/SalesClientsPage'
import EditOfferPage from '@/pages/salesManager/EditOfferPage'
import SuperAdminDealApprovalsPage from '@/pages/superAdmin/SuperAdminDealApprovalsPage'
import LegalDealsPage from '@/pages/legal/LegalDealsPage'
import LegalDealsHistoryPage from '@/pages/legal/LegalDealsHistoryPage'
import ContractsPage from '@/pages/contracts/ContractsPage'
import ClientAccountCreationPage from '@/pages/admin/ClientAccountCreationPage'
import EnhancedClientEquipmentVisitsPage from '@/pages/EnhancedClientEquipmentVisitsPage'
import MaintenanceDashboardUI from '@/pages/MaintenanceDashboardUI'
import ClientEquipmentDetails from '@/pages/ClientEquipmentDetails'
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
import RoleSpecificUserCreation from './components/admin/RoleSpecificUserCreation'

function App() {
  const { isAuthenticated, isAuthorizedToAccess, logout, user } = useAuthStore()
  const { initialize: initializeNotifications } = useNotificationStore()

  // Initialize notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializeNotifications()
    }
  }, [isAuthenticated, initializeNotifications])

  // Check authorization only after user data is loaded
  // This prevents premature logout when user data is still being loaded
  useEffect(() => {
    if (isAuthenticated && user) {
      // Only check authorization if we have user data
      if (!isAuthorizedToAccess()) {
        logout()
      }
    }
  }, [isAuthenticated, user, isAuthorizedToAccess, logout])

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
                <Route path="SalesManager" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><UnifiedSalesManagerDashboard /></RoleGuard>} />
                <Route path="SalesManager/targets" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><SalesTargetsPage /></RoleGuard>} />
                <Route path="SalesManager/reports-review" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><ManagerReportsReviewPage /></RoleGuard>} />
                <Route path="SalesManager/deals" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><DealsManagementPage /></RoleGuard>} />
                <Route path="SalesManager/deal-approvals" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><DealApprovalsPage /></RoleGuard>} />
                <Route path="SalesManager/offer-approvals" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><OfferApprovalsPage /></RoleGuard>} />
                <Route path="SalesManager/clients" element={<RoleGuard requiredAnyRoles={["SalesManager", "SalesSupport", "SuperAdmin"]}><SalesClientsPage /></RoleGuard>} />
                <Route path="SalesManager/offers" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><OffersManagementPage /></RoleGuard>} />
                <Route path="SalesManager/offers/:id/edit" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><EditOfferPage /></RoleGuard>} />
                <Route path="chat" element={<RoleGuard requiredAnyRoles={["Admin", "SuperAdmin", "SalesManager", "SalesSupport", "Customer"]}><ChatPage /></RoleGuard>} />
                <Route path="sales-statistics" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><SalesStatisticsPage /></RoleGuard>} />
                <Route path="sales-analytics" element={<RoleGuard requiredAnyRoles={["SalesManager", "SuperAdmin"]}><SalesAnalyticsPage /></RoleGuard>} />
                <Route path="super-Admin/deal-approvals" element={<RoleGuard requiredAnyRoles={["SuperAdmin"]}><SuperAdminDealApprovalsPage /></RoleGuard>} />
                <Route path="legal/deals" element={<RoleGuard requiredAnyRoles={["LegalManager", "LegalEmployee", "SuperAdmin"]}><LegalDealsPage /></RoleGuard>} />
                <Route path="legal/deals/history" element={<RoleGuard requiredAnyRoles={["LegalManager", "LegalEmployee", "SuperAdmin"]}><LegalDealsHistoryPage /></RoleGuard>} />
                <Route path="contracts" element={<RoleGuard requiredAnyRoles={["LegalManager", "LegalEmployee", "SuperAdmin"]}><ContractsPage /></RoleGuard>} />
                <Route path="sales-support/offer" element={<RoleGuard requiredAnyRoles={["SalesSupport", "SuperAdmin"]}><OfferCreationPage /></RoleGuard>} />
                <Route path="sales-support/requests" element={<RoleGuard requiredAnyRoles={["SalesSupport", "SuperAdmin"]}><RequestsInboxPage /></RoleGuard>} />
                <Route path="sales-support/products" element={<RoleGuard requiredAnyRoles={["SalesSupport", "SalesManager", "SuperAdmin"]}><ProductsCatalogPage /></RoleGuard>} />
                <Route path="weekly-plans" element={<WeeklyPlansScreen />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="Admin/create-role-user" element={<RoleGuard requiredAnyRoles={["Admin", "SuperAdmin"]}><RoleSpecificUserCreation /></RoleGuard>} />
                <Route path="Admin/users" element={<RoleGuard requiredAnyRoles={["Admin", "SuperAdmin"]}><UsersList /></RoleGuard>} />
                <Route path="Admin/client-accounts" element={<RoleGuard requiredAnyRoles={["Admin", "SuperAdmin"]}><ClientAccountCreationPage /></RoleGuard>} />
                <Route path="performance" element={<PerformancePage />} />
                <Route path="maintenance-support" element={<RoleGuard requiredAnyRoles={["MaintenanceSupport", "MaintenanceManager", "SuperAdmin"]}><MaintenanceSupportDashboard /></RoleGuard>} />
                <Route path="maintenance/requests/:id" element={<RoleGuard requiredAnyRoles={["MaintenanceSupport", "MaintenanceManager", "Engineer", "SuperAdmin"]}><MaintenanceRequestDetails /></RoleGuard>} />
                <Route path="maintenance/visits" element={<RoleGuard requiredAnyRoles={["Engineer", "MaintenanceManager", "SuperAdmin"]}><MaintenanceVisitManagement /></RoleGuard>} />
                <Route path="maintenance/spare-parts" element={<RoleGuard requiredAnyRoles={["SparePartsCoordinator", "InventoryManager", "Doctor", "HospitalAdmin", "SuperAdmin"]}><SparePartRequestManagement /></RoleGuard>} />
                <Route path="maintenance/client-equipment-visits" element={<RoleGuard requiredAnyRoles={["MaintenanceSupport", "MaintenanceManager", "Engineer", "SuperAdmin"]}><EnhancedClientEquipmentVisitsPage /></RoleGuard>} />
                <Route path="maintenance-dashboard-ui" element={<RoleGuard requiredAnyRoles={["MaintenanceSupport", "MaintenanceManager", "Engineer", "SuperAdmin"]}><MaintenanceDashboardUI /></RoleGuard>} />
                <Route path="client/:customerId/equipment" element={<RoleGuard requiredAnyRoles={["MaintenanceSupport", "MaintenanceManager", "Engineer", "SuperAdmin"]}><ClientEquipmentDetails /></RoleGuard>} />
                <Route path="spare-parts-coordinator" element={<RoleGuard requiredAnyRoles={["SparePartsCoordinator", "SuperAdmin"]}><SparePartsCoordinatorDashboard /></RoleGuard>} />
                <Route path="InventoryManager" element={<RoleGuard requiredAnyRoles={["InventoryManager", "SuperAdmin"]}><InventoryManagerDashboard /></RoleGuard>} />
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
