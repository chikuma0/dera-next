import { validateEnv } from '../config/env';

export class PerplexityService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    const env = validateEnv();
    this.apiUrl = env.perplexity.url;
    this.apiKey = env.perplexity.apiKey;
  }

  // List of models to try in order - using valid models from https://docs.perplexity.ai/guides/model-cards
  private models = ["sonar", "mistral-7b-instruct", "mixtral-8x7b-instruct", "llama-3-8b-instruct"];
  
  public async summarize(url: string, language: string = 'ja'): Promise<string> {
    // Use the correct endpoint path for Perplexity API
    const endpoint = `${this.apiUrl}/chat/completions`;
    
    // Try each model in sequence until one works
    for (const model of this.models) {
      try {
        console.log(`Calling Perplexity API with model ${model} for URL: ${url}`);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: "You provide concise summaries of news articles."
              },
              {
                role: "user",
                content: `Please summarize the content at this URL in ${language === 'ja' ? 'Japanese' : 'English'}: ${url}`
              }
            ],
            max_tokens: 300
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Perplexity API error with model ${model}: Status ${response.status}`, errorText);
          // Continue to the next model instead of throwing
          continue;
        }

        const data = await response.json();
        const summary = data.choices?.[0]?.message?.content || '';
        
        if (summary) {
          console.log(`Successfully summarized with model ${model}`);
          return summary;
        }
      } catch (error) {
        console.error(`Perplexity API error with model ${model}:`, error instanceof Error ? error.message : String(error));
        // Continue to the next model
      }
    }
    
    // If all models failed, return empty string (or could return a default message)
    console.error("All Perplexity API models failed for URL:", url);
    return '';
  }
}
