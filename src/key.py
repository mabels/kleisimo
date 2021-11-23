import os
import typing

from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305


class SymetricKey:

    def __init__(self,nounce: typing.Optional[bytes], key:
                 typing.Optional[bytes]):
        self._key = key
        self._nonce = nounce

    def create(self) -> None:
        self._key = ChaCha20Poly1305.generate_key()
        self._nonce = os.urandom(12)
        self._chacha = ChaCha20Poly1305(self._key)

    def get_key(self) -> bytes:
        if self._key is None:
            raise Exception("key is not set")
        return self._key

    def get_nonce(self) -> bytes:
        if self._nonce is None:
            raise Exception("nonce is not set")
        return self._nonce

    def encrypt(self, message: bytes, addition: typing.Optional[bytes] ) -> bytes:
        return self._chacha.encrypt(self.get_nonce(), message, addition)

    def decrypt(self, encrypted: bytes, addition: typing.Optional[bytes] ) -> bytes:
        return self._chacha.decrypt(self.get_nonce(), encrypted, addition)




