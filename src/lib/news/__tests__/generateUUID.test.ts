import generateUUID from '../generateUUID';

describe('generateUUID', () => {
  it('returns a 36-character UUID-like string', () => {
    const id = generateUUID('test-input');
    expect(id).toHaveLength(36);
    expect(id).toMatch(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/);
  });

  it('returns the same ID for the same input', () => {
    const first = generateUUID('same-input');
    const second = generateUUID('same-input');
    expect(first).toBe(second);
  });
});
