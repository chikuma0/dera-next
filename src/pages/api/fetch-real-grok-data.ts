
import { NextApiRequest, NextApiResponse } from 'next';
import { GrokDigestService } from '@/lib/services/grokDigestService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Fetching real data from Grok API...');
  
  try {
    // Create a new instance of the GrokDigestService
    const grokDigestService = new GrokDigestService();
    
    // Generate a new weekly digest with real news
    console.log('Calling Grok API to fetch real news and Twitter data...');
    const digest = await grokDigestService.generateWeeklyDigest();
    
    if (!digest) {
      console.error('Failed to fetch data from Grok API');
      res.status(500).json({ error: 'Failed to fetch data from Grok API' });
      return;
    }
    
    // Validate that we have real data
    if (!digest.topics || digest.topics.length === 0) {
      console.error('No topics found in Grok API response');
      res.status(500).json({ error: 'No topics found in Grok API response' });
      return;
    }
    
    // Check for real citations
    let realCitationsCount = 0;
    let realTweetsCount = 0;
    
    digest.topics.forEach(topic => {
      if (topic.citations && topic.citations.length > 0) {
        realCitationsCount += topic.citations.length;
        
        // Count real tweets
        const xPosts = topic.citations.filter(citation => 
          citation.type === 'x-post' && 
          citation.url && 
          (citation.url.includes('twitter.com') || citation.url.includes('x.com'))
        );
        
        realTweetsCount += xPosts.length;
      }
    });
    
    if (realCitationsCount === 0) {
      console.error('No real citations found in Grok API response');
      res.status(500).json({ error: 'No real citations found in Grok API response' });
      return;
    }
    
    console.log(`Successfully fetched real data from Grok API with ${digest.topics.length} topics:`);
    digest.topics.forEach((topic, index) => {
      console.log(`  ${index + 1}. ${topic.title}`);
      
      if (topic.citations && topic.citations.length > 0) {
        console.log(`     Citations: ${topic.citations.length}`);
      }
      
      if (topic.relatedHashtags && topic.relatedHashtags.length > 0) {
        console.log(`     Related hashtags: ${topic.relatedHashtags.length}`);
      }
    });
    
    console.log(`Real citations: ${realCitationsCount}`);
    console.log(`Real tweets: ${realTweetsCount}`);
    
    res.status(200).json({ 
      success: true, 
      topicsCount: digest.topics.length,
      citationsCount: realCitationsCount,
      tweetsCount: realTweetsCount
    });
  } catch (error) {
    console.error('Error fetching data from Grok API:', error);
    res.status(500).json({ error: String(error) });
  }
}
