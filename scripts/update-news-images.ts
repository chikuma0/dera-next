import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to extract image URL from HTML content
function extractImageUrl(htmlContent: string): string | null {
  if (!htmlContent) return null;
  
  try {
    const $ = cheerio.load(htmlContent);
    
    interface ImageCandidate {
      src: string;
      priority: number;
    }
    
    let bestImage: ImageCandidate | null = null;
    
    // Check all images and find the best one based on priority
    $('img').each((_, img) => {
      const $img = $(img);
      let src = $img.attr('src') || '';
      
      // Skip if no src or if it's a data URL
      if (!src || src.startsWith('data:')) return;
      
      // Handle relative URLs
      if (src.startsWith('//')) {
        src = 'https:' + src;
      } else if (src.startsWith('/')) {
        // Skip root-relative URLs as we don't know the base URL
        return;
      }
      
      // Calculate priority
      let priority = 0;
      
      // Higher priority for larger images
      const width = parseInt($img.attr('width') || '0', 10);
      const height = parseInt($img.attr('height') || '0', 10);
      
      if (width > 300 && height > 200) {
        priority += 3;
      } else if (width > 200 && height > 150) {
        priority += 2;
      } else if (width > 100 || height > 100) {
        priority += 1;
      }
      
      // Lower priority for common logo/icon patterns
      const lowerSrc = src.toLowerCase();
      if (lowerSrc.includes('logo') || lowerSrc.includes('icon') || 
          lowerSrc.includes('avatar') || lowerSrc.includes('favicon')) {
        priority -= 2;
      }
      
      // If this is the best image so far, save it
      if (priority >= 0 && (!bestImage || priority > bestImage.priority)) {
        // Create a new ImageCandidate with the current src and priority
        const candidate: ImageCandidate = { src, priority };
        bestImage = candidate;
      }
    });
    
    // Return the best image found, or null if none found
    return bestImage?.src || null;
  } catch (error) {
    console.error('Error extracting image URL:', error);
    return null;
  }
}

async function updateNewsImages() {
  console.log('Fetching news items without images...');
  
  // Get news items with content but no image_url
  const { data: articles, error: fetchError } = await supabase
    .from('news_items')
    .select('id, title, content, image_url')
    .is('image_url', null)
    .not('content', 'is', null)
    .not('content', 'eq', '');
    
  if (fetchError) {
    console.error('Error fetching news items:', fetchError);
    process.exit(1);
  }
  
  console.log(`Found ${articles?.length || 0} articles without images.`);
  
  if (!articles || articles.length === 0) {
    console.log('No articles need image updates.');
    return;
  }
  
  let updated = 0;
  let processed = 0;
  const total = articles.length;
  
  for (const article of articles) {
    processed++;
    try {
      console.log(`\nProcessing article ${processed}/${total}: ${article.title?.substring(0, 50)}...`);
      
      // Try to extract image from content
      const imageUrl = extractImageUrl(article.content || '');
      
      if (imageUrl) {
        console.log(`Found image: ${imageUrl.substring(0, 100)}...`);
        
        const { error: updateError } = await supabase
          .from('news_items')
          .update({ image_url: imageUrl })
          .eq('id', article.id);
          
        if (updateError) {
          console.error(`Error updating image for article ${article.id}:`, updateError);
        } else {
          updated++;
          console.log(`✅ Updated image for article ${article.id}`);
        }
      } else {
        console.log(`⚠️ No suitable image found in article ${article.id}`);
      }
    } catch (error) {
      console.error(`❌ Error processing article ${article.id}:`, error);
    }
  }
  
  console.log(`\nDone! Updated images for ${updated} out of ${total} articles.`);
  
  // Also try to update any remaining items with default images
  if (updated < total) {
    console.log('\nTrying to update remaining items with default images...');
    
    // Get default image URL from environment or use a placeholder
    const defaultImageUrl = process.env.DEFAULT_NEWS_IMAGE_URL || 'https://via.placeholder.com/800x450.png?text=No+Image+Available';
    
    // Define interface for the remaining articles
    interface RemainingArticle {
      id: string;
      title: string;
    }
    
    // Update all remaining items with the default image
    const { data: remainingArticles, error: remainingError } = await supabase
      .from('news_items')
      .update({ image_url: defaultImageUrl })
      .is('image_url', null)
      .select('id, title') as { data: RemainingArticle[] | null; error: any };
      
    if (remainingError) {
      console.error('Error updating remaining items with default images:', remainingError);
    } else if (remainingArticles && remainingArticles.length > 0) {
      console.log(`Updated ${remainingArticles.length} articles with default images.`);
      updated += remainingArticles.length;
    }
  }
  
  console.log(`\n✅ Final result: Updated ${updated} out of ${total} articles.`);
}

updateNewsImages().catch(e => { console.error(e); process.exit(1); });
