#!/bin/bash

# This script removes placeholder data and fetches real news data using the Perplexity API

# Set port
export PORT=3003

# Print banner
echo "====================================================="
echo "  FETCH REAL NEWS WITH PERPLEXITY API"
echo "====================================================="
echo "This script will:"
echo "1. Remove placeholder data files"
echo "2. Use your Perplexity API key to fetch real news"
echo "3. Open the Sonar digest page with nocache parameter"
echo "====================================================="
echo ""

# Backup existing data
echo "Creating backup of existing data..."
mkdir -p public/data/backup
if [ -f public/data/sonar-digest.json ]; then
  cp public/data/sonar-digest.json public/data/backup/sonar-digest.json.bak
fi

# Delete placeholder data
echo "Removing placeholder data..."
rm -f public/data/sonar-digest.json
rm -f public/data/sonar-digest-last-update.json

# Check for Perplexity API key
if ! grep -q "PERPLEXITY_API_KEY" .env.local; then
  echo "Error: No PERPLEXITY_API_KEY found in .env.local"
  echo "Please add your Perplexity API key to .env.local"
  exit 1
fi

# Update timestamp file
echo "Creating new timestamp file..."
echo "{\"lastUpdated\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" > public/data/sonar-digest-last-update.json

# Check if server is already running
if nc -z localhost $PORT 2>/dev/null; then
  echo "Server already running on port $PORT. Using existing server."
  SERVER_RUNNING=true
else
  # Start the server in the background
  echo "Starting Next.js server on port $PORT..."
  npm run dev &
  SERVER_PID=$!
  SERVER_RUNNING=false
  
  # Wait for server to start
  echo "Waiting for server to start (10 seconds)..."
  sleep 10
fi

# Use the Perplexity API to get real news
echo "Fetching real news from Perplexity API..."
curl -s "http://localhost:$PORT/api/news/sonar-digest?nocache=true" > /dev/null
echo "API request sent to fetch fresh data."

# Wait a bit for the API request to complete
echo "Waiting for API request to complete (5 seconds)..."
sleep 5

# Open the Sonar digest in browser with nocache parameter
echo "Opening Sonar digest in browser with nocache parameter..."
open "http://localhost:$PORT/news/sonar-digest?nocache=true"

# Instructions for user
echo ""
echo "The Sonar digest page should be loading in your browser."
echo "If you don't see real news data, try refreshing the page."
echo ""
echo "Real news data will be saved to public/data/sonar-digest.json"
echo ""

if [ "$SERVER_RUNNING" = false ]; then
  echo "Press Ctrl+C to stop the server when done."
  echo "====================================================="
  
  # Keep script running until user stops it
  trap "kill $SERVER_PID; exit" INT TERM
  wait $SERVER_PID
else
  echo "Using existing server. This script will now exit."
  echo "====================================================="
fi 