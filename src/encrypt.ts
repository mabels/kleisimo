import { Convert, Payload } from 'c5-envelope';
import { Encrypted } from '../schema/encrypted';

interface Key {
  readonly id: string;
  readonly alg: string;
  encrypt: (iv: string ,message: string) => string;
  decrypt: (iv: string, encrytped: string) => string;
}


interface WrapEncryptedProps {
  readonly message: unknown;
  readonly reason: string;
  readonly key: Key;
}

export const schema = 'https://github.com/mabels/kleisimo/schema/encrypted.ts'

export function wrapEncrypt({key, message, reason}: WrapEncryptedProps): Payload<Encrypted> {
  // use hash from json collector
  const hash = "salt"
  const encrypted: Encrypted = {
    keyId: key.id,

    encryptionMethod: key.alg,
    // TODO: sort keys to be idempotent
    message: key.encrypt(key.id + hash, JSON.stringify(message)),
    reason,
    hash
  };
  return Convert.toPayloadT(
    JSON.stringify({ data: encrypted, kind: '' })
  ) as Payload<Encrypted>;
}
