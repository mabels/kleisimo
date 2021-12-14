from dataclasses import dataclass
import uuid
import os
import re
import base58
from typing import Optional

from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305
from cryptography.hazmat.primitives import hashes

@dataclass
class SymetricKeyProps:
    alg: str
    id: Optional[str] = None
    nonce: bytes = os.urandom(12)
    key: Optional[bytes] = None
    hashSeed: str = str(uuid.uuid4())
    key_length: int = 32
    nonce_length: int = 12

class SymetricKey:
    _id: Optional[str]
    _hashSeed: str
    _key: Optional[bytes]
    _nonce: bytes
    _key_length: int
    _nonce_length: int
    _alg = 'chacha20-poly1305'


    def __init__(self, props: SymetricKeyProps):
        self._id = props.id
        self._key = props.key
        self._hashSeed = props.hashSeed
        self._key_length = props.key_length
        self._nonce_length = props.nonce_length
        self._nonce = props.nonce

    @staticmethod
    def create(props: SymetricKeyProps):
        return SymetricKey(props).generate()

    # def generate_nonce(self, length: Optional[int] = None) -> bytes:
        # nonce_length = length if length else self._nonce_length
        # self._nonce = os.urandom(nonce_length)
        # return self._nonce

    def generate(self):
        if self._key is None:
            self._key = os.urandom(self._key_length)
        self._nonce = self._nonce if self._nonce else self.create_nonce()
        if self._id is None:
            digest = hashes.Hash(hashes.SHA256())
            digest.update(self._key)
            digest.update(self._nonce)
            self._id=base58.b58encode(digest.finalize()).decode()
        self._chacha = ChaCha20Poly1305(self._key)
        return self

    def create_nonce(self) -> bytes:
        self._nonce = os.urandom(12)
        return self.nonce

    @property
    def key(self) -> bytes:
        if self._key is None:
            raise Exception("key is not set")
        return self._key

    @property
    def id(self) -> str:
        if self._id is None:
            raise Exception("key is not set")
        return self._id

    @property
    def nonce(self) -> bytes:
        if self._nonce is None:
            raise Exception("nonce is not set")
        return self._nonce

    def encrypt(self, nonce: bytes, message: bytes, addition: Optional[bytes] = None ) -> bytes:
        return self._chacha.encrypt(nonce, message, addition)

    def decrypt(self, nonce: bytes, encrypted: bytes, addition: Optional[bytes] = None) -> bytes:
        return self._chacha.decrypt(nonce, encrypted, addition)

    def hash(self, enc: str)-> str:
        hasher = hashes.Hash(hashes.SHA256())
        hasher.update(bytes(self._hashSeed, 'utf-8'));
        stripped = re.sub(r'[\n\r\s\t]+','', enc.upper(),flags=(re.M))
        hasher.update(stripped.encode())
        # 'A' means sha256 upcase und replace
        string_hash = base58.b58encode(hasher.finalize()).decode()
        return  "A{}".format(string_hash)



