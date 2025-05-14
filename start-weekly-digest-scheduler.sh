#!/bin/bash

# This script starts the weekly digest scheduler in the background
# and redirects output to a log file.

# Set the terminal title
echo -e "\033]0;Weekly Digest Scheduler\007"

# Print banner
echo "====================================================="
echo "  WEEKLY DIGEST SCHEDULER"
echo "====================================================="
echo "This script will start the weekly digest scheduler"
echo "in the background and redirect output to a log file."
echo "====================================================="
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the scheduler in the background
echo "Starting weekly digest scheduler..."
nohup node scripts/schedule-weekly-digest-updates.js > logs/digest-scheduler.log 2>&1 &

# Get the process ID
PID=$!
echo "Scheduler started with PID: $PID"
echo "Log file: logs/digest-scheduler.log"
echo ""
echo "To stop the scheduler, run: kill $PID"
echo "To view the logs, run: tail -f logs/digest-scheduler.log"
echo "====================================================="