import { validateEnv } from '../config/env';

export class SummaryService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    const env = validateEnv();
    this.apiKey = env.perplexity.apiKey || '';
  }

  async summarizeArticle(url: string, title: string): Promise<string> {
    try {
      const prompt = `あなたは日本語ネイティブで超一流のジャーナリストです。次の記事を日本の読者に対してニュース記事のような自然な日本語で要約してください。内容の要点を押さえつつ、読者に分かりやすく伝えてください。文体は文春オンラインやNHKのようなプロのニュース記事を参考にしてください。200文字以内でまとめてください。なお、要約文中に[1]や[2]などの引用番号や参照記号は含めないでください。\n\nタイトル: ${title}\nURL: ${url}`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes articles in Japanese.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Perplexity API error body:', errorBody);
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error summarizing article:', error);
      throw error;
    }
  }
} 