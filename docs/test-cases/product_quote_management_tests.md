# Product and Quote Management Tests

## Overview
Comprehensive test cases for validating product catalog and quote management functionality based on Krayin's actual schema and implementation.

## Test Cases

### Product Catalog Management

#### TEST-PRODUCT-001: Create New Product - Krayin Schema
**Description**: Verify product creation with Krayin's actual product table structure
**Priority**: High
**Preconditions**: User logged in with product management permissions
**Steps**:
1. Navigate to products section
2. Click "Create New Product"
3. Fill in product details based on products table:
   - SKU: "CRM-ENT-001" (unique constraint)
   - Name: "Enterprise CRM License"
   - Description: "Full-featured CRM solution for enterprises"
   - Quantity: 100 (integer default 0)
   - Price: "999.0000" (decimal 12,4)
4. Save product
**Expected Results**:
- Product created successfully in products table
- SKU uniqueness enforced by database constraint
- Quantity stored as integer with default 0
- Price stored as decimal(12,4) format
- All fields saved correctly
- Behavior identical between Laravel and Django

#### TEST-PRODUCT-002: Product Inventory Management
**Description**: Verify product inventory tracking via product_inventories table
**Steps**:
1. Create product with initial quantity
2. Track inventory via product_inventories table
3. Link to warehouses table if applicable
4. Monitor inventory changes
**Expected Results**:
- Product quantity tracked accurately
- Inventory movements logged in product_inventories
- Warehouse associations maintained
- Stock levels updated correctly

#### TEST-PRODUCT-003: Product Activities and Tags
**Description**: Verify product activity tracking and tagging
**Steps**:
1. Associate activities with products via product_activities table
2. Tag products via product_tags table
3. Track product-related communications
4. Monitor product engagement
**Expected Results**:
- Product activities tracked via product_activities pivot table
- Product tags managed via product_tags table
- Activity history maintained for products
- Tag-based filtering functional

### Quote Creation and Management

#### TEST-QUOTE-001: Create New Quote - Krayin Schema
**Description**: Verify quote creation with Krayin's actual quotes table structure
**Steps**:
1. Navigate to quotes section
2. Click "Create New Quote"
3. Fill in quote details based on quotes table:
   - Subject: "Enterprise CRM Proposal"
   - Description: "Annual CRM license proposal"
   - Person: Select from persons table (person_id foreign key)
   - User: Assign to user (user_id foreign key)
   - Billing Address: JSON field for address data
   - Shipping Address: JSON field for shipping info
   - Expired At: "2025-08-15 23:59:59"
4. Save quote
**Expected Results**:
- Quote created successfully in quotes table
- Person and user relationships established via foreign keys
- Address data stored as JSON in billing_address/shipping_address
- Expiration date stored as datetime
- Quote appears in quotes list

#### TEST-QUOTE-002: Quote Line Items via quote_items Table
**Description**: Verify quote line item functionality using Krayin's quote_items table
**Steps**:
1. Add products to quote via quote_items table
2. Set product quantities and unit prices
3. Calculate line totals with discount handling
4. Verify quote_items foreign key relationships
**Expected Results**:
- Products linked via quote_items table correctly
- Quantity and pricing calculations accurate
- Line-level discounts applied properly
- Foreign key constraints maintained

#### TEST-QUOTE-003: Quote Financial Calculations
**Description**: Verify Krayin's quote financial calculation fields
**Steps**:
1. Add multiple line items to quote
2. Apply discount_percent and discount_amount
3. Calculate tax_amount and adjustment_amount
4. Verify sub_total and grand_total calculations
**Expected Results**:
- All decimal(12,4) fields calculate correctly
- Discount calculations (percent vs amount) work properly
- Tax calculations accurate
- Grand total reflects all adjustments

#### TEST-QUOTE-004: Quote-Lead Integration
**Description**: Verify quote-lead relationships via lead_quotes table
**Steps**:
1. Create quote for existing lead
2. Link via lead_quotes pivot table
3. Track quote progression in lead pipeline
4. Verify quote impact on lead value
**Expected Results**:
- Quote linked to lead via lead_quotes table
- Lead pipeline updated with quote information
- Quote value influences lead value calculations
- Relationship integrity maintained

### Quote Workflow and Status Management

#### TEST-QUOTE-005: Quote Status Workflow
**Description**: Verify quote status progression
**Steps**:
1. Create quote in "Draft" status
2. Send quote to customer ("Sent")
3. Receive customer acceptance ("Accepted")
4. Convert to order/deal ("Converted")
**Expected Results**:
- Status transitions work correctly
- Workflow rules enforced
- Status history tracked
- Notifications sent appropriately

#### TEST-QUOTE-006: Quote Approval Process
**Description**: Verify quote approval workflow
**Steps**:
1. Create quote requiring approval
2. Submit for manager approval
3. Approve or reject quote
4. Track approval history
**Expected Results**:
- Approval workflow triggers
- Approval notifications sent
- Approval decisions tracked
- History maintains audit trail

#### TEST-QUOTE-007: Quote Expiration Management
**Description**: Verify quote expiration handling
**Steps**:
1. Create quote with expiration date
2. Monitor quote as it approaches expiration
3. Test automatic expiration
4. Verify renewal options
**Expected Results**:
- Expiration dates tracked
- Expiration warnings sent
- Automatic expiration works
- Renewal process functional

### Quote Customer Interaction

#### TEST-QUOTE-008: Customer Quote Portal
**Description**: Verify customer quote viewing portal
**Steps**:
1. Send quote link to customer
2. Customer views quote online
3. Customer accepts/rejects quote
4. Track customer interactions
**Expected Results**:
- Quote portal accessible
- Customer can view quote details
- Accept/reject functionality works
- Interactions logged properly

#### TEST-QUOTE-009: Quote Electronic Signatures
**Description**: Verify electronic signature functionality
**Steps**:
1. Configure e-signature settings
2. Send quote for signature
3. Customer signs electronically
4. Verify signature validity
**Expected Results**:
- E-signature setup works
- Signing process smooth
- Signatures captured properly
- Legal validity maintained

#### TEST-QUOTE-010: Quote Revision Management
**Description**: Verify quote revision tracking
**Steps**:
1. Create initial quote version
2. Make revisions to quote
3. Track version history
4. Compare quote versions
**Expected Results**:
- Revisions tracked properly
- Version history maintained
- Comparison tools functional
- Original preserved

### Quote Integration and Conversion

#### TEST-QUOTE-011: Quote-to-Deal Conversion
**Description**: Verify quote conversion to deals
**Steps**:
1. Accept customer quote
2. Convert quote to deal
3. Verify deal data inheritance
4. Track conversion metrics
**Expected Results**:
- Conversion process smooth
- Data transfers correctly
- Deal created with quote details
- Metrics tracked accurately

#### TEST-QUOTE-012: Quote-to-Invoice Integration
**Description**: Verify quote to invoice conversion
**Steps**:
1. Convert accepted quote to invoice
2. Verify invoice line items
3. Apply payment terms
4. Generate invoice document
**Expected Results**:
- Invoice created from quote
- Line items transfer correctly
- Payment terms applied
- Invoice formatting proper

#### TEST-QUOTE-013: Quote Inventory Integration
**Description**: Verify quote inventory reservation
**Steps**:
1. Create quote with inventory items
2. Reserve inventory for quote
3. Release reservation on expiration
4. Track inventory movements
**Expected Results**:
- Inventory reserved properly
- Reservations track correctly
- Auto-release on expiration
- Movement history accurate

### Quote Reporting and Analytics

#### TEST-QUOTE-014: Quote Reports and Analytics
**Description**: Verify quote reporting functionality
**Steps**:
1. Generate quote summary reports
2. Analyze quote conversion rates
3. Track quote values over time
4. Monitor quote performance metrics
**Expected Results**:
- Reports generate accurately
- Conversion rates calculated correctly
- Trend analysis meaningful
- Performance metrics useful

#### TEST-QUOTE-015: Quote Profitability Analysis
**Description**: Verify quote profitability calculations
**Steps**:
1. Calculate quote margins
2. Analyze cost vs. selling price
3. Track profitability trends
4. Generate profitability reports
**Expected Results**:
- Margin calculations accurate
- Cost analysis comprehensive
- Trends display properly
- Reports provide insights

### Performance and Data Migration

#### TEST-QUOTE-016: Quote Performance Testing
**Description**: Verify system performance with large quote datasets
**Preconditions**: 10,000+ quotes and 50,000+ products in system
**Steps**:
1. Load quotes list page
2. Generate complex quotes
3. Run quote reports
4. Test product search in quotes
**Expected Results**:
- Page load times acceptable (&lt;3 seconds)
- Quote generation smooth
- Reports complete timely
- Product search responsive

#### TEST-QUOTE-017: Product and Quote Data Migration
**Description**: Verify product and quote data migrated correctly
**Steps**:
1. Compare product counts between systems
2. Verify quote data preservation
3. Check pricing structure migration
4. Validate inventory data transfer
**Expected Results**:
- All products migrated successfully
- Quote data preserved accurately
- Pricing structures intact
- Inventory levels correct
