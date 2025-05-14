// scripts/add-sample-trend-data.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('Adding sample trend data for all technologies without data...');
  
  try {
    // Get Supabase credentials
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create a Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get all technologies
    const { data: allTechnologies, error: techError } = await supabase
      .from('ai_technologies')
      .select('id, name, slug, maturity_level');
    
    if (techError || !allTechnologies) {
      console.error('Error fetching technologies:', techError);
      return;
    }
    
    console.log(`Found ${allTechnologies.length} technologies in total`);
    
    // For each technology, check if it has trend points
    for (const tech of allTechnologies) {
      const { data: trendPoints, error: pointsError } = await supabase
        .from('technology_trend_points')
        .select('id')
        .eq('technology_id', tech.id)
        .limit(1);
      
      if (pointsError) {
        console.error(`Error checking trend points for ${tech.name}:`, pointsError);
        continue;
      }
      
      // If no trend points, add sample data
      if (!trendPoints || trendPoints.length === 0) {
        console.log(`Adding sample trend data for ${tech.name} (ID: ${tech.id})...`);
        
        // Create sample trend data for the past 7 days
        const trendData = [];
        const today = new Date();
        
        // Different patterns based on maturity level
        let baseCount, baseScore, growthFactor;
        
        switch (tech.maturity_level) {
          case 'established':
            baseCount = 20;
            baseScore = 85;
            growthFactor = 0.05;
            break;
          case 'growing':
            baseCount = 10;
            baseScore = 75;
            growthFactor = 0.15;
            break;
          case 'emerging':
          default:
            baseCount = 5;
            baseScore = 65;
            growthFactor = 0.25;
            break;
        }
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          // Increase mentions and importance over time
          // Use different patterns for different technologies to make it look more realistic
          const dayFactor = (6 - i) / 6; // 0 to 1 as days progress
          const randomVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
          
          const mentionCount = Math.round((baseCount + (baseCount * dayFactor * 2)) * randomVariation);
          const importanceScore = baseScore + (10 * dayFactor * randomVariation);
          const growthRate = growthFactor * (1 + dayFactor) * randomVariation;
          
          trendData.push({
            technology_id: tech.id,
            date: date.toISOString(),
            mention_count: mentionCount,
            importance_score: importanceScore,
            growth_rate: growthRate
          });
        }
        
        // Insert the trend data
        const { error: insertError } = await supabase
          .from('technology_trend_points')
          .upsert(trendData);
        
        if (insertError) {
          console.error(`Error inserting trend data for ${tech.name}:`, insertError);
          continue;
        }
        
        console.log(`Successfully added ${trendData.length} trend points for ${tech.name}`);
      } else {
        console.log(`${tech.name} already has trend data, skipping...`);
      }
    }
    
    console.log('Finished adding sample trend data for all technologies');
    
  } catch (error) {
    console.error('Error adding sample trend data:', error);
    process.exit(1);
  }
}

main();