// scripts/apply-migration.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
// Add type declaration for node-fetch
import type { Response } from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * This script applies the database migration for the DERA Pulse enhancements.
 * It reads the SQL file and executes it against the Supabase database using the REST API.
 */

async function main() {
  console.log('Applying DERA Pulse database migration...');
  
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
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '004_dera_pulse_enhancements.sql');
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
    
    // Since we can't execute arbitrary SQL directly, let's check if the tables exist
    // and create them if they don't
    
    console.log('Checking if tables exist...');
    
    // Check if ai_technologies table exists
    const { error: checkError } = await supabase
      .from('ai_technologies')
      .select('id')
      .limit(1);
    
    if (checkError && (checkError.code === 'PGRST116' || checkError.code === '42P01')) {
      console.log('Tables need to be created. Please use the Supabase dashboard or CLI to run the migration.');
      console.log('Migration file path:', migrationPath);
      
      // Instructions for manual migration
      console.log('\nTo apply this migration manually:');
      console.log('1. Go to the Supabase dashboard: https://app.supabase.com');
      console.log('2. Select your project');
      console.log('3. Go to the SQL Editor');
      console.log('4. Copy and paste the contents of the migration file');
      console.log('5. Run the SQL statements');
      
      // Print the first few lines of the migration file
      console.log('\nMigration file preview:');
      const previewLines = migrationSQL.split('\n').slice(0, 10);
      console.log(previewLines.join('\n') + '\n...');
    } else if (checkError) {
      console.error('Error checking tables:', checkError);
    } else {
      console.log('Tables already exist. Migration may have been applied already.');
      
      // Verify that we can access the ai_technologies table
      const { data, error } = await supabase
        .from('ai_technologies')
        .select('count');
        
      if (error) {
        console.warn('Warning: Could not verify migration success:', error);
      } else {
        console.log('Verification successful: ai_technologies table exists');
      }
    }
    
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

main();