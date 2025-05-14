# Setting Up Real News Data in DERA

This guide explains how to set up and use real news data in the DERA application by configuring the Supabase database and transitioning from mock data.

## 1. Create Database Tables

The application needs several database tables to store news data. You can create these tables by executing the SQL script in the Supabase SQL Editor:

```bash
# Navigate to the Supabase Dashboard > SQL Editor
# Copy and paste the contents of scripts/setup_news_tables.sql
# Run the script
```

This script will create:
- `news_categories` table
- `news_sources` table 
- `news_items` table
- `news_item_categories` junction table
- `published_news_with_categories` view
- Initial category and source data

## 2. Import Mock Data (Optional)

If you want to start with some sample data, you can import the mock news data into the real database:

```bash
# Make sure you have Node.js installed
npm install
npm run import-news
```

This will convert the mock news data from `src/lib/mock/mockNewsData.ts` into real database entries.

## 3. How the News System Works

The application is designed to automatically use the real news service with a fallback to mock data:

1. When the application runs, it first attempts to fetch news from the Supabase database
2. If the database connection fails or tables don't exist, it automatically falls back to mock data
3. A warning banner appears when mock data is being displayed

### Components

- `NewsService`: The real service that connects to Supabase
- `MockNewsService`: A fallback service that uses local mock data
- `NewsList`: Displays a list of news articles with pagination
- `NewsDetail`: Displays detailed information for a single news article
- `NewsCard`: Displays a preview of a news article

### Pages

- `/news`: Lists all news articles with filters for categories
- `/news/[id]`: Shows detailed view of a single news article
- `/news/category/[category]`: Filters news by category

## 4. Adding Real News

To add real news content to the database:

1. Use the Supabase dashboard to add entries to the tables
2. Create a script to automatically import news from external sources
3. Use the news admin interface (if available)

## 5. Troubleshooting

If you encounter issues with the news system:

- Check Supabase connection settings in `.env.local`
- Verify that all required tables exist in the database
- Check the console for error messages
- If necessary, the application will automatically fall back to mock data

## 6. Environment Variables

Make sure your `.env.local` file contains the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

These are required for the news service to connect to your Supabase database. 