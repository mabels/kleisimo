import { schema, PayloadSeal } from './encrypt';
import { SymetricKey } from './key';
import { Encrypted } from '../schema/encrypted';

test('wrap encryption envelope', async () => {
  const message = 'this is a test';

  const key = new SymetricKey({
    id: 'test-key',
    alg: 'chacha20-poly1305',
    hashSeed: 'test',
  });

  await key.create();
  console.log(key.nounceBuffer, key.nounceBuffer!.length, key.nounce, key.nounceLength, key.nounce.length);
  const payloadSeal = new PayloadSeal(key);
  const encrypted = payloadSeal.seal({ message, reason: 'reason' });
  console.log(encrypted.data);
  expect(encrypted.data.message).not.toEqual(message);
  expect(encrypted.data.reason).toEqual('reason');
  expect(encrypted.kind).toEqual(schema);
  const decrypted = payloadSeal.unseal(encrypted);
  expect(decrypted!.data.message).toEqual(message);
  expect(decrypted!.data.reason).toEqual('reason');
  expect(decrypted!.kind).toEqual(schema);
  expect(payloadSeal.unseal({ kind: 'wurstbrot', data: {} as unknown as Encrypted })).toBeFalsy();
});
