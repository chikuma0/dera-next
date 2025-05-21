import { validateEnv } from '../config/env';

export class PerplexityService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    const env = validateEnv();
    this.apiUrl = env.perplexity.url;
    this.apiKey = env.perplexity.apiKey;
  }

  public async summarize(url: string, language: string = 'ja'): Promise<string> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ url, language }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.summary || '';
  }
}
