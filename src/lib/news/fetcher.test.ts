import { getLatestNews } from './fetcher';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('getLatestNews', () => {
  it('returns only articles published within the lookback window', async () => {
    const now = new Date('2024-01-02T00:00:00Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    process.env.NEWS_LOOKBACK_HOURS = '24';

    const articles = [
      {
        id: '1',
        title: 'Recent',
        url: 'http://a',
        source: 'test',
        published_date: new Date(now - 60 * 60 * 1000).toISOString(),
        language: 'en',
        importance_score: 1,
        created_at: new Date(now - 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now - 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        title: 'Old',
        url: 'http://b',
        source: 'test',
        published_date: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
        language: 'en',
        importance_score: 1,
        created_at: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const builder: any = {
      select: jest.fn(() => builder),
      eq: jest.fn(() => builder),
      gte: jest.fn((field: string, value: string) => {
        builder._gteValue = value;
        return builder;
      }),
      order: jest.fn(() => builder),
      limit: jest.fn(async () => {
        const since = new Date(builder._gteValue);
        return {
          data: articles.filter(a => new Date(a.published_date) >= since),
          error: null,
        };
      }),
    };

    const client: any = { from: jest.fn(() => builder) };
    (createClient as jest.Mock).mockReturnValue(client);

    const result = await getLatestNews('en');

    expect(builder.gte).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});

