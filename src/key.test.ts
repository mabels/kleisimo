import { Key } from './key';

test('key', () => {
  const key = new Key({
    hashSeed: 'Hash',
    symetric: {
      nounce: Buffer.alloc(12, 0xff).toString('base64'),
      key: Buffer.alloc(32, 0x01).toString('base64'),
    },
  });
  expect(key.hashSeed).toBe('Hash');
  expect(key.symetric).toEqual({
    key: key.symetric.key,
    nounce: key.symetric.nounce
  });
});

test('en-decrypt', () => {
  const key = new Key({
    hashSeed: 'Hash',
    symetric: {
      nounce: Buffer.alloc(12, 0xff).toString('base64'),
      key: Buffer.alloc(32, 0x01).toString('base64'),
    },
  });
  expect(key.encrypt('input')).not.toContain('input');
  expect(key.decrypt(key.encrypt('input')).toString()).toBe('input');
});
test('hash', () => {
  const key = new Key({
    hashSeed: 'Hash',
    symetric: {
      nounce: Buffer.alloc(12, 0xff).toString('base64'),
      key: Buffer.alloc(32, 0x01).toString('base64'),
    },
  });
  expect(key.hash('input')).toBe('xZDQwv0Y19fdCvE+5NAueSHQiJQJNugFoAKoOfe9Vbo=');
  expect(key.hash(' in\nPut ')).toBe('xZDQwv0Y19fdCvE+5NAueSHQiJQJNugFoAKoOfe9Vbo=');
});
