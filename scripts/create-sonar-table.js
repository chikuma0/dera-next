// scripts/create-sonar-table.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Creating sonar_digests table...');
  
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
    
    // Create the table with the correct SQL
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
    
    console.log('Executing SQL:');
    console.log(createTableSQL);
    
    // Try to execute the SQL using the REST API
    try {
      // First, try to check if the table already exists
      console.log('Checking if table already exists...');
      const { error: checkError } = await supabase
        .from('sonar_digests')
        .select('id')
        .limit(1);
      
      if (checkError && (checkError.code === 'PGRST116' || checkError.code === '42P01')) {
        console.log('Table does not exist. Attempting to create it...');
        
        // Since we can't execute arbitrary SQL directly through the Supabase client,
        // we'll print instructions for manual execution
        console.log('\nPlease run the following SQL in the Supabase dashboard:');
        console.log(createTableSQL);
        
        console.log('\nInstructions:');
        console.log('1. Go to the Supabase dashboard: https://app.supabase.com');
        console.log('2. Select your project');
        console.log('3. Go to the SQL Editor');
        console.log('4. Copy and paste the SQL above');
        console.log('5. Run the SQL statement');
        
        // Create a file with the SQL for easy access
        const sqlFilePath = path.join(__dirname, '..', 'create-sonar-table.sql');
        fs.writeFileSync(sqlFilePath, createTableSQL);
        console.log(`\nSQL has been saved to: ${sqlFilePath}`);
      } else if (checkError) {
        console.error('Error checking if table exists:', checkError);
      } else {
        console.log('Table already exists!');
      }
    } catch (sqlError) {
      console.error('Error:', sqlError);
      console.log('Please run the SQL manually using the Supabase dashboard.');
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
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();