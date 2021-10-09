import { Key } from './key';

export interface HiddenObj<T> {
  readonly e: string[];
  readonly h: string;
  // readonly t: string;
}

export interface ValueType<T, H = HiddenObj<T>> {
  readonly name: string;
  readonly type: string;
  key?: Key;
  set(t: T): T;
  get(): T;
  setHidden(t: H): T;
  getHidden(): H;
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
      ret[a.name] = a.get() 
      return ret;
    }, {} as Record<string, unknown>) as unknown as O;
  }

  public asEncrypted(): H {
    return this.attributes.reduce((ret, a) => {
      ret[a.name] = a.getHidden() 
      return ret;
    }, {} as Record<string, unknown>) as unknown as H;
  }
}

export class HiddenAttribute<T> implements ValueType<T> {
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
  setHidden(t: HiddenObj<T>): T {
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
          throw Error(`unknown type: ${this.type}`)
    }
    return this.value;
  }
  pad(p: string): Buffer {
    let padlen = p.length;
    if (p.length % 8 !== 0) {
      padlen += 8 - (p.length % 8);
    }
    const o = Buffer.alloc(padlen, 0);
    o.write(p, 'utf-8')
    return o;
  }
  getHidden(): HiddenObj<T> {
    const v = '' + this.value;
    // pad
    return {
      e: [this.key.encrypt(this.pad(v))],
      h: this.key.hash(v),
      // t: this.type
    }
  }
  // asHiddenValue): HiddenValue {
  // }
}

export interface HiddenDateObj {
  month: number;
  year: number;
  encrypted: string
}

export class HiddenDateAttribute implements ValueType<Date, HiddenDateObj> {
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
    return this.value
  }
  setHidden(t: HiddenDateObj): Date {
    this.value = new Date(this.key.decrypt(t.encrypted).toString())
    return this.value
  }
  getHidden(): HiddenDateObj {
    return {
      month: this.value.getMonth(),
      year: this.value.getFullYear(),
      encrypted: this.key.encrypt(this.value.toISOString())
    }
  }
  set(t: Date): Date {
    this.value = t;
    return t;
  }
}

export interface HiddenZipObj {
  readonly zip: string;
}

export class HiddenZipAttribute implements ValueType<string, HiddenZipObj> {
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
  setHidden(t: HiddenZipObj): string {
    this.value = t.zip;
    return this.value;
  }
  getHidden(): HiddenZipObj {
    return {
      zip: this.value
    }
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

  getHidden(): T {
    return this.value;
  }
  setHidden(t: T): T {
    this.value = t;
    return this.value;
  }
  // asHiddenValue): HiddenValue {
  // }
}
