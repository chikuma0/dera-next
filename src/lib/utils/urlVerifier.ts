/**
 * Utility function to verify if a URL is accessible
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

/**
 * Check if a URL is accessible
 * @param url The URL to check
 * @returns A promise that resolves to an object with the URL, status code, and accessibility
 */
export async function verifyUrl(url: string): Promise<{
  url: string;
  status: number;
  accessible: boolean;
  error?: string;
}> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = protocol.request(
        {
          method: 'HEAD',
          host: parsedUrl.hostname,
          path: parsedUrl.pathname + parsedUrl.search,
          timeout: 5000,
        },
        (res) => {
          resolve({
            url,
            status: res.statusCode ?? 0,
            accessible: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 400,
          });
        }
      );
      
      req.on('error', (err) => {
        resolve({
          url,
          status: 0,
          accessible: false,
          error: err.message,
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          status: 0,
          accessible: false,
          error: 'Request timed out',
        });
      });
      
      req.end();
    } catch (error) {
      resolve({
        url,
        status: 0,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

/**
 * Verify multiple URLs
 * @param urls An array of URLs to check
 * @returns A promise that resolves to an array of URL verification results
 */
export async function verifyUrls(urls: string[]): Promise<{
  url: string;
  status: number;
  accessible: boolean;
  error?: string;
}[]> {
  return Promise.all(urls.map(verifyUrl));
}
