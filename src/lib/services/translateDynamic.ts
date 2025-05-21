import { SonarWeeklyDigest, SonarDigestTopic } from './sonarDigestService';
import { TranslationService } from './translationService';

// Type alias for type safety
export type TranslatedDigest = SonarWeeklyDigest;

// Normalize language codes (e.g., zh, zh-CN, zh-Hans -> zh-CN)
function normalizeLanguageCode(lang: string): string {
  if (!lang) return 'en';
  if (lang.startsWith('zh')) return 'zh-CN';
  if (lang.startsWith('ja')) return 'ja';
  if (lang.startsWith('en')) return 'en';
  return lang;
}

// Batch translate an array of strings
async function batchTranslateText(
  texts: string[],
  sourceLang: string,
  targetLang: string,
  translator: TranslationService
): Promise<string[]> {
  if (targetLang === sourceLang) return texts;
  try {
    // Google Translate API supports batching via contents array
    const [response] = await (translator as any).translationClient.translateText({
      parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/global`,
      contents: texts,
      mimeType: 'text/plain',
      sourceLanguageCode: sourceLang,
      targetLanguageCode: targetLang,
    });
    return response.translations?.map((t: any) => t.translatedText || '') ?? texts;
  } catch (error) {
    console.error('Batch translation error:', error);
    // Fallback: return original texts
    return texts;
  }
}

// Main translation function for the digest
export async function translateDigest(
  digest: SonarWeeklyDigest,
  targetLang: string
): Promise<TranslatedDigest> {
  const normalizedLang = normalizeLanguageCode(targetLang);
  if (normalizedLang === 'en') return digest;
  const translator = new TranslationService();
  const sourceLang = 'en';

  // Collect all strings to translate
  const digestStrings = [digest.title, digest.summary];
  const topicStrings: string[] = [];
  const citationStrings: string[] = [];
  digest.topics.forEach((topic) => {
    topicStrings.push(topic.title, topic.summary, topic.viralReason, topic.valueReason, topic.insights);
    topic.citations?.forEach((citation) => {
      citationStrings.push(citation.title);
    });
  });
  // (Optional) Add top-level citations if present in future
  // if (digest.citations) { digest.citations.forEach(c => citationStrings.push(c.title)); }

  // Batch translate
  const [digestTranslated, topicsTranslated, citationsTranslated] = await Promise.all([
    batchTranslateText(digestStrings, sourceLang, normalizedLang, translator),
    batchTranslateText(topicStrings, sourceLang, normalizedLang, translator),
    batchTranslateText(citationStrings, sourceLang, normalizedLang, translator),
  ]);

  // Reconstruct topics with translated fields
  let topicIdx = 0;
  let citationIdx = 0;
  const translatedTopics: SonarDigestTopic[] = digest.topics.map((topic) => {
    const translatedTopic: SonarDigestTopic = {
      ...topic,
      title: topicsTranslated[topicIdx++],
      summary: topicsTranslated[topicIdx++],
      viralReason: topicsTranslated[topicIdx++],
      valueReason: topicsTranslated[topicIdx++],
      insights: topicsTranslated[topicIdx++],
      citations: topic.citations?.map((citation) => ({
        ...citation,
        title: citationsTranslated[citationIdx++],
      })) || [],
    };
    return translatedTopic;
  });

  return {
    ...digest,
    title: digestTranslated[0],
    summary: digestTranslated[1],
    topics: translatedTopics,
  };
} 