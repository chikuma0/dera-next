#!/bin/bash

# Exit on error
set -e

echo "Setting up news system..."

# Create tables
echo "Creating database tables..."
psql "$DATABASE_URL" -f setup_news_tables.sql

# Install dependencies if needed
echo "Installing dependencies..."
npm install

# Build TypeScript files
echo "Building TypeScript files..."
npm run build

# Import initial data
echo "Importing initial news data..."
node dist/scripts/import_initial_news.js

echo "News system setup completed successfully!" 