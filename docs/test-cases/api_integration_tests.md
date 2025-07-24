# API Integration Tests

## Overview
Comprehensive test cases for validating REST API functionality parity between Laravel and Django implementations, focusing on endpoint behavior, data formats, and integration capabilities.

## Test Cases

### Authentication API Tests

#### TEST-API-AUTH-001: User Authentication Endpoint
**Description**: Verify user authentication API endpoint functionality
**Priority**: Critical
**Endpoint**: `POST /api/auth/login`
**Steps**:
1. Send valid login credentials
2. Verify response format and structure
3. Test JWT token generation
4. Validate token expiration handling
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
**Expected Response**:
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "manager"
  }
}
```
**Validation Points**:
- HTTP status code: 200
- Response structure identical between systems
- Token format consistent
- Expiration time accurate

#### TEST-API-AUTH-002: Token Refresh Endpoint
**Description**: Verify token refresh functionality
**Endpoint**: `POST /api/auth/refresh`
**Steps**:
1. Authenticate and get initial token
2. Use token to request refresh
3. Verify new token generation
4. Test expired token refresh
**Headers**: `Authorization: Bearer {token}`
**Expected Response**:
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### TEST-API-AUTH-003: User Logout Endpoint
**Description**: Verify user logout and token invalidation
**Endpoint**: `POST /api/auth/logout`
**Steps**:
1. Authenticate user
2. Call logout endpoint with token
3. Verify token invalidation
4. Test subsequent API calls with invalidated token
**Expected Results**:
- Logout successful (HTTP 200)
- Token invalidated properly
- Subsequent calls return 401 Unauthorized

### Lead Management API Tests

#### TEST-API-LEAD-001: Get All Leads
**Description**: Verify leads list API endpoint
**Endpoint**: `GET /api/leads`
**Steps**:
1. Make authenticated request to leads endpoint
2. Verify response format and pagination
3. Test filtering parameters
4. Validate data structure
**Query Parameters**:
- `page`: Page number for pagination
- `per_page`: Number of records per page
- `status`: Filter by lead status
- `source`: Filter by lead source
**Expected Response**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Mr.",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "organization": "Acme Corp",
      "status": "new",
      "source": "website",
      "created_at": "2025-07-24T10:00:00Z",
      "updated_at": "2025-07-24T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7
  }
}
```

#### TEST-API-LEAD-002: Create New Lead
**Description**: Verify lead creation via API
**Endpoint**: `POST /api/leads`
**Steps**:
1. Send valid lead data
2. Verify lead creation
3. Test required field validation
4. Check response format
**Request Body**:
```json
{
  "title": "Ms.",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@techcorp.com",
  "phone": "+1987654321",
  "organization": "Tech Corp",
  "status": "new",
  "source": "referral"
}
```
**Expected Response**: HTTP 201 with created lead data

#### TEST-API-LEAD-003: Update Existing Lead
**Description**: Verify lead update functionality
**Endpoint**: `PUT /api/leads/{id}`
**Steps**:
1. Update existing lead data
2. Verify partial updates (PATCH)
3. Test validation on updates
4. Check response consistency
**Request Body**:
```json
{
  "status": "qualified",
  "phone": "+1987654322"
}
```

#### TEST-API-LEAD-004: Delete Lead
**Description**: Verify lead deletion via API
**Endpoint**: `DELETE /api/leads/{id}`
**Steps**:
1. Delete existing lead
2. Verify soft delete vs hard delete
3. Test deletion authorization
4. Check cascade deletion rules
**Expected Results**:
- HTTP 204 No Content on success
- Lead marked as deleted
- Related data handled appropriately

### Contact Management API Tests

#### TEST-API-CONTACT-001: Contact CRUD Operations
**Description**: Verify complete contact CRUD functionality
**Endpoints**: 
- `GET /api/contacts`
- `POST /api/contacts`
- `PUT /api/contacts/{id}`
- `DELETE /api/contacts/{id}`
**Steps**:
1. Test contact listing with pagination
2. Create new contact with validation
3. Update contact information
4. Delete contact record
**Validation Points**:
- All CRUD operations work correctly
- Data validation enforced
- Response formats consistent
- Error handling appropriate

#### TEST-API-CONTACT-002: Contact Search and Filtering
**Description**: Verify contact search API functionality
**Endpoint**: `GET /api/contacts/search`
**Steps**:
1. Search contacts by name
2. Search by email address
3. Filter by organization
4. Test advanced search combinations
**Query Parameters**:
- `q`: Search query string
- `organization_id`: Filter by organization
- `type`: Filter by contact type
- `tags`: Filter by tags

### Deal Management API Tests

#### TEST-API-DEAL-001: Deal Pipeline Operations
**Description**: Verify deal pipeline API functionality
**Endpoint**: `GET /api/deals/pipeline`
**Steps**:
1. Retrieve deal pipeline data
2. Verify stage grouping
3. Test deal value calculations
4. Check pipeline metrics
**Expected Response**:
```json
{
  "pipeline": {
    "stages": [
      {
        "id": 1,
        "name": "Prospecting",
        "deals": [
          {
            "id": 1,
            "title": "Enterprise Software Deal",
            "value": 50000,
            "probability": 20,
            "expected_close_date": "2025-08-15"
          }
        ],
        "total_value": 150000,
        "deal_count": 3
      }
    ],
    "total_pipeline_value": 500000
  }
}
```

#### TEST-API-DEAL-002: Deal Stage Management
**Description**: Verify deal stage progression API
**Endpoint**: `PATCH /api/deals/{id}/stage`
**Steps**:
1. Move deal to next stage
2. Move deal backwards in pipeline
3. Test stage validation rules
4. Verify stage history tracking
**Request Body**:
```json
{
  "stage_id": 3,
  "notes": "Deal progressed after successful demo"
}
```

### Activity Management API Tests

#### TEST-API-ACTIVITY-001: Activity CRUD Operations
**Description**: Verify activity management API endpoints
**Endpoints**:
- `GET /api/activities`
- `POST /api/activities`
- `PUT /api/activities/{id}`
- `DELETE /api/activities/{id}`
**Steps**:
1. List activities with filtering
2. Create scheduled activities
3. Update activity details
4. Complete activities
**Activity Types to Test**:
- Meetings
- Phone calls
- Tasks
- Emails

#### TEST-API-ACTIVITY-002: Calendar Integration API
**Description**: Verify calendar API functionality
**Endpoint**: `GET /api/activities/calendar`
**Steps**:
1. Retrieve calendar events
2. Filter by date range
3. Filter by activity type
4. Test timezone handling
**Query Parameters**:
- `start_date`: Calendar start date
- `end_date`: Calendar end date
- `user_id`: Filter by assigned user
- `type`: Filter by activity type

### Organization API Tests

#### TEST-API-ORG-001: Organization Management
**Description**: Verify organization API endpoints
**Endpoint**: `GET /api/organizations`
**Steps**:
1. List organizations with pagination
2. Create new organization
3. Update organization details
4. Test organization hierarchy
**Expected Features**:
- Parent-child relationships
- Contact associations
- Custom field support
- Address management

### Product and Quote API Tests

#### TEST-API-PRODUCT-001: Product Catalog API
**Description**: Verify product catalog API functionality
**Endpoint**: `GET /api/products`
**Steps**:
1. List products with categorization
2. Search products by name/SKU
3. Filter by category and status
4. Test pricing information
**Product Data Structure**:
```json
{
  "id": 1,
  "name": "Enterprise CRM License",
  "sku": "CRM-ENT-001",
  "category": "Software",
  "price": 999.00,
  "cost": 299.00,
  "status": "active"
}
```

#### TEST-API-QUOTE-001: Quote Management API
**Description**: Verify quote API functionality
**Endpoints**:
- `GET /api/quotes`
- `POST /api/quotes`
- `PUT /api/quotes/{id}`
- `POST /api/quotes/{id}/send`
**Steps**:
1. Create quote with line items
2. Calculate quote totals
3. Send quote to customer
4. Track quote status changes

### Email Integration API Tests

#### TEST-API-EMAIL-001: Email API Operations
**Description**: Verify email API functionality
**Endpoint**: `POST /api/emails/send`
**Steps**:
1. Send individual emails
2. Send bulk emails
3. Track email delivery
4. Monitor email engagement
**Request Body**:
```json
{
  "to": ["recipient@example.com"],
  "subject": "Follow-up on your inquiry",
  "body": "Thank you for your interest...",
  "template_id": 5,
  "attachments": ["file1.pdf"]
}
```

### Reporting API Tests

#### TEST-API-REPORT-001: Report Generation API
**Description**: Verify report generation via API
**Endpoint**: `POST /api/reports/generate`
**Steps**:
1. Generate sales reports
2. Create custom reports
3. Export report data
4. Schedule report generation
**Report Types**:
- Sales performance
- Lead conversion
- Activity summaries
- Revenue analysis

### API Performance and Security Tests

#### TEST-API-PERF-001: API Rate Limiting
**Description**: Verify API rate limiting functionality
**Steps**:
1. Make requests within rate limits
2. Exceed rate limit thresholds
3. Test rate limit reset periods
4. Verify rate limit headers
**Expected Headers**:
- `X-RateLimit-Limit`: 1000
- `X-RateLimit-Remaining`: 999
- `X-RateLimit-Reset`: 1627804800

#### TEST-API-SEC-001: API Security Testing
**Description**: Verify API security measures
**Steps**:
1. Test unauthorized access attempts
2. Verify SQL injection protection
3. Test XSS prevention
4. Check CORS configuration
**Security Validations**:
- Authentication required for protected endpoints
- Input sanitization working
- Error messages don't leak sensitive data
- HTTPS enforcement

#### TEST-API-VAL-001: Data Validation Testing
**Description**: Verify API data validation
**Steps**:
1. Send invalid data formats
2. Test required field validation
3. Check data type validation
4. Verify business rule enforcement
**Validation Tests**:
- Email format validation
- Phone number format validation
- Date range validation
- Numeric value validation

### API Documentation and Consistency Tests

#### TEST-API-DOC-001: API Documentation Validation
**Description**: Verify API documentation accuracy
**Steps**:
1. Compare actual responses with documented schemas
2. Test all documented endpoints
3. Verify parameter descriptions
4. Check error response documentation
**Documentation Sources**:
- OpenAPI/Swagger specifications
- Postman collections
- API reference documentation

#### TEST-API-COMPAT-001: API Compatibility Testing
**Description**: Verify API compatibility between Laravel and Django
**Steps**:
1. Compare endpoint URLs and methods
2. Verify request/response formats
3. Test authentication compatibility
4. Check error response consistency
**Compatibility Areas**:
- URL structure consistency
- HTTP status codes
- Response format alignment
- Error message format
