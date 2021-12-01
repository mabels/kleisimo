from dataclasses import dataclass
import uuid
import os
import re
import base58
from typing import Optional, Union

from cryptography.hazmat.primitives.ciphers.aead import (
    AESCCM,
    AESGCM,
    AESOCB3,
    ChaCha20Poly1305,
)
from cryptography.hazmat.primitives import hashes



@dataclass
class SymetricKeyProps:
    alg: str
    id: Optional[str] = None
    nonce: Optional[bytes] = None
    key: Optional[bytes] = None
    hashSeed: str = str(uuid.uuid4())
    key_length: int = 32
    nonce_length: int = 12

class SymetricKey:
    _id: Optional[str]
    _hashSeed: str
    _key: Optional[bytes]
    _nonce: Optional[bytes]
    _alg = 'chacha20-poly1305'
    _key_length: int
    _nonce_length: int

    def __init__(self, props: SymetricKeyProps):
        self._id = props.id
        self._key = props.key
        self._nonce = props.nonce
        self._hashSeed = props.hashSeed
        self._key_length = props.key_length
        self._nonce_length = props.nonce_length
        self._alg = props.alg

    def __post_init__(self):
       self.generate_key()

    def generate_key(self):
        if self._alg == "chacha20-poly1305":
            self._key = os.urandom(self._key_length)
            self._enc = ChaCha20Poly1305
        elif self._alg == "aes-{}-ccm".format(self._key_length * 8):
            self._key=AESCCM.generate_key(self._key_length)
            self._enc=AESCCM
        elif self._alg == "aes-{}-ocb".format(self._key_length * 8):
            self._key = AESOCB3.generate_key(self._key_length)
            self._enc = AESOCB3
        elif self._alg == "aes-{}-gcm".format(self._key_length * 8):
            self._key = AESGCM.generate_key(self._key_length)
            self._enc = AESGCM
        else: raise Exception("Encryption algorithm not supported".format(self._alg))

    @staticmethod
    def create(props: SymetricKeyProps):
        return SymetricKey(props).generate()

    def generate(self):
        self.generate_key()
        self._nonce = os.urandom(self._nonce_length)
        digest = hashes.Hash(hashes.SHA256())
        digest.update(self._key)
        digest.update(self._nonce)
        self._id=base58.b58encode(digest.finalize()).decode()
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

    def encrypt(self, message: bytes, addition: Optional[bytes] = None ) -> bytes:
        if isinstance(self._enc, ChaCha20Poly1305):
            return self._enc.encrypt(message, addition)
        elif isinstance(self._enc, AESCCM):
            return self._enc.encrypt(message, addition)
        elif isinstance(self._enc, AESOCB3):
            return self._enc.encrypt(message, addition)
        elif isinstance(self._enc, AESGCM):
            return self._enc.encrypt(message, addition)
        else:
            print(self._key)
            print(self._alg)
            raise Exception("Algorithm {} for encryption is not supported".format(self._alg))

    def decrypt(self, encrypted: bytes, addition: Optional[bytes] = None) -> bytes:
        if isinstance(self._enc, ChaCha20Poly1305):
            return self._enc.decrypt(encrypted, addition)
        elif isinstance(self._enc, AESCCM):
            return self._enc.decrypt(encrypted, addition)
        elif isinstance(self._enc, AESOCB3):
            return self._enc.decrypt(encrypted, addition)
        elif isinstance(self._enc, AESGCM):
            return self._enc.crypt(encrypted, addition)
        else:
            raise Exception("Algorithm {} for decryption is not supported".format(self._alg))

    def hash(self, enc: str)-> str:
        hasher = hashes.Hash(hashes.SHA256())
        hasher.update(bytes(self._hashSeed, 'utf-8'));
        stripped = re.sub(r'[\n\r\s\t]+','', enc.upper(),flags=(re.M))
        hasher.update(stripped.encode())
        # 'A' means sha256 upcase und replace
        string_hash = base58.b58encode(hasher.finalize()).decode()
        return  "A{}".format(string_hash)



