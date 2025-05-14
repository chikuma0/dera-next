#!/bin/bash

# This script clears the Sonar digest cache and opens the clear cache page

# Set the terminal title
echo -e "\033]0;Clear Sonar Cache\007"

# Print banner
echo "====================================================="
echo "  CLEAR SONAR CACHE"
echo "====================================================="
echo "This script will:"
echo "1. Start the development server"
echo "2. Open the clear cache page"
echo "3. Regenerate the Sonar digest with real news"
echo "====================================================="
echo ""

# Start the development server in the background
echo "Starting development server..."
npm run dev &

# Wait for the server to start
echo "Waiting for the server to start..."
sleep 10

# Open the clear cache page
echo "Opening clear cache page..."
open http://localhost:3004/clear-sonar-cache.html

# Wait for user to clear the cache
echo ""
echo "Please click the 'Clear Cache' button on the page that opened."
echo "Then click 'View Sonar Digest' to see the updated digest."
echo ""
echo "Press Ctrl+C to stop the server when you're done."
echo "====================================================="

# Wait for the user to stop the script
wait
