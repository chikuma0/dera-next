import { config } from 'dotenv';
import { resolve } from 'path';
import { SummaryService } from '../src/lib/services/summaryService';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function testSummary() {
  try {
    console.log('Testing article summarization...');
    
    const summaryService = new SummaryService();
    
    // Test with a sample article
    const testUrl = 'https://www.theverge.com/2024/2/15/24073875/openai-sora-text-to-video-ai-generation-model';
    const testTitle = 'OpenAI\'s Sora: A Breakthrough in Text-to-Video AI';
    
    console.log('Generating summary for:', testTitle);
    const summary = await summaryService.summarizeArticle(testUrl, testTitle);
    
    console.log('\nGenerated Summary:');
    console.log('------------------');
    console.log(summary);
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSummary(); 