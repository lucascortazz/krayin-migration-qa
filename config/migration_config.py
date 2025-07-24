"""
Migration configuration settings for Krayin CRM Laravel to Django migration
"""
import os
from typing import Dict, Any

class MigrationConfig:
    """Configuration class for migration settings"""
    
    # Database configurations
    LARAVEL_DB = {
        'host': os.getenv('LARAVEL_DB_HOST', 'localhost'),
        'port': int(os.getenv('LARAVEL_DB_PORT', 3306)),
        'name': os.getenv('LARAVEL_DB_NAME', 'krayin_laravel'),
        'user': os.getenv('LARAVEL_DB_USER', 'root'),
        'password': os.getenv('LARAVEL_DB_PASSWORD', 'password'),
        'charset': 'utf8mb4'
    }
    
    DJANGO_DB = {
        'host': os.getenv('DJANGO_DB_HOST', 'localhost'),
        'port': int(os.getenv('DJANGO_DB_PORT', 5432)),
        'name': os.getenv('DJANGO_DB_NAME', 'krayin_django'),
        'user': os.getenv('DJANGO_DB_USER', 'postgres'),
        'password': os.getenv('DJANGO_DB_PASSWORD', 'password')
    }
    
    # Application URLs
    LARAVEL_APP_URL = os.getenv('LARAVEL_APP_URL', 'http://localhost:8000')
    DJANGO_APP_URL = os.getenv('DJANGO_APP_URL', 'http://localhost:8001')
    
    # Migration phases
    MIGRATION_PHASES = [
        'authentication',
        'user_management',
        'lead_management',
        'contact_management',
        'deal_management',
        'activity_management',
        'email_templates',
        'reports',
        'settings',
        'api_endpoints'
    ]
    
    # Components to track
    COMPONENTS_TO_TRACK = {
        'frontend': [
            'login_page',
            'dashboard',
            'leads_list',
            'leads_form',
            'contacts_list',
            'contacts_form',
            'deals_list',
            'deals_form',
            'activities',
            'reports',
            'settings'
        ],
        'backend': [
            'authentication_api',
            'leads_api',
            'contacts_api',
            'deals_api',
            'activities_api',
            'users_api',
            'reports_api',
            'settings_api'
        ],
        'database': [
            'users_table',
            'leads_table',
            'contacts_table',
            'deals_table',
            'activities_table',
            'email_templates_table'
        ]
    }
    
    # Test configuration
    TEST_CONFIG = {
        'selenium_grid_url': os.getenv('SELENIUM_GRID_URL', 'http://localhost:4444/wd/hub'),
        'implicit_wait': int(os.getenv('SELENIUM_IMPLICIT_WAIT', 10)),
        'explicit_wait': int(os.getenv('SELENIUM_EXPLICIT_WAIT', 30)),
        'screenshot_path': 'reports/screenshots',
        'test_data_path': 'config/test-data'
    }
    
    # Notification settings
    NOTIFICATIONS = {
        'slack_webhook': os.getenv('SLACK_WEBHOOK_URL'),
        'discord_webhook': os.getenv('DISCORD_WEBHOOK_URL'),
        'email_config': {
            'smtp_host': os.getenv('SMTP_HOST', 'smtp.gmail.com'),
            'smtp_port': int(os.getenv('SMTP_PORT', 587)),
            'username': os.getenv('SMTP_USER'),
            'password': os.getenv('SMTP_PASSWORD')
        }
    }
