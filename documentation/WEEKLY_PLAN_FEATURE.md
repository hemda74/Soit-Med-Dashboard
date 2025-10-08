# Weekly Plan Feature Documentation

## Overview

The Weekly Plan feature is a complete refactoring of the Sales Reports system, transforming it into a modern **To-Do List** management system. This new system allows salesmen to create weekly plans with tasks, track daily progress, and receive manager reviews.

## Key Changes from Sales Reports

| Feature            | Old (Sales Reports)          | New (Weekly Plans)                   |
| ------------------ | ---------------------------- | ------------------------------------ |
| **Structure**      | Single report (Title + Body) | Weekly plan + Tasks + Daily Progress |
| **Frequency**      | Daily/Weekly/Monthly/Custom  | Weekly only                          |
| **Detail Level**   | Single text block            | Multiple tasks + daily updates       |
| **Tracking**       | Difficult                    | Easy and organized                   |
| **Tasks**          | ❌ Not available             | ✅ Available with completion status  |
| **Daily Progress** | ❌ Not available             | ✅ Available                         |
| **Completion**     | ❌ Not tracked               | ✅ Automatic calculation             |

## System Architecture

### 1. **WeeklyPlan** - Main Plan Entity

The base plan created at the beginning of each week

### 2. **WeeklyPlanTask** - Individual Tasks

Tasks within the weekly plan with completion tracking

### 3. **DailyProgress** - Daily Updates

Daily progress notes added by the employee

## User Roles & Permissions

| Action               | Salesman       | Sales Manager | Super Admin |
| -------------------- | -------------- | ------------- | ----------- |
| Create weekly plan   | ✅             | ❌            | ❌          |
| Edit/Delete own plan | ✅             | ❌            | ❌          |
| Add/Edit tasks       | ✅ (own plans) | ❌            | ❌          |
| Add daily progress   | ✅ (own plans) | ❌            | ❌          |
| View all plans       | ❌             | ✅            | ✅          |
| Review/Rate plans    | ❌             | ✅            | ✅          |

## Backend API Endpoints

Base URL: `/api/WeeklyPlan`

### Weekly Plan Management

#### Create Weekly Plan

```http
POST /api/WeeklyPlan
Authorization: Bearer {token}
Role: Salesman

Request Body:
{
  "title": "First Week of October Plan",
  "description": "Sales plan for Cairo hospitals",
  "weekStartDate": "2024-10-01",
  "weekEndDate": "2024-10-07",
  "tasks": [
    {
      "title": "Visit Hospital 57357",
      "description": "Present new medical equipment",
      "displayOrder": 1
    }
  ]
}
```

#### Get All Plans (with filtering)

```http
GET /api/WeeklyPlan?employeeId={id}&startDate={date}&endDate={date}&hasManagerReview={bool}&minRating={1-5}&page={page}&pageSize={size}
Authorization: Bearer {token}
```

#### Update Plan

```http
PUT /api/WeeklyPlan/{id}
Authorization: Bearer {token}
Role: Salesman (own plans only)

Request Body:
{
  "title": "Updated plan title",
  "description": "Updated description"
}
```

#### Delete Plan

```http
DELETE /api/WeeklyPlan/{id}
Authorization: Bearer {token}
Role: Salesman (own plans only)
```

#### Get Plan by ID

```http
GET /api/WeeklyPlan/{id}
Authorization: Bearer {token}
```

### Task Management

#### Add Task

```http
POST /api/WeeklyPlan/{weeklyPlanId}/tasks
Authorization: Bearer {token}
Role: Salesman (own plans only)

Request Body:
{
  "title": "Call Hospital X",
  "description": "Follow up on last week's request",
  "displayOrder": 4
}
```

#### Update Task

```http
PUT /api/WeeklyPlan/{weeklyPlanId}/tasks/{taskId}
Authorization: Bearer {token}

Request Body:
{
  "title": "Updated task title",
  "isCompleted": true,
  "displayOrder": 1
}
```

#### Delete Task

```http
DELETE /api/WeeklyPlan/{weeklyPlanId}/tasks/{taskId}
Authorization: Bearer {token}
```

### Daily Progress Management

#### Add Daily Progress

```http
POST /api/WeeklyPlan/{weeklyPlanId}/progress
Authorization: Bearer {token}
Role: Salesman (own plans only)

Request Body:
{
  "progressDate": "2024-10-01",
  "notes": "Today I visited Hospital 57357 and presented all new products...",
  "tasksWorkedOn": [1, 2]
}
```

#### Update Daily Progress

```http
PUT /api/WeeklyPlan/{weeklyPlanId}/progress/{progressId}
Authorization: Bearer {token}

Request Body:
{
  "notes": "Updated progress notes...",
  "tasksWorkedOn": [1, 2, 3]
}
```

#### Delete Daily Progress

```http
DELETE /api/WeeklyPlan/{weeklyPlanId}/progress/{progressId}
Authorization: Bearer {token}
```

### Manager Review

#### Review/Rate Plan

```http
POST /api/WeeklyPlan/{id}/review
Authorization: Bearer {token}
Role: SalesManager, SuperAdmin

Request Body:
{
  "rating": 5,
  "managerComment": "Excellent performance this week! Keep it up."
}
```

## Frontend Implementation

### File Structure

```
src/
├── types/
│   └── weeklyPlan.types.ts          # TypeScript types
├── services/
│   └── weeklyPlan/
│       └── weeklyPlanApi.ts         # API service
├── hooks/
│   └── useWeeklyPlans.ts            # Custom hook
├── components/
│   └── weeklyPlan/
│       ├── WeeklyPlansScreen.tsx    # Main screen
│       ├── CreateWeeklyPlanModal.tsx
│       ├── ViewWeeklyPlanModal.tsx
│       ├── EditWeeklyPlanModal.tsx
│       ├── DeleteWeeklyPlanModal.tsx
│       └── ReviewWeeklyPlanModal.tsx
└── lib/
    └── translations.ts              # i18n translations
```

### Types

```typescript
// Main types defined in src/types/weeklyPlan.types.ts
interface WeeklyPlan {
	id: number;
	title: string;
	description: string;
	weekStartDate: string;
	weekEndDate: string;
	employeeId: string;
	employeeName: string;
	rating: number | null;
	managerComment: string | null;
	managerReviewedAt: string | null;
	tasks: WeeklyPlanTask[];
	dailyProgresses: DailyProgress[];
	totalTasks: number;
	completedTasks: number;
	completionPercentage: number;
}

interface WeeklyPlanTask {
	id: number;
	title: string;
	description: string;
	isCompleted: boolean;
	displayOrder: number;
}

interface DailyProgress {
	id: number;
	progressDate: string;
	notes: string;
	tasksWorkedOn: number[];
}
```

### Custom Hook Usage

```typescript
import { useWeeklyPlans } from '@/hooks/useWeeklyPlans';

function MyComponent() {
	const {
		plans,
		loading,
		error,
		pagination,
		hasAccess,
		canCreate,
		canReview,
		fetchPlans,
		createPlan,
		updatePlan,
		deletePlan,
		reviewPlan,
		addTask,
		updateTask,
		deleteTask,
		addDailyProgress,
		updateDailyProgress,
		deleteDailyProgress,
	} = useWeeklyPlans();

	useEffect(() => {
		if (hasAccess) {
			fetchPlans({ page: 1, pageSize: 10 });
		}
	}, [hasAccess]);

	// Use the hook functions...
}
```

### API Service Usage

```typescript
import { weeklyPlanApi } from '@/services/weeklyPlan/weeklyPlanApi';

// Create a plan
const response = await weeklyPlanApi.createWeeklyPlan({
	title: 'Week 1-7 October',
	description: 'Focus on Cairo hospitals',
	weekStartDate: '2024-10-01',
	weekEndDate: '2024-10-07',
	tasks: [{ title: 'Visit Hospital A', displayOrder: 1 }],
});

// Add daily progress
await weeklyPlanApi.addDailyProgress(planId, {
	progressDate: '2024-10-01',
	notes: 'Completed visits...',
	tasksWorkedOn: [1, 2],
});

// Review plan (manager)
await weeklyPlanApi.reviewWeeklyPlan(planId, {
	rating: 5,
	managerComment: 'Great work!',
});
```

## User Workflows

### Salesman Workflow

#### Monday (Start of Week):

1. Create weekly plan with tasks
2. Set goals for the week

#### Daily (End of Day):

1. Add daily progress update
2. Mark completed tasks
3. Add notes about accomplishments

#### During Week:

1. Add new urgent tasks as needed
2. Update task statuses
3. Monitor progress

### Manager Workflow

#### Weekly:

1. View all employee plans
2. Filter by employee or date range
3. Review completed plans
4. Provide ratings and feedback

#### Filtering:

- View pending reviews
- Filter by rating
- Filter by employee
- Filter by date range

## Features

### ✅ Implemented Features

1. **Weekly Plan Management**

      - Create, edit, delete plans
      - View plan details
      - Filter and search

2. **Task Management**

      - Add, edit, delete tasks
      - Mark tasks as complete
      - Reorder tasks
      - Track completion percentage

3. **Daily Progress Tracking**

      - Add daily updates
      - Link progress to tasks
      - Edit/delete progress

4. **Manager Review System**

      - Rate plans (1-5 stars)
      - Add comments
      - Track review status

5. **Filtering & Pagination**

      - Filter by employee
      - Filter by date range
      - Filter by review status
      - Filter by rating
      - Pagination support

6. **Role-based Access Control**

      - Salesman: Create and manage own plans
      - Manager: View all, review plans
      - Admin: Full access

7. **Progress Visualization**

      - Completion percentage
      - Progress bars
      - Task completion status

8. **Internationalization (i18n)**
      - English translations
      - Arabic translations

## Component Features

### WeeklyPlansScreen

- Main dashboard view
- Filter panel
- Plan cards with progress
- Pagination
- Access control

### CreateWeeklyPlanModal

- Plan details form
- Dynamic task list
- Date range selection
- Form validation

### ViewWeeklyPlanModal

- Detailed plan view
- Task list with status
- Daily progress timeline
- Manager review display

### EditWeeklyPlanModal

- Edit title and description
- Form validation

### DeleteWeeklyPlanModal

- Confirmation dialog
- Warning about data loss

### ReviewWeeklyPlanModal

- Star rating selector
- Comment textarea
- Plan summary

## Validation Rules

### Weekly Plan

- `title`: Required, max 200 characters
- `description`: Optional, max 1000 characters
- `weekStartDate`: Required
- `weekEndDate`: Required, must be after start date
- Cannot create multiple plans for same week

### Task

- `title`: Required, max 200 characters
- `description`: Optional, max 1000 characters
- `displayOrder`: Required

### Daily Progress

- `progressDate`: Required, must be within week range
- `notes`: Required, max 2000 characters
- Cannot add multiple progress for same date

### Review

- `rating`: Optional, 1-5
- `managerComment`: Optional, max 1000 characters
- Must provide rating or comment

## Date Handling

All dates use:

- Format: `YYYY-MM-DD` (ISO 8601)
- Timezone: UTC
- Library: `date-fns` for formatting

```typescript
import { format, startOfWeek, endOfWeek } from 'date-fns';

const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
const weekEnd = endOfWeek(today, { weekStartsOn: 0 }); // Saturday
```

## Error Handling

### Frontend

- Toast notifications for success/error
- Form validation errors
- Loading states
- Error boundaries

### Backend Error Codes

- `400`: Bad Request - Validation errors
- `401`: Unauthorized - Auth required
- `404`: Not Found - Plan not found
- `409`: Conflict - Duplicate plan for week

## Testing

### Manual Testing Checklist

#### Salesman:

- [ ] Create weekly plan with tasks
- [ ] Edit plan title/description
- [ ] Add new tasks to plan
- [ ] Mark tasks as complete
- [ ] Add daily progress
- [ ] Edit daily progress
- [ ] Delete daily progress
- [ ] View own plans
- [ ] Delete plan

#### Manager:

- [ ] View all employee plans
- [ ] Filter by employee
- [ ] Filter by date range
- [ ] Filter by review status
- [ ] Filter by rating
- [ ] Review plan with rating
- [ ] Review plan with comment
- [ ] View plan details

## Migration Notes

### For Users Migrating from Sales Reports:

1. **Old sales reports remain accessible** (backward compatibility)
2. **New weekly plan system** is separate
3. **Encourage use of weekly plans** for better tracking
4. **No automatic migration** - users create new plans

### For Developers:

1. **Old API still available** at `/api/SalesReport`
2. **New API available** at `/api/WeeklyPlan`
3. **Types separated** - `salesReport.types.ts` vs `weeklyPlan.types.ts`
4. **Services separated** - Import from correct module

## Best Practices

### For Salesmen:

1. Create plan at start of week
2. Add daily progress every day
3. Be specific in task descriptions
4. Link tasks to daily progress
5. Update task status regularly

### For Managers:

1. Review plans weekly
2. Provide constructive feedback
3. Be consistent with ratings
4. Filter for pending reviews
5. Track team progress

## Future Enhancements

Potential improvements:

- [ ] Task dependencies
- [ ] Task due dates
- [ ] Notifications for pending reviews
- [ ] Export plans to PDF
- [ ] Templates for common tasks
- [ ] Team collaboration features
- [ ] Analytics dashboard
- [ ] Mobile app support

## Support

For issues or questions:

- Check this documentation
- Review backend API docs
- Contact development team

## Version History

- **v1.0.0** (October 2025): Initial release
     - Complete refactoring from Sales Reports
     - Weekly plan with tasks system
     - Daily progress tracking
     - Manager review system
     - Full i18n support

---

Last Updated: October 4, 2025




