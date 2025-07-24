# Lead Management Tests

## Overview
Comprehensive test cases for validating lead management functionality parity between Laravel and Django implementations based on Krayin's actual schema.

## Test Cases

### Lead Creation

#### TEST-LEAD-001: Create New Lead - Valid Data
**Description**: Verify lead creation with Krayin's actual lead structure
**Priority**: High
**Preconditions**: User logged in with lead creation permissions
**Steps**:
1. Navigate to leads section
2. Click "Create" button
3. Fill in required fields based on leads table schema:
   - Title: "Enterprise Software Opportunity"
   - Description: "Large enterprise client interested in CRM solution"
   - Lead Value: "50000.00" (decimal 12,4)
   - Status: true/false (boolean)
   - Person: Select from persons table (person_id foreign key)
   - Lead Source: Select from lead_sources table (lead_source_id)
   - Lead Type: Select from lead_types table (lead_type_id)
   - Lead Pipeline: Select from lead_pipelines table (lead_pipeline_id)
   - Lead Stage: Select from lead_stages table (lead_stage_id)
   - Assigned User: Select from users table (user_id)
4. Click "Save" button
**Expected Results**:
- Lead created successfully in leads table
- All foreign key relationships established correctly
- Lead appears in leads list with proper stage
- LeadController processes request via LeadForm validation
- Lead value stored as decimal(12,4)

#### TEST-LEAD-002: Lead Pipeline and Stage Management
**Description**: Verify Krayin's lead pipeline system
**Steps**:
1. Create lead in specific pipeline (lead_pipeline_id)
2. Assign to pipeline stage (lead_stage_id)
3. Move lead through pipeline stages
4. Verify lead_pipeline_stages table relationships
**Expected Results**:
- Lead properly assigned to pipeline
- Stage progression tracked through lead_pipeline_stages
- Probability and sort_order values maintained
- Stage history preserved

#### TEST-LEAD-003: Lead-Person Relationship
**Description**: Verify lead connection to persons table
**Steps**:
1. Select existing person from persons table
2. Create lead with person_id foreign key
3. Verify bidirectional relationship
4. Check person's lead history
**Expected Results**:
- Lead linked to person via person_id foreign key
- Person shows associated leads
- Cascade delete rules working (person deletion affects leads)
- Relationship data consistent
- Behavior consistent between systems

### Lead Listing and Search

#### TEST-LEAD-004: Lead Activities Integration
**Description**: Verify lead activity tracking via lead_activities table
**Steps**:
1. Create activities for lead
2. Link activities via lead_activities pivot table
3. Track activity history
4. Verify activity_files attachments
**Expected Results**:
- Activities properly linked via lead_activities table
- Activity history displays chronologically
- File attachments tracked in activity_files
- Activity participants managed via activity_participants

#### TEST-LEAD-005: Lead Products Association
**Description**: Verify lead-product relationships
**Steps**:
1. Associate products with lead via lead_products table
2. Set product quantities and pricing
3. Calculate lead value from products
4. Verify product inventory impact
**Expected Results**:
- Products linked via lead_products pivot table
- Quantities and pricing saved correctly
- Lead value calculated from associated products
- Product inventory tracked if applicable

#### TEST-LEAD-006: Lead Status and Closure
**Description**: Verify lead status management and closure process
**Steps**:
1. Set lead status to true (active) or false (inactive)
2. Close lead with lost_reason
3. Set closed_at timestamp
4. Verify status change impact on pipeline
**Expected Results**:
- Status boolean field updates correctly
- Lost reason captured when applicable
- Closed timestamp recorded accurately
- Pipeline metrics updated accordingly

#### TEST-LEAD-005: Lead Search Functionality
**Description**: Verify lead search works correctly
**Steps**:
1. Navigate to leads list
2. Enter search term in search box
3. Verify results
**Expected Results**:
- Relevant leads displayed
- Search algorithm identical
- Results formatting consistent

#### TEST-LEAD-006: Lead Filtering
**Description**: Verify lead filtering by various criteria
**Steps**:
1. Apply filters (source, status, date range)
2. Verify filtered results
**Expected Results**:
- Correct leads displayed based on filters
- Filter behavior identical between systems

### Lead Editing and Updates

#### TEST-LEAD-007: Edit Lead Information
**Description**: Verify lead editing functionality
**Steps**:
1. Select existing lead
2. Click edit button
3. Modify lead information
4. Save changes
**Expected Results**:
- Changes saved successfully
- Updated information displayed
- Audit trail maintained (if applicable)

#### TEST-LEAD-008: Lead Status Updates
**Description**: Verify lead status can be updated
**Steps**:
1. Change lead status from "New" to "Qualified"
2. Save changes
**Expected Results**:
- Status updated correctly
- Any status-dependent behavior triggered
- History maintained

### Lead Conversion

#### TEST-LEAD-009: Convert Lead to Contact
**Description**: Verify lead to contact conversion process
**Steps**:
1. Select qualified lead
2. Click "Convert to Contact"
3. Complete conversion form
**Expected Results**:
- Contact created with lead information
- Lead marked as converted
- Relationship maintained between lead and contact

#### TEST-LEAD-010: Convert Lead to Deal
**Description**: Verify lead to deal conversion
**Steps**:
1. Select qualified lead
2. Convert to deal
3. Set deal parameters
**Expected Results**:
- Deal created successfully
- Lead conversion tracked
- Deal pipeline updated

### Lead Import/Export

#### TEST-LEAD-011: Bulk Lead Import
**Description**: Verify bulk import functionality
**Steps**:
1. Prepare CSV file with lead data
2. Use import feature
3. Verify imported leads
**Expected Results**:
- All valid leads imported
- Invalid records reported
- Data integrity maintained

#### TEST-LEAD-012: Lead Export
**Description**: Verify lead export functionality
**Steps**:
1. Select leads to export
2. Choose export format (CSV, Excel)
3. Download and verify file
**Expected Results**:
- Export file contains correct data
- Format matches specifications
- All selected leads included

### Lead Activities and Notes

#### TEST-LEAD-013: Add Activity to Lead
**Description**: Verify activities can be added to leads
**Steps**:
1. Open lead detail view
2. Add new activity (call, email, meeting)
3. Save activity
**Expected Results**:
- Activity saved and displayed
- Activity timeline updated
- Notifications sent (if configured)

#### TEST-LEAD-014: Add Notes to Lead
**Description**: Verify notes functionality
**Steps**:
1. Open lead detail
2. Add note in notes section
3. Save note
**Expected Results**:
- Note saved with timestamp
- Note displayed in chronological order
- Author information maintained

### Lead Assignment and Ownership

#### TEST-LEAD-015: Assign Lead to User
**Description**: Verify lead assignment functionality
**Steps**:
1. Select unassigned lead
2. Assign to specific user
3. Verify assignment
**Expected Results**:
- Lead assigned to user
- User notified of assignment
- Lead appears in user's lead list

#### TEST-LEAD-016: Transfer Lead Ownership
**Description**: Verify lead ownership transfer
**Steps**:
1. Transfer lead from one user to another
2. Verify transfer
**Expected Results**:
- Ownership transferred successfully
- Both users notified
- Lead history maintained

### Performance and Load Testing

#### TEST-LEAD-017: Lead List Performance
**Description**: Verify lead list loads within acceptable time
**Steps**:
1. Navigate to leads list with 1000+ leads
2. Measure load time
**Expected Results**:
- Page loads within 3 seconds
- Performance identical between systems

#### TEST-LEAD-018: Lead Search Performance
**Description**: Verify search performance with large dataset
**Steps**:
1. Perform search on database with 10,000+ leads
2. Measure response time
**Expected Results**:
- Search results returned within 2 seconds
- Performance consistent between systems

### Security Tests

#### TEST-LEAD-019: Lead Data Access Control
**Description**: Verify users can only access authorized leads
**Steps**:
1. Login as restricted user
2. Attempt to access leads outside permissions
**Expected Results**:
- Access denied for unauthorized leads
- Appropriate error message displayed
- Security behavior identical

#### TEST-LEAD-020: Lead Data Validation
**Description**: Verify input validation prevents malicious data
**Steps**:
1. Attempt to inject scripts in lead fields
2. Try SQL injection in search
**Expected Results**:
- Malicious input rejected
- Data sanitized properly
- Security measures identical

## API Parity Tests

### API Endpoints to Test

#### GET /api/leads
- Response structure identical
- Pagination parameters match
- Filter parameters work identically
- Response time within acceptable limits

#### POST /api/leads
- Accept same request format
- Validation rules identical
- Error responses match
- Success response format identical

#### PUT /api/leads/{id}
- Update functionality identical
- Validation behavior matches
- Response format consistent

#### DELETE /api/leads/{id}
- Deletion behavior identical
- Cascade deletion rules match
- Response codes consistent

## Migration-Specific Validation

### Data Integrity Checks
- All lead records migrated
- Relationships preserved (lead-to-contact, lead-to-deal)
- Custom fields maintained
- Activity history preserved
- File attachments migrated

### Behavioral Parity Validation
- UI elements positioned identically
- Form validation messages match
- Workflow steps identical
- Notification triggers same
- Email templates consistent

## Automation Notes
- All tests automated using Selenium WebDriver
- API tests using REST client automation
- Performance tests using Locust
- Security tests integrated with OWASP ZAP
- Database integrity checks automated
- Screenshots captured for visual comparison

## Success Criteria
- 100% test pass rate
- Performance within 5% of original system
- Zero data loss during migration
- UI/UX behavior identical
- API responses structurally identical
