import {wrapEncrypt, Key} from './encrypt';
import crypto from 'crypto';


test('wrap encryption envelope', () => {
 const message = "this is a test";

 const key: Key = {
  id: "test-key",
  alg: "top-notch-secure",
  encrypt: (iv: string, message: string) => {iv.},
  decrypt: (iv: string, encrytped: string) => {iv.},
}
 const encryptedWrap = wrapEncrypt({message, key, reason: "test ecryption envelope mapping"});

})
