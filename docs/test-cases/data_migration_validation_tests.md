# Data Migration Validation Tests

## Overview
Comprehensive test cases for validating data migration accuracy and integrity between Laravel (MySQL) and Django (PostgreSQL) implementations.

## Test Cases

### Pre-Migration Data Validation

#### TEST-PREMIG-001: Source Data Inventory
**Description**: Validate source data completeness before migration
**Priority**: Critical
**Steps**:
1. Count total records in each Laravel table
2. Identify data types and constraints
3. Document custom fields and relationships
4. Export sample data for comparison
**Tables to Validate**:
- users
- leads
- contacts
- deals
- activities
- organizations
- emails
- products
- quotes
**Expected Results**:
- Complete record counts documented
- Data types mapped correctly
- Relationships identified
- Sample data exported for validation

#### TEST-PREMIG-002: Data Quality Assessment
**Description**: Assess data quality issues before migration
**Steps**:
1. Identify duplicate records
2. Find orphaned records
3. Locate missing required data
4. Check data format inconsistencies
**Quality Checks**:
- Email format validation
- Phone number format consistency
- Date format standardization
- Null value analysis
**Expected Results**:
- Data quality issues documented
- Cleanup requirements identified
- Migration risk assessment complete

### User Data Migration Tests

#### TEST-MIG-USER-001: User Account Migration
**Description**: Verify user account data migration accuracy
**Steps**:
1. Compare user counts between systems
2. Validate user profile data migration
3. Check password hash preservation
4. Verify role and permission mapping
**Data Points to Validate**:
```sql
-- Laravel (MySQL)
SELECT COUNT(*) FROM users;
SELECT id, name, email, created_at, updated_at FROM users LIMIT 10;

-- Django (PostgreSQL)  
SELECT COUNT(*) FROM auth_user;
SELECT id, first_name, last_name, email, date_joined, last_login FROM auth_user LIMIT 10;
```
**Field Mapping Validation**:
- Laravel `name` → Django `first_name` + `last_name`
- Laravel `created_at` → Django `date_joined`
- Laravel `updated_at` → Django `last_login`
**Expected Results**:
- User counts match exactly
- All user data preserved
- Field mapping applied correctly
- No data loss or corruption

#### TEST-MIG-USER-002: User Permission Migration
**Description**: Verify user roles and permissions migrate correctly
**Steps**:
1. Compare role assignments
2. Validate permission mappings
3. Test role hierarchy preservation
4. Check custom permission migration
**Permission Mapping**:
- Laravel roles → Django groups
- Laravel permissions → Django permissions
- Custom permissions preserved
**Expected Results**:
- All roles migrated correctly
- Permission mappings accurate
- Hierarchy relationships maintained
- Custom permissions functional

### Contact and Lead Migration Tests

#### TEST-MIG-CONTACT-001: Contact Data Migration
**Description**: Verify contact data migration accuracy
**Steps**:
1. Compare contact record counts
2. Validate contact field mapping
3. Check contact-organization relationships
4. Verify custom field migration
**Contact Field Mapping**:
```json
{
  "laravel_field": "django_field",
  "first_name": "first_name",
  "last_name": "last_name", 
  "email": "email",
  "phone": "phone",
  "organization": "organization_id",
  "created_at": "created_at",
  "updated_at": "updated_at"
}
```
**Validation Queries**:
```sql
-- Record count comparison
SELECT COUNT(*) FROM contacts; -- Laravel
SELECT COUNT(*) FROM crm_contacts; -- Django

-- Sample data comparison
SELECT id, first_name, last_name, email, phone FROM contacts ORDER BY id LIMIT 10;
SELECT id, first_name, last_name, email, phone FROM crm_contacts ORDER BY id LIMIT 10;
```
**Expected Results**:
- Contact counts identical
- All field data preserved
- Relationships maintained
- Custom fields migrated

#### TEST-MIG-LEAD-001: Lead Data Migration
**Description**: Verify lead data migration accuracy
**Steps**:
1. Compare lead record counts
2. Validate lead source mapping
3. Check lead status migration
4. Verify lead-contact relationships
**Lead Status Mapping**:
- Laravel statuses → Django choices
- Custom statuses preserved
- Status history maintained
**Expected Results**:
- Lead counts match exactly
- Source mappings correct
- Status values consistent
- Conversion history preserved

### Deal and Opportunity Migration Tests

#### TEST-MIG-DEAL-001: Deal Data Migration
**Description**: Verify deal/opportunity data migration
**Steps**:
1. Compare deal record counts
2. Validate deal stage mapping
3. Check deal value calculations
4. Verify deal-contact relationships
**Deal Stage Mapping**:
```json
{
  "laravel_stages": ["prospect", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"],
  "django_stages": ["prospecting", "qualification", "proposal", "negotiation", "won", "lost"],
  "mapping": {
    "prospect": "prospecting",
    "qualified": "qualification", 
    "proposal": "proposal",
    "negotiation": "negotiation",
    "closed_won": "won",
    "closed_lost": "lost"
  }
}
```
**Value Calculations**:
- Deal amounts preserved
- Currency conversions handled
- Probability calculations maintained
**Expected Results**:
- Deal counts identical
- Stage mappings applied correctly
- Values calculated accurately
- Relationships preserved

#### TEST-MIG-DEAL-002: Deal Product Association
**Description**: Verify deal-product relationship migration
**Steps**:
1. Compare deal product line items
2. Validate quantity and pricing
3. Check discount applications
4. Verify total calculations
**Expected Results**:
- All line items migrated
- Quantities and prices accurate
- Discounts applied correctly
- Totals calculated properly

### Activity and Communication Migration Tests

#### TEST-MIG-ACTIVITY-001: Activity Data Migration
**Description**: Verify activity data migration accuracy
**Steps**:
1. Compare activity record counts
2. Validate activity type mapping
3. Check activity-entity relationships
4. Verify completion status migration
**Activity Type Mapping**:
- Meeting → Meeting
- Call → Phone Call
- Task → Task
- Email → Email
- Custom types preserved
**Relationship Validation**:
- Activity-Contact links
- Activity-Deal links
- Activity-Lead links
**Expected Results**:
- Activity counts match
- Type mappings correct
- Relationships maintained
- Status values accurate

#### TEST-MIG-EMAIL-001: Email Communication Migration
**Description**: Verify email data migration
**Steps**:
1. Compare email record counts
2. Validate email content preservation
3. Check attachment migration
4. Verify email threading
**Email Data Points**:
- Subject lines preserved
- Body content intact
- Sender/recipient information
- Timestamps accurate
- Thread relationships maintained
**Expected Results**:
- Email counts identical
- Content preserved completely
- Attachments transferred
- Threading relationships intact

### Product and Quote Migration Tests

#### TEST-MIG-PRODUCT-001: Product Catalog Migration
**Description**: Verify product data migration
**Steps**:
1. Compare product record counts
2. Validate product pricing
3. Check category mapping
4. Verify inventory levels
**Product Data Validation**:
- SKU uniqueness maintained
- Pricing structures preserved
- Category hierarchies intact
- Inventory quantities accurate
**Expected Results**:
- Product counts match
- All pricing data preserved
- Categories migrated correctly
- Inventory levels accurate

#### TEST-MIG-QUOTE-001: Quote and Proposal Migration
**Description**: Verify quote data migration
**Steps**:
1. Compare quote record counts
2. Validate quote line items
3. Check quote status mapping
4. Verify quote calculations
**Quote Validation Points**:
- Quote numbers preserved
- Line items complete
- Calculations accurate
- Status mappings correct
**Expected Results**:
- Quote counts identical
- Line items preserved
- Calculations match
- Status values correct

### Custom Fields and Configuration Migration

#### TEST-MIG-CUSTOM-001: Custom Field Migration
**Description**: Verify custom field migration accuracy
**Steps**:
1. Compare custom field definitions
2. Validate custom field values
3. Check field type preservation
4. Verify validation rules migration
**Custom Field Types**:
- Text fields
- Number fields
- Date fields
- Dropdown/Select fields
- Checkbox fields
- File upload fields
**Expected Results**:
- All custom fields migrated
- Field types preserved
- Values transferred correctly
- Validation rules functional

#### TEST-MIG-CONFIG-001: System Configuration Migration
**Description**: Verify system configuration migration
**Steps**:
1. Compare configuration settings
2. Validate email configurations
3. Check workflow settings
4. Verify notification preferences
**Configuration Areas**:
- SMTP settings
- Lead assignment rules
- Deal stage workflows
- Notification preferences
- User interface settings
**Expected Results**:
- Configurations preserved
- Settings functional
- Workflows operational
- Preferences maintained

### Data Integrity and Relationship Tests

#### TEST-MIG-INTEGRITY-001: Referential Integrity Validation
**Description**: Verify referential integrity after migration
**Steps**:
1. Check foreign key relationships
2. Validate parent-child links
3. Identify orphaned records
4. Verify cascade rules
**Relationship Checks**:
```sql
-- Check for orphaned contacts (contacts without valid organization_id)
SELECT COUNT(*) FROM crm_contacts c 
LEFT JOIN crm_organizations o ON c.organization_id = o.id 
WHERE c.organization_id IS NOT NULL AND o.id IS NULL;

-- Check for orphaned activities (activities without valid entity references)
SELECT COUNT(*) FROM crm_activities a 
WHERE (a.contact_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM crm_contacts WHERE id = a.contact_id))
   OR (a.deal_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM crm_deals WHERE id = a.deal_id));
```
**Expected Results**:
- No orphaned records
- All relationships intact
- Foreign keys valid
- Cascade rules working

#### TEST-MIG-INTEGRITY-002: Data Consistency Validation
**Description**: Verify data consistency across related tables
**Steps**:
1. Check aggregated values consistency
2. Validate calculated fields
3. Verify status consistency
4. Check timestamp logic
**Consistency Checks**:
- Deal totals match line item sums
- Contact counts match organization summaries
- Activity completion rates accurate
- Last modified timestamps logical
**Expected Results**:
- Aggregated values consistent
- Calculated fields accurate
- Status values logical
- Timestamps sequential

### Performance and Volume Testing

#### TEST-MIG-PERF-001: Large Dataset Migration Performance
**Description**: Verify migration performance with large datasets
**Prerequisites**: Large dataset available for testing
**Steps**:
1. Migrate datasets of varying sizes
2. Measure migration times
3. Monitor system resources
4. Validate data accuracy at scale
**Dataset Sizes**:
- 10,000 records per table
- 100,000 records per table
- 1,000,000 records per table
**Expected Results**:
- Migration completes within acceptable timeframes
- No performance degradation
- Data accuracy maintained at scale
- System resources utilized efficiently

#### TEST-MIG-ROLLBACK-001: Migration Rollback Testing
**Description**: Verify migration rollback capabilities
**Steps**:
1. Perform partial migration
2. Execute rollback procedure
3. Verify system state restoration
4. Check data integrity after rollback
**Expected Results**:
- Rollback completes successfully
- System restored to previous state
- No data corruption
- System fully functional after rollback

### Post-Migration Validation

#### TEST-POSTMIG-001: Application Functionality Validation
**Description**: Verify application functionality after migration
**Steps**:
1. Test core CRM functionality
2. Verify all features operational
3. Check performance benchmarks
4. Validate user workflows
**Functional Areas**:
- User authentication
- Contact management
- Lead processing
- Deal management
- Activity tracking
- Reporting functionality
**Expected Results**:
- All functionality operational
- Performance within acceptable ranges
- User workflows functional
- Data access working correctly

#### TEST-POSTMIG-002: Data Validation Sampling
**Description**: Statistical sampling validation of migrated data
**Steps**:
1. Select random sample of records
2. Compare data between systems
3. Validate calculations and aggregations
4. Check complex relationships
**Sampling Strategy**:
- 1% random sample for large tables
- 10% sample for smaller tables
- 100% validation for critical tables
**Expected Results**:
- Sample validation passes 100%
- No discrepancies found
- Calculations accurate
- Relationships preserved
