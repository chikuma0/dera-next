#!/bin/bash

# This script runs the enhanced sonar digest generator with real sources and starts the development server

# Make the script executable
chmod +x scripts/enhanced-sonar-digest-real-sources.js

# Run the enhanced sonar digest generator with real sources
echo "Running enhanced sonar digest generator with real sources..."
node scripts/enhanced-sonar-digest-real-sources.js

# Start the development server
echo "Starting development server..."
npm run dev