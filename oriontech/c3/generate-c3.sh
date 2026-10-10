#!/bin/bash

set -e

OUT="player"

rm -rf "$OUT"
mkdir -p "$OUT"

echo "[+] Generating shared RSA prime..."

# Generate the  1024-bit RSA key containing the shared prime.
openssl genrsa -3 1024 > shared-base.pem 2>/dev/null

echo "[+] Extracting RSA parameters..."

# Extract the modulus and private parameters from the base key.
openssl rsa -in shared-base.pem -text -noout > base-details.txt 2>/dev/null

echo "[+] C3 RSA material generation complete."
echo
echo "NOTE: This is only the initial generator."
echo "The final player keys will be created after verification."
