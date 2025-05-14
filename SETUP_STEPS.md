# Setting Up Real News Data: Step-by-Step Guide

Follow these steps to fix the errors and set up real news data:

## 1. Fix the Package.json Issue

If you're seeing errors related to `package.json`, it might be corrupted. Fix it by running:

```bash
# Make sure you have a recent backup or copy of package.json
# If necessary, recreate it by copying the content from a backup
```

## 2. Set Up Database Tables in Supabase

The error `relation "public.published_news_with_categories" does not exist` indicates the required tables don't exist yet:

1. **Log into your Supabase dashboard** for the project at https://app.supabase.com
2. **Navigate to the SQL Editor** section
3. **Copy the entire content** from `scripts/setup_news_tables.sql`
4. **Paste it into the SQL Editor** and run the script
5. **Verify the tables were created** by checking the Table Editor in Supabase

The script will create:
- `news_categories` table
- `news_sources` table 
- `news_items` table
- `news_item_categories` junction table
- `published_news_with_categories` view
- Initial sample data for categories and sources

## 3. Import Mock Data (Optional)

To populate your database with the sample news items:

```bash
# Run the import script
npm run import-news
```

If you encounter an error, make sure:
- Your `.env.local` file has the correct Supabase URL and keys
- You're running the script from the project root directory

## 4. Check Environment Variables

Make sure your `.env.local` file contains these required variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 5. Restart the Development Server

After setting up the database and fixing any issues:

```bash
# If the server is already running on port 3003, stop it first
# Then start a clean instance
npm run dev
```

## 6. Troubleshooting

### If you see "port already in use" errors:
Find and terminate the process using the port:
```bash
# On macOS/Linux
lsof -i :3003
kill -9 <PID>
```

### If you're still getting "relation does not exist" errors:
1. Check that the tables were actually created in Supabase
2. Verify you're connecting to the correct Supabase project
3. Make sure your environment variables are correct

### If the import script fails:
Try running it with debug output:
```bash
node --trace-warnings scripts/import_mock_to_real.js
```

## 7. What to Expect After Setup

Once everything is set up correctly:
- The news page will first try to fetch real data from Supabase
- If successful, it will display real news items
- If there's an error, it will automatically fall back to mock data with a warning banner
- The mocked news banner only appears when using mock data, not when using real database data 