import * as crypto from 'crypto';
import baseX from 'base-x';

export const bs58 = baseX('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');

interface Algorithm {
  encrypt(message: Buffer, addition: Buffer | undefined, nonce: Buffer): Buffer;
  decrypt(message: Buffer, additionLength: number, nonce: Buffer): { dec: Buffer; additional?: Buffer };
}

export type supportedAlgs = 'chacha20-poly1305';

export class ChaCha20Poly1305 implements Algorithm {
  readonly opts: crypto.CipherCCMOptions = {
    authTagLength: 4,
  };
  readonly key: Buffer;
  readonly alg: crypto.CipherCCMTypes = 'chacha20-poly1305';

  constructor(key: Buffer, opts?: crypto.CipherCCMOptions) {
    this.key = key;
    if (opts) {
      this.opts = opts;
    }
  }

  encrypt(message: Buffer, addition: Buffer | undefined, nonce: Buffer): Buffer {
    const cipher = crypto.createCipheriv(this.alg, this.key, nonce, this.opts);
    // if (addition) {
      // cipher.setAAD(addition, { plaintextLength: addition?.length });
    // }
    const ret = cipher.update(message);
    cipher.final();
    return ret;
  }
  decrypt(dec: Buffer, additionLength: number, nonce: Buffer): { dec: Buffer; additional?: Buffer } {
    const decipher = crypto.createDecipheriv(this.alg, this.key, nonce, this.opts);
    const ret = decipher.update(dec);
    // decipher.setAAD(Buffer.alloc(additionLength));
    // read additional
    // decipher.
    decipher.final();
    return { dec: ret };
  }

}

export function createAlgorithm(alg: supportedAlgs, key: Buffer): Algorithm {
  if (alg === 'chacha20-poly1305') {
    return new ChaCha20Poly1305(key);
  }
  throw new Error('Invalid or unsupported algorithm');
}

export interface SymetricKeyProp {
  readonly id?: string;
  readonly hashSeed?: string;
  readonly key?: string;
  readonly nonce?: string;
  readonly alg?: crypto.CipherCCMTypes;
  readonly keyLength?: number;
  readonly nonceLength?: number;
}

export class SymetricKey {
  id?: string;
  readonly hashSeed: string;
  keyBuffer?: Buffer;
  nonceBuffer?: Buffer;
  readonly alg: crypto.CipherCCMTypes;
  readonly keyLength: number;
  readonly nonceLength: number;

  constructor(prop: SymetricKeyProp) {
    this.id = prop.id;
    this.hashSeed = prop.hashSeed || crypto.randomUUID();
    this.alg = prop.alg || 'chacha20-poly1305';
    this.keyBuffer = prop.key ? Buffer.from(prop.key, 'base64') : undefined;
    this.nonceBuffer = prop.nonce ? Buffer.from(prop.nonce, 'base64') : undefined;
    this.keyLength = prop.keyLength || 32;
    this.nonceLength = prop.nonceLength || 12;
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
        crypto.randomBytes(this.nonceLength, (err, nonce) => {
          if (err) {
            rj(err);
            return;
          }
          this.keyBuffer = key;
          this.nonceBuffer = nonce;
          const hash = crypto.createHash('sha256');
          hash.update(key);
          hash.update(nonce);
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

  get nonce(): string {
    if (!this.nonceBuffer) {
      throw Error('nonce is not set!');
    }
    const nonce = this.nonceBuffer.toString('base64') as string;
    return nonce;
  }

  decrypt(dec: string): Buffer {
    if (!dec.startsWith('C')) {
      throw Error(`Unknown cipher:${dec}`);
    }
    dec = dec.slice('C'.length);
    const decipher = crypto.createDecipheriv(
      this.alg,
      Buffer.from(this.key, 'base64'),
      Buffer.from(this.nonce, 'base64'),
      {
        authTagLength: 4,
      },
    );
    const ret = decipher.update(bs58.decode(dec));
    decipher.final();
    return ret;
  }

  encrypt(enc: string | Buffer, addition?: Buffer): string {
    const cipher = crypto.createCipheriv(this.alg, Buffer.from(this.key, 'base64'), Buffer.from(this.nonce, 'base64'), {
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
