from dataclasses import dataclass
from typing import Any, Optional
from key import SymetricKey
from c5_envelope import PayloadT, HashCollector, JsonCollector, JsonHash, JsonProps, sortKeys, SVal

from lang.python.encrypted import Decrypted, Encrypted
import base64
schema = 'https://github.com/mabels/kleisimo/blob/main/schema/encrypted.ts';

@dataclass
class PayloadSealProps:
    message: Any
    reason: Optional[str]
    jsonProps: Optional[JsonProps] = None


class PayloadSeal:

    def __init__(self, key: SymetricKey):
        self.key = key

    def seal(self,props: PayloadSealProps) -> PayloadT:
        key_id = self.key.id
        encryption_method = self.key._alg
        jsonHash = toDataJson(props.message)
        enc: bytes = self.key.encrypt(jsonHash.jsonStr.encode())
        encrypted = Encrypted(encryption_method, jsonHash.hash, key_id,
                              base64.b64encode(enc).decode(), props.reason)
        return PayloadT.from_dict({"kind": schema,"data": encrypted.to_dict()})

    def unseal(self, encrypted_payload: PayloadT) -> PayloadT:
        if (encrypted_payload.kind == schema):
            encrypted = Encrypted.from_dict(encrypted_payload.data)
            decrypted_message = self.key.decrypt(base64.b64decode(encrypted.message.encode()))
            decrypted = Decrypted(encrypted.encryption_method, encrypted.hash,
                                  self.key.id,
                                  decrypted_message.decode(),
                                  encrypted.reason)
            return PayloadT.from_dict({"kind": schema,
                                       "data": decrypted.to_dict()})


def toDataJson(message, jsonProps: JsonProps = JsonProps()) -> JsonHash:
    dataJsonStrings: list[str] = []
    dataJsonC = JsonCollector(lambda part: dataJsonStrings.append(part),props=jsonProps)
    dataHashC = HashCollector()

    def collect(sval: SVal):
        dataHashC.append(sval)
        dataJsonC.append(sval)

    sortKeys(message, collect)
    return JsonHash(**{
        'jsonStr': "".join(dataJsonStrings),
        'hash': dataHashC.digest() if dataHashC is not None else None
    })

