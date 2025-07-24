.PHONY: help install test clean setup-env start-services stop-services tracker reports

# Default target
help:
	@echo "Available commands:"
	@echo "  install        - Install all dependencies"
	@echo "  test          - Run all tests"
	@echo "  test-security - Run security tests only"
	@echo "  test-performance - Run performance tests only"
	@echo "  test-integration - Run integration tests only"
	@echo "  setup-env     - Set up environment configuration"
	@echo "  start-services - Start Docker services"
	@echo "  stop-services - Stop Docker services"
	@echo "  tracker       - Start migration tracker"
	@echo "  reports       - Generate migration reports"
	@echo "  clean         - Clean up temporary files"

# Install dependencies
install:
	pip install -r requirements.txt
	npm install
	@echo "Dependencies installed successfully"

# Set up environment
setup-env:
	cp .env.example .env
	@echo "Environment configuration created. Please update .env with your settings."

# Start Docker services
start-services:
	docker-compose up -d
	@echo "Services started. Waiting for containers to be ready..."
	sleep 10

# Stop Docker services
stop-services:
	docker-compose down

# Run all tests
test:
	python -m pytest tests/ -v --cov=. --cov-report=html --cov-report=term
	npm test

# Run security tests
test-security:
	python -m pytest tests/security/ -v --html=reports/test-results/security_tests.html

# Run performance tests
test-performance:
	python -m pytest tests/performance/ -v --html=reports/test-results/performance_tests.html

# Run integration tests
test-integration:
	python -m pytest tests/integration/ -v --html=reports/test-results/integration_tests.html

# Run migration validation tests
test-migration:
	python -m pytest tests/migration-validation/ -v --html=reports/test-results/migration_tests.html

# Start migration tracker
tracker:
	cd migration-tracker && python backend/tracker_server.py

# Generate reports
reports:
	python scripts/validators/validate_migration.py
	@echo "Migration reports generated in reports/ directory"

# Clean up
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	rm -rf .pytest_cache/
	rm -rf htmlcov/
	rm -rf node_modules/.cache/
	@echo "Cleanup completed"

# Full setup for new environment
setup: setup-env install start-services
	@echo "Full setup completed. You can now run 'make test' to verify everything works."

# CI/CD pipeline
ci: install test reports
	@echo "CI pipeline completed"
