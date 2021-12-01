import unittest
import json

from key import SymetricKey, SymetricKeyProps
from encrypt import PayloadSeal, PayloadSealProps, schema
from c5_envelope import PayloadT

from lang.python.encrypted import Encrypted, Decrypted


class PayloadSealTest(unittest.TestCase):
    def test_en_decrypt(self) -> None:
        # message = "this is a test"
        message ={'load': 'this is the only one message'}
        key_props = SymetricKeyProps(
            id = 'test-key',
            alg = 'chacha20-poly1305',
            hashSeed = 'test',
        )
        key = SymetricKey.create(key_props)
        payloadSeal = PayloadSeal(key)
        encrypted_payload = payloadSeal.seal(PayloadSealProps(message, reason= 'reason'))
        encrypted = Encrypted.from_dict(encrypted_payload.data)
        self.assertNotEqual(encrypted.message, message)
        self.assertEqual(encrypted.reason,'reason')
        self.assertEqual(encrypted_payload.kind,schema)
        decrypted_payload = payloadSeal.unseal(encrypted_payload)
        decrypted = Decrypted.from_dict(decrypted_payload.data)
        self.assertEqual(json.loads(decrypted.message), message)
        self.assertEqual(decrypted.reason,'reason')
        self.assertEqual(decrypted_payload.kind, schema)
        self.assertFalse(payloadSeal.unseal(PayloadT.from_dict({ "kind":
                                                                'wurstbrot',
                                                                "data": {}})))
