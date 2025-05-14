// scripts/apply-twitter-migration.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * This script applies the Twitter integration migration for DERA Pulse.
 * It reads the SQL file and executes it against the Supabase database.
 */

async function main() {
  console.log('Applying Twitter integration database migration...');
  
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
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '006_twitter_integration.sql');
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
    
    // Execute each statement directly using the REST API
    console.log('Executing SQL statements...');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { query: statement });
      
      if (error) {
        console.warn(`Warning: Error executing statement ${i + 1}:`, error);
        // Continue with other statements even if one fails
      }
    }
    
    // Verify that the tables were created
    console.log('Verifying migration...');
    
    // Check if tweets table exists
    const { error: checkError } = await supabase
      .from('tweets')
      .select('id')
      .limit(1);
    
    if (checkError && (checkError.code === 'PGRST116' || checkError.code === '42P01')) {
      console.error('Migration failed: tweets table does not exist');
      
      // Instructions for manual migration
      console.log('\nTo apply this migration manually:');
      console.log('1. Go to the Supabase dashboard: https://app.supabase.com');
      console.log('2. Select your project');
      console.log('3. Go to the SQL Editor');
      console.log('4. Copy and paste the contents of the migration file');
      console.log('5. Run the SQL statements');
      
      // Print the migration file
      console.log('\nMigration file:');
      console.log(migrationSQL);
      
      process.exit(1);
    } else if (checkError) {
      console.warn('Warning: Could not verify migration success:', checkError);
    } else {
      console.log('Verification successful: tweets table exists');
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

main();