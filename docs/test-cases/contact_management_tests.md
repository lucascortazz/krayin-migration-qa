# Person Management Tests

## Overview
Comprehensive test cases for validating person (contact) management functionality parity between Laravel and Django implementations. Note: Krayin uses "persons" table instead of "contacts".

## Test Cases

### Person Creation and Management

#### TEST-PERSON-001: Create New Person - Valid Data
**Description**: Verify person creation with complete information
**Priority**: High
**Steps**:
1. Navigate to persons section
2. Click "Create" button
3. Fill in required fields based on persons table schema:
   - Name: "Jane Smith"
   - Emails: ["jane.smith@techcorp.com", "j.smith@personal.com"] (JSON array)
   - Contact Numbers: ["+1987654321", "+1987654322"] (JSON array)
   - Organization: "Tech Corp" (organization_id reference)
   - Job Title: "Marketing Manager"
4. Click "Save" button
**Expected Results**:
- Person created successfully in `persons` table
- All fields saved correctly (name, emails JSON, contact_numbers JSON, organization_id, job_title)
- Person appears in persons list
- Behavior identical between Laravel and Django

#### TEST-PERSON-002: Person-Lead Relationship
**Description**: Verify person can be created from existing lead
**Steps**:
1. Select converted lead (leads table)
2. Create person from lead data using person_id relationship
3. Verify relationship establishment
**Expected Results**:
- Person inherits lead information correctly
- Lead-person relationship maintained via person_id foreign key
- Conversion history tracked in leads table

#### TEST-PERSON-003: Person Organization Association
**Description**: Verify person can be associated with organization
**Steps**:
1. Create or select organization from organizations table
2. Associate person with organization via organization_id
3. Verify relationship in both records
**Expected Results**:
- Person linked to organization via organization_id foreign key
- Organization shows associated persons
- Relationship visible in both records

#### TEST-PERSON-004: Person JSON Fields Management
**Description**: Verify JSON field handling for emails and contact numbers
**Steps**:
1. Add multiple emails to emails JSON field
2. Add multiple contact numbers to contact_numbers JSON field
3. Update and remove individual entries
4. Verify JSON array integrity
**Expected Results**:
- Multiple emails stored correctly in JSON format
- Multiple contact numbers handled properly
- Individual entries can be updated/removed
- JSON structure maintained properly

### Person Communication History

#### TEST-PERSON-005: Email Communication Tracking
**Description**: Verify email communications are tracked in emails table
**Steps**:
1. Send email to person from CRM (creates record in emails table)
2. Receive email reply (linked via person_id foreign key)
3. Check communication history and email threading
**Expected Results**:
- All emails logged in emails table with person_id link
- Email content preserved (subject, reply, folders JSON)
- Email threading maintained via parent_id and reference_ids JSON
- Email status tracked (is_read, source, user_type)

#### TEST-PERSON-006: Activity Logging and Scheduling
**Description**: Verify activities are logged in activities table
**Steps**:
1. Create activity with person relationship (activities table)
2. Set activity details (title, type, comment, schedule_from, schedule_to)
3. Mark activity as done (is_done = true)
4. Add activity participants via activity_participants table
**Expected Results**:
- Activity recorded in activities table with proper relationships
- Activity details saved (title, type, comment, additional JSON)
- Schedule dates stored correctly (schedule_from, schedule_to)
- Completion status tracked (is_done boolean)
- Activity participants tracked in separate pivot table

#### TEST-PERSON-007: Person Activity Relationships
**Description**: Verify person-activity relationships through pivot tables
**Steps**:
1. Create activities for persons (person_activities table)
2. Link activities to leads through person (lead_activities table)
3. Track activity files (activity_files table)
4. Verify relationship integrity
**Expected Results**:
- Person activities linked via person_activities pivot table
- Lead activities connected through person relationships
- Activity files properly associated
- All relationship foreign keys maintained

### Person Data Management

#### TEST-PERSON-008: Person Data Validation
**Description**: Verify person data validation rules based on Krayin schema
**Steps**:
1. Attempt to create person with invalid email JSON format
2. Try invalid contact_numbers JSON structure
3. Test required field validation (name is required)
4. Validate organization_id foreign key constraint
**Expected Results**:
- Invalid JSON data rejected for emails and contact_numbers fields
- Name field validation enforced (required)
- Organization_id must reference valid organizations.id
- Validation rules identical between Laravel and Django
- Invalid data rejected
- Appropriate error messages shown
- Validation rules identical between systems

#### TEST-PERSON-009: Person Merge Functionality
**Description**: Verify duplicate persons can be merged (if supported by Krayin)
**Steps**:
1. Identify duplicate persons in persons table
2. Initiate merge process via PersonController
3. Select primary person record
4. Merge JSON fields (emails, contact_numbers) and relationships
**Expected Results**:
- Persons merged successfully
- JSON arrays combined appropriately
- Activity history preserved via pivot tables
- Organization relationships maintained

#### TEST-PERSON-010: Person Import/Export
**Description**: Verify bulk person operations
**Steps**:
1. Export person list including JSON fields
2. Modify exported data (emails, contact_numbers arrays)
3. Import updated data via PersonController
4. Verify JSON field updates and new person creation
**Expected Results**:
- Export contains all person data including JSON fields
- Import updates existing persons correctly
- New persons created as needed with proper JSON structure
- Data integrity maintained across all relationships

### Contact Segmentation and Lists

#### TEST-CONTACT-010: Contact Segmentation
**Description**: Verify contacts can be segmented by criteria
**Steps**:
1. Create segment based on job title
2. Add geographic criteria
3. Include activity-based filters
**Expected Results**:
- Segment created with correct contacts
- Dynamic segments update automatically
- Segment criteria saved correctly

#### TEST-CONTACT-011: Contact Lists Management
**Description**: Verify contact list creation and management
**Steps**:
1. Create static contact list
2. Add/remove contacts manually
3. Create dynamic list with rules
**Expected Results**:
- Static lists maintain membership
- Dynamic lists auto-update
- List management tools functional

### Contact Preferences and Privacy

#### TEST-CONTACT-012: Communication Preferences
**Description**: Verify contact communication preferences
**Steps**:
1. Set email preferences (opt-in/opt-out)
2. Configure SMS preferences
3. Set communication frequency limits
**Expected Results**:
- Preferences saved and respected
- Opt-out requests processed correctly
- Compliance with privacy regulations

#### TEST-CONTACT-013: Data Privacy Compliance
**Description**: Verify GDPR/privacy compliance features
**Steps**:
1. Export contact's personal data
2. Process data deletion request
3. Verify anonymization options
**Expected Results**:
- Complete data export available
- Data deletion processes correctly
- Anonymization maintains referential integrity

### Person API Functionality

#### TEST-PERSON-011: Person API CRUD Operations
**Description**: Verify all person API endpoints function correctly (PersonController)
**API Endpoints**:
- GET /api/persons - List persons with PersonDataGrid
- POST /api/persons - Create person via AttributeForm
- GET /api/persons/{id} - Get person details
- PUT /api/persons/{id} - Update person
- DELETE /api/persons/{id} - Delete person with cascade rules
**Expected Results**:
- All endpoints respond correctly
- PersonResource formatting consistent
- JSON fields (emails, contact_numbers) handled properly
- Foreign key constraints enforced (organization_id)

#### TEST-PERSON-012: Person Search and Filtering
**Description**: Verify person search functionality via PersonDataGrid
**Steps**:
1. Search by name field
2. Filter by organization_id
3. Search within emails JSON array
4. Filter by job_title
**Expected Results**:
- Search results accurate across all fields
- JSON field searching functional
- PersonDataGrid filtering works correctly
- API response time acceptable

### Krayin-Specific Features

#### TEST-PERSON-013: Email Integration with Persons
**Description**: Verify emails table integration with persons
**Steps**:
1. Send email linked to person via person_id foreign key
2. Track email metadata (source, user_type, folders JSON)
3. Verify email threading via parent_id and reference_ids
4. Check email attachments via email_attachments table
**Expected Results**:
- Email correctly linked to person via person_id
- Email metadata stored properly (from, sender, reply_to, cc, bcc JSON)
- Email threading functional with parent_id relationships
- Attachments properly associated via email_attachments table

#### TEST-PERSON-014: AttributeForm Integration
**Description**: Verify custom attributes work with persons
**Steps**:
1. Create custom attributes for persons entity_type
2. Assign attribute values to persons
3. Validate AttributeForm processing
4. Check attribute_values table integration
**Expected Results**:
- Custom attributes created for 'persons' entity_type
- Attribute values stored in attribute_values table
- AttributeForm validation working correctly
- Attribute data preserved during person updates

#### TEST-PERSON-015: Event System Integration
**Description**: Verify Krayin's event system with person operations
**Steps**:
1. Trigger 'contacts.person.create.before' event
2. Create person and trigger 'contacts.person.create.after' event
3. Update person and verify update events
4. Monitor event dispatch and listeners
**Expected Results**:
- All person-related events triggered correctly
- Event data passed properly to listeners
- Before/after events maintain data consistency
- Event system behavior identical between Laravel and Django
### Performance and Scalability

#### TEST-PERSON-016: Person List Performance with PersonDataGrid
**Description**: Verify person list performance with large datasets
**Steps**:
1. Load person list with 10,000+ persons via PersonDataGrid
2. Measure page load time with JSON field queries
3. Test scrolling and pagination performance
4. Monitor JSON field search performance
**Expected Results**:
- Page loads within 3 seconds despite JSON field complexity
- PersonDataGrid renders smoothly
- JSON field queries optimized
- Pagination responsive with large datasets

#### TEST-PERSON-017: Person Search Performance with JSON Fields
**Description**: Verify search performance with JSON field queries
**Steps**:
1. Perform text search on 50,000+ persons including JSON fields
2. Search within emails JSON array
3. Filter by contact_numbers JSON content
4. Measure JSON query response times
**Expected Results**:
- JSON field searches complete within 2 seconds
- Database indexes on JSON fields utilized
- Complex JSON queries perform adequately
- Performance consistent between Laravel and Django

## Migration Validation Checklist

### Data Migration Verification
- [ ] All person records migrated from Laravel persons table
- [ ] JSON fields (emails, contact_numbers) preserved correctly
- [ ] Person-organization relationships maintained (organization_id)
- [ ] Person-lead relationships preserved (person_id in leads table)
- [ ] Email communications migrated to emails table with person_id links
- [ ] Activity relationships migrated via person_activities pivot table
- [ ] Custom attributes transferred to attribute_values table
- [ ] Job titles migrated correctly
- [ ] JSON field structure validated

### Functional Parity Verification
- [ ] PersonController functionality identical
- [ ] PersonDataGrid behavior matches
- [ ] AttributeForm processing works identically
- [ ] JSON field operations (emails, contact_numbers) consistent
- [ ] Event system (contacts.person.*) behavior matches
- [ ] PersonResource API responses structurally equivalent
- [ ] Email integration via emails table functional
- [ ] Activity relationships via pivot tables working

### UI/UX Parity Verification
- [ ] Person forms layout identical (admin::contacts.persons.*)
- [ ] JSON field validation messages match
- [ ] Person list views consistent (PersonDataGrid)
- [ ] Detail views show same information
- [ ] Navigation patterns preserved
- [ ] Action buttons in same locations (create, edit, view)
- [ ] Modal dialogs behave identically
- [ ] Mobile responsiveness maintained

### Krayin-Specific Migration Validation
- [ ] PersonController routes functional (/admin/contacts/persons/*)
- [ ] PersonDataGrid configuration preserved
- [ ] AttributeForm integration working
- [ ] Event system triggers (contacts.person.*) functional
- [ ] PersonResource API serialization correct
- [ ] JSON field indexing optimized
- [ ] Email integration via emails table working
- [ ] Activity pivot table relationships intact
- [ ] Custom attribute system functional

## Automation Implementation
- Selenium WebDriver for UI testing (admin::contacts.persons views)
- REST API testing framework for PersonController endpoints
- Database comparison tools for JSON field validation
- Performance monitoring for PersonDataGrid operations
- JSON field query optimization testing
- Event system testing framework
- Krayin-specific AttributeForm validation testing
