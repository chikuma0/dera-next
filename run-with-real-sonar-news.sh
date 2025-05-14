#!/bin/bash

# This script fetches real news for the Sonar digest and starts the development server.

# Set the terminal title
echo -e "\033]0;Sonar Digest with Real News\007"

# Print banner
echo "====================================================="
echo "  SONAR DIGEST WITH REAL NEWS"
echo "====================================================="
echo "This script will:"
echo "1. Fetch real news from Perplexity's Sonar API"
echo "2. Update the Sonar digest with real news content"
echo "3. Start the development server"
echo "====================================================="
echo ""

# Make the script executable if it's not already
chmod +x scripts/fetch-real-sonar-news.js

# Run the fetch real news script
echo "Step 1: Fetching real news for Sonar digest..."
node scripts/fetch-real-sonar-news.js

# Check if the script was successful
if [ $? -eq 0 ]; then
  echo "✅ Real news fetched successfully for Sonar digest"
else
  echo "⚠️ There were issues fetching real news for Sonar digest"
fi

echo ""
echo "Step 2: Starting development server..."
echo "The server will be available at http://localhost:3004"
echo "To view the Sonar Digest with real news, go to:"
echo "http://localhost:3004/news/sonar-digest"
echo ""
echo "Press Ctrl+C to stop the server"
echo "====================================================="

# Start the development server
npm run dev
