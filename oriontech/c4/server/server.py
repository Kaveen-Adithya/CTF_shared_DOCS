#!/usr/bin/env python3

from scapy.all import IP, ICMP, Raw, send, sniff
from Crypto.Cipher import AES

import hashlib
import secrets
import time

from pathlib import Path


# ============================================================
# C4 SERVER CONFIGURATION
# ============================================================

SERVER_IP = "10.77.20.10"
SERVER_INTERFACE = "c4-host"

SESSION_LIFETIME = 120
HEARTBEAT_TIMEOUT = 15


# ============================================================
# C4 TRANSPORT CONFIGURATION
#
# This is the shared transport secret used only for protecting
# the ICMP response.
#
# The final CTF binary will contain an obfuscated representation
# of the corresponding client-side value.
# ============================================================

TRANSPORT_SECRET = (
    "ORIONDESK-C4-TRANSPORT-2026"
)


# ============================================================
# FLAG FILES
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

KEY_FILE = BASE_DIR / ".flag-key"
FLAG_FILE = BASE_DIR / ".flag.enc"


# ============================================================
# ACTIVE SESSIONS
# ============================================================

sessions = {}


# ============================================================
# FLAG LOADING
# ============================================================

def load_flag_key():

    if not KEY_FILE.exists():
        raise RuntimeError(
            f"Flag key not found: {KEY_FILE}"
        )

    key_hex = KEY_FILE.read_text().strip()

    try:
        key = bytes.fromhex(key_hex)
    except ValueError as error:
        raise RuntimeError(
            "Invalid hexadecimal flag key"
        ) from error

    if len(key) not in (16, 24, 32):
        raise RuntimeError(
            "Invalid AES key length"
        )

    return key


def load_encrypted_flag():

    if not FLAG_FILE.exists():
        raise RuntimeError(
            f"Encrypted flag file not found: {FLAG_FILE}"
        )

    lines = FLAG_FILE.read_text().strip().splitlines()

    if len(lines) != 3:
        raise RuntimeError(
            "Invalid encrypted flag file"
        )

    try:

        ciphertext = bytes.fromhex(lines[0])
        nonce = bytes.fromhex(lines[1])
        tag = bytes.fromhex(lines[2])

    except ValueError as error:

        raise RuntimeError(
            "Invalid hexadecimal data in encrypted flag file"
        ) from error

    return ciphertext, nonce, tag


def decrypt_server_flag():

    key = load_flag_key()

    ciphertext, nonce, tag = load_encrypted_flag()

    cipher = AES.new(
        key,
        AES.MODE_GCM,
        nonce=nonce
    )

    return cipher.decrypt_and_verify(
        ciphertext,
        tag
    )


# ============================================================
# TRANSPORT KEY
# ============================================================

def derive_transport_key(session_token):

    material = (
        TRANSPORT_SECRET
        + ":"
        + session_token
    ).encode()

    return hashlib.sha256(material).digest()


# ============================================================
# ENCRYPT FLAG FOR CLIENT
# ============================================================

def encrypt_flag_for_client(
    flag,
    session_token
):

    key = derive_transport_key(
        session_token
    )

    nonce = secrets.token_bytes(12)

    cipher = AES.new(
        key,
        AES.MODE_GCM,
        nonce=nonce
    )

    ciphertext, tag = cipher.encrypt_and_digest(
        flag
    )

    return (
        nonce.hex(),
        ciphertext.hex(),
        tag.hex()
    )


# ============================================================
# ICMP RESPONSE
# ============================================================

def send_reply(packet, payload):

    if not packet.haslayer(IP):
        return

    destination = packet[IP].src

    reply = (
        IP(
            src=SERVER_IP,
            dst=destination
        )
        /
        ICMP(
            type="echo-reply",
            id=packet[ICMP].id,
            seq=packet[ICMP].seq
        )
        /
        Raw(
            load=payload
        )
    )

    send(
        reply,
        verbose=False
    )


# ============================================================
# PACKET HANDLER
# ============================================================

def handle_packet(packet):

    # --------------------------------------------------------
    # Basic packet validation
    # --------------------------------------------------------

    if not packet.haslayer(IP):
        return

    if not packet.haslayer(ICMP):
        return

    icmp = packet[ICMP]

    # Only ICMP Echo Requests
    if icmp.type != 8:
        return

    if not packet.haslayer(Raw):
        return

    # --------------------------------------------------------
    # Extract payload
    # --------------------------------------------------------

    try:

        payload = packet[Raw].load.decode(
            errors="ignore"
        )

    except Exception:

        return

    client_ip = packet[IP].src

    # ========================================================
    # INITIAL SESSION REQUEST
    # ========================================================

    if payload == "ORION_HELLO":

        token = secrets.token_hex(16)

        now = time.time()

        sessions[token] = {
            "created": now,
            "last_seen": now,
            "client_ip": client_ip,
        }

        print(
            f"[+] New session: {token} "
            f"| client={client_ip}"
        )

        send_reply(
            packet,
            f"SESSION:{token}".encode()
        )

        return

    # ========================================================
    # HEARTBEAT
    # ========================================================

    if payload.startswith("HEARTBEAT:"):

        token = payload.split(
            ":",
            1
        )[1].strip()

        # ----------------------------------------------------
        # Session must exist
        # ----------------------------------------------------

        if token not in sessions:

            print(
                f"[-] Invalid session: {token}"
            )

            return

        session = sessions[token]

        now = time.time()

        # ----------------------------------------------------
        # Client IP must match original session
        # ----------------------------------------------------

        if session["client_ip"] != client_ip:

            print(
                f"[-] Session source mismatch "
                f"| token={token}"
            )

            return

        # ----------------------------------------------------
        # Heartbeat must remain fresh
        # ----------------------------------------------------

        if (
            now - session["last_seen"]
            > HEARTBEAT_TIMEOUT
        ):

            print(
                f"[-] Session heartbeat timeout "
                f"| token={token}"
            )

            del sessions[token]

            return

        # ----------------------------------------------------
        # Update heartbeat
        # ----------------------------------------------------

        session["last_seen"] = now

        age = now - session["created"]

        print(
            f"[+] Heartbeat | "
            f"session={token} | "
            f"age={age:.1f}s | "
            f"client={client_ip}"
        )

        # ====================================================
        # C4 SUCCESS CONDITION
        #
        # SAME session must survive beyond 120 seconds.
        # ====================================================

        if age > SESSION_LIFETIME:

            print(
                "[+] Session survived "
                "120 seconds"
            )

            try:

                flag = decrypt_server_flag()

            except Exception as error:

                print(
                    f"[-] Flag decryption failed: "
                    f"{error}"
                )

                return

            # ------------------------------------------------
            # Encrypt flag for the validated client session.
            # ------------------------------------------------

            try:

                nonce_hex, ciphertext_hex, tag_hex = (
                    encrypt_flag_for_client(
                        flag,
                        token
                    )
                )

            except Exception as error:

                print(
                    f"[-] Flag transport encryption "
                    f"failed: {error}"
                )

                return

            # ------------------------------------------------
            # Encrypted ICMP response.
            #
            # Format:
            #
            # ORION_FLAG_V1:
            # nonce:
            # ciphertext:
            # tag
            # ------------------------------------------------

            response = (
                "ORION_FLAG_V1:"
                f"{nonce_hex}:"
                f"{ciphertext_hex}:"
                f"{tag_hex}"
            ).encode()

            send_reply(
                packet,
                response
            )

            print(
                "[+] Encrypted flag response sent"
            )

            del sessions[token]

            return

        return

    # ========================================================
    # CLIENT REPORTS EXPIRATION
    # ========================================================

    if payload.startswith("TOKEN_EXPIRED:"):

        token = payload.split(
            ":",
            1
        )[1].strip()

        if token in sessions:

            session = sessions[token]

            if session["client_ip"] == client_ip:

                del sessions[token]

                print(
                    f"[-] Client reported expiration: "
                    f"{token}"
                )

        return


# ============================================================
# SERVER STARTUP
# ============================================================

print(
    "[*] OrionDesk C4 server"
)

print(
    f"[*] Server IP: {SERVER_IP}"
)

print(
    f"[*] Interface: {SERVER_INTERFACE}"
)

print(
    f"[*] Session lifetime: "
    f"{SESSION_LIFETIME} seconds"
)

print(
    f"[*] Heartbeat timeout: "
    f"{HEARTBEAT_TIMEOUT} seconds"
)

print(
    "[*] Encrypted ICMP transport enabled"
)

print(
    "[*] ICMP listener starting..."
)


# ============================================================
# ICMP SNIFFER
# ============================================================

sniff(
    iface=SERVER_INTERFACE,
    filter="icmp",
    prn=handle_packet,
    store=False
)
