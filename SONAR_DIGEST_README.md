# Sonar Weekly Digest System

This document explains how the Sonar Weekly Digest system works and how to use it.

## Overview

The Sonar Weekly Digest is a feature that provides a weekly summary of the 5 most impactful AI news items. The digest is generated once a week and stored in the database, then served to users throughout the week.

## How It Works

1. **Weekly Generation**: The digest is generated once a week (e.g., every Monday) using the Perplexity Sonar API.
2. **Database Storage**: The generated digest is stored in the database.
3. **User Access**: Users access the latest digest from the database throughout the week.
4. **No On-the-Fly Generation**: The system never generates content on-the-fly when users access the page, ensuring consistent performance and content.

## Scripts

### 1. Generate Weekly Digest

To manually generate a new weekly digest:

```bash
node scripts/generate-weekly-sonar-digest.js
```

This script:
- Calls the Perplexity Sonar API to generate a new digest with 5 topics
- Stores the digest in the database
- Logs the generated topics

### 2. Schedule Weekly Generation

To set up automatic weekly generation, use the scheduling script with a cron job:

```bash
# Example cron entry (runs every Monday at 1:00 AM):
0 1 * * 1 /usr/bin/node /path/to/schedule-weekly-sonar-digest.js >> /path/to/logs/sonar-digest.log 2>&1
```

The scheduling script:
- Executes the generation script
- Logs the output for monitoring

### 3. Clear Browser Cache

If users are seeing outdated content, they can:

1. **Use the Clear Cache Page**:
   Navigate to the clear cache page:
   ```
   http://localhost:3003/clear-sonar-cache.html
   ```
   This provides a user-friendly interface to clear the cache and reload the page.

2. **Run a script in the browser console**:
   ```javascript
   // Copy and paste this into the browser console
   const scriptElement = document.createElement('script');
   scriptElement.src = '/scripts/clear-sonar-cache.js';
   document.body.appendChild(scriptElement);
   ```

3. **Use the nocache parameter**:
   Navigate directly to:
   ```
   http://localhost:3003/news/sonar-digest?nocache=true
   ```

## Implementation Details

1. **API Route**: The `/api/news/sonar-digest` route only retrieves the latest digest from the database, never generating content on-the-fly.

2. **Component**: The `SonarDigest` component displays the digest with enhanced visualization:
   - Weekly badge
   - Numbered topics (1-5)
   - Improved styling and layout
   - Animated background

3. **Caching**: The component uses localStorage to cache the digest for 7 days, reducing database load.

## Troubleshooting

If the digest is not showing 5 topics:

1. Clear the browser cache using the script mentioned above
2. Check the database to ensure the latest digest has 5 topics
3. Run the generation script manually to create a new digest

## Development

When making changes to the Sonar Digest system:

1. Update the `sonarDigestService.ts` file for backend changes
2. Update the `SonarDigest.tsx` component for frontend changes
3. Test by generating a new digest and viewing it in the browser