from pathlib import Path
from math import gcd
from cryptography.hazmat.primitives.serialization import (
    load_pem_private_key,
    Encoding,
    PublicFormat,
)
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric.padding import PKCS1v15
import secrets


BASE = Path("shared-base.pem")
OUT = Path("player")

OUT.mkdir(exist_ok=True)


# --------------------------------------------------
# 1. Load the original RSA private key
# --------------------------------------------------

with open(BASE, "rb") as f:
    base_key = load_pem_private_key(f.read(), password=None)

if not isinstance(base_key, rsa.RSAPrivateKey):
    raise RuntimeError("shared-base.pem is not an RSA private key")

base_numbers = base_key.private_numbers()

p = base_numbers.p
q1 = base_numbers.q
n1 = base_numbers.public_numbers.n
e = base_numbers.public_numbers.e

print(f"[+] Original RSA key size : {base_key.key_size} bits")
print(f"[+] Public exponent       : {e}")


# --------------------------------------------------
# 2. Generate a different prime q2
# --------------------------------------------------

print("[+] Generating second RSA prime...")

while True:
    q2 = rsa.generate_private_key(
        public_exponent=e,
        key_size=1024,
    ).private_numbers().q

    if q2 != q1 and q2 != p:
        break


# --------------------------------------------------
# 3. Construct second RSA key using:
#
#       n2 = p × q2
#
# --------------------------------------------------

n2 = p * q2
phi2 = (p - 1) * (q2 - 1)

if gcd(e, phi2) != 1:
    raise RuntimeError("Invalid RSA parameters")

d2 = pow(e, -1, phi2)

dmp1 = d2 % (p - 1)
dmq1 = d2 % (q2 - 1)
iqmp = pow(q2, -1, p)

second_numbers = rsa.RSAPrivateNumbers(
    p=p,
    q=q2,
    d=d2,
    dmp1=dmp1,
    dmq1=dmq1,
    iqmp=iqmp,
    public_numbers=rsa.RSAPublicNumbers(
        e=e,
        n=n2,
    ),
)

second_key = second_numbers.private_key()


# --------------------------------------------------
# 4. Verify the shared-prime vulnerability
# --------------------------------------------------

shared = gcd(n1, n2)

print(f"[+] n1 size               : {n1.bit_length()} bits")
print(f"[+] n2 size               : {n2.bit_length()} bits")
print(f"[+] GCD(n1, n2)           : {shared.bit_length()} bits")

if shared != p:
    raise RuntimeError("Shared-prime verification FAILED")

if shared == 1:
    raise RuntimeError("Keys do not share a prime")

print("[+] Shared-prime verification: SUCCESS")


# --------------------------------------------------
# 5. Export ONLY public keys for the player
# --------------------------------------------------

public1 = base_key.public_key().public_bytes(
    Encoding.PEM,
    PublicFormat.SubjectPublicKeyInfo,
)

public2 = second_key.public_key().public_bytes(
    Encoding.PEM,
    PublicFormat.SubjectPublicKeyInfo,
)

(OUT / "public_key_1.pem").write_bytes(public1)
(OUT / "public_key_2.pem").write_bytes(public2)


# --------------------------------------------------
# 6. Create C3 encrypted message
# --------------------------------------------------

message = b"ECLIPSE{br0k3n_tru5t}\nOrionDesk Enterprise 4.2 Trial"

ciphertext = base_key.public_key().encrypt(
    message,
    PKCS1v15(),
)

(OUT / "encrypted_message.bin").write_bytes(ciphertext)


print("[+] Player public key 1 created")
print("[+] Player public key 2 created")
print("[+] Encrypted message created")
print()
print("[+] C3 generation complete.")
print()
print("Player files:")
print("    player/public_key_1.pem")
print("    player/public_key_2.pem")
print("    player/encrypted_message.bin")
