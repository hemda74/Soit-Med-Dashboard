# Web Project - Automated Commit Script for Dev Branch
# ====================================================
# This script executes all commit commands from COMMIT_COMMANDS.txt
# Make sure you're on the dev branch before running this script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Web Project - Commit Automation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're on dev branch
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "dev") {
    Write-Host "WARNING: You are on branch '$currentBranch', not 'dev'" -ForegroundColor Yellow
    Write-Host "Switching to dev branch..." -ForegroundColor Yellow
    git checkout dev
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to switch to dev branch" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Current branch: dev" -ForegroundColor Green
Write-Host ""

# Check and set remote repository
$remoteUrl = "https://github.com/hemda74/Soit-Med-Dashboard"
$currentRemote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0 -or $currentRemote -ne $remoteUrl) {
    Write-Host "Setting remote repository..." -ForegroundColor Yellow
    if ($currentRemote) {
        git remote set-url origin $remoteUrl
    } else {
        git remote add origin $remoteUrl
    }
    Write-Host "✓ Remote set to: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "✓ Remote repository verified: $remoteUrl" -ForegroundColor Green
}
Write-Host ""

# Commit 1: Translation Infrastructure
Write-Host "Commit 1: Translation Infrastructure" -ForegroundColor Yellow
git add src/utils/translations.ts
git commit -m "feat: add translation utility for non-React contexts

- Create getTranslation utility function for hooks and services
- Enable translation access outside React components
- Support language switching via theme store"
Write-Host "✓ Commit 1 completed" -ForegroundColor Green
Write-Host ""

# Commit 2: Core Translation Updates
Write-Host "Commit 2: Core Translation Updates" -ForegroundColor Yellow
git add src/lib/translations.ts
git commit -m "feat: add comprehensive translation keys for all modules

- Add payment module translations (success/error messages)
- Add maintenance module translations (request/visit operations)
- Add weekly plans translations (forms, modals, statuses)
- Add dashboard translations (metrics, cards, labels)
- Add sales support translations (reports, offers, approvals)
- Add form placeholder translations (product forms, search)
- Add error and success message translations
- Ensure all keys have both English and Arabic translations"
Write-Host "✓ Commit 2 completed" -ForegroundColor Green
Write-Host ""

# Commit 3: Sales Components Translation Integration
Write-Host "Commit 3: Sales Components Translation Integration" -ForegroundColor Yellow
git add src/components/sales/SalesmanReportForm.tsx
git add src/components/sales/SalesSupportDashboard.tsx
git add src/components/sales/ClientDetails.tsx
git add src/components/sales/SalesSupportClientDetails.tsx
git commit -m "feat: integrate translations in sales components

- Replace hardcoded strings in SalesmanReportForm with translation keys
- Update SalesSupportDashboard with translated labels and messages
- Add translations to ClientDetails component
- Update SalesSupportClientDetails with translation support
- Ensure all user-facing text uses translation system"
Write-Host "✓ Commit 3 completed" -ForegroundColor Green
Write-Host ""

# Commit 4: Page Components Translation Integration
Write-Host "Commit 4: Page Components Translation Integration" -ForegroundColor Yellow
git add src/pages/OffersManagementPage.tsx
git add src/pages/salesman/DealReportsPage.tsx
git add src/pages/salesManager/EditOfferPage.tsx
git add src/pages/salesManager/DealsManagementPage.tsx
git add src/pages/legal/LegalDealsPage.tsx
git add src/pages/admin/ClientAccountCreationPage.tsx
git commit -m "feat: integrate translations in page components

- Update OffersManagementPage with translation support
- Replace hardcoded strings in DealReportsPage
- Add translations to EditOfferPage for offer editing
- Update DealsManagementPage with translated messages
- Add translations to LegalDealsPage
- Update ClientAccountCreationPage with translation keys
- Replace all toast messages and error texts with translations"
Write-Host "✓ Commit 4 completed" -ForegroundColor Green
Write-Host ""

# Commit 5: Hooks and Services Translation Integration
Write-Host "Commit 5: Hooks and Services Translation Integration" -ForegroundColor Yellow
git add src/services/notificationService.ts
git add src/hooks/usePaymentQueries.ts
git add src/hooks/useMaintenanceQueries.ts
git commit -m "feat: integrate translations in hooks and services

- Update notificationService with translated toast messages
- Replace hardcoded strings in usePaymentQueries hooks
- Add translations to useMaintenanceQueries hooks
- Use translation utility for non-React contexts
- Ensure all success/error messages are translated"
Write-Host "✓ Commit 5 completed" -ForegroundColor Green
Write-Host ""

# Commit 6: Dashboard and Support Components Translation
Write-Host "Commit 6: Dashboard and Support Components Translation" -ForegroundColor Yellow
git add src/components/dashboards/UnifiedSalesManagerDashboard.tsx
git add src/components/salesSupport/OfferCreationPage.tsx
git commit -m "feat: integrate translations in dashboard and support components

- Update UnifiedSalesManagerDashboard with translated metrics and labels
- Replace hardcoded strings in dashboard cards and descriptions
- Add translations to OfferCreationPage form placeholders
- Update product form fields with translation keys
- Translate search placeholders and category filters"
Write-Host "✓ Commit 6 completed" -ForegroundColor Green
Write-Host ""

# Commit 7: Weekly Plans Components Translation Integration
Write-Host "Commit 7: Weekly Plans Components Translation Integration" -ForegroundColor Yellow
git add src/components/weeklyPlan/WeeklyPlansScreen.tsx
git add src/components/weeklyPlan/CreateWeeklyPlanModal.tsx
git add src/components/weeklyPlan/EditWeeklyPlanModal.tsx
git add src/components/weeklyPlan/ReviewWeeklyPlanModal.tsx
git add src/components/weeklyPlan/ViewWeeklyPlanModal.tsx
git add src/components/weeklyPlan/DeleteWeeklyPlanModal.tsx
git add src/components/sales/WeeklyPlanForm.tsx
git commit -m "feat: integrate translations in weekly plans components

Business Logic:
- Update WeeklyPlansScreen with translated statistics and labels
- Add translations to CreateWeeklyPlanModal form fields
- Update EditWeeklyPlanModal with translation support
- Add translations to ReviewWeeklyPlanModal feedback form
- Update ViewWeeklyPlanModal with translated labels
- Add translations to DeleteWeeklyPlanModal confirmation
- Replace hardcoded strings in WeeklyPlanForm
- Translate task types, priorities, and form placeholders
- Support bilingual weekly plan management for international sales teams"
Write-Host "✓ Commit 7 completed" -ForegroundColor Green
Write-Host ""

# Commit 8: Chat Module - Type Definitions
Write-Host "Commit 8: Chat Module - Type Definitions" -ForegroundColor Yellow
git add src/types/chat.types.ts
git commit -m "feat: add chat type support to TypeScript definitions

Business Logic:
- Add ChatType type definition (Support, Sales, Maintenance)
- Update ChatConversationResponseDTO with chatType and chatTypeName fields
- Support chat type categorization for conversation routing
- Enable frontend to display conversation category to users
- Add proper TypeScript types for chat type-based filtering
- Support role-based conversation access control in frontend"
Write-Host "✓ Commit 8 completed" -ForegroundColor Green
Write-Host ""

# Commit 9: Chat Module - Component Updates
Write-Host "Commit 9: Chat Module - Component Updates" -ForegroundColor Yellow
git add src/components/chat/ChatList.tsx
git add src/components/chat/ChatWindow.tsx
git add src/pages/ChatPage.tsx
git commit -m "feat: enhance chat components with chat type support

Business Logic:
- Update ChatList to display and filter conversations by chat type
- Add chat type badges and visual indicators for conversation categories
- Update ChatWindow to show conversation type in header
- Enable users to see which type of support they're receiving
- Support role-based conversation filtering in chat list
- Improve user experience by clearly showing conversation context
- Add chat type selector for creating new conversations by category"
Write-Host "✓ Commit 9 completed" -ForegroundColor Green
Write-Host ""

# Commit 10: Navigation Configuration Updates
Write-Host "Commit 10: Navigation Configuration Updates" -ForegroundColor Yellow
git add src/config/navigation.config.tsx
git commit -m "refactor: update navigation configuration

- Update navigation routes and permissions
- Add new routes for chat type selection
- Improve navigation structure for better user flow"
Write-Host "✓ Commit 10 completed" -ForegroundColor Green
Write-Host ""

# Commit 11: Documentation and Scripts
Write-Host "Commit 11: Documentation and Scripts" -ForegroundColor Yellow
git add COMMIT_COMMANDS.txt
git add TRANSLATION_STATUS.md
git add commit-changes.ps1
git commit -m "docs: update documentation and automation scripts

- Update commit commands with latest changes
- Add translation status documentation
- Enhance PowerShell commit automation script
- Document chat type feature implementation"
Write-Host "✓ Commit 11 completed" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All commits completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Push to remote repository" -ForegroundColor Yellow
Write-Host "Run: git push origin dev" -ForegroundColor Yellow
Write-Host ""

# Ask if user wants to push
$push = Read-Host "Do you want to push to remote now? (y/n)"
if ($push -eq "y" -or $push -eq "Y") {
    Write-Host "Pushing to remote: https://github.com/hemda74/Soit-Med-Dashboard" -ForegroundColor Yellow
    git push origin dev
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully pushed to remote!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to push to remote" -ForegroundColor Red
        Write-Host "You can try manually: git push origin dev" -ForegroundColor Yellow
    }
} else {
    Write-Host "Skipping push. You can push manually later with: git push origin dev" -ForegroundColor Yellow
}
