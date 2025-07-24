# Krayin Test Cases Update Summary

## Overview
Based on analysis of the actual Krayin source code, all test case files have been updated to accurately reflect Krayin's real implementation rather than generic CRM patterns.

## Key Discoveries from Krayin Source Code

### Database Schema Insights
1. **persons table** (not "contacts"): `name`, `emails` (JSON), `contact_numbers` (JSON), `organization_id`, `job_title`
2. **organizations table**: `name`, `address` (JSON)
3. **leads table**: Complex pipeline system with `lead_pipeline_id`, `lead_stage_id`, `lead_value` (decimal 12,4)
4. **activities table**: Generic activities with entity-specific pivot tables
5. **emails table**: Comprehensive email tracking with threading via `parent_id` and `reference_ids` JSON
6. **quotes table**: Financial calculations with JSON address fields
7. **products table**: Simple structure with `sku`, `name`, `description`, `quantity`, `price`

### Krayin-Specific Features
1. **JSON Fields**: Extensive use of JSON for emails, contact_numbers, address, folders, email metadata
2. **Pivot Tables**: Entity-specific activity relationships (person_activities, lead_activities, etc.)
3. **Pipeline System**: Complex lead pipeline with stages, probabilities, and sort order
4. **Event System**: Laravel events for entity operations (contacts.person.create.before/after)
5. **AttributeForm**: Custom attribute system for all entities
6. **DataGrid**: Specialized data grid controllers for listing/filtering

## Files Updated

### 1. contact_management_tests.md → person_management_tests.md
- **Updated to "Person Management"** reflecting Krayin's persons table
- **JSON Field Testing**: Added tests for emails and contact_numbers JSON arrays
- **Organization Relationships**: Via organization_id foreign key
- **Email Integration**: Via emails table with person_id links
- **Activity Relationships**: Via person_activities pivot table
- **Event System Testing**: Krayin's person events
- **AttributeForm Integration**: Custom attributes for persons

### 2. lead_management_tests.md
- **Pipeline System**: Lead pipeline and stage management via lead_pipeline_stages
- **Decimal Precision**: lead_value as decimal(12,4)
- **Person Relationships**: Via person_id foreign key (not separate contact fields)
- **Lead Activities**: Via lead_activities pivot table
- **Lead Products**: Via lead_products table
- **Status Management**: Boolean status field with lost_reason and closed_at

### 3. product_quote_management_tests.md
- **Product Schema**: SKU (unique), name, description, quantity (integer), price (decimal 12,4)
- **Product Inventory**: Via product_inventories table
- **Product Activities**: Via product_activities pivot table
- **Quote Structure**: JSON address fields, decimal financial calculations
- **Quote Items**: Via quote_items table
- **Lead Integration**: Via lead_quotes table

### 4. activity_management_tests.md
- **Generic Activities**: Single activities table with type field
- **Entity Relationships**: Via pivot tables (person_activities, lead_activities, product_activities, warehouse_activities)
- **Participants**: Via activity_participants table
- **Files**: Via activity_files table
- **JSON Fields**: additional field for extra activity data
- **Scheduling**: schedule_from/schedule_to datetime fields

### 5. organization_management_tests.md
- **Simple Schema**: name and address (JSON only)
- **Person Relationships**: Via organization_id in persons table
- **JSON Address**: Complex address structure in JSON field
- **Custom Attributes**: Via attribute system

### 6. email_management_tests.md
- **Comprehensive Email Table**: subject, source, user_type, various JSON metadata fields
- **Email Threading**: Via parent_id and reference_ids JSON
- **Entity Links**: person_id and lead_id foreign keys
- **Attachments**: Via email_attachments table
- **Tags**: Via email_tags table
- **Unique Constraints**: unique_id and message_id fields

### 7. api_integration_tests.md
- **Controller-Specific**: LeadController, PersonController endpoints
- **DataGrid Integration**: PersonDataGrid, LeadDataGrid filtering
- **Resource Formatting**: PersonResource, LeadResource
- **Form Validation**: LeadForm, AttributeForm
- **JSON Field APIs**: Handling of emails, contact_numbers, etc.

### 8. data_migration_validation_tests.md
- **Krayin Table Structure**: All tables updated to match actual schema
- **JSON Field Migration**: Validation of JSON array preservation
- **Pivot Table Migration**: All entity-activity relationships
- **Decimal Precision**: Ensuring decimal(12,4) fields maintain precision
- **Foreign Key Integrity**: All Krayin-specific relationships

## Migration Impact

### Data Structure Changes
1. **contacts → persons**: Terminology and schema change
2. **JSON Fields**: emails and contact_numbers as arrays
3. **Pipeline Complexity**: Lead pipeline system with stages
4. **Activity Relationships**: Pivot table approach vs direct foreign keys
5. **Email System**: Dedicated emails table with threading

### Validation Requirements
1. **JSON Field Integrity**: Ensuring array structures preserved
2. **Decimal Precision**: Financial calculations maintain precision
3. **Foreign Key Constraints**: All Krayin relationships working
4. **Pivot Table Data**: Activity associations maintained
5. **Event System**: Laravel events translated to Django

### Testing Priorities
1. **Person Management**: Core entity with JSON fields
2. **Lead Pipeline**: Complex business logic
3. **Email Threading**: Communication history
4. **Activity Relationships**: Multiple entity associations
5. **Financial Calculations**: Quote and product pricing

## Next Steps
1. **Validate Field Mappings**: Ensure all Django models match Krayin schema
2. **Test JSON Handling**: Verify Django can handle Krayin's JSON structures
3. **Pipeline Logic**: Implement lead pipeline system in Django
4. **Event Translation**: Map Laravel events to Django signals
5. **Performance Testing**: JSON field queries and pivot table joins
