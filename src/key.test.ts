import { SymetricKey } from './key';

test('key', async () => {
    const nonce= Buffer.alloc(12, 0xff).toString('base64');
    const key= Buffer.alloc(32, 0x01).toString('base64');
  const symKey = new SymetricKey({
    hashSeed: 'Hash',
    nonce: nonce,
    key,
  });
  expect(symKey.hashSeed).toBe('Hash');
  expect({key: symKey.key, nonce: symKey.nonce}).toEqual({
    key,
    nonce: nonce,
  });
});

test('en-decrypt', async () => {
  const key = new SymetricKey({
    hashSeed: 'Hash',
    nonce: Buffer.alloc(12, 0xff).toString('base64'),
    key: Buffer.alloc(32, 0x01).toString('base64'),
  });
  await key.create();
  expect(key.encrypt('input')).not.toContain('input');
  expect(key.decrypt(key.encrypt('input')).toString()).toBe('input');
});
test('hash', async () => {
  const key = new SymetricKey({
    hashSeed: 'Hash',
    nonce: Buffer.alloc(12, 0xff).toString('base64'),
    key: Buffer.alloc(32, 0x01).toString('base64'),
  });
  await key.create();
  expect(key.hash('input')).toBe('AEJDPjgo535AwWJ2tEPt8KW91DDS9JiktH6hsQ2Xq6kLR');
  expect(key.hash(' in\nPut ')).toBe('AEJDPjgo535AwWJ2tEPt8KW91DDS9JiktH6hsQ2Xq6kLR');
});
