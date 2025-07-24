"""
Database configuration and connection management for migration testing
"""
import os
import mysql.connector
import psycopg2
from contextlib import contextmanager
from typing import Dict, Any, Generator

class DatabaseConfig:
    """Database configuration and connection manager"""
    
    def __init__(self):
        self.laravel_config = {
            'host': os.getenv('LARAVEL_DB_HOST', 'localhost'),
            'port': int(os.getenv('LARAVEL_DB_PORT', 3306)),
            'database': os.getenv('LARAVEL_DB_NAME', 'krayin_laravel'),
            'user': os.getenv('LARAVEL_DB_USER', 'root'),
            'password': os.getenv('LARAVEL_DB_PASSWORD', 'password'),
            'charset': 'utf8mb4',
            'autocommit': True
        }
        
        self.django_config = {
            'host': os.getenv('DJANGO_DB_HOST', 'localhost'),
            'port': int(os.getenv('DJANGO_DB_PORT', 5432)),
            'database': os.getenv('DJANGO_DB_NAME', 'krayin_django'),
            'user': os.getenv('DJANGO_DB_USER', 'postgres'),
            'password': os.getenv('DJANGO_DB_PASSWORD', 'password')
        }
    
    @contextmanager
    def laravel_connection(self) -> Generator[mysql.connector.MySQLConnection, None, None]:
        """Context manager for Laravel MySQL connection"""
        connection = None
        try:
            connection = mysql.connector.connect(**self.laravel_config)
            yield connection
        except mysql.connector.Error as e:
            print(f"Laravel database connection error: {e}")
            raise
        finally:
            if connection and connection.is_connected():
                connection.close()
    
    @contextmanager
    def django_connection(self) -> Generator[psycopg2.extensions.connection, None, None]:
        """Context manager for Django PostgreSQL connection"""
        connection = None
        try:
            connection = psycopg2.connect(**self.django_config)
            yield connection
        except psycopg2.Error as e:
            print(f"Django database connection error: {e}")
            raise
        finally:
            if connection:
                connection.close()
    
    def test_laravel_connection(self) -> bool:
        """Test Laravel database connectivity"""
        try:
            with self.laravel_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                return cursor.fetchone()[0] == 1
        except Exception as e:
            print(f"Laravel connection test failed: {e}")
            return False
    
    def test_django_connection(self) -> bool:
        """Test Django database connectivity"""
        try:
            with self.django_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                return cursor.fetchone()[0] == 1
        except Exception as e:
            print(f"Django connection test failed: {e}")
            return False
    
    def get_laravel_table_info(self, table_name: str) -> Dict[str, Any]:
        """Get table information from Laravel database"""
        with self.laravel_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(f"DESCRIBE {table_name}")
            return cursor.fetchall()
    
    def get_django_table_info(self, table_name: str) -> Dict[str, Any]:
        """Get table information from Django database"""
        with self.django_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = %s
                ORDER BY ordinal_position
            """, (table_name,))
            columns = cursor.fetchall()
            return [
                {
                    'column_name': col[0],
                    'data_type': col[1],
                    'is_nullable': col[2],
                    'column_default': col[3]
                }
                for col in columns
            ]
    
    def compare_table_structures(self, table_name: str) -> Dict[str, Any]:
        """Compare table structures between Laravel and Django"""
        try:
            laravel_info = self.get_laravel_table_info(table_name)
            django_info = self.get_django_table_info(table_name)
            
            return {
                'laravel': laravel_info,
                'django': django_info,
                'comparison': {
                    'column_count_match': len(laravel_info) == len(django_info),
                    'laravel_columns': len(laravel_info),
                    'django_columns': len(django_info)
                }
            }
        except Exception as e:
            return {
                'error': str(e),
                'laravel': None,
                'django': None,
                'comparison': None
            }

# Global database instance
db_config = DatabaseConfig()
