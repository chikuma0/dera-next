#!/bin/bash

# This script runs the generate-real-sonar-digest.js script to create a sonar digest
# with real news and Twitter data, without relying on the Perplexity Sonar API to generate content.

# Make the script executable
chmod +x scripts/generate-real-sonar-digest.js

# Run the script
node scripts/generate-real-sonar-digest.js

# Start the development server
echo "Starting development server..."
npm run dev