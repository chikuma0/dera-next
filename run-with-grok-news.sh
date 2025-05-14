#!/bin/bash

# This script refreshes the Sonar Digest with real news data from Grok API
# and starts the development server with real data.

# Set the terminal title
echo -e "\033]0;Sonar Digest with Grok News\007"

# Print banner
echo "====================================================="
echo "  SONAR DIGEST WITH GROK NEWS"
echo "====================================================="
echo "This script will:"
echo "1. Use Grok API to fetch real news and Twitter data"
echo "2. Generate a new Sonar Digest with real news"
echo "3. Start the development server with real data"
echo "====================================================="
echo ""

# Make the script executable if it's not already
chmod +x scripts/refresh-sonar-with-grok-data.js

# Run the refresh script
echo "Step 1: Refreshing Sonar Digest with Grok news data..."
node scripts/refresh-sonar-with-grok-data.js

# Update the timestamp file
echo "Step 2: Updating timestamp file..."
node scripts/update-sonar-digest-timestamp.js

# Check if the refresh was successful
if [ $? -eq 0 ]; then
  echo "✅ Sonar Digest refresh completed successfully"
else
  echo "⚠️ Sonar Digest refresh completed with warnings"
fi

echo ""
echo "Step 2: Starting development server with real data..."
echo "The server will be available at http://localhost:3003"
echo "To view the Sonar Digest with real news, go to:"
echo "http://localhost:3003/news/sonar-digest"
echo ""
echo "Press Ctrl+C to stop the server"
echo "====================================================="

# Start the development server
npm run dev