// Script to import mock news data into real Supabase tables
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Since we're running a Node.js script which can't directly import TypeScript,
// we'll extract the mock data from the source file using a simple approach
function extractMockData() {
  try {
    const mockDataPath = path.join(__dirname, '../src/lib/mock/mockNewsData.ts');
    const fileContent = fs.readFileSync(mockDataPath, 'utf8');
    
    // Extract and parse the mockNews array from the file content
    // This is a simplified approach - in a more complex scenario you might want to use a TS compiler
    let mockNewsStr = fileContent.match(/export const mockNews: NewsItem\[] = \[([\s\S]*?)\];/)[1];
    let mockCategoriesStr = fileContent.match(/export const mockCategories: NewsCategory\[] = \[([\s\S]*?)\];/)[1];
    
    // Process date strings from the mock data
    mockNewsStr = mockNewsStr.replace(/new Date\(([^)]+)\)/g, (match, p1) => {
      // Handle different date formats in the mock data
      if (p1.includes('Date.now()')) {
        return `new Date(${eval(p1)})`;
      }
      return `new Date(${p1})`;
    });
    
    // Convert the extracted strings to JS objects
    // CAUTION: Using eval here for simplicity, but this is not safe for production code
    // Only use this approach when you fully control and trust the input
    const mockNews = eval(`[${mockNewsStr}]`);
    const mockCategories = eval(`[${mockCategoriesStr}]`);
    
    return { mockNews, mockCategories };
  } catch (error) {
    console.error('Error extracting mock data:', error);
    return { mockNews: [], mockCategories: [] };
  }
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or service role key is missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importMockData() {
  try {
    console.log('Starting import of mock data to Supabase...');
    
    // Extract mock data from the TypeScript file
    const { mockNews, mockCategories } = extractMockData();
    
    if (mockNews.length === 0) {
      throw new Error('Failed to extract mock news data from source file');
    }
    
    console.log(`Extracted ${mockNews.length} news items and ${mockCategories.length} categories`);

    // Step 1: Get existing news sources to map mock source_id to real source_id
    const { data: sourcesData, error: sourcesError } = await supabase
      .from('news_sources')
      .select('id, name');
    
    if (sourcesError) {
      throw new Error(`Error fetching sources: ${sourcesError.message}`);
    }
    
    // Map source names to IDs
    const sourceMap = {};
    sourcesData.forEach(source => {
      sourceMap[source.name] = source.id;
    });
    
    // Step 2: Get existing categories to map names to IDs
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('news_categories')
      .select('id, name');
    
    if (categoriesError) {
      throw new Error(`Error fetching categories: ${categoriesError.message}`);
    }
    
    // Map category names to IDs
    const categoryMap = {};
    categoriesData.forEach(category => {
      categoryMap[category.name] = category.id;
    });
    
    // Step 3: Import news items
    for (const item of mockNews) {
      // Map the source_name to source_id
      const sourceId = sourceMap[item.source_name];
      if (!sourceId) {
        console.warn(`Source "${item.source_name}" not found in database. Skipping news item: ${item.title}`);
        continue;
      }
      
      // Insert news item
      const { data: newsItem, error: newsError } = await supabase
        .from('news_items')
        .insert({
          title: item.title,
          summary: item.summary,
          content: item.content,
          source_id: sourceId,
          url: item.url,
          published_at: item.published_at,
          collected_at: item.collected_at,
          image_url: item.image_url,
          relevance_score: item.relevance_score,
          ai_processed: item.ai_processed,
          status: item.status
        })
        .select('id')
        .single();
      
      if (newsError) {
        console.error(`Error inserting news item "${item.title}": ${newsError.message}`);
        continue;
      }
      
      // Insert category associations
      if (item.categories && item.categories.length > 0) {
        const categoryAssociations = [];
        
        for (const categoryName of item.categories) {
          const categoryId = categoryMap[categoryName];
          if (categoryId) {
            categoryAssociations.push({
              news_item_id: newsItem.id,
              category_id: categoryId
            });
          } else {
            console.warn(`Category "${categoryName}" not found in database for news item: ${item.title}`);
          }
        }
        
        if (categoryAssociations.length > 0) {
          const { error: catAssocError } = await supabase
            .from('news_item_categories')
            .insert(categoryAssociations);
          
          if (catAssocError) {
            console.error(`Error inserting category associations for "${item.title}": ${catAssocError.message}`);
          }
        }
      }
      
      console.log(`Imported news item: ${item.title}`);
    }
    
    console.log('Import completed successfully!');
    
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Run the import
importMockData(); 