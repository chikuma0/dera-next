#!/bin/bash

# This script starts the development server and opens the clear cache page.

# Set the terminal title
echo -e "\033]0;Digest Cache Cleaner\007"

# Print banner
echo "====================================================="
echo "  DIGEST CACHE CLEANER"
echo "====================================================="
echo "This script will:"
echo "1. Update the timestamp file"
echo "2. Start the development server"
echo "3. Open the clear cache page"
echo "====================================================="
echo ""

# Update the timestamp file
echo "Step 1: Updating timestamp file..."
node scripts/update-sonar-digest-timestamp.js

# Check if the update was successful
if [ $? -eq 0 ]; then
  echo "✅ Timestamp file updated successfully"
else
  echo "⚠️ There were issues updating the timestamp file"
fi

echo ""
echo "Step 2: Starting development server..."
echo "The server will be available at http://localhost:3003"
echo ""

# Start the development server in the background
npm run dev &

# Wait for the server to start
echo "Waiting for the server to start..."
sleep 5

# Open the clear cache page
echo "Step 3: Opening clear cache page..."
open http://localhost:3003/clear-digest-cache.html

echo ""
echo "The clear cache page has been opened in your browser."
echo "Use this page to clear the cache for both Sonar and Grok digests."
echo ""
echo "Press Ctrl+C to stop the server when you're done."
echo "====================================================="

# Wait for the user to stop the script
wait