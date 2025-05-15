export class PerplexityAPI {
  private apiKey: string;
  private apiEndpoint: string;

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    this.apiEndpoint = 'https://api.perplexity.ai/chat/completions';

    if (!this.apiKey) {
      console.warn('PERPLEXITY_API_KEY is not set in environment variables');
    }
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key is not configured');
    }

    try {
      console.log('Sending request to Perplexity API...');
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'pplx-70b-online',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant that provides clear and concise summaries in Japanese.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Received response from Perplexity API');
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Perplexity API:', error);
      throw error;
    }
  }
} 