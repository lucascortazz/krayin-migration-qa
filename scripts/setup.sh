#!/bin/bash

# Krayin Migration QA Setup Script
# This script sets up the development environment for migration testing

set -e  # Exit on any error

echo "🚀 Setting up Krayin Migration QA Environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed. Please install Docker."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install Node.js dependencies
echo "📥 Installing Node.js dependencies..."
npm install

# Copy environment configuration
if [ ! -f ".env" ]; then
    echo "⚙️ Setting up environment configuration..."
    cp .env.example .env
    echo "📝 Please update .env file with your configuration settings"
fi

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p reports/{test-results,migration-progress,performance-comparison,security-analysis}
mkdir -p reports/test-results/screenshots
mkdir -p logs
mkdir -p temp

# Set up git hooks (if .git exists)
if [ -d ".git" ]; then
    echo "🔗 Setting up git hooks..."
    cp scripts/git-hooks/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
fi

# Check Docker services
echo "🐳 Checking Docker services..."
if docker-compose ps | grep -q "Up"; then
    echo "📋 Docker services are already running"
else
    echo "🔄 Starting Docker services..."
    docker-compose up -d
    echo "⏳ Waiting for services to be ready..."
    sleep 15
fi

# Test database connections
echo "🔍 Testing database connections..."
python3 -c "
from config.database_config import db_config
print('Testing Laravel database connection...', end=' ')
if db_config.test_laravel_connection():
    print('✅ Success')
else:
    print('❌ Failed')

print('Testing Django database connection...', end=' ')
if db_config.test_django_connection():
    print('✅ Success')
else:
    print('❌ Failed')
"

# Run a quick test to verify setup
echo "🧪 Running setup verification tests..."
python3 -m pytest tests/conftest.py -v --tb=short

# Build frontend assets
echo "🔨 Building frontend assets..."
npm run build

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Update .env file with your configuration"
echo "   2. Run 'make test' to verify everything works"
echo "   3. Run 'make tracker' to start the migration tracker"
echo "   4. Open http://localhost:8080 to view the migration dashboard"
echo ""
echo "🔗 Useful commands:"
echo "   make test              - Run all tests"
echo "   make test-security     - Run security tests"
echo "   make test-performance  - Run performance tests"
echo "   make tracker          - Start migration tracker"
echo "   make reports          - Generate migration reports"
echo ""

# Deactivate virtual environment
deactivate
