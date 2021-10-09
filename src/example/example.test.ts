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
    CreatedAt: await Key.create('CreatedAt'),
    RegisteredWithToken: await Key.create('RegisteredWithToken'),
    FirstName: await Key.create('FirstName'),
    LastName: await Key.create('LastName'),
    Email: await Key.create('Email'),
    Zip: await Key.create('Zip'),
    UpdatedAt: await Key.create('UpdatedAt'),
  };
}

test('example', async () => {
  const ac = new Example(await ExampleKey());
  ac.assign(EXAMPLE);
  expect(ac.asUnencrypted()).toEqual(EXAMPLE);
  // console.log(ac.asEncrypted())
  ac.assignEncryped(ac.asEncrypted());
  expect(ac.asUnencrypted()).toEqual(EXAMPLE);
});
