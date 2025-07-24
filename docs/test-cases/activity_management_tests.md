# Activity Management Tests

## Overview
Comprehensive test cases for validating activity and task management functionality parity between Laravel and Django implementations.

## Test Cases

### Activity Creation and Management

#### TEST-ACTIVITY-001: Create New Activity - Valid Data
**Description**: Verify activity creation with complete information
**Priority**: High
**Preconditions**: User logged in with activity management permissions
**Steps**:
1. Navigate to activities section
2. Click "Create New Activity"
3. Fill in activity details:
   - Title: "Follow-up call with prospect"
   - Type: "Phone Call"
   - Priority: "High"
   - Due Date: "2025-07-26"
   - Due Time: "14:00"
   - Duration: "30 minutes"
   - Description: "Discuss proposal details and answer questions"
   - Assigned To: "John Smith"
   - Related To: Select contact "Jane Doe"
4. Save activity
**Expected Results**:
- Activity created successfully
- All fields saved correctly
- Activity appears in activity list
- Due date/time stored with correct timezone
- Behavior identical between Laravel and Django

#### TEST-ACTIVITY-002: Activity Type Management
**Description**: Verify different activity types are supported
**Steps**:
1. Create activities of different types:
   - Meeting
   - Phone Call
   - Email
   - Task
   - Site Visit
2. Verify each type saves correctly
**Expected Results**:
- All activity types supported
- Type-specific fields available
- Icons/colors display correctly
- Type filtering works

#### TEST-ACTIVITY-003: Activity Assignment
**Description**: Verify activities can be assigned to team members
**Steps**:
1. Create activity assigned to specific user
2. Verify assignee receives notification
3. Check activity appears in assignee's calendar
4. Test reassignment functionality
**Expected Results**:
- Assignment saves correctly
- Notifications sent appropriately
- Calendar integration works
- Reassignment updates properly

#### TEST-ACTIVITY-004: Activity Completion
**Description**: Verify activity completion workflow
**Steps**:
1. Mark activity as completed
2. Add completion notes
3. Record actual duration
4. Verify status change
**Expected Results**:
- Status updated to completed
- Completion timestamp recorded
- Notes saved properly
- Activity moves to completed list

### Activity Calendar Integration

#### TEST-ACTIVITY-005: Calendar View Display
**Description**: Verify calendar view shows activities correctly
**Steps**:
1. Navigate to calendar view
2. Switch between day, week, month views
3. Verify activities display correctly
4. Check timezone handling
**Expected Results**:
- Activities show in correct time slots
- All view modes work properly
- Timezone conversions accurate
- Color coding by activity type

#### TEST-ACTIVITY-006: Calendar Event Creation
**Description**: Verify activities can be created from calendar
**Steps**:
1. Click on calendar time slot
2. Create activity directly in calendar
3. Drag to change time/duration
4. Verify persistence
**Expected Results**:
- Quick creation works
- Drag-and-drop functionality
- Changes save automatically
- Calendar updates immediately

#### TEST-ACTIVITY-007: Recurring Activities
**Description**: Verify recurring activity functionality
**Steps**:
1. Create weekly recurring meeting
2. Create monthly recurring task
3. Modify single instance
4. Verify series handling
**Expected Results**:
- Recurring series created
- Individual modifications allowed
- Series deletion handled properly
- Future instances generated correctly

### Activity Relationships

#### TEST-ACTIVITY-008: Activity-Contact Relationship
**Description**: Verify activities can be linked to contacts
**Steps**:
1. Create activity for specific contact
2. View contact's activity history
3. Filter activities by contact
4. Verify relationship integrity
**Expected Results**:
- Activity linked to contact
- Contact history shows activity
- Filtering works correctly
- Relationship data consistent

#### TEST-ACTIVITY-009: Activity-Deal Relationship
**Description**: Verify activities can be associated with deals
**Steps**:
1. Create activity for active deal
2. View deal's activity timeline
3. Track deal progression activities
4. Verify sales process tracking
**Expected Results**:
- Activity linked to deal
- Deal timeline updated
- Sales process tracked
- Pipeline progression visible

#### TEST-ACTIVITY-010: Activity-Lead Relationship
**Description**: Verify activities can be linked to leads
**Steps**:
1. Create follow-up activity for lead
2. Schedule lead nurturing sequence
3. Track lead conversion activities
4. Verify lead activity history
**Expected Results**:
- Activity linked to lead
- Nurturing sequence works
- Conversion tracking accurate
- Lead history complete

### Activity Notifications and Reminders

#### TEST-ACTIVITY-011: Activity Reminders
**Description**: Verify reminder functionality for activities
**Steps**:
1. Set reminder for 15 minutes before activity
2. Set email reminder for 1 hour before
3. Test notification delivery
4. Verify reminder timing
**Expected Results**:
- Reminders trigger at correct times
- Multiple reminder types supported
- Notifications delivered properly
- Reminder preferences saved

#### TEST-ACTIVITY-012: Activity Notifications
**Description**: Verify notification system for activity changes
**Steps**:
1. Assign activity to team member
2. Modify assigned activity
3. Complete activity
4. Verify notifications sent
**Expected Results**:
- Assignment notifications sent
- Change notifications delivered
- Completion notifications work
- Notification preferences respected

### Activity Reporting and Analytics

#### TEST-ACTIVITY-013: Activity Reports
**Description**: Verify activity reporting functionality
**Steps**:
1. Generate activity summary report
2. Create productivity report by user
3. Analyze activity completion rates
4. Export reports to different formats
**Expected Results**:
- Reports generate correctly
- Data accuracy maintained
- Multiple export formats supported
- Filtering options available

#### TEST-ACTIVITY-014: Activity Analytics
**Description**: Verify activity analytics and metrics
**Steps**:
1. View activity completion rates
2. Analyze time spent per activity type
3. Track overdue activities
4. Monitor team productivity
**Expected Results**:
- Metrics calculated correctly
- Visual charts display properly
- Trends analysis available
- Performance indicators accurate

### Activity Search and Filtering

#### TEST-ACTIVITY-015: Activity Search
**Description**: Verify activity search functionality
**Steps**:
1. Search activities by title
2. Search by description content
3. Search by assignee
4. Search by date range
**Expected Results**:
- Search returns accurate results
- Multiple search criteria supported
- Search performance acceptable
- Results properly formatted

#### TEST-ACTIVITY-016: Activity Filtering
**Description**: Verify activity filtering options
**Steps**:
1. Filter by activity type
2. Filter by status (pending/completed)
3. Filter by priority level
4. Filter by assignee
**Expected Results**:
- Filters work correctly
- Multiple filters combinable
- Filter state persists
- Clear filter option available

### Activity Validation and Error Handling

#### TEST-ACTIVITY-017: Activity Data Validation
**Description**: Verify validation for activity data
**Steps**:
1. Create activity with past due date
2. Try invalid duration values
3. Leave required fields empty
4. Test invalid assignee selection
**Expected Results**:
- Validation errors displayed
- Invalid data rejected
- Error messages clear
- Validation consistent across systems

#### TEST-ACTIVITY-018: Activity Conflict Detection
**Description**: Verify detection of scheduling conflicts
**Steps**:
1. Create overlapping activities for same user
2. Schedule activities outside working hours
3. Test double-booking scenarios
4. Verify conflict warnings
**Expected Results**:
- Conflicts detected automatically
- Warning messages displayed
- Override options available
- Calendar conflicts highlighted

### Activity Integration and API

#### TEST-ACTIVITY-019: Activity API Operations
**Description**: Verify activity API endpoints work correctly
**Steps**:
1. Create activity via API
2. Retrieve activity list via API
3. Update activity via API
4. Delete activity via API
**Expected Results**:
- All CRUD operations work
- API responses consistent
- Data validation enforced
- Error responses proper

#### TEST-ACTIVITY-020: External Calendar Integration
**Description**: Verify integration with external calendar systems
**Steps**:
1. Sync activities to Google Calendar
2. Import activities from Outlook
3. Test two-way synchronization
4. Verify data consistency
**Expected Results**:
- Sync functionality works
- Data integrity maintained
- Conflict resolution handled
- Real-time updates supported

### Performance and Data Migration

#### TEST-ACTIVITY-021: Activity Performance Testing
**Description**: Verify system performance with large activity datasets
**Preconditions**: 50,000+ activity records in system
**Steps**:
1. Load activities list page
2. Perform calendar view operations
3. Generate activity reports
4. Test search performance
**Expected Results**:
- Page load times acceptable (&lt;3 seconds)
- Calendar rendering smooth
- Reports generate timely
- Search remains responsive

#### TEST-ACTIVITY-022: Activity Data Migration Validation
**Description**: Verify activity data migrated correctly from Laravel to Django
**Steps**:
1. Compare activity counts between systems
2. Verify activity field mapping
3. Check relationship preservation
4. Validate recurring series migration
**Expected Results**:
- All activities migrated successfully
- No data loss or corruption
- Relationships maintained
- Recurring series intact
