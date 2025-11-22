# Untranslated Files Review

This document lists all files in the Web application that contain hardcoded English strings and need translation support.

## Files Requiring Translation

### 1. `src/components/Dashboard.tsx`
**Status:** No translation hook imported
**Untranslated Strings:**
- "Welcome to Soit-Med Dashboard"
- "You don't have permission to view analytics and statistics."
- "Please contact your administrator if you need access to this information."

### 2. `src/components/sales/DealForm.tsx`
**Status:** No translation hook imported
**Untranslated Strings:**
- "Edit Deal"
- "Create New Deal"
- "Client *"
- "Select a client"
- "Deal Value (EGP) *"
- "Enter deal value"
- "Description *"
- "Describe the deal details..."
- "Expected Close Date *"
- "Pick a date"
- "Cancel"
- "Saving..."
- "Update Deal"
- "Create Deal"
- Validation messages: "Client is required", "Deal value must be greater than 0", etc.

### 3. `src/components/sales/ClientSearch.tsx`
**Status:** No translation hook imported
**Untranslated Strings:**
- "Search clients..." (default placeholder)
- "Filter by Classification (optional)"
- "All Classifications"
- "Classification {cls}"
- "Searching..."
- "No clients found"
- "Classification: {client.classification}"

### 4. `src/components/sales/ClientDetails.tsx`
**Status:** No translation hook imported
**Untranslated Strings:**
- "Classification: {client.classification}"
- "Assigned to"
- "Phone"
- "Organization"
- "Classification"
- "Client Statistics"
- "Total Visits"
- "Total Offers"
- "Successful Deals"
- "Total Revenue"
- Tab labels: "Overview", "Visits", "Deals", "Offers", "Progress"
- "Client Information"
- "Organization Name"
- "Not specified"
- "Assigned To"
- "Not assigned"
- "Performance Metrics"
- "Average Satisfaction"
- "No ratings yet"
- "Conversion Rate"
- "Not calculated"
- "Last Interaction"
- "No interactions"
- "Client Visits"
- "Add Progress"
- "Loading visits..."
- "No visits recorded yet"
- "Result: {visitResult}"
- "Deals"
- "Create Deal"
- "Loading deals..."
- "No deals created yet"
- "Expected close: {date}"
- "Offer Requests"
- "Create Request"
- "Loading offers..."
- "No offer requests yet"
- "Requested by: {name}"
- "Assigned to: {name}"
- "Task Progress"
- "Loading progress..."
- "No progress recorded yet"
- "Next: {nextStep}"
- "Satisfaction: {rating}/5"
- "Loading client details..."
- "Error loading client details: {error}"

### 5. `src/components/sales/TaskProgressForm.tsx`
**Status:** No translation hook imported
**Untranslated Strings:**
- "Create Task Progress"
- "Client *"
- "Select a client"
- "Task *"
- "Select a task"
- "Progress Type *"
- "Select progress type"
- "Visit", "Call", "Email", "Meeting"
- "Description *"
- "Describe what happened during this progress..."
- "Progress Date *"
- "Pick a date"
- "Visit Result"
- "Select visit result"
- "Interested", "Not Interested"
- "Next Step"
- "Select next step"
- "Needs Offer", "Needs Deal"
- "Satisfaction Rating (1-5)"
- "Rate client satisfaction"
- "Follow-up Date"
- "Pick a follow-up date"
- "Create Offer Request"
- "Automatically create an offer request for this client"
- "Requested Products *"
- "Describe the products the client is interested in..."
- "Priority"
- "Select priority"
- "Low", "Medium", "High"
- "Cancel"
- "Creating..."
- "Create Progress"
- Validation messages: "Client is required", "Task is required", etc.

### 6. `src/components/salesSupport/OfferCreationPage.tsx`
**Status:** Needs review - may have some translations but likely incomplete
**Note:** This is a large file (988+ lines). Needs full review for untranslated strings.

### 7. `src/components/weeklyPlan/WeeklyPlansScreen.tsx`
**Status:** Needs review - may have some translations but likely incomplete
**Note:** Large file, needs full review.

### 8. `src/components/sales/DealApprovalForm.tsx`
**Status:** No translation hook imported
**Untranslated Strings:**
- Likely contains approval/rejection messages, labels, and button text
- Needs full review

## Summary

**Total Files Identified:** 8+ files requiring translation
**Priority Files:**
1. Dashboard.tsx (main entry point)
2. DealForm.tsx (frequently used)
3. ClientDetails.tsx (comprehensive component)
4. TaskProgressForm.tsx (form component)
5. ClientSearch.tsx (reusable component)

## Next Steps

1. Import `useTranslation` hook in each file
2. Add translation keys to `src/lib/translations.ts` for all identified strings
3. Replace hardcoded strings with `t('translationKey')` calls
4. Test translations in both English and Arabic
5. Ensure no duplicate translation keys are added





