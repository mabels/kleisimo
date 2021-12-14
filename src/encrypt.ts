import {
  HashCollector,
  PlainValType,
  JsonHash,
  JsonProps,
  JsonCollector,
  SVal,
  objectGraphStreamer,
} from 'object-graph-streamer';

import {
  Convert,
  Payload  }
  from 'c5-envelope';
import { Encrypted, Decrypted } from '../schema/encrypted';
import {SymetricKey} from './key';

export interface Key {
  readonly id: string;
  readonly alg: string;
  encrypt(iv: string, message: string): string;
  decrypt(encrytped: string): string;
}

interface PayloadSealProps {
  readonly message: unknown;
  readonly reason?: string;
  readonly jsonProps?: JsonProps;
}

export const schema = 'https://github.com/mabels/kleisimo/blob/main/schema/encrypted.ts';

export class PayloadSeal {
  readonly key: SymetricKey;
  constructor(key: SymetricKey) {
    this.key = key;
  }

  seal({ message, reason}: PayloadSealProps): Payload<Encrypted> {
    const jsonHash = toDataJson({ message});
    const hash = jsonHash.hash || '';
    const encrypted: Encrypted = {
      keyId: this.key.id!,
      encryptionMethod: this.key.alg,
      message: this.key.encrypt(jsonHash.jsonStr),
      nonce: "lsl",
      reason,
      hash,
    };
    return Convert.toPayloadT(JSON.stringify({ data: encrypted, kind: schema })) as Payload<Encrypted>;
  }

  unseal(encrypted: Payload<Encrypted>): Payload<Decrypted> | undefined{
    if (encrypted.kind === schema) {
      return {
        kind: schema,
        data: {...encrypted.data, message: JSON.parse(this.key.decrypt(encrypted.data.message).toString())},
      }
    }
    return undefined
  }
}

function toDataJson({
  message,
  jsonProps,
}: {
  message: unknown;
  jsonProps?: JsonProps;
}): JsonHash {
  const dataJsonStrings: string[] = [];
  const dataHashC = new HashCollector();
  const dataJsonC = new JsonCollector((part) => dataJsonStrings.push(part), jsonProps);
  objectGraphStreamer(message, (sval: SVal) => {
    dataHashC.append(sval);
    dataJsonC.append(sval);
  });
  return {
    jsonStr: dataJsonStrings.join(''),
    hash: dataHashC.digest(),
  };
}
