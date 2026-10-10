Here is a clear and simple `README.md` for the provided Python script.

---

# RSA Shared-Prime Challenge Generator

A Python script designed to generate a cryptography CTF (Capture The Flag) challenge demonstrating the **shared-prime RSA vulnerability**. It takes an existing base RSA private key, generates a second key that shares one of the same prime factors, verifies the vulnerability via greatest common divisor (GCD), exports the public components, and creates an encrypted test message.

---

## How It Works (The Vulnerability)

In standard RSA, each modulus is generated using two unique, randomly chosen large prime numbers ($n = p \times q$). If two different RSA moduli ($n_1$ and $n_2$) accidentally share a common prime factor ($p$), anyone can instantly factor both moduli by calculating:

$$\text{GCD}(n_1, n_2) = p$$

Once $p$ is recovered, the private keys for both moduli can be easily computed, compromising the security of both keys. This script simulates that exact scenario for a puzzle or challenge.

---

## Features

* **Key Derivation & Manipulation:** Loads a base RSA private key (`shared-base.pem`) and extracts its prime factor $p$.
* **Shared-Prime Construction:** Generates a new random prime $q_2$ and pairs it with $p$ to build a second RSA keypair with modulus $n_2 = p \times q_2$.
* **Automatic Validation:** Performs a sanity check using `math.gcd(n1, n2)` to ensure the shared prime condition is precisely met.
* **Challenge Packaging:** Exports only the public keys and an encrypted sample message into a `player/` directory for distribution.

---

## Requirements

* **Python:** Version 3.8 or higher.
* **Dependencies:** The Python `cryptography` library.

---

## Setup & Usage

### 1. Install Dependencies

Install the required cryptographic package via pip:

```bash
pip install cryptography

```

### 2. Prepare the Base Key

Ensure you have a valid RSA private key named `shared-base.pem` in the same directory as the script. (You can generate one using OpenSSL if needed: `openssl genrsa -out shared-base.pem 2048`)

### 3. Run the Script

Execute the script to generate the player package:

```bash
python generate_challenge.py

```

---

## Output Files

The script automatically creates a `player/` directory containing the challenge assets:

* `player/public_key_1.pem`: The public key derived from the original base key.
* `player/public_key_2.pem`: The second public key sharing the prime factor $p$.
* `player/encrypted_message.bin`: A target message encrypted using the first public key and PKCS#1 v1.5 padding.