#!/bin/bash

# This script runs the entire process with real data:
# 1. Sets up the required API keys
# 2. Starts the Next.js server
# 3. Fetches real data from the Grok API
# 4. Runs the social impact scoring with real data
# 5. Displays the results

# Set up colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== RUNNING WITH REAL DATA ===${NC}"
echo "This script will run the entire process with real data."
echo "It will set up the required API keys, start the Next.js server,"
echo "fetch real data from the xAI Grok API, and run the social impact scoring."
echo "=======================================\n"

# Step 1: Check if API keys are set up
echo -e "${YELLOW}Step 1: Checking if API keys are set up...${NC}"

if [ ! -f .env.local ] || ! grep -q "XAI_API_KEY" .env.local || ! grep -q "PERPLEXITY_API_KEY" .env.local; then
  echo -e "${YELLOW}API keys not found. Setting up API keys...${NC}"
  node scripts/setup-api-keys.js
else
  echo -e "${GREEN}✅ API keys are already set up${NC}"
fi

# Step 2: Check if Next.js server is running
echo -e "\n${YELLOW}Step 2: Checking if Next.js server is running...${NC}"

if ! curl -s http://localhost:3001 > /dev/null; then
  echo -e "${YELLOW}Next.js server is not running. Starting server...${NC}"
  echo -e "${YELLOW}Starting Next.js server in a new terminal window...${NC}"
  
  # Check the operating system
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'\" && npm run dev -- -p 3001"'
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v gnome-terminal &> /dev/null; then
      gnome-terminal -- bash -c "cd \"$PWD\" && npm run dev -- -p 3001; exec bash"
    elif command -v xterm &> /dev/null; then
      xterm -e "cd \"$PWD\" && npm run dev -- -p 3001; exec bash" &
    else
      echo -e "${RED}❌ Could not find a suitable terminal emulator${NC}"
      echo "Please start the Next.js server manually with:"
      echo "npm run dev -- -p 3001"
      exit 1
    fi
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start cmd /k "cd /d \"$PWD\" && npm run dev -- -p 3001"
  else
    echo -e "${RED}❌ Unsupported operating system${NC}"
    echo "Please start the Next.js server manually with:"
    echo "npm run dev -- -p 3001"
    exit 1
  fi
  
  echo -e "${YELLOW}Waiting for Next.js server to start...${NC}"
  sleep 10
  
  # Check if server is running
  if ! curl -s http://localhost:3001 > /dev/null; then
    echo -e "${RED}❌ Next.js server failed to start${NC}"
    echo "Please start the Next.js server manually with:"
    echo "npm run dev -- -p 3001"
    exit 1
  fi
else
  echo -e "${GREEN}✅ Next.js server is already running on port 3001${NC}"
fi

# Step 3: Fetch real data from the Grok API
echo -e "\n${YELLOW}Step 3: Fetching real data from the xAI Grok API...${NC}"
echo -e "${YELLOW}Running refresh-sonar-with-grok-data.js...${NC}"

node scripts/refresh-sonar-with-grok-data.js

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to fetch real data from the xAI Grok API${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Successfully fetched real data from the xAI Grok API${NC}"

# Step 4: Run the social impact scoring
echo -e "\n${YELLOW}Step 4: Running social impact scoring...${NC}"
echo -e "${YELLOW}Running integrated-social-impact-scoring.js...${NC}"

node scripts/integrated-social-impact-scoring.js

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to run social impact scoring${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Successfully ran social impact scoring${NC}"

# Step 5: Display the results
echo -e "\n${YELLOW}Step 5: Displaying the results...${NC}"
echo -e "${GREEN}✅ The social impact scoring and citation fixing system is now using real data${NC}"
echo -e "${GREEN}✅ The Twitter-enhanced Sonar digest is available at:${NC}"
echo -e "${GREEN}   public/data/sonar-digest-twitter-enhanced.json${NC}"

echo -e "\n${GREEN}=== REAL DATA PROCESS COMPLETE ===${NC}"
echo "You can now view the Sonar Digest with real data at:"
echo "http://localhost:3001/news/sonar-digest"
echo "=======================================\n"