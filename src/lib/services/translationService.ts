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
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ text, targetLang }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Translation API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.translatedText || data.translation || '';
  }
}
