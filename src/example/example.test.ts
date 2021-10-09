import { createKey, Key } from '../key';
import { Example, ExampleKey, ExampleObj } from './example.model';

const EXAMPLE: ExampleObj = {
  Id: 'Account.Id',
  CreatedAt: new Date('2008-09-12 12:34:44'),
  RegisteredWithToken: 'Account.RegisteredWithToken',
  FirstName: 'Account.FirstName',
  LastName: 'Account.LastName',
  Email: 'Account.Email',
  UpdatedAt: new Date('2008-10-12 12:34:44'),
};

async function accountKey(): Promise<ExampleKey> {
  return {
    CreatedAt: await createKey('CreatedAt'),
    RegisteredWithToken: await createKey('RegisteredWithToken'),
    FirstName: await createKey('FirstName'),
    LastName: await createKey('LastName'),
    Email: await createKey('Email'),
    UpdatedAt: await createKey('UpdatedAt'),
  };
}

test('example', async () => {
  const ac = new Example(await accountKey());
  ac.assign(EXAMPLE);
  expect(ac.asUnencrypted()).toEqual(EXAMPLE);
  // console.log(ac.asEncrypted())
  ac.assignEncryped(ac.asEncrypted());
  expect(ac.asUnencrypted()).toEqual(EXAMPLE);
});
