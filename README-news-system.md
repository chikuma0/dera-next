# AI News Aggregation System

The AI News Aggregation System is a core feature of the DERA platform, providing automated collection, processing, and display of AI news from various sources.

## Features

- **Automated Collection**: Fetches news from RSS feeds, APIs, and other sources
- **Content Classification**: Categorizes news items by topic, technology, and relevance
- **Japanese Market Focus**: Special attention to Japan-relevant AI news
- **User-friendly Interface**: Clean, responsive display of news items
- **Admin Dashboard**: Manage news sources and content

## Setup Guide

### 1. Database Setup

Run the migration scripts to set up the database schema:

```bash
# Connect to your Supabase project
npx supabase db push --db-url postgres://postgres:<password>@<host>/postgres

# Or run the SQL files directly
psql -U postgres -d your_database -f src/lib/db/migrations/03_news_system.sql
psql -U postgres -d your_database -f src/lib/db/migrations/04_seed_news_sources.sql
```

### 2. Environment Variables

Ensure these environment variables are set:

```
# Supabase Configuration (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: API configuration
API_COLLECTION_KEY=your_secret_key_for_collection_api
```

### 3. Initial Data Collection

Trigger the initial news collection:

```bash
# Set the API key to a substring of your service role key
export API_KEY=$(echo $SUPABASE_SERVICE_ROLE_KEY | cut -c 1-20)

# Run the collection script
node scripts/collect-news.js
```

### 4. Scheduled Collection

For production, set up a scheduled job to collect news regularly:

```bash
# Example crontab entry (runs every 3 hours)
0 */3 * * * cd /path/to/project && API_KEY=your_api_key node scripts/collect-news.js >> logs/collection.log 2>&1
```

## Administrator Guide

### Managing News Sources

1. Navigate to `/admin/news-sources` in your application
2. Here you can:
   - View all configured news sources
   - Add new sources
   - Enable/disable sources
   - Adjust source priority (affects auto-approval)

### Content Approval Workflow

News items go through the following states:

1. **Pending**: New items collected but not yet published
2. **Published**: Approved items visible to users
3. **Rejected**: Items deemed irrelevant or low quality

Items from high-priority sources (priority >= 8) are automatically approved.

## Development Guide

### Key Files

- `src/lib/db/migrations/03_news_system.sql`: Database schema
- `src/lib/news/rssCollector.ts`: RSS collection logic
- `src/lib/services/newsService.ts`: Data access service
- `src/components/news/`: UI components
- `src/app/news/`: Pages for news display
- `src/app/api/news/collect/`: Collection API endpoint

### Adding New Sources

To add support for a new source type:

1. Create a new collector class in `src/lib/news/` (similar to `rssCollector.ts`)
2. Update the API endpoint to use your new collector
3. Add source configuration to the database

## Customization

### Relevance Scoring

The default relevance scoring is based on source priority. To customize:

1. Edit the `autoApproveNews` function in `src/app/api/news/collect/route.ts`
2. For advanced scoring, consider implementing NLP-based relevance in a new service

### Adding AI Processing

For more advanced content processing:

1. Create a new service that uses OpenAI or another AI provider
2. Process text to extract entities, summarize content, or generate insights
3. Update the `news_items` table with the processed data 