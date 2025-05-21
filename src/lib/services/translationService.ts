import { validateEnv } from '../config/env';

export class TranslationService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    const env = validateEnv();
    this.apiUrl = env.translation.url;
    this.apiKey = env.translation.apiKey;
  }

  public async translate(text: string, targetLang: string): Promise<string> {
    // Google Cloud Translation API expects API key as query parameter
    const url = `${this.apiUrl}?key=${this.apiKey}`;
    
    try {
      console.log(`Calling Google Translate API for text length: ${text.length} chars`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          format: 'text'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Translation API error: ${response.status}`, errorText);
        throw new Error(`Translation API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      // Google Translate API returns data in this format:
      // { "data": { "translations": [{ "translatedText": "..." }] } }
      
      // Validate the response structure
      if (!data.data?.translations || !data.data.translations.length) {
        console.warn('Unexpected translation response format:', JSON.stringify(data).substring(0, 200));
        return '';
      }
      
      return data.data.translations[0].translatedText || '';
    } catch (error) {
      console.error('Translation API error:', error instanceof Error ? error.message : String(error));
      // Return empty string instead of throwing to make the service more resilient
      return '';
    }
  }
}
