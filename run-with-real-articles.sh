#!/bin/bash

# This script runs the real articles sonar digest generator and starts the development server

# Make the script executable
chmod +x scripts/real-articles-sonar-digest.js

# Run the real articles sonar digest generator
echo "Running real articles sonar digest generator..."
node scripts/real-articles-sonar-digest.js

# Start the development server
echo "Starting development server..."
npm run dev