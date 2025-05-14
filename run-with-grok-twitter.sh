#!/bin/bash

# This script makes the enhanced-refresh-sonar-with-grok-data.js executable and runs it
# It completely removes the Twitter API dependency by using Grok's DeepSearch capabilities

# Make the script executable
chmod +x scripts/enhanced-refresh-sonar-with-grok-data.js

# Run the script
node scripts/enhanced-refresh-sonar-with-grok-data.js

# Start the development server
echo "Starting development server..."
npm run dev