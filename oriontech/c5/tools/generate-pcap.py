#!/usr/bin/env python3

from pathlib import Path
import random
import struct

from scapy.all import (
    Ether,
    IP,
    UDP,
    TCP,
    DNS,
    DNSQR,
    Raw,
    wrpcap,
)


# ============================================================
# C5 - Blind Relay
# PCAP Evidence Generator
#
# Input:
#   source-image-ctf.jpg
#
# Output:
#   ../evidence/network-diagnostics-041.pcapng
#
# Capture design:
#
#   90 background / decoy frames
#   10 relevant image-transfer frames
#   --------------------------------
#   100 total frames
#
# The image is divided into exactly 10 chunks.
#
# Each relevant packet contains:
#
#   ORIONIMG
#   version
#   chunk number
#   total chunks
#   original image size
#   chunk size
#   image chunk
#
# ============================================================


# ============================================================
# Paths
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

SOURCE_IMAGE = BASE_DIR / "source-image-ctf.jpg"

EVIDENCE_DIR = BASE_DIR.parent / "evidence"

OUTPUT_PCAP = (
    EVIDENCE_DIR /
    "network-diagnostics-041.pcapng"
)


# ============================================================
# Capture configuration
# ============================================================

TOTAL_IMAGE_FRAMES = 10
BACKGROUND_FRAMES = 90

TOTAL_FRAMES = (
    TOTAL_IMAGE_FRAMES +
    BACKGROUND_FRAMES
)


# ============================================================
# Suspicious internal communication
# ============================================================

IMAGE_SRC_IP = "10.77.20.15"
IMAGE_DST_IP = "10.77.20.70"

IMAGE_SRC_PORT = 45678
IMAGE_DST_PORT = 45679


# ============================================================
# Custom image-transfer protocol
# ============================================================

MAGIC = b"ORIONIMG"

VERSION = 1


# ============================================================
# Network constants
# ============================================================

# Keep UDP payload safely below normal Ethernet MTU.
MAX_IMAGE_PAYLOAD = 1200


# ============================================================
# Deterministic randomness
# ============================================================

random.seed(41041)


# ============================================================
# MAC address generator
# ============================================================

def random_mac():
    """
    Generate a locally administered unicast MAC address.
    """

    return "02:%02x:%02x:%02x:%02x:%02x" % (
        random.randint(0, 255),
        random.randint(0, 255),
        random.randint(0, 255),
        random.randint(0, 255),
        random.randint(0, 255),
    )


# ============================================================
# Background IP generator
# ============================================================

def random_internal_ip():

    return random.choice([
        "10.77.10.10",
        "10.77.10.20",
        "10.77.10.30",
        "10.77.10.40",
        "10.77.20.10",
        "10.77.20.20",
        "10.77.20.30",
        "10.77.20.40",
    ])


# ============================================================
# Background HTTP traffic
# ============================================================

def make_http_packet(
    src_ip,
    dst_ip,
    src_port,
    dst_port,
    path
):

    payload = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: orionhub.internal\r\n"
        f"User-Agent: Mozilla/5.0\r\n"
        f"Accept: */*\r\n"
        f"Connection: keep-alive\r\n"
        f"\r\n"
    ).encode()

    return (
        Ether(
            src=random_mac(),
            dst=random_mac()
        )
        /
        IP(
            src=src_ip,
            dst=dst_ip
        )
        /
        TCP(
            sport=src_port,
            dport=dst_port,
            flags="PA",
            seq=random.randint(1000, 900000),
            ack=random.randint(1000, 900000),
        )
        /
        Raw(load=payload)
    )


# ============================================================
# Background DNS traffic
# ============================================================

def make_dns_packet():

    src_ip = random_internal_ip()

    dst_ip = "10.77.20.53"

    domains = [
        "oriontech.local",
        "api.oriontech.local",
        "cdn.oriontech.local",
        "mail.oriontech.local",
        "updates.oriontech.local",
        "auth.oriontech.local",
        "status.oriontech.local",
        "fonts.example.net",
        "analytics.example.net",
    ]

    return (
        Ether(
            src=random_mac(),
            dst=random_mac()
        )
        /
        IP(
            src=src_ip,
            dst=dst_ip
        )
        /
        UDP(
            sport=random.randint(30000, 60000),
            dport=53
        )
        /
        DNS(
            rd=1,
            qd=DNSQR(
                qname=random.choice(domains)
            )
        )
    )


# ============================================================
# Background UDP traffic
# ============================================================

def make_udp_background():

    src_ip = random_internal_ip()

    dst_ip = random.choice([
        "10.77.20.50",
        "10.77.20.60",
        "10.77.20.70",
        "10.77.20.80",
    ])

    payload = random.choice([
        b"healthcheck",
        b"metrics=ok",
        b"heartbeat",
        b"service-status",
        b"cache-sync",
        b"telemetry",
        b"keepalive",
        b"worker-ready",
        b"connection-ok",
    ])

    return (
        Ether(
            src=random_mac(),
            dst=random_mac()
        )
        /
        IP(
            src=src_ip,
            dst=dst_ip
        )
        /
        UDP(
            sport=random.randint(30000, 60000),
            dport=random.choice([
                5000,
                5001,
                6000,
                7000,
                8080,
            ])
        )
        /
        Raw(load=payload)
    )


# ============================================================
# Background traffic selector
# ============================================================

def make_background_packet(index):

    packet_type = index % 5

    # DNS
    if packet_type == 0:

        return make_dns_packet()


    # OrionHub HTTP traffic
    if packet_type == 1:

        return make_http_packet(
            "10.77.10.20",
            "10.77.20.70",
            random.randint(30000, 50000),
            3005,
            random.choice([
                "/",
                "/customer-login",
                "/services",
                "/payments",
                "/invoices",
                "/support",
            ]),
        )


    # More OrionHub traffic
    if packet_type == 2:

        return make_http_packet(
            "10.77.10.30",
            "10.77.20.70",
            random.randint(30000, 50000),
            3005,
            random.choice([
                "/",
                "/services",
                "/payments",
                "/support",
            ]),
        )


    # UDP service traffic
    if packet_type == 3:

        return make_udp_background()


    # Internal HTTP service traffic
    return make_http_packet(
        "10.77.10.40",
        "10.77.20.60",
        random.randint(30000, 50000),
        random.choice([
            80,
            443,
            8080,
        ]),
        random.choice([
            "/health",
            "/status",
            "/api/status",
            "/metrics",
        ]),
    )


# ============================================================
# Split image into exactly 10 chunks
# ============================================================

def split_image_into_chunks(image_data):

    image_size = len(image_data)

    if image_size == 0:

        raise ValueError(
            "Source image is empty."
        )


    # Header size:
    #
    # 8  bytes = magic
    # 1  byte  = version
    # 2  bytes = chunk number
    # 2  bytes = total chunks
    # 4  bytes = original image size
    # 4  bytes = chunk size
    #
    # Total = 21 bytes

    header_size = 21

    maximum_chunk_size = (
        MAX_IMAGE_PAYLOAD -
        header_size
    )


    # We require the entire image to fit into
    # exactly 10 packets.

    if image_size > (
        maximum_chunk_size *
        TOTAL_IMAGE_FRAMES
    ):

        raise ValueError(
            "\nSource image is too large for "
            "exactly 10 packets.\n"
            f"Image size: {image_size} bytes\n"
            f"Maximum supported: "
            f"{maximum_chunk_size * TOTAL_IMAGE_FRAMES} bytes\n"
        )


    # Divide the image as evenly as possible.

    base_size = (
        image_size //
        TOTAL_IMAGE_FRAMES
    )

    remainder = (
        image_size %
        TOTAL_IMAGE_FRAMES
    )


    chunks = []

    offset = 0


    for index in range(
        TOTAL_IMAGE_FRAMES
    ):

        chunk_size = base_size

        if index < remainder:

            chunk_size += 1


        chunk = image_data[
            offset:
            offset + chunk_size
        ]


        chunks.append(chunk)

        offset += chunk_size


    return chunks


# ============================================================
# Build the 10 image-transfer packets
# ============================================================

def build_image_frames(image_data):

    chunks = split_image_into_chunks(
        image_data
    )

    image_size = len(image_data)

    frames = []


    for chunk_number, chunk in enumerate(
        chunks
    ):

        # ----------------------------------------------------
        # Protocol header
        # ----------------------------------------------------
        #
        # !8sBHHII
        #
        # 8s = magic
        # B  = version
        # H  = chunk number
        # H  = total chunks
        # I  = original image size
        # I  = current chunk size
        #

        header = struct.pack(
            "!8sBHHII",
            MAGIC,
            VERSION,
            chunk_number,
            TOTAL_IMAGE_FRAMES,
            image_size,
            len(chunk),
        )


        payload = (
            header +
            chunk
        )


        if len(payload) > MAX_IMAGE_PAYLOAD:

            raise ValueError(
                "Generated image packet exceeds "
                "maximum payload size."
            )


        # ----------------------------------------------------
        # Create packet
        # ----------------------------------------------------

        packet = (
            Ether(
                src="02:42:ac:11:00:15",
                dst="02:42:ac:11:00:46",
            )
            /
            IP(
                src=IMAGE_SRC_IP,
                dst=IMAGE_DST_IP,
                ttl=64,
                id=41041 + chunk_number,
            )
            /
            UDP(
                sport=IMAGE_SRC_PORT,
                dport=IMAGE_DST_PORT,
            )
            /
            Raw(
                load=payload
            )
        )


        frames.append(packet)


    return frames


# ============================================================
# Validate image frames
# ============================================================

def validate_image_frames(
    frames,
    original_image
):

    if len(frames) != TOTAL_IMAGE_FRAMES:

        raise ValueError(
            "Image frame count is not 10."
        )


    recovered_chunks = []


    for expected_index, packet in enumerate(
        frames
    ):

        raw = bytes(
            packet[Raw].load
        )


        # Header length = 21 bytes

        if len(raw) < 21:

            raise ValueError(
                "Image packet has an invalid header."
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

            raise ValueError(
                "Invalid image packet magic."
            )


        if version != VERSION:

            raise ValueError(
                "Invalid image protocol version."
            )


        if total_chunks != TOTAL_IMAGE_FRAMES:

            raise ValueError(
                "Invalid total chunk count."
            )


        if chunk_number != expected_index:

            raise ValueError(
                "Image chunks are not correctly numbered."
            )


        chunk = raw[21:]


        if len(chunk) != chunk_size:

            raise ValueError(
                "Chunk size does not match header."
            )


        recovered_chunks.append(chunk)


    recovered_image = b"".join(
        recovered_chunks
    )


    if recovered_image != original_image:

        raise ValueError(
            "Image reconstruction validation failed."
        )


# ============================================================
# Insert the 10 relevant packets
# ============================================================

def build_capture(
    background,
    image_frames
):

    # Zero-based positions.
    #
    # Wireshark frame numbers will therefore be:
    #
    # 8, 17, 28, 37, 46,
    # 57, 66, 75, 85, 97

    insertion_positions = [
        7,
        16,
        27,
        36,
        45,
        56,
        65,
        74,
        84,
        96,
    ]


    packets = []

    image_index = 0

    background_index = 0


    for frame_index in range(
        TOTAL_FRAMES
    ):

        if frame_index in insertion_positions:

            packets.append(
                image_frames[image_index]
            )

            image_index += 1

        else:

            packets.append(
                background[background_index]
            )

            background_index += 1


    if len(packets) != TOTAL_FRAMES:

        raise ValueError(
            "Final PCAP frame count is incorrect."
        )


    if image_index != TOTAL_IMAGE_FRAMES:

        raise ValueError(
            "Not all image frames were inserted."
        )


    if background_index != BACKGROUND_FRAMES:

        raise ValueError(
            "Not all background frames were inserted."
        )


    return packets, insertion_positions


# ============================================================
# Main
# ============================================================

def main():

    print("=" * 60)

    print(
        "C5 PCAP GENERATOR - BLIND RELAY"
    )

    print("=" * 60)

    print()


    # --------------------------------------------------------
    # Check source image
    # --------------------------------------------------------

    if not SOURCE_IMAGE.exists():

        raise SystemExit(
            "ERROR: Source image not found:\n"
            f"{SOURCE_IMAGE}"
        )


    image_data = (
        SOURCE_IMAGE.read_bytes()
    )


    if not image_data:

        raise SystemExit(
            "ERROR: Source image is empty."
        )


    print(
        f"[+] Source image : "
        f"{SOURCE_IMAGE}"
    )


    print(
        f"[+] Image size   : "
        f"{len(image_data):,} bytes"
    )


    # --------------------------------------------------------
    # Create evidence directory
    # --------------------------------------------------------

    EVIDENCE_DIR.mkdir(
        parents=True,
        exist_ok=True
    )


    # --------------------------------------------------------
    # Build image frames
    # --------------------------------------------------------

    try:

        image_frames = (
            build_image_frames(
                image_data
            )
        )

    except ValueError as error:

        raise SystemExit(
            f"ERROR: {error}"
        )


    print(
        f"[+] Image frames : "
        f"{len(image_frames)} "
        f"(required: 10)"
    )


    # --------------------------------------------------------
    # Validate image reconstruction
    # --------------------------------------------------------

    try:

        validate_image_frames(
            image_frames,
            image_data
        )

    except ValueError as error:

        raise SystemExit(
            f"ERROR: Image validation failed: "
            f"{error}"
        )


    print(
        "[+] Image reconstruction validation: OK"
    )


    # --------------------------------------------------------
    # Generate background
    # --------------------------------------------------------

    background = []


    for index in range(
        BACKGROUND_FRAMES
    ):

        background.append(
            make_background_packet(
                index
            )
        )


    print(
        f"[+] Background   : "
        f"{len(background)} packets"
    )


    # --------------------------------------------------------
    # Build complete capture
    # --------------------------------------------------------

    packets, positions = build_capture(
        background,
        image_frames
    )


    # --------------------------------------------------------
    # Validate final capture
    # --------------------------------------------------------

    if len(packets) != 100:

        raise SystemExit(
            "ERROR: Final capture does not contain "
            "exactly 100 frames."
        )


    # --------------------------------------------------------
    # Write PCAPNG
    # --------------------------------------------------------

    wrpcap(
        str(OUTPUT_PCAP),
        packets,
        linktype=1
    )


    # --------------------------------------------------------
    # Final report
    # --------------------------------------------------------

    print()

    print("=" * 60)

    print(
        "PCAP GENERATION COMPLETE"
    )

    print("=" * 60)


    print(
        f"Output        : "
        f"{OUTPUT_PCAP}"
    )


    print(
        f"Total frames  : "
        f"{len(packets)}"
    )


    print(
        f"Background    : "
        f"{BACKGROUND_FRAMES}"
    )


    print(
        f"Image frames  : "
        f"{TOTAL_IMAGE_FRAMES}"
    )


    print()

    print(
        "Relevant Wireshark frame numbers:"
    )


    for position in positions:

        print(
            f"  Frame {position + 1}"
        )


    print()

    print(
        "Suspicious transfer:"
    )


    print(
        f"  Source       : "
        f"{IMAGE_SRC_IP}:{IMAGE_SRC_PORT}"
    )


    print(
        f"  Destination  : "
        f"{IMAGE_DST_IP}:{IMAGE_DST_PORT}"
    )


    print()

    print(
        "Expected C6 workflow:"
    )


    print(
        "  1. Investigate the PCAP"
    )


    print(
        "  2. Identify the suspicious "
        "internal UDP communication"
    )


    print(
        "  3. Recover the 10 relevant frames"
    )


    print(
        "  4. Extract the image chunks"
    )


    print(
        "  5. Reassemble the JPEG"
    )


    print(
        "  6. Analyze the recovered image "
        "for the C6 flag"
    )


    print()

    print("=" * 60)


# ============================================================
# Entry point
# ============================================================

if __name__ == "__main__":

    main()
