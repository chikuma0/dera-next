#!/usr/bin/env node

// This script requires ts-node to run TypeScript files
// Install with: npm install -D ts-node typescript @types/node

// Use Next.js's configuration to run the script
require('@next/env').loadEnvConfig(process.cwd());

// Use ts-node to register TypeScript
try {
  require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
      target: 'es2017',
      isolatedModules: true,
      esModuleInterop: true,
    },
  });

  // Now we can import TypeScript files
  const { SonarDigestService } = require('../src/lib/services/sonarDigestService');
  
  async function main() {
    console.log('Generating weekly Sonar digest...');
    
    try {
      // Create a new instance of the SonarDigestService
      const sonarDigestService = new SonarDigestService();
      
      // Generate a new weekly digest
      console.log('Calling Perplexity API to generate digest...');
      const digest = await sonarDigestService.generateWeeklyDigest();
      
      if (!digest) {
        console.error('Failed to generate digest');
        process.exit(1);
      }
      
      console.log(`Successfully generated digest with ${digest.topics.length} topics:`);
      digest.topics.forEach((topic, index) => {
        console.log(`  ${index + 1}. ${topic.title}`);
      });
      
      console.log('Weekly digest generation complete!');
      console.log('This digest will be served to users throughout the week.');
      
      process.exit(0);
    } catch (error) {
      console.error('Error generating weekly digest:', error);
      process.exit(1);
    }
  }

  main();
} catch (e) {
  console.error('This script requires ts-node to run. Please install it with:');
  console.error('npm install -D ts-node typescript @types/node');
  console.error('\nError details:', e);
  process.exit(1);
}