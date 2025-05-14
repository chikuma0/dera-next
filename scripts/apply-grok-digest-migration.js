// scripts/apply-grok-digest-migration.js

/**
 * This script applies the Grok digest migration to the Supabase database.
 * It creates the grok_digests table for storing weekly AI news digests.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing required environment variables.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Path to the migration file
const migrationFilePath = path.join(__dirname, '../supabase/migrations/007_grok_digest.sql');

// Apply the migration
async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    
    console.log('Applying migration...');
    const { error } = await supabase.rpc('execute_sql', { sql: migrationSQL });
    
    if (error) {
      // If the execute_sql function doesn't exist, we'll need to run the SQL directly
      if (error.message.includes('function "execute_sql" does not exist')) {
        console.log('execute_sql function not found, running SQL directly...');
        
        // Split the SQL into separate statements
        const statements = migrationSQL.split(';').filter(stmt => stmt.trim() !== '');
        
        for (const statement of statements) {
          console.log(`Executing statement: ${statement.substring(0, 50)}...`);
          const { error: stmtError } = await supabase.rpc('execute_sql', { sql: statement });
          
          if (stmtError) {
            console.error(`Error executing statement: ${stmtError.message}`);
            
            // Try to execute the statement directly using raw SQL
            try {
              await supabase.from('_raw_sql').rpc('sql', { query: statement });
              console.log('Statement executed successfully using raw SQL');
            } catch (rawError) {
              console.error(`Error executing raw SQL: ${rawError.message}`);
            }
          }
        }
      } else {
        console.error('Error applying migration:', error.message);
        process.exit(1);
      }
    }
    
    console.log('Migration applied successfully!');
    console.log('The grok_digests table has been created.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the migration
applyMigration();