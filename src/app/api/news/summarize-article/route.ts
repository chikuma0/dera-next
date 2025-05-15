import { NextResponse } from 'next/server';
import { validateEnv } from '@/lib/config/env';

export async function POST(request: Request) {
  try {
    const { url, title } = await request.json();
    const env = validateEnv();

    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.perplexity.apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar-medium-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes articles in Japanese.'
          },
          {
            role: 'user',
            content: `Please provide a concise summary of the following article in Japanese:
Title: ${title}
URL: ${url}

Focus on the key points and main takeaways. Keep the summary under 200 characters.`
          }
        ],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content.trim();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing article:', error);
    return NextResponse.json(
      { error: 'Failed to summarize article' },
      { status: 500 }
    );
  }
} 