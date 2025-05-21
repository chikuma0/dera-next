import { ArticleService } from '@/lib/services/articleService';

describe('calculateTimeDecay', () => {
  const service = new ArticleService();
  const callDecay = (date: Date) => (service as any).calculateTimeDecay(date);

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('returns 1.2 for dates within 12 hours', () => {
    const date = new Date('2023-12-31T13:00:00Z');
    expect(callDecay(date)).toBe(1.2);
  });

  it('returns 1.0 for dates within 2 days', () => {
    const date = new Date('2023-12-30T12:00:00Z');
    expect(callDecay(date)).toBe(1.0);
  });

  it('returns 0.1 for dates over three weeks old', () => {
    const date = new Date('2023-12-09T00:00:00Z');
    expect(callDecay(date)).toBe(0.1);
  });
});
