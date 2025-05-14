import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { validateEnv } from '../src/lib/config/env';

async function main() {
  // Validate environment variables
  const env = validateEnv();
  
  // Create Supabase client
  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
  
  try {
    console.log('Reading SQL file...');
    const sql = readFileSync('scripts/setup-complete-schema.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log('Executing SQL statements...');
    for (const stmt of statements) {
      const { error } = await supabase.from('_sql').insert({ query: stmt });
      if (error) {
        console.error('Error executing SQL statement:', error);
        console.error('Statement:', stmt);
        process.exit(1);
      }
    }
    
    console.log('Database schema setup successfully!');
    
    // Run the setup script to populate initial data
    console.log('Running setup script...');
    const { spawn } = require('child_process');
    const setup = spawn('npx', ['ts-node', 'scripts/setup-news-db.ts'], {
      stdio: 'inherit'
    });
    
    setup.on('close', (code: number) => {
      if (code !== 0) {
        console.error('Setup script failed');
        process.exit(1);
      }
      console.log('Setup completed successfully!');
    });
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 