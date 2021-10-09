import {
  AttributeRegister,
  KleisimoAttribute,
  KleisimoDateAttribute,
  KleisimoDateObj,
  KleisimoObj,
  KleisimoZipAttribute,
  KleisimoZipObj,
  OpenAttribute,
} from '../kleisimo';
import { Key } from '../index';

export interface ExampleObj {
  readonly Id: string;
  readonly CreatedAt: Date;
  readonly RegisteredWithToken: string;
  readonly FirstName: string;
  readonly LastName: string;
  readonly Email: string;
  readonly Zip: string;
  readonly UpdatedAt: Date;
}

export interface ExampleKleisimo {
  readonly Id: string;
  readonly CreatedAt: KleisimoDateObj;
  readonly RegisteredWithToken: KleisimoObj<string>;
  readonly FirstName: KleisimoObj<string>;
  readonly LastName: KleisimoObj<string>;
  readonly Email: KleisimoObj<string>;
  readonly Zip: KleisimoZipObj;
  readonly UpdatedAt: KleisimoDateObj;
}

export interface ExampleKey {
  readonly CreatedAt: Key.Key;
  readonly RegisteredWithToken: Key.Key;
  readonly FirstName: Key.Key;
  readonly LastName: Key.Key;
  readonly Email: Key.Key;
  readonly Zip: Key.Key;
  readonly UpdatedAt: Key.Key;
}

export class Example extends AttributeRegister<ExampleObj, ExampleKleisimo> {
  readonly Id = new OpenAttribute<string>(this, 'Id', 'string');
  readonly CreatedAt: KleisimoDateAttribute;
  readonly RegisteredWithToken: KleisimoAttribute<string>;
  readonly FirstName: KleisimoAttribute<string>;
  readonly LastName: KleisimoAttribute<string>;
  readonly Email: KleisimoAttribute<string>;
  readonly Zip: KleisimoZipAttribute;
  readonly UpdatedAt: KleisimoDateAttribute;

  constructor(key: ExampleKey) {
    super();
    this.CreatedAt = new KleisimoDateAttribute(this, 'CreatedAt', key.CreatedAt);
    this.RegisteredWithToken = new KleisimoAttribute<string>(
      this,
      'RegisteredWithToken',
      'string',
      key.RegisteredWithToken,
    );
    this.FirstName = new KleisimoAttribute<string>(this, 'FirstName', 'string', key.FirstName);
    this.LastName = new KleisimoAttribute<string>(this, 'LastName', 'string', key.LastName);
    this.Email = new KleisimoAttribute<string>(this, 'Email', 'string', key.Email);
    this.Zip = new KleisimoZipAttribute(this, 'Zip', key.Email);
    this.UpdatedAt = new KleisimoDateAttribute(this, 'UpdatedAt', key.UpdatedAt);
  }
  public assign(ue: ExampleObj) {
    this.Id.set(ue.Id);

    this.CreatedAt.set(ue.CreatedAt);
    this.RegisteredWithToken.set(ue.RegisteredWithToken);
    this.FirstName.set(ue.FirstName);
    this.LastName.set(ue.LastName);
    this.Email.set(ue.Email);
    this.Zip.set(ue.Zip);
    this.UpdatedAt.set(new Date(ue.UpdatedAt));
  }

  public assignEncryped(ue: ExampleKleisimo) {
    this.Id.set(ue.Id);

    this.CreatedAt.setKleisimo(ue.CreatedAt);
    this.RegisteredWithToken.setKleisimo(ue.RegisteredWithToken);
    this.FirstName.setKleisimo(ue.FirstName);
    this.LastName.setKleisimo(ue.LastName);
    this.Email.setKleisimo(ue.Email);
    this.Zip.setKleisimo(ue.Zip);
    this.UpdatedAt.setKleisimo(ue.UpdatedAt);
  }
}
