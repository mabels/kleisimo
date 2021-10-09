import { Key } from './key';

export interface Obj<T> {
  readonly e: string[];
  readonly h: string;
  // readonly t: string;
}

export interface ValueType<T, H = Obj<T>> {
  readonly name: string;
  readonly type: string;
  key?: Key;
  set(t: T): T;
  get(): T;
  setKleisimo(t: H): T;
  getKleisimo(): H;
}

// export interface RegisteredValueType<T> extends ValueType<T> {
//     readonly name: string;
//     readonly type: string;
//     readonly key: Key;
// }

export class AttributeRegister<O, H> {
  public readonly attributes: ValueType<unknown, unknown>[] = [];
  // protected readonly key: Key;
  // constructor(key: Key) {
  //     this.key = key;
  // }
  register<T, H>(vt: ValueType<T, H>): void {
    this.attributes.push(vt);
  }

  public asUnencrypted(): O {
    return this.attributes.reduce((ret, a) => {
      ret[a.name] = a.get();
      return ret;
    }, {} as Record<string, unknown>) as unknown as O;
  }

  public asEncrypted(): H {
    return this.attributes.reduce((ret, a) => {
      ret[a.name] = a.getKleisimo();
      return ret;
    }, {} as Record<string, unknown>) as unknown as H;
  }
}

export class Attribute<T> implements ValueType<T> {
  readonly name: string;
  readonly type: string;
  key: Key;
  value: T;
  constructor(ar: AttributeRegister<unknown, unknown>, name: string, type: string, key: Key) {
    this.name = name;
    this.type = type;
    this.value = undefined as unknown as T;
    this.key = key;
    ar.register(this);
  }
  set(t: T): T {
    this.value = t;
    return t;
  }
  get(): T {
    return this.value;
  }
  unpad(b: string): string {
    return this.key.decrypt(b).toString('utf-8').split('\x00')[0];
  }
  setKleisimo(t: Obj<T>): T {
    const x = this.unpad(t.e[0]);
    // unpad
    switch (this.type) {
      case 'number':
        this.value = parseInt(x) as unknown as T;
        break;
      case 'string':
        this.value = x as unknown as T;
        break;
      default:
        throw Error(`unknown type: ${this.type}`);
    }
    return this.value;
  }
  pad(p: string): Buffer {
    let padlen = p.length;
    if (p.length % 8 !== 0) {
      padlen += 8 - (p.length % 8);
    }
    const o = Buffer.alloc(padlen, 0);
    o.write(p, 'utf-8');
    return o;
  }
  getKleisimo(): Obj<T> {
    const v = '' + this.value;
    // pad
    return {
      e: [this.key.encrypt(this.pad(v))],
      h: this.key.hash(v),
      // t: this.type
    };
  }
  // asKleisimoValue): KleisimoValue {
  // }
}

export interface DateObj {
  month: number;
  year: number;
  encrypted: string;
}

export class DateAttribute implements ValueType<Date, DateObj> {
  readonly name: string;
  readonly type: string;
  key: Key;
  value: Date;
  constructor(ar: AttributeRegister<unknown, unknown>, name: string, key: Key) {
    this.name = name;
    this.type = 'Date';
    this.value = undefined as unknown as Date;
    this.key = key;
    ar.register(this);
  }
  get(): Date {
    return this.value;
  }
  setKleisimo(t: DateObj): Date {
    this.value = new Date(this.key.decrypt(t.encrypted).toString());
    return this.value;
  }
  getKleisimo(): DateObj {
    return {
      month: this.value.getMonth(),
      year: this.value.getFullYear(),
      encrypted: this.key.encrypt(this.value.toISOString()),
    };
  }
  set(t: Date): Date {
    this.value = t;
    return t;
  }
}

export interface ZipObj {
  readonly zip: string;
}

export class ZipAttribute implements ValueType<string, ZipObj> {
  readonly name: string;
  readonly type: string;
  key: Key;
  value: string;
  constructor(ar: AttributeRegister<unknown, unknown>, name: string, key: Key) {
    this.name = name;
    this.type = 'string';
    this.value = undefined as unknown as string;
    this.key = key;
    ar.register(this);
  }
  get(): string {
    return this.value;
  }
  setKleisimo(t: ZipObj): string {
    this.value = t.zip;
    return this.value;
  }
  getKleisimo(): ZipObj {
    return {
      zip: this.value,
    };
  }
  set(t: string): string {
    this.value = t;
    return t;
  }
}

export class OpenAttribute<T> implements ValueType<T, T> {
  readonly name: string;
  readonly type: string;
  value: T;
  constructor(ar: AttributeRegister<unknown, unknown>, name: string, type: string) {
    this.value = undefined as unknown as T;
    this.name = name;
    this.type = type;
    ar.register(this);
  }

  key?: Key | undefined;
  set(t: T): T {
    this.value = t;
    return t;
  }

  get(): T {
    return this.value;
  }

  getKleisimo(): T {
    return this.value;
  }
  setKleisimo(t: T): T {
    this.value = t;
    return this.value;
  }
  // asKleisimoValue): KleisimoValue {
  // }
}
