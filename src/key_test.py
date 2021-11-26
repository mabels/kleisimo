import unittest

from key import SymetricKey, SymetricKeyProps


class SymetricKeyTest(unittest.TestCase):
    def test_en_decrypt(self) -> None:
        message ="this is the only one message"
        key = SymetricKey.create(SymetricKeyProps())
        encrypted = key.encrypt(message.encode(), None)
        decrypted = key.decrypt(encrypted, None)
        print(decrypted)
        self.assertEqual(message,decrypted.decode())


    def test_hash(self) -> None:
        key_props = SymetricKeyProps(
            hashSeed= 'Hash',
            nonce = bytes('////////////', "utf-8"),
            key = bytes('AQEBAQEBAQEBAQEB', "utf-8"),
        )
            # nonce= Buffer.alloc(12, 0xff).toString('base64'),
            # key= Buffer.alloc(32, 0x01).toString('base64'),
        key = SymetricKey.create(key_props)
        self.assertEqual(key.hash('input'), 'AEJDPjgo535AwWJ2tEPt8KW91DDS9JiktH6hsQ2Xq6kLR')
        self.assertEqual(key.hash(' in\nPut '),'AEJDPjgo535AwWJ2tEPt8KW91DDS9JiktH6hsQ2Xq6kLR')
