import { createHash } from 'crypto';

/**
 * Generate a deterministic UUID-like identifier from a given input string.
 * The same input will always produce the same output.
 *
 * @param input - String to generate the UUID from
 * @returns A 36-character UUID-like string
 */
export function generateUUID(input: string): string {
  const hash = createHash('sha256').update(input).digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join('-');
}

export default generateUUID;
