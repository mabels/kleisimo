import {
  AttributeRegister,
  KleisimoObj,
  ValueType,
  OpenAttribute,
  KleisimoZipAttribute,
  KleisimoDateAttribute,
  KleisimoAttribute,
} from './kleisimo';
import { Key } from './key';

class MockValueType implements ValueType<string> {
  readonly name: string = 'name';
  readonly type: string = 'string';
  key?: Key;

  constructor(name: string) {
    this.name = name;
  }

  set(t: string): string {
    throw new Error('Method not implemented.');
  }
  get(): string {
    throw new Error('Method not implemented.');
  }
  setKleisimo(t: KleisimoObj<string>): string {
    throw new Error('Method not implemented.');
  }
  getKleisimo(): KleisimoObj<string> {
    throw new Error('Method not implemented.');
  }
}

test('AttributeRegister', () => {
  const ar = new AttributeRegister();
  expect(ar.attributes).toEqual([]);
  ar.register(new MockValueType('1'));
  expect(ar.attributes).toEqual([{ name: '1', type: 'string' }]);
  ar.register(new MockValueType('2'));
  expect(ar.attributes).toEqual([
    { name: '1', type: 'string' },
    { name: '2', type: 'string' },
  ]);
});

test('Open', () => {
  const ar = new AttributeRegister();
  const op = new OpenAttribute<string>(ar, 'bla', 'test');
  expect(ar.attributes).toEqual([{ name: 'bla', type: 'test', value: undefined }]);
  expect(op.get()).toEqual(undefined);
  op.set('in');
  expect(op.get()).toEqual('in');
  expect(op.getKleisimo()).toEqual('in');
  op.setKleisimo('bla');
  expect(op.get()).toEqual('bla');
  expect(op.getKleisimo()).toEqual('bla');
});

test('KleisimoZipAttribute', () => {
  const ar = new AttributeRegister();
  const key = new Key({
    hashSeed: 'hash',
    symetric: {
        nounce: Buffer.alloc(12, 0xff).toString('base64'),
        key: Buffer.alloc(32, 0x01).toString('base64'),
      },
  });
  const op = new KleisimoZipAttribute(ar, 'bla', key);
  expect(ar.attributes).toEqual([
    { name: 'bla', type: 'string', value: undefined, key: { hashSeed: 'hash', symetric: op.key.symetric } },
  ]);
  expect(op.get()).toEqual(undefined);
  op.set('in');
  expect(op.get()).toEqual('in');
  expect(op.getKleisimo()).toEqual({ zip: 'in' });
  op.setKleisimo({ zip: 'bla' });
  expect(op.get()).toEqual('bla');
  expect(op.getKleisimo()).toEqual({ zip: 'bla' });
});

test('KleisimoDateAttribute', () => {
  const ar = new AttributeRegister();
  const key = new Key({
    hashSeed: 'hash',
    symetric: {
        nounce: Buffer.alloc(12, 0xff).toString('base64'),
        key: Buffer.alloc(32, 0x01).toString('base64'),
      },
  });
  const op = new KleisimoDateAttribute(ar, 'bla', key);
  expect(ar.attributes).toEqual([
    { name: 'bla', type: 'Date', value: undefined, key: { hashSeed: 'hash', symetric: op.key.symetric } },
  ]);
  expect(op.get()).toEqual(undefined);
  const now = new Date();
  op.set(now);
  expect(op.get()).toEqual(now);
  expect(op.getKleisimo()).toEqual({
    encrypted: key.encrypt(now.toISOString()),
    month: now.getMonth(),
    year: now.getFullYear(),
  });
  op.setKleisimo({
    month: 44,
    year: 44,
    encrypted: key.encrypt(now.toISOString()),
  });
  expect(op.get().toISOString()).toEqual(now.toISOString());
  expect(op.getKleisimo()).toEqual({
    encrypted: key.encrypt(now.toISOString()),
    month: now.getMonth(),
    year: now.getFullYear(),
  });
});

test('KleisimoAttribute<string>', () => {
  const ar = new AttributeRegister();
  const key = new Key({
    hashSeed: 'hash',
    symetric: {
    nounce: Buffer.alloc(12, 0xff).toString('base64'),
    key: Buffer.alloc(32, 0x01).toString('base64'),
  },
  });
  const op = new KleisimoAttribute<string>(ar, 'bla', 'string', key);
  expect(ar.attributes).toEqual([
    { name: 'bla', type: 'string', value: undefined, key: { hashSeed: 'hash', symetric: op.key.symetric } },
  ]);
  expect(op.get()).toEqual(undefined);
  op.set('bla');
  expect(op.get()).toEqual('bla');
  expect(op.getKleisimo()).toEqual({
    e: [key.encrypt(op.pad(op.get()))],
    h: key.hash(op.get()),
    // t: 'string',
  });
  op.setKleisimo({
    e: [key.encrypt('xxxxx')],
    h: key.hash('yyyyy'),
    // t: 'string',
  });
  expect(op.get()).toEqual('xxxxx');
  expect(op.getKleisimo()).toEqual({
    e: [key.encrypt(op.pad('xxxxx'))],
    h: key.hash('xxxxx'),
    // t: 'string',
  });
});


test('KleisimoAttribute<number>', () => {
    const ar = new AttributeRegister();
    const key = new Key({
      hashSeed: 'hash',
      symetric: {
      nounce: Buffer.alloc(12, 0xff).toString('base64'),
      key: Buffer.alloc(32, 0x01).toString('base64'),
    },
    });
    const op = new KleisimoAttribute<number>(ar, 'bla', 'number', key);
    expect(ar.attributes).toEqual([
      { name: 'bla', type: 'number', value: undefined, key: { hashSeed: 'hash', symetric: op.key.symetric } },
    ]);
    expect(op.get()).toEqual(undefined);
    op.set(4711);
    expect(op.get()).toEqual(4711);
    expect(op.getKleisimo()).toEqual({
      e: [key.encrypt(op.pad('' + op.get()))],
      h: key.hash('' + op.get()),
      // t: 'number',
    });
    op.setKleisimo({
      e: [key.encrypt('4711')],
      h: key.hash('yyyyy'),
      // t: 'number',
    });
    expect(op.get()).toEqual(4711);
    expect(op.getKleisimo()).toEqual({
      e: [key.encrypt(op.pad('4711'))],
      h: key.hash('4711'),
      // t: 'number',
    });
  });