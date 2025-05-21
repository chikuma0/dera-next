# News Cron Job Fix Plan

## Issue Analysis

The news section's cron job is failing due to two main issues:

1. **ID Format Incompatibility**: 
   - Error: `invalid input syntax for type uuid: "https://news.google.com/rss/articles/..."`
   - The code is using full article URLs as IDs in the database
   - While the database schema defines `id` as text type, the database is rejecting these URLs and expects UUID format

2. **Perplexity API Issues** (to be addressed separately):
   - Error: `Perplexity summary error: Error: Perplexity API error: 404`
   - The Perplexity API endpoint is not responding properly, returning 404 errors

## Solution for ID Format Issue

### Current Implementation (Problem)

In `src/lib/news/fetcher.ts`, the news item ID is currently being generated as:

```typescript
id: item.link || Buffer.from(`${source.name}-${title}`).toString('base64').replace(/[+/=]/g, ''),
```

This is problematic because:
- Google News URLs are too complex and not suitable for database IDs
- The database seems to expect UUID format even though the schema defines `id` as text

### Proposed Fix

The project already has a `generateUUID` utility in `src/lib/news/generateUUID.ts` that creates UUID-like strings from input text. We should use this to generate consistent, valid UUIDs from the article URLs.

#### Code Changes Required

1. **Import the generateUUID function in fetcher.ts**:
   ```typescript
   import { generateUUID } from './generateUUID';
   ```

2. **Replace the ID generation logic**:
   ```typescript
   // Replace this:
   id: item.link || Buffer.from(`${source.name}-${title}`).toString('base64').replace(/[+/=]/g, ''),
   
   // With this:
   id: generateUUID(item.link || `${source.name}-${title}`),
   ```

These changes will:
- Generate proper UUID-formatted strings that the database will accept
- Maintain deterministic ID generation (same URL = same ID)
- Preserve the fallback mechanism for items without links

## Implementation Steps

1. Switch to Code mode
2. Update the `src/lib/news/fetcher.ts` file with the changes outlined above
3. Test the cron job to verify the fix works

## Future Considerations

1. **Database Schema**: Consider explicitly changing the `id` column to UUID type for better type safety
2. **Error Handling**: Add more robust error handling for the Perplexity API
3. **Monitoring**: Set up monitoring for the cron job to detect failures earlier