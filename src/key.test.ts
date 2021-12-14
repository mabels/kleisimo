import { SymetricKey, ChaCha20Poly1305 } from './key';
import {} from 'fs';

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

test('encrypt and write to file', async () => {
  const message = {"secret": "this is top secret!"};
  const key = new SymetricKey({
    id: "testKey",
    hashSeed: 'Hash',
    nonce: Buffer.alloc(12, 0xff).toString('base64'),
    key: Buffer.alloc(32, 0x01).toString('base64'),
  });
  expect(key.encrypt(JSON.stringify(message))).not.toContain('input');
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

test('cha-cha-algorithm', async () => {
  const nonce= Buffer.alloc(12, 0xff);
  const key= Buffer.alloc(32, 0x01);
  const chacha = new ChaCha20Poly1305(key);
  const message = Buffer.from("this is very secret!");
  const enc = chacha.encrypt(message, undefined, nonce);
  const decrypted = chacha.decrypt(enc, 0, nonce);
  expect(decrypted.dec).toEqual(message);
})

