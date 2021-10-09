import * as crypto from 'crypto';

export interface KeyProp {
  readonly hashSeed: string;
  readonly symetric: {
    key: string;
    nounce: string;
  };
}

export function createKey(seed: string): Promise<Key> {
  return new Promise<Key>((rs, rj) => {
    crypto.randomBytes(32, (err, key) => {
      if (err) {
        rj(err);
        return;
      }
      crypto.randomBytes(12, (err, nounce) => {
        if (err) {
          rj(err);
          return;
        }
        rs(
          new Key({
            hashSeed: seed,
            symetric: {
              key: key.toString('base64'),
              nounce: nounce.toString('base64'),
            },
          }),
        );
      });
    });
  });
}

export class Key {
  readonly hashSeed: string;
  readonly symetric: {
    key: Buffer;
    nounce: Buffer;
  };

  constructor(prob: KeyProp) {
    this.hashSeed = prob.hashSeed;
    this.symetric = {
      key: Buffer.from(prob.symetric.key, 'base64'),
      nounce: Buffer.from(prob.symetric.nounce, 'base64'),
    };
  }

  decrypt(dec: string): Buffer {
    let decipher = crypto.createDecipheriv('chacha20-poly1305', this.symetric.key, this.symetric.nounce, {
      authTagLength: 4,
    });
    const ret = decipher.update(Buffer.from(dec, 'base64'));
    decipher.final();
    return ret;
  }
  encrypt(enc: string| Buffer): string {

    const cipher = crypto.createCipheriv('chacha20-poly1305', this.symetric.key, this.symetric.nounce, {
      authTagLength: 4,
    });
    let out: Buffer;
    if (typeof enc === 'string') {
      out = Buffer.from(enc);
    } else {
      out = enc
    }
    const ret = cipher.update(out);
    cipher.final();
    return ret.toString('base64');
  }
  hash(enc: string): string {
    const hasher = crypto.createHash('sha256');
    hasher.update(this.hashSeed);
    hasher.update(enc.toUpperCase().replace(/[\n\r \t]+/g, ''));
    return hasher.digest('base64');
  }
}
