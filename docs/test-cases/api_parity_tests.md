# API Parity Tests

## Overview
Comprehensive API testing to ensure complete parity between Laravel and Django REST API implementations.

## Authentication API Tests

### AUTH-API-001: User Login
**Endpoint**: `POST /api/auth/login`
**Description**: Verify login API returns identical responses
**Laravel Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Expected Response Structure**:
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "manager"
  },
  "expires_at": "2025-07-25T12:00:00Z"
}
```
**Validation Points**:
- Response structure identical
- Token format consistent
- User object fields match
- Error responses identical for invalid credentials

### AUTH-API-002: Token Refresh
**Endpoint**: `POST /api/auth/refresh`
**Description**: Verify token refresh mechanism works identically
**Headers**: `Authorization: Bearer {token}`
**Expected Response**:
```json
{
  "success": true,
  "token": "new_jwt_token",
  "expires_at": "2025-07-25T13:00:00Z"
}
```

### AUTH-API-003: User Logout
**Endpoint**: `POST /api/auth/logout`
**Description**: Verify logout invalidates token correctly
**Expected Response**:
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

## Leads API Tests

### LEADS-API-001: Get All Leads
**Endpoint**: `GET /api/leads`
**Description**: Verify leads listing API parity
**Query Parameters**:
- `page`: 1
- `per_page`: 20
- `sort`: name
- `order`: asc
- `filter[status]`: new
- `search`: company name

**Expected Response Structure**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Mr",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "organization": "Acme Corp",
      "source": {
        "id": 1,
        "name": "Website"
      },
      "status": "new",
      "assigned_to": {
        "id": 1,
        "name": "Sales Rep"
      },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 150,
    "last_page": 8
  },
  "links": {
    "first": "/api/leads?page=1",
    "last": "/api/leads?page=8",
    "prev": null,
    "next": "/api/leads?page=2"
  }
}
```

### LEADS-API-002: Create Lead
**Endpoint**: `POST /api/leads`
**Request Body**:
```json
{
  "title": "Ms",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@techcorp.com",
  "phone": "+1987654321",
  "organization": "Tech Corp",
  "source_id": 2,
  "assigned_to": 1,
  "custom_fields": {
    "industry": "Technology",
    "budget": "50000"
  }
}
```
**Expected Response**: 201 Created with lead object

### LEADS-API-003: Get Lead Details
**Endpoint**: `GET /api/leads/{id}`
**Expected Response**: Complete lead object with relationships
**Includes**:
- Lead basic information
- Associated activities
- Notes and attachments
- Source information
- Assigned user details

### LEADS-API-004: Update Lead
**Endpoint**: `PUT /api/leads/{id}`
**Description**: Verify lead update functionality
**Partial Update Support**: `PATCH /api/leads/{id}`

### LEADS-API-005: Delete Lead
**Endpoint**: `DELETE /api/leads/{id}`
**Expected Response**: 204 No Content
**Validation**: Lead and related data properly deleted

## Contacts API Tests

### CONTACTS-API-001: List Contacts
**Endpoint**: `GET /api/contacts`
**Description**: Verify contacts listing with filtering and pagination
**Query Parameters**:
- `page`, `per_page`, `sort`, `order`
- `filter[organization]`
- `filter[tags]`
- `search`

### CONTACTS-API-002: Create Contact
**Endpoint**: `POST /api/contacts`
**Request Structure**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@company.com",
  "phone": "+1234567890",
  "organization_id": 1,
  "job_title": "Manager",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "postal_code": "12345",
    "country": "US"
  },
  "social_profiles": {
    "linkedin": "linkedin.com/in/johndoe",
    "twitter": "@johndoe"
  }
}
```

### CONTACTS-API-003: Contact Activities
**Endpoint**: `GET /api/contacts/{id}/activities`
**Description**: Get contact's activity timeline
**Response**: Chronological list of all interactions

### CONTACTS-API-004: Add Contact Activity
**Endpoint**: `POST /api/contacts/{id}/activities`
**Activity Types**: email, call, meeting, note, task
**Request Structure**:
```json
{
  "type": "call",
  "subject": "Follow-up call",
  "description": "Discussed project requirements",
  "duration": 1800,
  "scheduled_at": "2025-07-25T14:00:00Z",
  "completed_at": "2025-07-25T14:30:00Z"
}
```

## Deals API Tests

### DEALS-API-001: List Deals
**Endpoint**: `GET /api/deals`
**Pipeline Support**: Filter by pipeline and stage
**Query Parameters**:
- `filter[pipeline_id]`
- `filter[stage_id]`
- `filter[assigned_to]`
- `filter[value_min]`, `filter[value_max]`

### DEALS-API-002: Create Deal
**Endpoint**: `POST /api/deals`
**Request Structure**:
```json
{
  "name": "Enterprise Software Deal",
  "value": 100000,
  "currency": "USD",
  "pipeline_id": 1,
  "stage_id": 2,
  "contact_id": 1,
  "organization_id": 1,
  "assigned_to": 1,
  "expected_close_date": "2025-08-30",
  "probability": 70,
  "products": [
    {
      "product_id": 1,
      "quantity": 5,
      "unit_price": 20000
    }
  ]
}
```

### DEALS-API-003: Move Deal Stage
**Endpoint**: `PATCH /api/deals/{id}/stage`
**Request**:
```json
{
  "stage_id": 3,
  "reason": "Customer signed contract"
}
```

### DEALS-API-004: Deal Products
**Endpoint**: `GET /api/deals/{id}/products`
**Description**: List products associated with deal
**Endpoint**: `POST /api/deals/{id}/products` - Add product to deal

## Activities API Tests

### ACTIVITIES-API-001: List Activities
**Endpoint**: `GET /api/activities`
**Filters**: type, date range, assigned user, related entity

### ACTIVITIES-API-002: Create Activity
**Endpoint**: `POST /api/activities`
**Activity Types**: call, email, meeting, task, note
**Support for**: leads, contacts, deals, organizations

### ACTIVITIES-API-003: Activity Calendar
**Endpoint**: `GET /api/activities/calendar`
**Query Parameters**:
- `start_date`, `end_date`
- `user_id`
- `type`

## Users and Teams API Tests

### USERS-API-001: List Users
**Endpoint**: `GET /api/users`
**Description**: Get team members list
**Role-based filtering**: admin, manager, agent

### USERS-API-002: User Profile
**Endpoint**: `GET /api/users/{id}`
**Includes**: permissions, team assignments, activity stats

### USERS-API-003: Update User Profile
**Endpoint**: `PUT /api/users/{id}`
**Updateable fields**: name, email, role, permissions

## Reports API Tests

### REPORTS-API-001: Lead Reports
**Endpoint**: `GET /api/reports/leads`
**Metrics**: conversion rates, source performance, time-to-conversion

### REPORTS-API-002: Sales Reports
**Endpoint**: `GET /api/reports/sales`
**Metrics**: revenue, deal velocity, win rates, forecasting

### REPORTS-API-003: Activity Reports
**Endpoint**: `GET /api/reports/activities`
**Metrics**: activity volume, response times, productivity

## Error Handling Tests

### ERROR-001: 400 Bad Request
**Scenarios**: Invalid JSON, missing required fields, invalid data types
**Expected Response**:
```json
{
  "error": "Validation failed",
  "message": "The given data was invalid",
  "errors": {
    "email": ["The email field is required"],
    "phone": ["The phone format is invalid"]
  }
}
```

### ERROR-002: 401 Unauthorized
**Scenarios**: Missing token, invalid token, expired token
**Expected Response**:
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### ERROR-003: 403 Forbidden
**Scenarios**: Insufficient permissions
**Expected Response**:
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### ERROR-004: 404 Not Found
**Scenarios**: Resource doesn't exist
**Expected Response**:
```json
{
  "error": "Not Found",
  "message": "The requested resource was not found"
}
```

### ERROR-005: 422 Unprocessable Entity
**Scenarios**: Business logic validation failures
**Expected Response**:
```json
{
  "error": "Unprocessable Entity",
  "message": "Lead cannot be deleted because it has associated deals"
}
```

### ERROR-006: 429 Too Many Requests
**Scenarios**: Rate limiting exceeded
**Expected Response**:
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 60 seconds",
  "retry_after": 60
}
```

### ERROR-007: 500 Internal Server Error
**Scenarios**: Server errors
**Expected Response**:
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Performance Requirements

### Response Time Benchmarks
- **List endpoints**: < 500ms for 100 records
- **Create/Update operations**: < 200ms
- **Search endpoints**: < 1000ms
- **Report generation**: < 5000ms
- **File uploads**: Progress indication for files > 10MB

### Throughput Requirements
- **Concurrent users**: Support 100 simultaneous API users
- **Request rate**: 1000 requests/minute per endpoint
- **Peak load**: Handle 5x normal load for 10 minutes

## Security Tests

### SEC-API-001: SQL Injection Prevention
**Test**: Inject SQL commands in all input fields
**Expected**: Queries properly parameterized, no SQL execution

### SEC-API-002: XSS Prevention
**Test**: Include JavaScript in text fields
**Expected**: Content properly escaped in responses

### SEC-API-003: CSRF Protection
**Test**: Submit requests without CSRF tokens
**Expected**: Requests rejected with 403 status

### SEC-API-004: Rate Limiting
**Test**: Exceed API rate limits
**Expected**: 429 status with retry-after header

### SEC-API-005: Authentication Bypass
**Test**: Access protected endpoints without authentication
**Expected**: 401 status for all protected endpoints

## API Documentation Parity

### Documentation Requirements
- [ ] All endpoints documented identically
- [ ] Request/response examples match
- [ ] Error codes and messages documented
- [ ] Authentication requirements specified
- [ ] Rate limiting information included
- [ ] Deprecation notices synchronized

## Automation Framework

### Test Implementation
- **Framework**: pytest + requests library
- **Configuration**: Environment-specific API base URLs
- **Authentication**: Automated token management
- **Data Setup**: Automated test data creation/cleanup
- **Reporting**: Detailed API response comparisons
- **CI Integration**: Automated API testing on code changes

### Test Data Management
- **Setup**: Automated test data creation
- **Isolation**: Each test uses fresh data
- **Cleanup**: Automatic data cleanup after tests
- **Consistency**: Same test data used for both systems
