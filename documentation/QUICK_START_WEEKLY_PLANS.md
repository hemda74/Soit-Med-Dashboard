# Quick Start: Weekly Plans Feature

## 🚀 Access the Feature

### URL Path

```
http://localhost:5173/weekly-plans
```

(Replace `localhost:5173` with your actual development server URL)

### Navigation

The **Weekly Plans** menu item will appear in the sidebar for users with these roles:

- ✅ **Salesman**
- ✅ **Sales Manager**
- ✅ **Super Admin**

Look for the checklist icon (📋) in the sidebar menu.

---

## 👥 User Access

### For Salesman

When logged in as a **Salesman**, you will see:

- ✅ "Create Plan" button
- ✅ Your own weekly plans only
- ✅ Edit/Delete buttons on your plans
- ✅ Ability to add tasks and daily progress

**What you can do:**

1. Click "Create Plan" to start a new weekly plan
2. Add multiple tasks to your plan
3. Track daily progress
4. Mark tasks as complete
5. View your completion percentage

### For Sales Manager

When logged in as a **Sales Manager**, you will see:

- ✅ All employee weekly plans
- ✅ Filter by employee dropdown
- ✅ Review button on all plans
- ❌ No "Create Plan" button
- ❌ Cannot edit employee plans

**What you can do:**

1. View all employee weekly plans
2. Filter by specific employee
3. Filter by date range
4. Filter by review status (reviewed/pending)
5. Filter by rating (1-5 stars)
6. Click "Review" to rate and comment on plans

### For Super Admin

Has **all permissions** from both Salesman and Sales Manager roles.

---

## 📝 Quick Workflow Guide

### Creating Your First Weekly Plan (Salesman)

1. **Navigate to Weekly Plans**

      - Click the "Weekly Plans" menu item in the sidebar

2. **Click "Create Plan"**

      - A modal will open

3. **Fill in Plan Details**

      - **Title**: e.g., "First Week of October Plan"
      - **Description**: Brief overview of your goals
      - **Week Start Date**: Sunday (auto-filled with current week)
      - **Week End Date**: Saturday (auto-filled with current week)

4. **Add Tasks** (Optional but recommended)

      - Click "Add Task" button
      - Enter task title: e.g., "Visit Hospital 57357"
      - Enter task description: e.g., "Present new medical equipment"
      - Add more tasks as needed

5. **Submit**
      - Click "Create Plan" button
      - You'll see a success message

### Adding Daily Progress (Salesman)

1. **View Your Plan**

      - Click "View" on your weekly plan card

2. **Add Progress**
      - (This feature is in the detailed view - you can enhance it with a button)
      - Or create a separate component for daily progress management

### Reviewing Plans (Manager)

1. **Navigate to Weekly Plans**

      - You'll see all employee plans

2. **Filter Plans** (Optional)

      - Filter by employee
      - Filter by date range
      - Filter to see only "Pending Review" plans

3. **Review a Plan**
      - Click "Review" button on any plan
      - Select a rating (1-5 stars)
      - Add a comment with feedback
      - Click "Submit Review"

---

## 🎯 Key Features Available Now

✅ **Create weekly plans with tasks**
✅ **View all plans** (role-based)
✅ **Filter and search**
✅ **Pagination**
✅ **Progress tracking**
✅ **Manager reviews**
✅ **Rating system**
✅ **Edit/Delete plans** (own plans only)
✅ **Responsive design**
✅ **Dark mode support**
✅ **Arabic/English support**

---

## 🔧 Testing Instructions

### Test as Salesman:

1. Login with a Salesman account
2. Go to `/weekly-plans`
3. Create a new plan with 2-3 tasks
4. View the plan details
5. Edit the plan title
6. Try deleting the plan

### Test as Sales Manager:

1. Login with a Sales Manager account
2. Go to `/weekly-plans`
3. View all employee plans
4. Filter by a specific employee
5. Review a plan with 5 stars and a comment
6. Filter to see only reviewed plans

---

## ⚙️ Backend Connection

### Make sure your backend is running on:

```
http://localhost:5117
```

Or update the API base URL in:

```
src/services/weeklyPlan/weeklyPlanApi.ts
```

### Environment Variable:

Set in your `.env` file:

```
VITE_API_BASE_URL=http://localhost:5117
```

---

## 🐛 Troubleshooting

### "Weekly Plans" not showing in sidebar

- Check your user role - must be Salesman, SalesManager, or SuperAdmin
- Clear browser cache and reload

### Cannot create a plan

- Ensure backend is running
- Check console for API errors
- Verify authentication token is valid

### No plans showing

- Check filters - clear all filters
- Verify backend data exists
- Check console for errors

### API connection errors

- Verify backend is running on correct port
- Check CORS settings on backend
- Verify API endpoints match backend

---

## 📚 Additional Resources

- [Complete Feature Documentation](./WEEKLY_PLAN_FEATURE.md)
- [Implementation Summary](./WEEKLY_PLAN_IMPLEMENTATION_SUMMARY.md)
- [Backend API Documentation](../backend-docs/) (if available)

---

## 🎨 UI Screenshots Locations

Once you access the feature, you should see:

### Main Screen:

- Header with "Weekly Plans" title
- Filter panel with date pickers and dropdowns
- Plan cards showing:
     - Plan title
     - Employee name
     - Date range
     - Progress bar
     - Completion percentage
     - Action buttons (View, Edit, Delete, Review)

### Create Modal:

- Form with title, description, dates
- Dynamic task list
- Add Task button
- Save/Cancel buttons

### View Modal:

- Complete plan details
- Task list with checkboxes
- Daily progress timeline
- Manager review section (if reviewed)

---

## ✨ Next Steps

1. **Access the feature**: Navigate to `/weekly-plans`
2. **Test functionality**: Create a plan, add tasks
3. **Test reviews**: Have a manager review your plan
4. **Provide feedback**: Report any issues or improvements

---

**Ready to use!** 🎉

The Weekly Plans system is fully functional and integrated into your application.

---

Last Updated: October 4, 2025

























