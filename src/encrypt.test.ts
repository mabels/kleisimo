import {Convert, Envelope, simpleEnvelope} from 'c5-envelope';
import {wrapEncrypt} from './encrypt';

test('wrap encryption envelope', () => {
 const message = "";

 const encryptedWrap = wrapEncrypt(message, key);

})
