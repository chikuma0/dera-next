// apply_twitter_migration.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

async function main() {
  console.log('Applying Twitter integration migration...');
  
  try {
    // Get Supabase credentials
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Supabase URL available:', !!SUPABASE_URL);
    console.log('Supabase Service Role Key available:', !!SUPABASE_SERVICE_ROLE_KEY);
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create a Supabase client
    console.log('Creating Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('twitter_migration.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { query: statement });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
      }
    }
    
    // Verify that the tables were created
    console.log('Verifying migration...');
    
    // Check if tweets table exists
    const { data, error } = await supabase
      .from('tweets')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error verifying tweets table:', error);
    } else {
      console.log('Tweets table exists');
    }
    
    console.log('Migration completed!');
    
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

main();