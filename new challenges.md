# PROJECT ECLIPSE

## OrionTech Solutions — Complete CTF Challenge Design

### CTF Theme

**Project ECLIPSE** is an eight-stage penetration-testing CTF based on the investigation of a simulated compromise of **OrionTech Solutions**, a fictional IT software and services company.

The player begins with publicly available information and progressively moves through OrionTech's software ecosystem, web infrastructure, network traffic, Linux server, and isolated internal Finance network.

The challenges form a continuous attack chain:

```text
C1
Public Reconnaissance
     ↓
C2
Hidden Image / Steganography
     ↓
C3
RSA Cryptographic Weakness
     ↓
C4
Software Trial → Reverse Engineering
     ↓
C5
Web Enumeration → SSRF → Internal API
     ↓
C6
Network Forensics → Packet Reconstruction
     ↓
C7
File Upload → Linux User Access
     ↓
C8
Root Privilege Escalation → Network Pivot → Finance Vault
```

---

# Challenge 1 — Shadow Profile

## Domain

**Advanced Reconnaissance / OSINT**

## Difficulty

Moderate

## Scenario

The investigation begins with the public-facing OrionTech Solutions website.

OrionTech is a legitimate-looking IT company providing:

* Software development
* Cloud services
* Managed IT services
* Cybersecurity services
* Technical support
* Software subscriptions

The player is given the public OrionTech website and must investigate information available through public sources.

During reconnaissance, the player discovers information about an old OrionTech developer.

For example:

```text
Developer:
Daniel Perera

Position:
Senior Software Engineer

Project:
OrionHub Payment Gateway

Username:
dperera
```

The developer previously worked on an abandoned OrionTech software project.

The player eventually discovers an abandoned project page containing an image.

The image becomes the starting point for Challenge 2.

## Player Objective

Identify the developer connected to the legacy OrionHub project and locate the abandoned project artifact.

## Expected Techniques

* Website enumeration
* Search-engine investigation
* Public metadata analysis
* Username correlation
* OSINT
* Source-code repository investigation

## C1 Output

The player discovers:

```text
Abandoned OrionTech project
+
Image artifact
```

## Flag

```text
ECLIPSE{shadow_profile}
```

## Dependency

C1 → C2

---

# Challenge 2 — Fragments in Silence

## Domain

**Steganography / Digital Artifact Analysis**

## Difficulty

Moderate

## Scenario

The abandoned OrionTech project discovered during C1 contains an apparently ordinary image.

Example:

```text
legacy_orionhub.png
```

The image appears to be a normal technical image related to the old software project.

However, OrionTech's developer used the image to hide information.

The player must investigate the image.

The hidden information contains an encrypted message.

The important part is that **the encrypted message itself is the Challenge 2 flag**.

For example, the hidden content may look like:

```text
4f52494f4e7b........
```

or another intentionally encrypted/encoded representation.

The player must identify the concealment method, extract the hidden text, and recover the Challenge 2 flag.

## Player Objective

Analyze the image and recover the hidden encrypted message.

The player must determine how the message was concealed.

## Possible Techniques

* Metadata analysis
* `strings`
* Hex analysis
* Steganography analysis
* LSB extraction
* Embedded-data inspection
* Image structure analysis

## Important Design Decision

Unlike the previous design, **do not make C2 unnecessarily complicated**.

The intended chain should be:

```text
C1
 ↓
Find image
 ↓
Analyze image
 ↓
Extract hidden message
 ↓
Recover C2 flag
 ↓
Obtain clue needed for C3
```

The image can also contain a second piece of information pointing toward the RSA material used in C3.

## C2 Output

Example:

```text
Hidden encrypted message
+
RSA challenge artifact location
```

## Flag

```text
ECLIPSE{fragments_in_silence}
```

## Dependency

C1 → C2 → C3

---

# Challenge 3 — Broken Trust

## Domain

**Applied Cryptography**

## Difficulty

Moderate-Hard

## Scenario

The information recovered from the abandoned OrionTech project leads to two RSA public keys used by the company's old payment software.

Example:

```text
orion_payment_public.pem
orion_backup_public.pem
```

The keys appear to use strong RSA encryption.

However, the old developer made a serious key-generation mistake.

The two RSA moduli share a prime factor.

Conceptually:

```text
N1 = p × q1

N2 = p × q2
```

Therefore:

```text
gcd(N1, N2) = p
```

The player must identify the cryptographic implementation weakness and reconstruct the required private-key information.

The recovered private key allows the player to decrypt an encrypted message.

That message provides the information required for Challenge 4.

## Player Objective

Identify the RSA weakness, recover the private key material, decrypt the message, and obtain the Challenge 4 software information.

## Expected Techniques

* RSA analysis
* Public-key inspection
* GCD calculation
* Mathematical reasoning
* OpenSSL
* Cryptographic scripting
* File analysis

## C3 Output

The decrypted message contains:

```text
OrionTech software product
+
Trial download information
+
Challenge 4 clue
```

For example:

```text
Product:
OrionDesk Enterprise

Version:
4.2 Trial

Download:
oriondesk_trial.exe
```

## Flag

```text
ECLIPSE{broken_trust}
```

## Dependency

C2 → C3 → C4

---

# Challenge 4 — Blackbox

## Domain

**Reverse Engineering**

## Difficulty

Hard

## Scenario

OrionTech develops software products for customers.

One of its commercial products is:

### OrionDesk Enterprise

The player discovers the product through OrionTech's public software/product page.

The company offers a **trial version** of the software.

The C3 information allows the player to identify the correct product and obtain the trial version.

The trial application is intentionally designed as a CTF artifact.

For example:

```text
OrionDesk Enterprise
Version 4.2 Trial
```

The player installs or executes the software in the controlled CTF environment.

The trial version contains an intentional licensing restriction.

For example:

```text
ORIONDESK ENTERPRISE

Trial Version

Remaining:
7 days

[ Activate License ]
```

The player must reverse engineer the application to understand how the trial restriction works.

The application should **not** simply contain the flag as a plaintext string.

Instead, the licensing logic should require analysis of the compiled program.

The player discovers the internal license-validation logic and determines how the trial restriction can be bypassed.

After successfully modifying or manipulating the program in the isolated CTF environment, the software operates as a simulated lifetime/full version.

The full version reveals the Challenge 4 flag.

## Player Objective

Reverse engineer the OrionDesk trial application and bypass its simulated trial restriction to activate the lifetime version.

## Expected Techniques

* Static binary analysis
* Dynamic analysis
* Strings analysis
* Function identification
* Control-flow analysis
* Debugging
* Ghidra
* `objdump`
* `strings`
* Linux binary analysis

## Recommended Implementation

The binary should contain logic conceptually similar to:

```text
check_license()
       ↓
check_trial_status()
       ↓
validate_activation()
       ↓
show_trial_features()
```

The player must understand the control flow and modify the appropriate condition.

The flag should only become visible after the intended activation state is reached.

## C4 Output

Successful activation:

```text
ORIONDESK ENTERPRISE
LIFETIME LICENSE

License Status:
ACTIVE

ECLIPSE{blackbox}
```

## Dependency

C3 → C4

---

# Challenge 5 — Blind Relay

## Domain

**Advanced Web Application Security**

## Difficulty

Hard

## Scenario

After completing C4, the player has enough information to investigate OrionHub.

OrionHub is OrionTech's central customer and staff platform.

The application provides:

```text
Customer Login
Staff Login
Services
Payments
Invoices
Support
URL Preview
```

The player begins by enumerating the web application.

The URL Preview functionality is intentionally vulnerable in the isolated CTF environment.

The player must discover the relevant endpoint through web enumeration.

For example:

```text
/preview
/url-preview
/tools/preview
/internal/preview
```

The player can use authorized fuzzing tools such as:

```text
ffuf
```

The objective is **not simply to discover a page**.

The player must understand how the URL Preview functionality causes the server to make requests to another resource.

The player then uses the application behavior to reach an internal OrionTech API.

The internal API contains an incident record.

The player discovers a hidden endpoint and abuses an intentionally designed internal trust weakness.

The chain becomes:

```text
Web enumeration
       ↓
Find URL Preview
       ↓
Understand server-side request behavior
       ↓
Reach internal API
       ↓
Find hidden endpoint
       ↓
Exploit internal trust
       ↓
Incident record
       ↓
PCAP evidence
```

## Player Objective

Discover the URL Preview functionality, identify the internal API, find the hidden incident endpoint, and retrieve the incident evidence.

## Tools

* Burp Suite
* ffuf
* curl
* Browser developer tools
* HTTP analysis tools

## C5 Output

The incident record contains:

```text
Incident:
OT-INC-2026-041

Evidence:
eclipse_incident.pcapng
```

The player can download:

```text
eclipse_incident.pcapng
```

The incident record also contains the C5 flag.

## Flag

```text
ECLIPSE{blind_relay}
```

## Dependency

C4 → C5 → C6

---

# Challenge 6 — Echoes on the Wire

## Domain

**Network Forensics / Packet Reconstruction**

## Difficulty

Hard

## Scenario

The player now has:

```text
eclipse_incident.pcapng
```

The PCAP contains traffic captured from OrionTech's internal environment.

The capture contains normal traffic mixed with suspicious traffic.

Example protocols:

```text
DNS
HTTP
TCP
UDP
ARP
ICMP
```

During the investigation, the player notices that an image was transferred across the internal network.

The image is intentionally split across multiple network packets.

For example:

```text
Packet 101 → Image fragment 01
Packet 102 → Image fragment 02
Packet 103 → Image fragment 03
...
Packet 110 → Image fragment 10
```

The fragments do not immediately form a usable image.

The player must identify the relevant communication and reconstruct the original image.

## Player Objective

Identify the ten packets belonging to the image transfer and reconstruct the original image from the network traffic.

The recovered image contains a GPS coordinate.

For example:

```text
06°55'xx.x"N
79°5x'xx.x"E
```

The coordinates form the Challenge 6 flag/clue.

## Important Technical Design

The image should be transferred using a protocol that produces genuine packet-level evidence.

A good implementation is:

```text
Sender
   ↓
TCP/HTTP transfer
   ↓
PCAP capture
   ↓
10 relevant packets
   ↓
Reassembly
   ↓
Original image
```

This is better than simply putting ten unrelated packets into the PCAP.

The player should need to use:

* Wireshark
* Follow TCP Stream
* Export/reconstruct transferred data
* tshark
* Hex inspection

## C6 Output

Recovered image:

```text
ORIONTECH INTERNAL LOCATION

GPS:
<synthetic coordinates>
```

The coordinates reveal the C6 flag.

## Flag

```text
ECLIPSE{echoes_on_the_wire}
```

## Dependency

C5 → C6 → C7

---

# Challenge 7 — Broken Boundary

## Domain

**Web File Upload + Linux Initial Access**

## Difficulty

Hard

## Scenario

During the web enumeration performed in C5, the player discovers another obscure OrionTech page.

The page belongs to an old developer support/ticket system.

Example:

```text
/legacy/support/ticket-request
```

The page is intentionally difficult to discover.

It contains an old customer ticket submission form.

The form allows users to upload attachments.

The intended restriction says:

```text
Allowed:
PDF documents only
```

However, the upload validation is intentionally vulnerable.

The player discovers that a server-executable file can be uploaded despite the supposed PDF restriction.

The player uses the vulnerability in the isolated CTF environment to obtain a shell as a **low-privileged OrionTech user**.

For example:

```text
www-data
```

or:

```text
ticketuser
```

The player is not root.

After obtaining access, they investigate the system and find:

```text
/home/ticketuser/user.txt
```

The file contains the C7 flag.

## Player Objective

Discover the hidden legacy ticket system, identify the upload weakness, obtain low-privileged system access, and locate the user-level flag.

## Expected Skills

* Web enumeration
* File-upload security analysis
* Burp Suite
* ffuf
* HTTP request manipulation
* Linux shell
* System enumeration

## Important Isolation Requirement

The upload vulnerability must exist **only inside the CTF environment**.

The server should:

* Contain synthetic data
* Have no access to production systems
* Have no sensitive host mounts
* Have no unnecessary outbound Internet access
* Run inside the isolated challenge network

These isolation requirements are consistent with the original project design.

## C7 Output

The player obtains:

```text
Low-privileged Linux shell
+
user.txt
+
Internal server information
```

Example:

```text
ECLIPSE{broken_boundary}
```

The system also contains information that becomes useful for C8.

## Dependency

C6 → C7 → C8

---

# Challenge 8 — Zero Hour

## Domain

**Linux Privilege Escalation + Network Pivoting**

## Difficulty

Hard / Capstone

## Scenario

The player now has low-privileged access to the OrionTech Linux server.

The player investigates the server.

They discover an OrionTech backup mechanism:

```text
/opt/orion/backup/backup.sh
```

The backup process is executed automatically by root every five minutes.

Conceptually:

```text
root
 │
 └── cron
      │
      └── backup.sh
```

However, the script has an intentional permission weakness.

The low-privileged user can modify the script.

The player identifies this privilege boundary and uses it to execute code with root privileges.

The player becomes:

```text
root
```

## Root Access

After obtaining root access, the player investigates the network configuration.

They discover that the Linux server has two network interfaces:

```text
eth0
10.77.10.70

eth1
10.77.40.10
```

The second interface connects to the isolated Finance network.

```text
10.77.40.0/24
```

The player must use the compromised Linux system as a pivot.

---

# Internal Finance Network

The player discovers:

```text
10.77.40.20
```

This host contains:

### OrionTech Finance Vault

```text
Customer Payments
Invoices
Subscription Records
Incident Reports
Internal Finance Documents
```

All data is synthetic and created specifically for the CTF.

The player must enumerate the authorized internal network and identify the Finance Vault.

The final access sequence also requires information accumulated during previous challenges.

---

# Cross-Challenge Dependency

The final challenge should demonstrate that the previous challenges were not independent.

The attack chain is:

```text
C1
Developer identity
      ↓
C2
Hidden project artifact
      ↓
C3
Cryptographic secret
      ↓
C4
Software/internal information
      ↓
C5
Incident record
      ↓
C6
Network evidence
      ↓
C7
Linux user access
      ↓
C8
Root + Internal Network
      ↓
Finance Vault
```

The player therefore reconstructs the complete compromise rather than solving eight unrelated puzzles.

## C8 Objective

1. Investigate the Linux system.
2. Identify the root-executed backup process.
3. Exploit the intended privilege boundary.
4. Obtain root access.
5. Inspect network interfaces.
6. Identify the Finance network.
7. Establish the intended pivot.
8. Enumerate the authorized internal subnet.
9. Identify the Finance Vault.
10. Retrieve the final flag.

## Final Flag

```text
ECLIPSE{oriontech_complete_compromise}
```

---

# Final Challenge Summary

| ID | Challenge            | Domain                          | Main Skill                          | Difficulty      |
| -- | -------------------- | ------------------------------- | ----------------------------------- | --------------- |
| C1 | Shadow Profile       | OSINT / Recon                   | Public information gathering        | Moderate        |
| C2 | Fragments in Silence | Steganography                   | Hidden image analysis               | Moderate        |
| C3 | Broken Trust         | Cryptography                    | RSA shared-prime attack             | Moderate-Hard   |
| C4 | Blackbox             | Reverse Engineering             | Trial software analysis             | Hard            |
| C5 | Blind Relay          | Web Security                    | Enumeration + SSRF + internal trust | Hard            |
| C6 | Echoes on the Wire   | Network Forensics               | Packet reconstruction               | Hard            |
| C7 | Broken Boundary      | Web + Linux                     | File upload → initial access        | Hard            |
| C8 | Zero Hour            | Privilege Escalation + Pivoting | Root → internal network → vault     | Hard / Capstone |

---

# Complete Attack Chain

```text
                 ORIONTECH SOLUTIONS
                         │
                         ▼
                ┌─────────────────┐
                │ C1 Shadow       │
                │ Profile         │
                │ OSINT           │
                └────────┬────────┘
                         │
                  Developer/
                  project clue
                         │
                         ▼
                ┌─────────────────┐
                │ C2 Fragments    │
                │ in Silence      │
                │ Steganography   │
                └────────┬────────┘
                         │
                    RSA artifacts
                         │
                         ▼
                ┌─────────────────┐
                │ C3 Broken Trust │
                │ RSA weakness    │
                └────────┬────────┘
                         │
                  Software clue
                         │
                         ▼
                ┌─────────────────┐
                │ C4 Blackbox     │
                │ Reverse         │
                │ Engineering     │
                └────────┬────────┘
                         │
                 OrionHub clue
                         │
                         ▼
                ┌─────────────────┐
                │ C5 Blind Relay  │
                │ Web Security    │
                └────────┬────────┘
                         │
                 Incident + PCAP
                         │
                         ▼
                ┌─────────────────┐
                │ C6 Echoes on    │
                │ the Wire        │
                │ Network         │
                │ Forensics       │
                └────────┬────────┘
                         │
                  Linux access
                  information
                         │
                         ▼
                ┌─────────────────┐
                │ C7 Broken       │
                │ Boundary        │
                │ File Upload     │
                │ Linux Access    │
                └────────┬────────┘
                         │
                    User shell
                         │
                         ▼
                ┌─────────────────┐
                │ C8 Zero Hour    │
                │ Root + Pivot    │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ FINANCE VAULT   │
                │ 10.77.40.20     │
                └────────┬────────┘
                         │
                         ▼
              ECLIPSE{FINAL_FLAG}
```

# Assignment Alignment

The revised design still covers the major technical domains required by the original proposal:

| Assignment Area                       | Revised Challenge |
| ------------------------------------- | ----------------- |
| Reconnaissance                        | C1                |
| Steganography                         | C2                |
| Cryptography                          | C3                |
| Reverse Engineering                   | C4                |
| Web Security                          | C5                |
| Network Forensics                     | C6                |
| Linux Security / Privilege Escalation | C7 + C8           |
| Network Pivoting                      | C8                |
| Cross-Challenge Dependency            | C1 → C8           |
| Scripting / Automation                | C3, C5, C6, C8    |
| Network Segmentation                  | C8                |
| CTFd                                  | All challenges    |
| Docker / Virtualization               | C5, C7, C8        |

The original assignment specifically maps the eight stages to learning outcomes and emphasizes cross-challenge dependency, with C8 using information accumulated from earlier challenges.

# Important Implementation Requirements

For the implementation, all vulnerable components must remain inside the authorized CTF environment.

Use:

```text
Synthetic accounts
Synthetic company data
Synthetic payment records
Synthetic employee identities
Synthetic GPS coordinates
Synthetic network traffic
Synthetic credentials
```

Do not use real:

```text
Credit cards
Employee information
Customer information
Production credentials
Production software
Real company infrastructure
```

The original proposal explicitly requires synthetic data, private IP addresses, isolated infrastructure, and no production systems.

# Recommended Scoring

The original scoring model totaled **2,875 points**, with difficulty increasing toward C8.

A revised distribution can remain:

| Challenge |     Score |
| --------- | --------: |
| C1        |       150 |
| C2        |       175 |
| C3        |       250 |
| C4        |       300 |
| C5        |       400 |
| C6        |       450 |
| C7        |       500 |
| C8        |       650 |
| **Total** | **2,875** |

This maintains the original progression toward the capstone.

# Final Assessment

**Yes — I would approve this revised challenge structure for the project.**

The strongest changes are:

* **C4:** The commercial software trial gives the reverse-engineering challenge a believable reason to exist.
* **C5:** The web challenge becomes a proper multi-step web-security investigation rather than a single vulnerability.
* **C6:** Packet reconstruction makes the network-forensics stage much more hands-on.
* **C7:** The hidden legacy ticket system creates a believable bridge from web enumeration to Linux access.
* **C8:** Root escalation followed by network pivoting provides a strong capstone.

Most importantly, the eight stages still satisfy the original design principle that the player should **progressively reproduce an attack chain rather than solve isolated puzzles**.
