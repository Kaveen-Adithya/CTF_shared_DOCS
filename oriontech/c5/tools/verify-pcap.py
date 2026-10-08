#!/usr/bin/env python3

from pathlib import Path
import struct
import hashlib

from scapy.all import rdpcap, Raw


# ============================================================
# C5 PCAP Reconstruction Test
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
PCAP_FILE = BASE_DIR.parent / "evidence" / "network-diagnostics-041.pcapng"
SOURCE_IMAGE = BASE_DIR / "source-image-ctf.jpg"
RECOVERED_IMAGE = BASE_DIR / "recovered-source-image.jpg"

MAGIC = b"ORIONIMG"
EXPECTED_FRAMES = 10

SRC_IP = "10.77.20.15"
DST_IP = "10.77.20.70"

SRC_PORT = 45678
DST_PORT = 45679


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def main():

    print("=" * 60)
    print("C5 PCAP IMAGE RECONSTRUCTION TEST")
    print("=" * 60)

    # --------------------------------------------------------
    # Check files
    # --------------------------------------------------------

    if not PCAP_FILE.exists():
        raise SystemExit(
            f"ERROR: PCAP not found:\n{PCAP_FILE}"
        )

    if not SOURCE_IMAGE.exists():
        raise SystemExit(
            f"ERROR: Source image not found:\n{SOURCE_IMAGE}"
        )

    original = SOURCE_IMAGE.read_bytes()

    print(f"[+] Source image : {SOURCE_IMAGE}")
    print(f"[+] Source size  : {len(original):,} bytes")
    print(f"[+] Source SHA256 : {sha256(original)}")

    # --------------------------------------------------------
    # Read PCAP
    # --------------------------------------------------------

    packets = rdpcap(str(PCAP_FILE))

    print(f"[+] PCAP frames  : {len(packets)}")

    # --------------------------------------------------------
    # Extract relevant packets
    # --------------------------------------------------------

    chunks = []

    for frame_number, packet in enumerate(
        packets,
        start=1
    ):

        if not packet.haslayer("IP"):
            continue

        ip = packet["IP"]

        if ip.src != SRC_IP:
            continue

        if ip.dst != DST_IP:
            continue

        if not packet.haslayer("UDP"):
            continue

        udp = packet["UDP"]

        if udp.sport != SRC_PORT:
            continue

        if udp.dport != DST_PORT:
            continue

        if not packet.haslayer(Raw):
            continue

        raw = bytes(packet[Raw].load)

        # Header:
        # 8s B H H I I
        # 21 bytes

        if len(raw) < 21:
            raise SystemExit(
                f"ERROR: Frame {frame_number} "
                "has an invalid payload."
            )

        (
            magic,
            version,
            chunk_number,
            total_chunks,
            original_size,
            chunk_size,
        ) = struct.unpack(
            "!8sBHHII",
            raw[:21]
        )

        if magic != MAGIC:
            continue

        if total_chunks != EXPECTED_FRAMES:
            raise SystemExit(
                f"ERROR: Frame {frame_number} "
                "reports unexpected chunk count."
            )

        chunk = raw[21:]

        if len(chunk) != chunk_size:
            raise SystemExit(
                f"ERROR: Frame {frame_number} "
                "chunk size mismatch."
            )

        chunks.append(
            (
                chunk_number,
                frame_number,
                chunk
            )
        )

    # --------------------------------------------------------
    # Validate frame count
    # --------------------------------------------------------

    print(
        f"[+] Relevant frames found: {len(chunks)}"
    )

    if len(chunks) != EXPECTED_FRAMES:
        raise SystemExit(
            "ERROR: Expected exactly 10 "
            "relevant frames."
        )

    # --------------------------------------------------------
    # Sort chunks
    # --------------------------------------------------------

    chunks.sort(
        key=lambda item: item[0]
    )

    print()
    print("Recovered frame order:")

    for chunk_number, frame_number, chunk in chunks:

        print(
            f"  Chunk {chunk_number + 1}/10 "
            f"-> Wireshark frame {frame_number} "
            f"-> {len(chunk):,} bytes"
        )

    # --------------------------------------------------------
    # Check chunk numbering
    # --------------------------------------------------------

    expected_numbers = list(
        range(EXPECTED_FRAMES)
    )

    actual_numbers = [
        item[0]
        for item in chunks
    ]

    if actual_numbers != expected_numbers:
        raise SystemExit(
            "ERROR: Chunk numbering is invalid."
        )

    # --------------------------------------------------------
    # Reconstruct image
    # --------------------------------------------------------

    recovered = b"".join(
        item[2]
        for item in chunks
    )

    print()
    print(
        f"[+] Reconstructed size: "
        f"{len(recovered):,} bytes"
    )

    # --------------------------------------------------------
    # Validate original size
    # --------------------------------------------------------

    original_size_from_header = None

    # Read it from first chunk header again
    first_frame_number = chunks[0][1]

    first_packet = packets[
        first_frame_number - 1
    ]

    raw = bytes(
        first_packet[Raw].load
    )

    (
        _magic,
        _version,
        _chunk_number,
        _total_chunks,
        original_size_from_header,
        _chunk_size,
    ) = struct.unpack(
        "!8sBHHII",
        raw[:21]
    )

    if len(recovered) != original_size_from_header:
        raise SystemExit(
            "ERROR: Reconstructed size does "
            "not match protocol metadata."
        )

    # --------------------------------------------------------
    # Write recovered image
    # --------------------------------------------------------

    RECOVERED_IMAGE.write_bytes(
        recovered
    )

    print(
        f"[+] Recovered image: "
        f"{RECOVERED_IMAGE}"
    )

    # --------------------------------------------------------
    # SHA256 comparison
    # --------------------------------------------------------

    recovered_hash = sha256(recovered)

    print(
        f"[+] Recovered SHA256: "
        f"{recovered_hash}"
    )

    # --------------------------------------------------------
    # Final comparison
    # --------------------------------------------------------

    if recovered == original:

        print()
        print("=" * 60)
        print("SUCCESS")
        print("=" * 60)
        print()
        print(
            "The image reconstructed from the PCAP "
            "is byte-for-byte identical to the source image."
        )
        print()
        print("C6 network-forensics reconstruction: PASS")
        print("=" * 60)

    else:

        print()
        print("=" * 60)
        print("FAIL")
        print("=" * 60)
        print()
        print(
            "The reconstructed image does not "
            "match the source image."
        )
        print("=" * 60)

        raise SystemExit(1)


if __name__ == "__main__":
    main()
