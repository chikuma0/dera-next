# Weekly Digest Scheduler

This document explains how to set up and use the weekly digest scheduler for automatically updating the Sonar and Grok digests.

## Overview

The weekly digest scheduler is designed to automatically update both the Sonar digest and Grok digest on a weekly basis. By default, it's configured to run every Monday at 9:00 AM.

This scheduler uses the Grok API instead of the Twitter API for fetching social media data, which helps avoid rate limits that are common with the Twitter API.

## Requirements

The weekly digest scheduler requires several environment variables to be set up correctly:

1. **API Keys**:
   - Perplexity API Key: Required for the Sonar digest
   - Grok API Key: Required for fetching social media data

2. **Database Configuration**:
   - Supabase URL
   - Supabase Anon Key
   - Supabase Service Role Key

3. **Other Configuration**:
   - Next.js Base URL
   - Feature Flags

### Environment Setup

To set up the environment variables:

1. Copy the `.env.template` file to `.env.local`:
   ```bash
   cp .env.template .env.local
   ```

2. Run the environment setup script:
   ```bash
   node scripts/setup-env-keys.js
   ```

3. Follow the prompts to enter your API keys and other configuration values.

## Files

- `scripts/schedule-weekly-digest-updates.js` - The main scheduler script
- `scripts/fetch-grok-social-data.js` - Script to fetch social media data using the Grok API
- `start-weekly-digest-scheduler.sh` - Shell script to start the scheduler in the background
- `digest-scheduler-crontab.example` - Example crontab entry for setting up a cron job

## Running Options

There are three ways to run the scheduler:

### 1. Run Immediately (One-time)

To run the digest updates immediately without scheduling:

```bash
node scripts/schedule-weekly-digest-updates.js --run-now
```

This will update both the Sonar and Grok digests immediately and then schedule the next update for the following Monday at 9:00 AM.

### 2. Run as a Long-running Process

To start the scheduler as a long-running process:

```bash
./start-weekly-digest-scheduler.sh
```

This will start the scheduler in the background, redirect output to `logs/digest-scheduler.log`, and keep it running until the server is restarted or the process is manually stopped.

To stop the scheduler:

```bash
# Find the process ID
ps aux | grep schedule-weekly-digest-updates

# Kill the process
kill <PID>
```

### 3. Run as a Cron Job

To set up the scheduler as a cron job:

1. Edit your crontab:

```bash
crontab -e
```

2. Add the following line (adjust the path to match your installation):

```
0 9 * * 1 cd /path/to/dera-next && /usr/bin/node scripts/schedule-weekly-digest-updates.js --run-once >> logs/digest-scheduler.log 2>&1
```

This will run the scheduler every Monday at 9:00 AM.

## Logs

Logs are stored in the `logs/digest-scheduler.log` file. You can view the logs with:

```bash
tail -f logs/digest-scheduler.log
```

## Timestamp Files

The scheduler updates the following timestamp files:

- `public/data/sonar-digest-last-update.json` - Last update timestamp for the Sonar digest
- `public/data/grok-digest-last-update.json` - Last update timestamp for the Grok digest

These files are used by the frontend to display the last update time and to determine when to fetch new data.

## Customizing the Schedule

To change the schedule, edit the `getMillisecondsUntilNextMonday` function in `scripts/schedule-weekly-digest-updates.js`. You can modify it to run on a different day or time.