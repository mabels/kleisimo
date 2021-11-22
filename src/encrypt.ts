import {
  Convert,
  HashCollector,
  Payload,
  PlainValType,
  JsonHash,
  JsonProps,
  JsonCollector,
  SVal,
  sortKeys,
} from 'c5-envelope';
import { Encrypted } from '../schema/encrypted';

export interface Key {
  readonly id: string;
  readonly alg: string;
  encrypt: (iv: string, message: string) => string;
  decrypt: (iv: string, encrytped: string) => string;
}

interface WrapEncryptedProps {
  readonly message: unknown;
  readonly reason?: string;
  readonly key: Key;
  readonly jsonProps?: JsonProps;
}

export const schema = 'https://github.com/mabels/kleisimo/blob/main/schema/encrypted.ts';

export function wrapEncrypt({ key, message, reason, jsonProps }: WrapEncryptedProps): Payload<Encrypted> {
  const jsonHash = toDataJson({ message, jsonProps });
  const hash = jsonHash.hash || "";
  const encrypted: Encrypted = {
    keyId: key.id,
    encryptionMethod: key.alg,
    message: key.encrypt(key.id + hash, jsonHash.jsonStr),
    reason,
    hash
  };
  return Convert.toPayloadT(JSON.stringify({ data: encrypted, kind: schema })) as Payload<Encrypted>;
}

function toDataJson({
  message,
  jsonProps,
  salt
}: {
  message: unknown;
  jsonProps?: Partial<JsonProps>;
  salt?: string;
}): JsonHash {
  const dataJsonStrings: string[] = [];
  const dataJsonC = new JsonCollector((part) => dataJsonStrings.push(part), jsonProps);
  const dataHashC = new HashCollector();
  dataHashC.append({ val: new PlainValType(salt || '') });
  sortKeys(message, (sval: SVal) => {
    dataHashC.append(sval);
    dataJsonC.append(sval);
  });
  return {
    jsonStr: dataJsonStrings.join(''),
    hash: dataHashC.digest()
  };
}
