import { Key } from '../index';
import { Example, ExampleKey, ExampleObj } from './example.model';

const EXAMPLE: ExampleObj = {
  Id: 'Example.Id',
  CreatedAt: new Date('2008-09-12 12:34:44'),
  RegisteredWithToken: 'Example.RegisteredWithToken',
  FirstName: 'Example.FirstName',
  LastName: 'Example.LastName',
  Email: 'Example.Email',
  Zip: 'Example.Zip',
  UpdatedAt: new Date('2008-10-12 12:34:44'),
};

async function ExampleKey(): Promise<ExampleKey> {
  return {
    CreatedAt: await Key.SymetricKey.create({hashSeed: 'CreatedAt'}),
    RegisteredWithToken: await Key.SymetricKey.create({hashSeed: 'RegisteredWithToken'}),
    FirstName: await Key.SymetricKey.create({hashSeed: 'FirstName'}),
    LastName: await Key.SymetricKey.create({hashSeed: 'LastName'}),
    Email: await Key.SymetricKey.create({hashSeed: 'Email'}),
    Zip: await Key.SymetricKey.create({hashSeed: 'Zip'}),
    UpdatedAt: await Key.SymetricKey.create({hashSeed: 'UpdatedAt'}),
  };
}

test('example', async () => {
  const key = await ExampleKey();
  const ac0 = new Example(key);
  ac0.assign(EXAMPLE);
  expect(ac0.asUnencrypted()).toEqual(EXAMPLE);
  // console.log(ac.asEncrypted())
  const ac1 = new Example(key);
  ac1.assignEncryped(ac0.asEncrypted());
  expect(ac1.asUnencrypted()).toEqual(EXAMPLE);
});
