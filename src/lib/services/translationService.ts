import { TranslationServiceClient } from '@google-cloud/translate';
import { supabase } from '../supabase/client';

// Initialize Google Cloud Translation client
const translationClient = new TranslationServiceClient({
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

export class TranslationService {
  private supabase;

  constructor() {
    this.supabase = supabase;
  }

  /**
   * Translate text from English to Japanese
   */
  async translateText(text: string): Promise<string> {
    try {
      const [response] = await translationClient.translateText({
        parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/global`,
        contents: [text],
        mimeType: 'text/plain',
        sourceLanguageCode: 'en',
        targetLanguageCode: 'ja',
      });

      return response.translations?.[0]?.translatedText || '';
    } catch (error) {
      console.error('Error translating text:', error);
      throw error;
    }
  }

  /**
   * Translate a news item and update the database
   */
  async translateNewsItem(newsItemId: string): Promise<void> {
    try {
      // Get the news item
      const { data: newsItem, error: fetchError } = await this.supabase
        .from('news_items')
        .select('*')
        .eq('id', newsItemId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!newsItem) {
        throw new Error('News item not found');
      }

      // Skip if already translated
      if (newsItem.translation_status === 'completed') {
        return;
      }

      // Update status to pending
      await this.supabase
        .from('news_items')
        .update({ translation_status: 'pending' })
        .eq('id', newsItemId);

      try {
        // Translate title and summary
        const [translatedTitle, translatedSummary] = await Promise.all([
          this.translateText(newsItem.title),
          newsItem.summary ? this.translateText(newsItem.summary) : Promise.resolve(''),
        ]);

        // Update the news item with translations
        const { error: updateError } = await this.supabase
          .from('news_items')
          .update({
            translated_title: translatedTitle,
            translated_summary: translatedSummary,
            translation_status: 'completed',
            translated_at: new Date().toISOString(),
          })
          .eq('id', newsItemId);

        if (updateError) {
          throw updateError;
        }
      } catch (error) {
        // Update status to failed if translation fails
        await this.supabase
          .from('news_items')
          .update({ translation_status: 'failed' })
          .eq('id', newsItemId);
        throw error;
      }
    } catch (error) {
      console.error('Error translating news item:', error);
      throw error;
    }
  }

  /**
   * Get translated content for a news item
   */
  async getTranslatedContent(newsItemId: string): Promise<{
    title: string;
    summary: string | null;
  }> {
    try {
      const { data: newsItem, error } = await this.supabase
        .from('news_items')
        .select('translated_title, translated_summary, translation_status')
        .eq('id', newsItemId)
        .single();

      if (error) {
        throw error;
      }

      if (!newsItem) {
        throw new Error('News item not found');
      }

      // If translation is pending or failed, try to translate
      if (newsItem.translation_status !== 'completed') {
        await this.translateNewsItem(newsItemId);
        // Fetch again after translation
        const { data: updatedItem } = await this.supabase
          .from('news_items')
          .select('translated_title, translated_summary')
          .eq('id', newsItemId)
          .single();

        return {
          title: updatedItem?.translated_title || '',
          summary: updatedItem?.translated_summary || null,
        };
      }

      return {
        title: newsItem.translated_title || '',
        summary: newsItem.translated_summary || null,
      };
    } catch (error) {
      console.error('Error getting translated content:', error);
      throw error;
    }
  }
} 