"""
Test configuration and fixtures for pytest
"""
import pytest
import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from config.test_settings import TEST_SETTINGS
from config.migration_config import MigrationConfig
from tests.base_migration_test import BaseMigrationTest

@pytest.fixture(scope="session")
def test_config():
    """Provide test configuration for all tests"""
    return TEST_SETTINGS

@pytest.fixture(scope="session")
def migration_config():
    """Provide migration configuration for all tests"""
    return MigrationConfig()

@pytest.fixture(scope="function")
def base_test():
    """Provide base test instance with setup and teardown"""
    test_instance = BaseMigrationTest()
    test_instance.setup_method(None)
    yield test_instance
    test_instance.teardown_method(None)

@pytest.fixture(scope="function")
def authenticated_laravel_session(base_test):
    """Provide authenticated Laravel session"""
    base_test.login_laravel()
    yield base_test

@pytest.fixture(scope="function")
def authenticated_django_session(base_test):
    """Provide authenticated Django session"""
    base_test.login_django()
    yield base_test

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Setup test environment before running tests"""
    # Create reports directory
    reports_dir = Path("reports/test-results")
    reports_dir.mkdir(parents=True, exist_ok=True)
    
    # Create screenshots directory
    screenshots_dir = reports_dir / "screenshots"
    screenshots_dir.mkdir(exist_ok=True)
    
    yield
    
    # Cleanup after all tests
    print("Test environment cleanup completed")

def pytest_configure(config):
    """Configure pytest with custom markers"""
    config.addinivalue_line(
        "markers", "security: marks tests as security tests"
    )
    config.addinivalue_line(
        "markers", "performance: marks tests as performance tests"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "migration: marks tests as migration validation tests"
    )
    config.addinivalue_line(
        "markers", "api: marks tests as API tests"
    )
    config.addinivalue_line(
        "markers", "behavioral: marks tests as behavioral parity tests"
    )

def pytest_runtest_makereport(item, call):
    """Hook to capture test results for screenshot taking"""
    if call.when == "call":
        if call.excinfo is not None:
            # Test failed, mark for screenshot
            if hasattr(item, "funcargs"):
                for fixture_name, fixture_value in item.funcargs.items():
                    if hasattr(fixture_value, '_test_failed'):
                        fixture_value._test_failed = True

@pytest.fixture(scope="function")
def performance_threshold():
    """Provide performance thresholds for testing"""
    return {
        'page_load_time': TEST_SETTINGS['PERFORMANCE']['MAX_PAGE_LOAD_TIME'],
        'api_response_time': TEST_SETTINGS['PERFORMANCE']['MAX_API_RESPONSE_TIME'],
        'database_query_time': TEST_SETTINGS['PERFORMANCE']['MAX_DATABASE_QUERY_TIME']
    }

@pytest.fixture(scope="function")
def test_data():
    """Provide test data for tests"""
    from config.test_settings import TEST_DATA
    return TEST_DATA

# Parallel execution configuration
def pytest_configure_node(node):
    """Configure node for parallel execution"""
    if hasattr(node.config.option, 'dist') and node.config.option.dist == 'each':
        # Configure for parallel execution
        node.slaveinput['selenium_grid'] = True

# Custom assertion helpers
class MigrationAssertions:
    """Custom assertions for migration testing"""
    
    @staticmethod
    def assert_page_parity(laravel_elements, django_elements, tolerance=0.95):
        """Assert that pages have sufficient parity"""
        total_elements = len(laravel_elements)
        matching_elements = sum(
            1 for key in laravel_elements 
            if laravel_elements.get(key) == django_elements.get(key)
        )
        
        parity_ratio = matching_elements / total_elements if total_elements > 0 else 0
        
        assert parity_ratio >= tolerance, (
            f"Page parity below threshold: {parity_ratio:.2%} < {tolerance:.2%}\n"
            f"Matching elements: {matching_elements}/{total_elements}\n"
            f"Laravel elements: {laravel_elements}\n"
            f"Django elements: {django_elements}"
        )
    
    @staticmethod
    def assert_api_parity(laravel_response, django_response):
        """Assert that API responses have parity"""
        assert laravel_response.status_code == django_response.status_code, (
            f"Status codes don't match: Laravel {laravel_response.status_code} "
            f"vs Django {django_response.status_code}"
        )
        
        # Compare response structure (keys)
        if laravel_response.headers.get('content-type', '').startswith('application/json'):
            laravel_data = laravel_response.json()
            django_data = django_response.json()
            
            assert set(laravel_data.keys()) == set(django_data.keys()), (
                f"Response structure mismatch:\n"
                f"Laravel keys: {set(laravel_data.keys())}\n"
                f"Django keys: {set(django_data.keys())}"
            )

@pytest.fixture
def migration_assertions():
    """Provide migration-specific assertions"""
    return MigrationAssertions()
