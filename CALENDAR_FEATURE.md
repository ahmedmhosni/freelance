# 📅 Calendar View Feature

## Overview
A fully functional calendar view for tasks using react-big-calendar, providing visual task planning and management.

## Features

### ✅ Implemented
1. **Full Calendar View** - Month, Week, Day, and Agenda views
2. **Color-Coded Tasks** - Tasks colored by priority
3. **Interactive Events** - Click tasks to edit them
4. **Date Selection** - Click empty dates to create new tasks
5. **Task Tooltips** - Hover to see task details
6. **Responsive Design** - Works on all screen sizes
7. **Dark Mode Support** - Fully themed for dark mode

### 🎨 Priority Colors
- **Urgent**: Red (#eb5757)
- **High**: Orange (#ffa344)
- **Medium**: Yellow (#ffd426)
- **Low**: Blue (#2eaadc)
- **Completed**: Green (#28a745)

### 📋 Calendar Views
1. **Month View** - See all tasks for the month
2. **Week View** - Detailed weekly schedule
3. **Day View** - Hour-by-hour task view
4. **Agenda View** - List of upcoming tasks

## Usage

### Viewing Tasks
1. Navigate to Tasks page
2. Click the "Calendar" view toggle button
3. Use toolbar to switch between Month/Week/Day/Agenda views
4. Navigate months using Previous/Next buttons

### Creating Tasks
1. Click on any empty date in the calendar
2. Task form opens with the selected date pre-filled
3. Fill in task details and save

### Editing Tasks
1. Click on any task event in the calendar
2. Task form opens with existing data
3. Modify and save changes

### Navigation
- **Today Button**: Jump to current date
- **Previous/Next**: Navigate through time periods
- **View Selector**: Switch between different calendar views

## Technical Details

### Components
- **TaskCalendar.jsx** - Main calendar component
- Uses react-big-calendar with date-fns localizer
- Fetches tasks from API automatically
- Real-time event styling based on task properties

### Styling
- Custom CSS in index.css
- Themed for both light and dark modes
- Responsive design
- Notion-inspired minimal aesthetic

### Integration
- Integrated into Tasks page
- Works alongside Kanban and List views
- Shares task data with other views
- Click handlers for task editing and creation

## Keyboard Shortcuts (Future)
- `T` - Jump to today
- `←/→` - Navigate previous/next
- `M` - Month view
- `W` - Week view
- `D` - Day view
- `A` - Agenda view

## API Endpoints Used
- `GET /api/tasks` - Fetch all tasks for calendar

## Dependencies
- react-big-calendar: ^1.19.4
- date-fns: ^4.1.0

## Browser Support
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

## Performance
- Lazy loads task data
- Efficient event rendering
- Optimized for 1000+ tasks
- Memoized event calculations

## Future Enhancements
1. **Drag & Drop** - Reschedule tasks by dragging
2. **Multi-day Tasks** - Support for tasks spanning multiple days
3. **Recurring Tasks** - Show recurring task patterns
4. **Task Filtering** - Filter by project, priority, status
5. **Export Calendar** - Export to iCal/Google Calendar
6. **Print View** - Printable calendar layout
7. **Time Slots** - Add specific times to tasks
8. **Resource View** - Group by project or assignee

## Screenshots

### Month View
```
┌─────────────────────────────────────────┐
│  ← November 2025 →        [M][W][D][A]  │
├─────────────────────────────────────────┤
│ Sun  Mon  Tue  Wed  Thu  Fri  Sat      │
│                          1    2    3    │
│  4    5    6    7    8    9   10       │
│ [Task1]  [Task2]                       │
│ 11   12   13   14   15   16   17       │
│     [Task3]                            │
│ 18   19   20   21   22   23   24       │
│                    [Task4]             │
│ 25   26   27   28   29   30            │
└─────────────────────────────────────────┘
```

### Week View
```
┌─────────────────────────────────────────┐
│  ← Week of Nov 18, 2025 →               │
├─────────────────────────────────────────┤
│ Time │ Mon │ Tue │ Wed │ Thu │ Fri     │
├──────┼─────┼─────┼─────┼─────┼─────────┤
│ 9 AM │     │Task1│     │     │         │
│10 AM │     │     │Task2│     │         │
│11 AM │     │     │     │Task3│         │
│ ...  │     │     │     │     │         │
└─────────────────────────────────────────┘
```

### Agenda View
```
┌─────────────────────────────────────────┐
│ Date       │ Time  │ Event              │
├────────────┼───────┼────────────────────┤
│ Nov 22     │ All Day│ Task 1 - High     │
│ Nov 23     │ All Day│ Task 2 - Medium   │
│ Nov 25     │ All Day│ Task 3 - Urgent   │
│ Nov 28     │ All Day│ Task 4 - Low      │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Calendar not showing
- Check if react-big-calendar is installed
- Verify CSS is imported
- Check browser console for errors

### Tasks not appearing
- Verify tasks have due_date set
- Check API response format
- Ensure date format is correct

### Styling issues
- Clear browser cache
- Check dark mode toggle
- Verify CSS variables are defined

## Code Example

### Basic Usage
```jsx
import TaskCalendar from '../components/TaskCalendar';

<TaskCalendar 
  onTaskClick={(task) => {
    // Handle task click
    editTask(task);
  }}
  onDateSelect={(date) => {
    // Handle date selection
    createTaskForDate(date);
  }}
/>
```

### Custom Event Styling
```jsx
const eventStyleGetter = (event) => {
  const task = event.resource;
  let backgroundColor = '#2eaadc';
  
  switch (task.priority) {
    case 'urgent': backgroundColor = '#eb5757'; break;
    case 'high': backgroundColor = '#ffa344'; break;
    case 'medium': backgroundColor = '#ffd426'; break;
    case 'low': backgroundColor = '#2eaadc'; break;
  }
  
  return { style: { backgroundColor } };
};
```

## Testing Checklist
- [x] Calendar renders correctly
- [x] Tasks display with correct dates
- [x] Click task opens edit form
- [x] Click date opens create form
- [x] Priority colors display correctly
- [x] Navigation works (prev/next/today)
- [x] View switching works (month/week/day/agenda)
- [x] Dark mode styling works
- [x] Responsive on mobile
- [x] Tooltips show task info

## Deployment Notes
- No additional backend changes required
- Uses existing task API endpoints
- CSS is included in main bundle
- No environment variables needed

---

**Created**: November 22, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
