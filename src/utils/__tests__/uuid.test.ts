import { uuidv4 } from '../uuid';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('uuidv4', () => {
  it('returns an RFC 4122 version 4 UUID', () => {
    expect(uuidv4()).toMatch(UUID_V4);
  });

  it('returns a different value on each call', () => {
    const ids = new Set(Array.from({ length: 100 }, () => uuidv4()));
    expect(ids.size).toBe(100);
  });
});
