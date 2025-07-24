"""
Base test class for migration testing with common utilities and setup
"""
import os
import pytest
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from config.test_settings import TEST_SETTINGS, TEST_DATA
from config.migration_config import MigrationConfig

class BaseMigrationTest:
    """Base class for all migration tests"""
    
    def __init__(self):
        self.driver = None
        self.wait = None
        self.config = MigrationConfig()
        self.test_settings = TEST_SETTINGS
        self.test_data = TEST_DATA
        
    def setup_method(self, method):
        """Setup method called before each test"""
        self.driver = self._create_driver()
        self.wait = WebDriverWait(
            self.driver, 
            self.test_settings['SELENIUM']['EXPLICIT_WAIT']
        )
        self.driver.implicitly_wait(
            self.test_settings['SELENIUM']['IMPLICIT_WAIT']
        )
        self.driver.set_window_size(*self.test_settings['SELENIUM']['WINDOW_SIZE'])
        
    def teardown_method(self, method):
        """Cleanup method called after each test"""
        if self.driver:
            if hasattr(self, '_test_failed') and self._test_failed:
                self._take_screenshot(method.__name__)
            self.driver.quit()
    
    def _create_driver(self):
        """Create and configure WebDriver instance"""
        browser = self.test_settings['SELENIUM']['BROWSER'].lower()
        grid_url = self.test_settings['SELENIUM']['GRID_URL']
        headless = self.test_settings['SELENIUM']['HEADLESS']
        
        if browser == 'chrome':
            options = ChromeOptions()
            if headless:
                options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            
            if grid_url:
                return webdriver.Remote(
                    command_executor=grid_url,
                    options=options
                )
            else:
                return webdriver.Chrome(options=options)
                
        elif browser == 'firefox':
            options = FirefoxOptions()
            if headless:
                options.add_argument('--headless')
            
            if grid_url:
                return webdriver.Remote(
                    command_executor=grid_url,
                    options=options
                )
            else:
                return webdriver.Firefox(options=options)
        
        else:
            raise ValueError(f"Unsupported browser: {browser}")
    
    def _take_screenshot(self, test_name):
        """Take screenshot on test failure"""
        if self.test_settings['REPORTING']['SCREENSHOT_ON_FAILURE']:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{test_name}_{timestamp}.png"
            screenshot_dir = self.test_settings['REPORTING']['REPORT_PATH'] / 'screenshots'
            screenshot_dir.mkdir(parents=True, exist_ok=True)
            screenshot_path = screenshot_dir / filename
            self.driver.save_screenshot(str(screenshot_path))
            print(f"Screenshot saved: {screenshot_path}")
    
    def navigate_to_laravel(self, path=""):
        """Navigate to Laravel application"""
        url = f"{self.config.LARAVEL_APP_URL}{path}"
        self.driver.get(url)
        
    def navigate_to_django(self, path=""):
        """Navigate to Django application"""
        url = f"{self.config.DJANGO_APP_URL}{path}"
        self.driver.get(url)
    
    def login_laravel(self, email=None, password=None):
        """Login to Laravel application"""
        email = email or self.test_data['USERS']['admin']['email']
        password = password or self.test_data['USERS']['admin']['password']
        
        self.navigate_to_laravel('/login')
        self.driver.find_element(By.NAME, 'email').send_keys(email)
        self.driver.find_element(By.NAME, 'password').send_keys(password)
        self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()
        
    def login_django(self, email=None, password=None):
        """Login to Django application"""
        email = email or self.test_data['USERS']['admin']['email']
        password = password or self.test_data['USERS']['admin']['password']
        
        self.navigate_to_django('/login/')
        self.driver.find_element(By.NAME, 'email').send_keys(email)
        self.driver.find_element(By.NAME, 'password').send_keys(password)
        self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()
    
    def wait_for_element(self, locator, timeout=None):
        """Wait for element to be present and visible"""
        timeout = timeout or self.test_settings['SELENIUM']['EXPLICIT_WAIT']
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.visibility_of_element_located(locator))
    
    def wait_for_page_load(self):
        """Wait for page to load completely"""
        self.wait.until(
            lambda driver: driver.execute_script("return document.readyState") == "complete"
        )
    
    def compare_page_elements(self, laravel_path, django_path, elements_to_compare):
        """Compare specific elements between Laravel and Django pages"""
        # Navigate to Laravel page and capture elements
        self.navigate_to_laravel(laravel_path)
        self.wait_for_page_load()
        laravel_elements = {}
        
        for element_name, selector in elements_to_compare.items():
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, selector)
                laravel_elements[element_name] = element.text.strip()
            except Exception as e:
                laravel_elements[element_name] = f"ERROR: {str(e)}"
        
        # Navigate to Django page and capture elements
        self.navigate_to_django(django_path)
        self.wait_for_page_load()
        django_elements = {}
        
        for element_name, selector in elements_to_compare.items():
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, selector)
                django_elements[element_name] = element.text.strip()
            except Exception as e:
                django_elements[element_name] = f"ERROR: {str(e)}"
        
        return {
            'laravel': laravel_elements,
            'django': django_elements,
            'comparison': {
                element: laravel_elements[element] == django_elements[element]
                for element in elements_to_compare.keys()
            }
        }
    
    def measure_page_load_time(self, url):
        """Measure page load time"""
        start_time = time.time()
        self.driver.get(url)
        self.wait_for_page_load()
        end_time = time.time()
        return end_time - start_time
    
    def assert_parity(self, laravel_result, django_result, message=""):
        """Assert that Laravel and Django results are equivalent"""
        assert laravel_result == django_result, (
            f"Parity assertion failed: {message}\n"
            f"Laravel: {laravel_result}\n"
            f"Django: {django_result}"
        )
