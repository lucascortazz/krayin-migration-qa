"""
Test settings and configuration for the migration QA framework
"""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Test configuration
TEST_SETTINGS = {
    'SELENIUM': {
        'GRID_URL': os.getenv('SELENIUM_GRID_URL', 'http://localhost:4444/wd/hub'),
        'IMPLICIT_WAIT': int(os.getenv('SELENIUM_IMPLICIT_WAIT', 10)),
        'EXPLICIT_WAIT': int(os.getenv('SELENIUM_EXPLICIT_WAIT', 30)),
        'BROWSER': os.getenv('TEST_BROWSER', 'chrome'),
        'HEADLESS': os.getenv('HEADLESS_MODE', 'false').lower() == 'true',
        'WINDOW_SIZE': (1920, 1080),
        'PAGE_LOAD_TIMEOUT': 30
    },
    
    'PERFORMANCE': {
        'LOAD_TEST_USERS': int(os.getenv('LOAD_TEST_USERS', 50)),
        'LOAD_TEST_DURATION': int(os.getenv('LOAD_TEST_DURATION', 300)),
        'MAX_PAGE_LOAD_TIME': 3.0,  # seconds
        'MAX_API_RESPONSE_TIME': 1.0,  # seconds
        'MAX_DATABASE_QUERY_TIME': 0.5  # seconds
    },
    
    'SECURITY': {
        'ENABLE_SECURITY_SCANS': os.getenv('ENABLE_SECURITY_SCANS', 'true').lower() == 'true',
        'OWASP_ZAP_URL': os.getenv('OWASP_ZAP_URL', 'http://localhost:8090'),
        'SQL_INJECTION_PAYLOADS': [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT * FROM users --"
        ],
        'XSS_PAYLOADS': [
            "<script>alert('XSS')</script>",
            "javascript:alert('XSS')",
            "<img src=x onerror=alert('XSS')>"
        ]
    },
    
    'API': {
        'TIMEOUT': 30,
        'RETRY_COUNT': 3,
        'RETRY_DELAY': 1,
        'HEADERS': {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    },
    
    'DATABASE': {
        'CONNECTION_TIMEOUT': 10,
        'QUERY_TIMEOUT': 30,
        'MAX_CONNECTIONS': 10
    },
    
    'REPORTING': {
        'SCREENSHOT_ON_FAILURE': True,
        'VIDEO_RECORDING': False,
        'LOG_LEVEL': 'INFO',
        'REPORT_FORMAT': 'html',
        'REPORT_PATH': BASE_DIR / 'reports' / 'test-results'
    },
    
    'PARALLEL_EXECUTION': {
        'MAX_WORKERS': int(os.getenv('MAX_WORKERS', 4)),
        'ENABLE_PARALLEL': os.getenv('ENABLE_PARALLEL', 'true').lower() == 'true'
    }
}

# Test data configuration
TEST_DATA = {
    'USERS': {
        'admin': {
            'email': 'admin@test.com',
            'password': 'admin123',
            'role': 'administrator'
        },
        'manager': {
            'email': 'manager@test.com',
            'password': 'manager123',
            'role': 'manager'
        },
        'agent': {
            'email': 'agent@test.com',
            'password': 'agent123',
            'role': 'agent'
        }
    },
    
    'LEADS': {
        'sample_lead': {
            'name': 'John Doe',
            'email': 'john.doe@example.com',
            'phone': '+1234567890',
            'company': 'Acme Corp',
            'source': 'Website'
        }
    },
    
    'CONTACTS': {
        'sample_contact': {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'email': 'jane.smith@example.com',
            'phone': '+0987654321',
            'organization': 'Tech Solutions Inc'
        }
    }
}

# Environment-specific overrides
ENVIRONMENT = os.getenv('TEST_ENVIRONMENT', 'local')

if ENVIRONMENT == 'ci':
    TEST_SETTINGS['SELENIUM']['HEADLESS'] = True
    TEST_SETTINGS['PARALLEL_EXECUTION']['MAX_WORKERS'] = 2
elif ENVIRONMENT == 'staging':
    TEST_SETTINGS['PERFORMANCE']['LOAD_TEST_USERS'] = 10
    TEST_SETTINGS['PERFORMANCE']['LOAD_TEST_DURATION'] = 60
