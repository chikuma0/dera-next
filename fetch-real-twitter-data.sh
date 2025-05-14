#!/bin/bash

# This script fetches real Twitter data from the Twitter API

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found"
  echo "Please create a .env file with your Twitter API key"
  exit 1
fi

# Check if Twitter API key is set
if ! grep -q "TWITTER_API_KEY" .env; then
  echo "Error: TWITTER_API_KEY not found in .env file"
  echo "Please add your Twitter API key to the .env file"
  exit 1
fi

# Run the script to fetch real Twitter data
echo "Fetching real Twitter data..."
node scripts/fetch-real-twitter-data.js

# Start the application
echo "Starting the application with real Twitter data..."
npm run dev