// scripts/apply-migration.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * This script applies the database migration for the DERA Pulse enhancements.
 * It reads the SQL file and executes it against the Supabase database using the REST API.
 */

async function main() {
  console.log('Applying database migration...');
  
  try {
    // Get Supabase credentials
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Supabase URL available:', !!SUPABASE_URL);
    console.log('Supabase Service Role Key available:', !!SUPABASE_SERVICE_ROLE_KEY);
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240425000002_add_language_column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Create a Supabase client
    console.log('Creating Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
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
        const { error } = await supabase.rpc('exec_sql', { query: statement });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          // Try direct SQL if RPC fails
          try {
            await supabase.from('_raw_sql').rpc('sql', { query: statement });
            console.log(`Statement ${i + 1} executed successfully using raw SQL`);
          } catch (rawError) {
            console.error(`Error executing raw SQL for statement ${i + 1}:`, rawError);
          }
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
      }
    }
    
    // Verify that the language column was added
    console.log('Verifying migration...');
    
    const { error: checkError } = await supabase
      .from('news_items')
      .select('language')
      .limit(1);
    
    if (checkError) {
      console.error('Migration verification failed:', checkError);
      console.log('\nTo apply this migration manually:');
      console.log('1. Go to the Supabase dashboard: https://app.supabase.com');
      console.log('2. Select your project');
      console.log('3. Go to the SQL Editor');
      console.log('4. Copy and paste the following SQL:');
      console.log('\n' + migrationSQL);
    } else {
      console.log('Migration verified successfully: language column exists');
    }
    
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

main();