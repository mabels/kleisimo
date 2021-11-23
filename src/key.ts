import * as crypto from 'crypto';
import baseX from 'base-x';

export const bs58 = baseX('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');

export interface SymetricKeyProp {
  readonly id?: string;
  readonly hashSeed?: string;
  readonly key?: string;
  readonly nounce?: string;
  readonly alg?: crypto.CipherCCMTypes;
  readonly keyLength?: number;
  readonly nounceLength?: number;
}

export class SymetricKey {
  id?: string;
  readonly hashSeed: string;
  keyBuffer?: Buffer;
  nounceBuffer?: Buffer;
  readonly alg: crypto.CipherCCMTypes;
  readonly keyLength: number;
  readonly nounceLength: number;

  constructor(prop: SymetricKeyProp) {
    this.id = prop.id;
    this.hashSeed = prop.hashSeed || crypto.randomUUID();
    this.alg = prop.alg || 'chacha20-poly1305';
    this.keyBuffer = prop.key ? Buffer.from(prop.key, 'base64') : undefined;
    this.nounceBuffer = prop.nounce ? Buffer.from(prop.nounce, 'base64') : undefined;
    this.keyLength = prop.keyLength || 32;
    this.nounceLength = prop.nounceLength || 12;
  }

  public static async create(props: SymetricKeyProp): Promise<SymetricKey> {
    return new SymetricKey(props).create();
  }

  async create(): Promise<SymetricKey> {
    return new Promise<SymetricKey>((rs, rj) => {
      crypto.randomBytes(this.keyLength, (err, key) => {
        if (err) {
          rj(err);
          return;
        }
        crypto.randomBytes(this.nounceLength, (err, nounce) => {
          if (err) {
            rj(err);
            return;
          }
          this.keyBuffer = key;
          this.nounceBuffer = nounce;
          const hash = crypto.createHash('sha256');
          hash.update(key);
          hash.update(nounce);
          this.id = hash.digest().toString('base64');
          rs(this);
        });
      });
    });
  }

  get key(): string {
    if (!this.keyBuffer) {
      throw Error('key is not set!');
    }
    const key = this.keyBuffer.toString('base64') as string;
    return key;
  }

  get nounce(): string {
    if (!this.nounceBuffer) {
      throw Error('key is not set!');
    }
    const nounce = this.nounceBuffer.toString('base64') as string;
    return nounce;
  }

  decrypt(dec: string): Buffer {
    if (!dec.startsWith('C')) {
      throw Error(`Unknown cipher:${dec}`);
    }
    dec = dec.slice('C'.length);
    const decipher = crypto.createDecipheriv(this.alg, this.key, this.nounce, {
      authTagLength: 4,
    });
    const ret = decipher.update(bs58.decode(dec));
    decipher.final();
    return ret;
  }

  encrypt(enc: string | Buffer, addition?: Buffer): string {
    const cipher = crypto.createCipheriv(this.alg, this.key, this.nounce, {
      authTagLength: 4,
    });
    let out: Buffer;
    if (typeof enc === 'string') {
      out = Buffer.from(enc);
    } else {
      out = enc;
    }
    if (addition) {
      cipher.setAAD(addition, { plaintextLength: addition?.length });
    }
    const ret = cipher.update(out);
    cipher.final();
    // C means chacha20-poly1305
    return 'C' + bs58.encode(ret);
  }

  hash(enc: string): string {
    const hasher = crypto.createHash('sha256');
    hasher.update(this.hashSeed);
    hasher.update(enc.toUpperCase().replace(/[\n\r \t]+/g, ''));
    // 'A' means sha256 upcase und replace
    return 'A' + bs58.encode(hasher.digest());
  }
}
