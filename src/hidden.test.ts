import {
  AttributeRegister,
  HiddenObj,
  ValueType,
  OpenAttribute,
  HiddenZipAttribute,
  HiddenDateAttribute,
  HiddenAttribute,
} from './hidden';
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
  setHidden(t: HiddenObj<string>): string {
    throw new Error('Method not implemented.');
  }
  getHidden(): HiddenObj<string> {
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
  expect(op.getHidden()).toEqual('in');
  op.setHidden('bla');
  expect(op.get()).toEqual('bla');
  expect(op.getHidden()).toEqual('bla');
});

test('HiddenZipAttribute', () => {
  const ar = new AttributeRegister();
  const key = new Key({
    hashSeed: 'hash',
    symetric: {
        nounce: Buffer.alloc(12, 0xff).toString('base64'),
        key: Buffer.alloc(32, 0x01).toString('base64'),
      },
  });
  const op = new HiddenZipAttribute(ar, 'bla', key);
  expect(ar.attributes).toEqual([
    { name: 'bla', type: 'string', value: undefined, key: { hashSeed: 'hash', symetric: op.key.symetric } },
  ]);
  expect(op.get()).toEqual(undefined);
  op.set('in');
  expect(op.get()).toEqual('in');
  expect(op.getHidden()).toEqual({ zip: 'in' });
  op.setHidden({ zip: 'bla' });
  expect(op.get()).toEqual('bla');
  expect(op.getHidden()).toEqual({ zip: 'bla' });
});

test('HiddenDateAttribute', () => {
  const ar = new AttributeRegister();
  const key = new Key({
    hashSeed: 'hash',
    symetric: {
        nounce: Buffer.alloc(12, 0xff).toString('base64'),
        key: Buffer.alloc(32, 0x01).toString('base64'),
      },
  });
  const op = new HiddenDateAttribute(ar, 'bla', key);
  expect(ar.attributes).toEqual([
    { name: 'bla', type: 'Date', value: undefined, key: { hashSeed: 'hash', symetric: op.key.symetric } },
  ]);
  expect(op.get()).toEqual(undefined);
  const now = new Date();
  op.set(now);
  expect(op.get()).toEqual(now);
  expect(op.getHidden()).toEqual({
    encrypted: key.encrypt(now.toISOString()),
    month: now.getMonth(),
    year: now.getFullYear(),
  });
  op.setHidden({
    month: 44,
    year: 44,
    encrypted: key.encrypt(now.toISOString()),
  });
  expect(op.get().toISOString()).toEqual(now.toISOString());
  expect(op.getHidden()).toEqual({
    encrypted: key.encrypt(now.toISOString()),
    month: now.getMonth(),
    year: now.getFullYear(),
  });
});

test('HiddenAttribute<string>', () => {
  const ar = new AttributeRegister();
  const key = new Key({
    hashSeed: 'hash',
    symetric: {
    nounce: Buffer.alloc(12, 0xff).toString('base64'),
    key: Buffer.alloc(32, 0x01).toString('base64'),
  },
  });
  const op = new HiddenAttribute<string>(ar, 'bla', 'string', key);
  expect(ar.attributes).toEqual([
    { name: 'bla', type: 'string', value: undefined, key: { hashSeed: 'hash', symetric: op.key.symetric } },
  ]);
  expect(op.get()).toEqual(undefined);
  op.set('bla');
  expect(op.get()).toEqual('bla');
  expect(op.getHidden()).toEqual({
    e: [key.encrypt(op.pad(op.get()))],
    h: key.hash(op.get()),
    // t: 'string',
  });
  op.setHidden({
    e: [key.encrypt('xxxxx')],
    h: key.hash('yyyyy'),
    // t: 'string',
  });
  expect(op.get()).toEqual('xxxxx');
  expect(op.getHidden()).toEqual({
    e: [key.encrypt(op.pad('xxxxx'))],
    h: key.hash('xxxxx'),
    // t: 'string',
  });
});


test('HiddenAttribute<number>', () => {
    const ar = new AttributeRegister();
    const key = new Key({
      hashSeed: 'hash',
      symetric: {
      nounce: Buffer.alloc(12, 0xff).toString('base64'),
      key: Buffer.alloc(32, 0x01).toString('base64'),
    },
    });
    const op = new HiddenAttribute<number>(ar, 'bla', 'number', key);
    expect(ar.attributes).toEqual([
      { name: 'bla', type: 'number', value: undefined, key: { hashSeed: 'hash', symetric: op.key.symetric } },
    ]);
    expect(op.get()).toEqual(undefined);
    op.set(4711);
    expect(op.get()).toEqual(4711);
    expect(op.getHidden()).toEqual({
      e: [key.encrypt(op.pad('' + op.get()))],
      h: key.hash('' + op.get()),
      // t: 'number',
    });
    op.setHidden({
      e: [key.encrypt('4711')],
      h: key.hash('yyyyy'),
      // t: 'number',
    });
    expect(op.get()).toEqual(4711);
    expect(op.getHidden()).toEqual({
      e: [key.encrypt(op.pad('4711'))],
      h: key.hash('4711'),
      // t: 'number',
    });
  });