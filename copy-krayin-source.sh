#!/bin/bash

# Krayin Source Code Copy Script
# This script copies key Krayin files for analysis

echo "Starting Krayin source code copy..."

# Create directory structure
mkdir -p krayin-source/app/{Models,Controllers}
mkdir -p krayin-source/database/migrations
mkdir -p krayin-source/routes
mkdir -p krayin-source/resources/views
mkdir -p krayin-source/config

# Set source path
KRAYIN_PATH="/Users/lucascortazzo/code/krayin5"

echo "Copying Models..."
# Copy Models
find "$KRAYIN_PATH/packages/Webkul" -name "Models" -type d -exec cp -r {}/* krayin-source/app/Models/ \; 2>/dev/null

echo "Copying Controllers..."
# Copy Controllers  
find "$KRAYIN_PATH/packages/Webkul" -path "*/Http/Controllers/*" -name "*.php" -exec cp {} krayin-source/app/Controllers/ \; 2>/dev/null

echo "Copying Database Migrations..."
# Copy Migrations
find "$KRAYIN_PATH/packages/Webkul" -path "*/Database/Migrations/*" -name "*.php" -exec cp {} krayin-source/database/migrations/ \; 2>/dev/null

echo "Copying Routes..."
# Copy Routes
find "$KRAYIN_PATH/packages/Webkul" -name "routes.php" -exec cp {} krayin-source/routes/ \; 2>/dev/null
find "$KRAYIN_PATH" -maxdepth 2 -name "routes" -type d -exec cp -r {}/* krayin-source/routes/ \; 2>/dev/null

echo "Copying Views..."
# Copy Views
find "$KRAYIN_PATH/packages/Webkul" -path "*/Resources/views/*" -name "*.blade.php" -exec cp {} krayin-source/resources/views/ \; 2>/dev/null

echo "Copying Config files..."
# Copy Config
cp -r "$KRAYIN_PATH/config"/* krayin-source/config/ 2>/dev/null

echo "Copy completed! Files are now available in krayin-source/ directory"
echo "Total files copied:"
find krayin-source -type f | wc -l

echo "File breakdown:"
echo "Models: $(find krayin-source/app/Models -name "*.php" | wc -l)"
echo "Controllers: $(find krayin-source/app/Controllers -name "*.php" | wc -l)"
echo "Migrations: $(find krayin-source/database/migrations -name "*.php" | wc -l)"
echo "Routes: $(find krayin-source/routes -name "*.php" | wc -l)"
echo "Views: $(find krayin-source/resources/views -name "*.blade.php" | wc -l)"
echo "Config: $(find krayin-source/config -name "*.php" | wc -l)"
