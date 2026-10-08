import subprocess
from pathlib import Path
from math import gcd


def get_rsa_values(filename):
    result = subprocess.run(
        [
            "openssl",
            "rsa",
            "-pubin",
            "-in",
            filename,
            "-text",
            "-noout"
        ],
        capture_output=True,
        text=True,
        check=True
    )

    lines = result.stdout.splitlines()

    modulus_lines = []
    reading_modulus = False
    exponent = None

    for line in lines:
        stripped = line.strip()

        if stripped == "Modulus:":
            reading_modulus = True
            continue

        if reading_modulus:
            if stripped.startswith("Exponent:"):
                reading_modulus = False

                exponent_text = stripped.split(":")[1].strip()

                # Example:
                # 3 (0x3)
                exponent = int(exponent_text.split()[0])
                continue

            if stripped:
                modulus_lines.append(stripped.replace(":", ""))

    modulus_hex = "".join(modulus_lines)

    # Remove OpenSSL's leading 00 byte if present
    if modulus_hex.startswith("00"):
        modulus_hex = modulus_hex[2:]

    n = int(modulus_hex, 16)

    return n, exponent


# ============================================================
# Load RSA public keys
# ============================================================

n1, e1 = get_rsa_values("public_key_1.pem")
n2, e2 = get_rsa_values("public_key_2.pem")

print("[+] Public Key 1")
print(f"    n1 = {n1}")
print(f"    e1 = {e1}")

print("\n[+] Public Key 2")
print(f"    n2 = {n2}")
print(f"    e2 = {e2}")


# ============================================================
# Find shared prime
# ============================================================

print("\n[*] Calculating GCD(n1, n2)...")

p = gcd(n1, n2)

if p == 1:
    print("[-] No common prime factor found.")
    raise SystemExit(1)

if p == n1 or p == n2:
    print("[-] Invalid RSA key relationship.")
    raise SystemExit(1)

print("[+] Shared prime factor found!")
print(f"    p = {p}")


# ============================================================
# Factor n1
# ============================================================

q1 = n1 // p

print("\n[+] Factoring n1")
print(f"    q = {q1}")

if p * q1 != n1:
    print("[-] Factorization verification failed.")
    raise SystemExit(1)

print("[+] Factorization verified.")


# ============================================================
# Calculate Euler's totient
# ============================================================

phi = (p - 1) * (q1 - 1)

print("\n[+] Calculating Euler's totient")
print(f"    phi(n) = {phi}")


# ============================================================
# Calculate private exponent
# ============================================================

print("\n[*] Calculating private exponent d...")

d = pow(e1, -1, phi)

print("[+] Private exponent calculated")
print(f"    d = {d}")


# ============================================================
# Read ciphertext
# ============================================================

ciphertext_bytes = Path("encrypted_message.bin").read_bytes()

ciphertext = int.from_bytes(
    ciphertext_bytes,
    byteorder="big"
)

print("\n[+] Encrypted message loaded")
print(f"    Size: {len(ciphertext_bytes)} bytes")


# ============================================================
# RSA decryption
# ============================================================

print("\n[*] Decrypting...")

plaintext_int = pow(
    ciphertext,
    d,
    n1
)

plaintext_length = (
    plaintext_int.bit_length() + 7
) // 8

plaintext = plaintext_int.to_bytes(
    plaintext_length,
    byteorder="big"
)


# ============================================================
# Display result
# ============================================================

print("\n")
print("=" * 60)
print("DECRYPTED MESSAGE")
print("=" * 60)

try:
    print(plaintext.decode("utf-8"))
except UnicodeDecodeError:
    print("[!] Plaintext contains non-UTF-8 bytes.")
    print(plaintext)

print("=" * 60)
