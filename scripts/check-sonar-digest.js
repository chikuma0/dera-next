// scripts/check-sonar-digest.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env files
dotenv.config({ path: '.env.local' });
dotenv.config();

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Checking Sonar Digest data...');
  
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
    
    // Check if sonar_digests table exists and get the latest digest
    console.log('Checking sonar_digests table...');
    
    const { data: digestData, error } = await supabase
      .from('sonar_digests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching from database:', error);
      
      // Check if the sample data file exists
      console.log('Checking sample data file...');
      const filePath = path.join(__dirname, '..', 'public/data/sonar-digest.json');
      
      if (fs.existsSync(filePath)) {
        console.log('Reading sample digest from file:', filePath);
        const fileData = fs.readFileSync(filePath, 'utf8');
        const sampleData = JSON.parse(fileData);
        
        console.log('Sample data file exists with the following topics:');
        console.log(`Number of topics: ${sampleData.topics.length}`);
        console.log('Topic titles:');
        sampleData.topics.forEach((topic, index) => {
          console.log(`  ${index + 1}. ${topic.title}`);
        });
      } else {
        console.log('Sample data file does not exist');
      }
    } else if (digestData && digestData.length > 0) {
      const digest = digestData[0];
      console.log('Found digest in database:');
      console.log(`ID: ${digest.id}`);
      console.log(`Title: ${digest.title}`);
      console.log(`Date: ${digest.date}`);
      console.log(`Number of topics: ${digest.topics.length}`);
      console.log('Topic titles:');
      digest.topics.forEach((topic, index) => {
        console.log(`  ${index + 1}. ${topic.title}`);
      });
      
      // Check if the sample data file exists and compare
      console.log('\nComparing with sample data file...');
      const filePath = path.join(__dirname, '..', 'public/data/sonar-digest.json');
      
      if (fs.existsSync(filePath)) {
        console.log('Reading sample digest from file:', filePath);
        const fileData = fs.readFileSync(filePath, 'utf8');
        const sampleData = JSON.parse(fileData);
        
        console.log('Sample data file has the following topics:');
        console.log(`Number of topics: ${sampleData.topics.length}`);
        console.log('Topic titles:');
        sampleData.topics.forEach((topic, index) => {
          console.log(`  ${index + 1}. ${topic.title}`);
        });
        
        // Compare the number of topics
        if (digest.topics.length !== sampleData.topics.length) {
          console.log('\nWARNING: Number of topics in database does not match sample data file');
          console.log(`Database: ${digest.topics.length} topics`);
          console.log(`Sample file: ${sampleData.topics.length} topics`);
        }
      } else {
        console.log('Sample data file does not exist');
      }
    } else {
      console.log('No digest found in database');
      
      // Check if the sample data file exists
      console.log('Checking sample data file...');
      const filePath = path.join(__dirname, '..', 'public/data/sonar-digest.json');
      
      if (fs.existsSync(filePath)) {
        console.log('Reading sample digest from file:', filePath);
        const fileData = fs.readFileSync(filePath, 'utf8');
        const sampleData = JSON.parse(fileData);
        
        console.log('Sample data file exists with the following topics:');
        console.log(`Number of topics: ${sampleData.topics.length}`);
        console.log('Topic titles:');
        sampleData.topics.forEach((topic, index) => {
          console.log(`  ${index + 1}. ${topic.title}`);
        });
      } else {
        console.log('Sample data file does not exist');
      }
    }
  } catch (error) {
    console.error('Error checking Sonar digest data:', error);
  }
}

main();