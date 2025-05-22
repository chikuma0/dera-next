# News Auto-Refresh Implementation

We've implemented automated news refreshes at multiple levels to keep your news feed updated with the latest articles.

## Changes Made

### 1. Server-Side Scheduled Fetches (Every 4 Hours)

Modified `vercel.json` to run the cron job every 4 hours instead of once daily:

```json
"crons": [
  {
    "path": "/api/news/cron",
    "schedule": "0 */4 * * *"
  }
]
```

This ensures that new content is fetched from RSS sources regularly throughout the day. The cron syntax `0 */4 * * *` means "at minute 0 of every 4th hour" (i.e., 12 AM, 4 AM, 8 AM, 12 PM, 4 PM, 8 PM).

### 2. Client-Side Auto-Refresh (Two Levels)

Modified `NewsList.tsx` to implement a two-tier refresh strategy:

1. **Regular Database Refresh (Every 30 seconds)**
   - Fetches the latest sorted articles from the database
   - Fast and lightweight (no external API calls)
   - Captures any updates made by server-side cron jobs

2. **Full RSS Refresh (Every 10 minutes)**
   - Triggers a complete refresh from all RSS sources
   - Updates the database with any new articles
   - Ensures fresh content even if the server-side cron hasn't run recently

```jsx
// Regular refresh from database (every 30 seconds typically)
const dbRefreshInterval = setInterval(() => {
  fetchNews(false);
}, autoRefresh * 1000);

// Full refresh from RSS sources every 10 minutes
const fullRefreshInterval = setInterval(() => {
  console.log("Triggering full RSS refresh");
  fetchNews(true);
}, 10 * 60 * 1000); // 10 minutes
```

## How It Works

With these changes, articles are refreshed through multiple mechanisms:

1. **Server-side cron job** fetches new articles every 4 hours
2. **Client-side full refresh** fetches new articles every 10 minutes when users are actively viewing the page
3. **Client-side database refresh** ensures the latest sorted articles are displayed every 30 seconds

This multi-tiered approach ensures your news feed stays current with minimal server load, as:
- The most resource-intensive operation (RSS fetching) happens at reasonable intervals
- Lightweight database queries happen frequently for active users
- Server-side cron provides baseline updates regardless of user activity

## Testing

To verify these changes are working:

1. Open the browser console on the `/news` page
2. You should see "Triggering full RSS refresh" message every 10 minutes
3. Articles should update accordingly when new content is found