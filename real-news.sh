#!/bin/bash

# A simplified script to run the Next.js server with real news

# Set port
PORT=3003

# Print banner
echo "====================================================="
echo "  REAL NEWS FETCH AND RUN"
echo "====================================================="
echo "This script will:"
echo "1. Start the Next.js server on port $PORT"
echo "2. Open the Sonar digest page in your browser"
echo "====================================================="
echo ""

# Start the server in the background
echo "Starting Next.js server on port $PORT..."
PORT=$PORT npm run dev &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start (10 seconds)..."
sleep 10

# Open the Sonar digest in browser
echo "Opening Sonar digest in browser..."
open http://localhost:$PORT/news/sonar-digest

# Instructions for user
echo ""
echo "To see real news in the Sonar digest:"
echo "1. The page should be loading in your browser"
echo "2. Click on the refresh button or add ?nocache=true to the URL"
echo "3. The digest will fetch real news from Perplexity API"
echo ""
echo "Press Ctrl+C to stop the server when done."
echo "====================================================="

# Keep script running until user stops it
trap "kill $SERVER_PID; exit" INT TERM
wait $SERVER_PID 