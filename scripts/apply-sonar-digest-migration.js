// scripts/apply-sonar-digest-migration.js
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
 * This script applies the Sonar digest migration to the Supabase database.
 * It creates the sonar_digests table for storing weekly AI news digests from Perplexity's Sonar API.
 */

async function main() {
  console.log('Applying Sonar Digest database migration...');
  
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
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '008_sonar_digest.sql');
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
    
    // Check if sonar_digests table exists
    console.log('Checking if sonar_digests table exists...');
    
    const { error: checkError } = await supabase
      .from('sonar_digests')
      .select('id')
      .limit(1);
    
    if (checkError && (checkError.code === 'PGRST116' || checkError.code === '42P01')) {
      console.log('Table needs to be created. Please use the Supabase dashboard or CLI to run the migration.');
      console.log('Migration file path:', migrationPath);
      
      // Instructions for manual migration
      console.log('\nTo apply this migration manually:');
      console.log('1. Go to the Supabase dashboard: https://app.supabase.com');
      console.log('2. Select your project');
      console.log('3. Go to the SQL Editor');
      console.log('4. Copy and paste the contents of the migration file');
      console.log('5. Run the SQL statements');
      
      // Print the migration file
      console.log('\nMigration SQL:');
      // Make sure the SQL has commas between column definitions
      const fixedSQL = migrationSQL.replace(/\n  ([a-z_]+)/g, ',\n  $1').replace(/,\n  id/g, '\n  id');
      console.log(fixedSQL);
      
      // Execute the SQL directly using the Supabase REST API
      console.log('\nAttempting to execute SQL directly...');
      try {
        // Create the table directly
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS sonar_digests (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            date TIMESTAMP WITH TIME ZONE NOT NULL,
            summary TEXT NOT NULL,
            topics JSONB NOT NULL,
            raw_html TEXT NOT NULL,
            published_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY
          },
          body: JSON.stringify({
            query: createTableSQL
          })
        });
        
        if (response.ok) {
          console.log('Table created successfully!');
        } else {
          console.error('Failed to create table:', await response.text());
          console.log('Please run the SQL manually as described above.');
        }
      } catch (sqlError) {
        console.error('Error executing SQL:', sqlError);
        console.log('Please run the SQL manually as described above.');
      }
      
      // Save Perplexity API key to .env file if provided
      const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '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';
      
      if (PERPLEXITY_API_KEY) {
        console.log('\nSaving Perplexity API key to .env file...');
        
        // Read existing .env file or create a new one
        let envContent = '';
        const envPath = path.join(__dirname, '..', '.env');
        
        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, 'utf8');
        }
        
        // Check if PERPLEXITY_API_KEY already exists in .env
        if (!envContent.includes('PERPLEXITY_API_KEY=')) {
          // Append the API key to the .env file
          fs.appendFileSync(envPath, `\nPERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}\n`);
          console.log('Perplexity API key added to .env file');
        } else {
          console.log('Perplexity API key already exists in .env file');
        }
      }
    } else if (checkError) {
      console.error('Error checking table:', checkError);
    } else {
      console.log('Table already exists. Migration may have been applied already.');
      
      // Verify that we can access the sonar_digests table
      const { data, error } = await supabase
        .from('sonar_digests')
        .select('count');
        
      if (error) {
        console.warn('Warning: Could not verify migration success:', error);
      } else {
        console.log('Verification successful: sonar_digests table exists');
      }
      
      // Save Perplexity API key to .env file if provided
      const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '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';
      
      if (PERPLEXITY_API_KEY) {
        console.log('\nSaving Perplexity API key to .env file...');
        
        // Read existing .env file or create a new one
        let envContent = '';
        const envPath = path.join(__dirname, '..', '.env');
        
        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, 'utf8');
        }
        
        // Check if PERPLEXITY_API_KEY already exists in .env
        if (!envContent.includes('PERPLEXITY_API_KEY=')) {
          // Append the API key to the .env file
          fs.appendFileSync(envPath, `\nPERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}\n`);
          console.log('Perplexity API key added to .env file');
        } else {
          console.log('Perplexity API key already exists in .env file');
        }
      }
    }
    
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

main();