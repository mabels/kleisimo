export interface Encrypted {
  readonly keyId: string;
  readonly encryptionMethod: string;
  readonly message: string;
  readonly reason?: string;
  readonly hash: string;
}
