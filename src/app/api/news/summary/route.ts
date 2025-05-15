import { NextRequest, NextResponse } from 'next/server';
import { SummaryService } from '@/lib/services/summaryService';
import { TranslationService } from '@/lib/services/translationService';

export async function POST(req: NextRequest) {
  try {
    const { url, title, targetLang } = await req.json();
    if (!url || !title) {
      return new NextResponse(JSON.stringify({ error: 'Missing url or title' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    let summary: string;
    if (targetLang === 'ja') {
      // Summarize in Japanese
      const summaryService = new SummaryService();
      summary = await summaryService.summarizeArticle(url, title);
    } else {
      // For English or other languages, just return the title or a placeholder
      summary = title;
    }

    // Optionally, translate the summary if needed (e.g., for other languages)
    if (targetLang && targetLang !== 'ja' && targetLang !== 'en') {
      const translationService = new TranslationService();
      summary = await translationService.translateText(summary, targetLang);
    }

    return new NextResponse(JSON.stringify({ summary }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('API error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
} 