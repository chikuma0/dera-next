export const GitHubScraper = jest.fn().mockImplementation(() => ({
  fetchNews: jest.fn().mockResolvedValue([]),
  fetchNewsInternal: jest.fn().mockResolvedValue([]),
  determinePriority: jest.fn().mockReturnValue('general'),
  categorizeContent: jest.fn().mockReturnValue([])
})); 