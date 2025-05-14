import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Read all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order

    console.log(`Found ${migrationFiles.length} migration(s) to run`);

    for (const file of migrationFiles) {
      const migrationName = file.split('.')[0];
      console.log(`\nRunning migration: ${migrationName}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = readFileSync(filePath, 'utf8');
      
      const { error } = await supabase.rpc('exec', { query: sql });
      
      if (error) {
        console.error(`❌ Migration failed: ${migrationName}`, error);
        throw error;
      }
      
      console.log(`✅ Successfully applied: ${migrationName}`);
    }
    
    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
