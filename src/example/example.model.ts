import { AttributeRegister, HiddenAttribute, HiddenDateAttribute, HiddenDateObj, HiddenObj, HiddenZipAttribute, HiddenZipObj, OpenAttribute } from '../hidden';
import { Key } from '../key';

export interface ExampleObj {
  readonly Id: string;
  readonly CreatedAt: Date;
  readonly RegisteredWithToken: string;
  readonly FirstName: string;
  readonly LastName: string;
  readonly Email: string;
  readonly UpdatedAt: Date;
}

export interface ExampleHidden {
  readonly Id: string;
  readonly CreatedAt: HiddenDateObj;
  readonly RegisteredWithToken: HiddenObj<string>;
  readonly FirstName: HiddenObj<string>;
  readonly LastName: HiddenObj<string>;
  readonly Email: HiddenObj<string>;
  readonly UpdatedAt: HiddenDateObj;
}

export interface ExampleKey {
  readonly CreatedAt: Key;
  readonly RegisteredWithToken: Key;
  readonly FirstName: Key;
  readonly LastName: Key;
  readonly Email: Key;
  readonly UpdatedAt: Key;
}

export class Example extends AttributeRegister<ExampleObj, ExampleHidden> {
  readonly Id = new OpenAttribute<string>(this, 'Id', 'string');
  readonly CreatedAt: HiddenDateAttribute;
  readonly RegisteredWithToken: HiddenAttribute<string>;
  readonly FirstName: HiddenAttribute<string>;
  readonly LastName: HiddenAttribute<string>;
  readonly Email: HiddenAttribute<string>;
  readonly UpdatedAt: HiddenDateAttribute;

  constructor(key: ExampleKey) {
    super();
    this.CreatedAt = new HiddenDateAttribute(this, 'CreatedAt', key.CreatedAt);
    this.RegisteredWithToken = new HiddenAttribute<string>(this, 'RegisteredWithToken', 'string', key.RegisteredWithToken);
    this.FirstName = new HiddenAttribute<string>(this, 'FirstName', 'string', key.FirstName);
    this.LastName = new HiddenAttribute<string>(this, 'LastName', 'string', key.LastName);
    this.Email = new HiddenAttribute<string>(this, 'Email', 'string', key.Email);
    this.UpdatedAt = new HiddenDateAttribute(this, 'UpdatedAt', key.UpdatedAt);
  }
  public assign(ue: ExampleObj) {
    this.Id.set(ue.Id);

    this.CreatedAt.set(ue.CreatedAt);
    this.RegisteredWithToken.set(ue.RegisteredWithToken);
    this.FirstName.set(ue.FirstName);
    this.LastName.set(ue.LastName);
    this.Email.set(ue.Email);
    this.UpdatedAt.set(new Date(ue.UpdatedAt));
  }

  public assignEncryped(ue: ExampleHidden) {
    this.Id.set(ue.Id);

    this.CreatedAt.setHidden(ue.CreatedAt);
    this.RegisteredWithToken.setHidden(ue.RegisteredWithToken);
    this.FirstName.setHidden(ue.FirstName);
    this.LastName.setHidden(ue.LastName);
    this.Email.setHidden(ue.Email);
    this.UpdatedAt.setHidden(ue.UpdatedAt);
  }

  
}
