import unittest

from key import SymetricKey

class SymetricKeyTest(unittest.TestCase):
    def test_en_decrypt(self) -> None:
        message ="this is the only one message"
        key = SymetricKey(None, None)
        key.create()
        encrypted = key.encrypt(message.encode(), None)
        decrypted = key.decrypt(encrypted, None)
        print(decrypted)
        self.assertEqual(message,decrypted.decode())

