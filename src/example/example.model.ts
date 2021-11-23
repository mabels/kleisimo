import { Key, Kleisimo } from '../index';

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
  readonly CreatedAt: Kleisimo.DateObj;
  readonly RegisteredWithToken: Kleisimo.Obj<string>;
  readonly FirstName: Kleisimo.Obj<string>;
  readonly LastName: Kleisimo.Obj<string>;
  readonly Email: Kleisimo.Obj<string>;
  readonly Zip: Kleisimo.ZipObj;
  readonly UpdatedAt: Kleisimo.DateObj;
}

export interface ExampleKey {
  readonly CreatedAt: Key.SymetricKey;
  readonly RegisteredWithToken: Key.SymetricKey;
  readonly FirstName: Key.SymetricKey;
  readonly LastName: Key.SymetricKey;
  readonly Email: Key.SymetricKey;
  readonly Zip: Key.SymetricKey;
  readonly UpdatedAt: Key.SymetricKey;
}

export class Example extends Kleisimo.AttributeRegister<ExampleObj, ExampleKleisimo> {
  readonly Id = new Kleisimo.OpenAttribute<string>(this, 'Id', 'string');
  readonly CreatedAt: Kleisimo.DateAttribute;
  readonly RegisteredWithToken: Kleisimo.Attribute<string>;
  readonly FirstName: Kleisimo.Attribute<string>;
  readonly LastName: Kleisimo.Attribute<string>;
  readonly Email: Kleisimo.Attribute<string>;
  readonly Zip: Kleisimo.ZipAttribute;
  readonly UpdatedAt: Kleisimo.DateAttribute;

  constructor(key: ExampleKey) {
    super();
    this.CreatedAt = new Kleisimo.DateAttribute(this, 'CreatedAt', key.CreatedAt);
    this.RegisteredWithToken = new Kleisimo.Attribute<string>(
      this,
      'RegisteredWithToken',
      'string',
      key.RegisteredWithToken,
    );
    this.FirstName = new Kleisimo.Attribute<string>(this, 'FirstName', 'string', key.FirstName);
    this.LastName = new Kleisimo.Attribute<string>(this, 'LastName', 'string', key.LastName);
    this.Email = new Kleisimo.Attribute<string>(this, 'Email', 'string', key.Email);
    this.Zip = new Kleisimo.ZipAttribute(this, 'Zip', key.Email);
    this.UpdatedAt = new Kleisimo.DateAttribute(this, 'UpdatedAt', key.UpdatedAt);
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
