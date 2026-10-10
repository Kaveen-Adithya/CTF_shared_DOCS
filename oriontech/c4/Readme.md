Here is a clear and simple `README.md` for the provided C code.

---

# OrionDesk ICMP Client

A lightweight, raw-socket C application designed to communicate with a designated server using **ICMP (Ping) packets** as a covert or alternative transport layer. It establishes a session, sends periodic heartbeats, and securely handles/decrypts an encrypted flag response using **AES-256-GCM** and **SHA-256**.

---

## Features

* **ICMP Tunneling / Echo Request-Reply:** Crafts raw ICMP Echo packets (`ORION_HELLO`, `HEARTBEAT`, `TOKEN_EXPIRED`) with custom identifiers, sequence numbers, and manual IP checksum calculations.
* **Session Management:** Automatically requests a session token on startup and maintains it via regular heartbeat intervals (`5 seconds`).
* **Cryptographic Security:** Derives transport encryption keys using **SHA-256** (combining a hardcoded secret and the session token) and decrypts incoming payload responses protected by **AES-256-GCM**.
* **Timeout & Error Handling:** Utilizes `select()` for non-blocking network monitoring with built-in response validation.

---

## Requirements

* **OS:** Linux (requires raw socket privileges / root access).
* **Libraries:** OpenSSL (`libcrypto` for EVP/AES-GCM and SHA-256).
* **Compiler:** GCC or any standard C compiler supporting C99.

---

## Compilation & Usage

### 1. Install Dependencies (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install build-essential libssl-dev

```

### 2. Compile the Source Code

Save the code into a file named `client.c`, then compile it linking against the OpenSSL crypto library:

```bash
gcc -O2 client.c -o client -lssl -lcrypto

```

### 3. Run the Application

Because the program uses raw sockets (`SOCK_RAW`, `IPPROTO_ICMP`), it must be executed with root or administrator privileges:

```bash
sudo ./client

```

---

## Configuration

You can modify the following macros at the top of the code to suit your environment:

* `SERVER_IP`: Target server IPv4 address (default: `10.77.20.10`).
* `SESSION_SECONDS`: Total lifetime duration of the session before expiration (default: `120` seconds).
* `HEARTBEAT_SECONDS`: Interval between keep-alive heartbeats (default: `5` seconds).