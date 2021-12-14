import base64
import unittest
import json

from key import SymetricKey, SymetricKeyProps
from encrypt import PayloadSeal, PayloadSealProps, schema
from c5_envelope import PayloadT

from lang.python.encrypted import Encrypted, Decrypted


class PayloadSealTest(unittest.TestCase):
    def test_en_decrypt(self) -> None:
        message ={'load': 'this is the only one message'}
        # key_props = SymetricKeyProps(
            # id = 'test-key',
            # alg = 'chacha20-poly1305',
            # hashSeed = 'test',
        # )
        key_props = SymetricKeyProps(
            id = 'test-key',
            hashSeed= 'Hash',
            nonce = bytes('////////////', "utf-8"),
            # key = bytes('AQEBAQEBAQEBAQEB', "utf-8"),
            key = bytes('AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB', "utf-8"),
            alg = 'chacha20-poly1305',
        )
        key = SymetricKey.create(key_props)
        payloadSeal = PayloadSeal(key)
        encrypted_payload = payloadSeal.seal(PayloadSealProps(message,nonce=key_props.nonce.decode(), reason= 'reason'))
        encrypted = Encrypted.from_dict(encrypted_payload.data)
        self.assertNotEqual(encrypted.message, message)
        self.assertEqual(encrypted.reason,'reason')
        self.assertEqual(encrypted_payload.kind,schema)
        self.assertEqual(base64.b64decode(encrypted.nonce), key_props.nonce)
        print(json.dumps(encrypted.to_dict()))
        decrypted_payload = payloadSeal.unseal(encrypted_payload)
        decrypted = Decrypted.from_dict(decrypted_payload.data)
        self.assertEqual(json.loads(decrypted.message), message)
        self.assertEqual(decrypted.reason,'reason')
        self.assertEqual(decrypted_payload.kind, schema)
        print(json.dumps(decrypted.to_dict()))
        self.assertFalse(payloadSeal.unseal(PayloadT.from_dict({ "kind":
                                                                'wurstbrot',
                                                                "data": {}})))
