export class ScraperError extends Error {
  constructor(
    message: string,
    public source: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ScraperError';
  }
}

export class RateLimitError extends ScraperError {
  constructor(source: string, originalError?: Error) {
    super(`Rate limit exceeded for ${source}`, source, originalError);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends ScraperError {
  constructor(source: string, originalError?: Error) {
    super(`Network error while fetching from ${source}`, source, originalError);
    this.name = 'NetworkError';
  }
}

export class ParseError extends ScraperError {
  constructor(source: string, originalError?: Error) {
    super(`Error parsing content from ${source}`, source, originalError);
    this.name = 'ParseError';
  }
} 