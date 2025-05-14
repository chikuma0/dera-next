#!/bin/bash

# This script runs the enhanced sonar digest generator and starts the development server

# Make the script executable
chmod +x scripts/enhanced-sonar-digest.js

# Run the enhanced sonar digest generator
echo "Running enhanced sonar digest generator..."
node scripts/enhanced-sonar-digest.js

# Start the development server
echo "Starting development server..."
npm run dev