#!/bin/bash

# This script refreshes the Sonar news digest and starts the development server

# Load environment variables from .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  PORT=${PORT:-3003} # Default to 3003 if not set
else
  PORT=3003
fi

# Set the terminal title
echo -e "\033]0;Run with Real News\007"

# Print banner
echo "====================================================="
echo "  RUN WITH REAL SONAR NEWS"
echo "====================================================="
echo "This script will:"
echo "1. Refresh the Sonar news digest with real news from Perplexity API"
echo "2. Start the development server on port $PORT"
echo "3. Open the cache clearing page"
echo "====================================================="
echo ""

# Refresh the real news digests
echo "Refreshing Sonar news digest..."
PORT=$PORT node scripts/fetch-real-sonar-news.js

# Start the development server in the background
echo "Starting development server..."
PORT=$PORT npm run dev &

# Wait for the server to start
echo "Waiting for the server to start..."
sleep 10

# Open the cache clearing page
echo "Opening cache clearing page..."
open http://localhost:$PORT/clear-sonar-cache.html

# Wait for user to clear the cache
echo ""
echo "Please use the Sonar tab on the page that opened to clear the Sonar cache."
echo "Then click the button to reload the digest page with the latest real news content."
echo ""
echo "Press Ctrl+C to stop the server when you're done."
echo "====================================================="

# Wait for the user to stop the script
wait
