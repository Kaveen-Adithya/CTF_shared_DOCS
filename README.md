## Assignment 01 – CTF Play Box Implementation: Project Initiation

# PROJECT ECLIPSE

## The HelixGrid Intrusion

**Degree:** BSc (Hons) in Information Technology – Cyber Security
**Module:** IE3132 – Penetration Testing
**Year:** Year 3, Semester 1
**Assignment:** Assignment 01

---

# 1. Executive Summary

Project ECLIPSE is an advanced Capture The Flag Play Box designed around a simulated compromise of a fictional technology organization named **HelixGrid Laboratories**.

HelixGrid develops secure industrial communication software. The company recently detected suspicious activity within its development infrastructure. Investigation identified signs of reconnaissance, leaked information, encrypted communication, unauthorized web application access, suspicious network traffic, and compromise of an internal Linux server.

Participants act as penetration testers working with the HelixGrid incident response team.

Their task is not simply to solve eight independent puzzles. Instead, they must reconstruct and reproduce the attacker's path through a sequence of interconnected challenges.

Project ECLIPSE contains eight stages:

1. Shadow Profile – Advanced Reconnaissance
2. Fragments in Silence – Advanced Steganography
3. Broken Trust – Applied Cryptography
4. Blackbox – Reverse Engineering
5. Blind Relay – Advanced Web Security
6. Echoes on the Wire – Network Forensics
7. Broken Boundary – Linux Privilege Escalation
8. Zero Hour – Network Pivoting and Capstone Compromise

The platform will use CTFd for challenge management, Docker for most challenge services, isolated virtual networks for segmentation, and an Ubuntu virtual machine for the later system-security stages.

All vulnerable systems are intentionally created for the CTF. No public, institutional, or production system is targeted.

---

# 2. Objectives

Project ECLIPSE aims to:

* Develop advanced information-gathering skills.
* Teach participants to correlate information from multiple sources.
* Introduce multi-layer steganography analysis.
* Demonstrate real weaknesses caused by incorrect cryptographic implementation.
* Develop reverse-engineering skills.
* Develop advanced web security investigation skills.
* Improve packet analysis and network-forensic capabilities.
* Develop Linux privilege-escalation methodology.
* Introduce network segmentation and pivoting concepts.
* Require scripting and automation throughout the CTF.
* Encourage participants to construct a complete attack chain instead of solving isolated tasks.
* Provide a realistic but isolated penetration-testing environment.

---

# 3. CTF Overview

| Field            | Proposed Design                                                         |
| ---------------- | ----------------------------------------------------------------------- |
| CTF Name         | Project ECLIPSE                                                         |
| Organization     | HelixGrid Laboratories                                                  |
| Theme            | Investigation and reproduction of an advanced infrastructure compromise |
| Challenge Count  | 8                                                                       |
| Target Audience  | Intermediate/advanced cybersecurity students                            |
| Difficulty       | Moderate → Moderate-Hard → Hard                                         |
| Platform         | Hybrid CTF                                                              |
| Management       | CTFd                                                                    |
| Containers       | Docker                                                                  |
| Final Targets    | Ubuntu Linux VMs                                                        |
| Primary Language | Python                                                                  |
| Web Framework    | Flask / FastAPI                                                         |
| Database         | PostgreSQL / SQLite depending on challenge                              |
| Reverse Proxy    | Nginx                                                                   |
| Flag Format      | `ECLIPSE{...}`                                                          |
| Isolation        | Dedicated virtual network                                               |
| Deployment       | Local laboratory server / isolated VM host                              |

---

# 4. Scenario

HelixGrid Laboratories is preparing the release of a confidential security platform known internally as **ECLIPSE**.

Two weeks before release, the organization's security monitoring system detected a sequence of unusual events:

* An employee development account was accessed.
* Confidential design material appeared to have been copied.
* A development API received unusual requests.
* Encrypted traffic was detected between several systems.
* An internal Linux server began communicating with services it normally never contacted.
* Audit logs were partially deleted.
* A privileged service was modified shortly before the incident was detected.

HelixGrid disconnected the affected systems and created forensic copies.

The security team believes the attacker did not compromise the environment through one vulnerability. Instead, the attacker chained several weaknesses.

Participants receive the role of a penetration-testing team.

Their mission is to identify and reproduce that attack path inside an isolated reconstruction of the environment.

---

# 5. Attack Story

The intended attack pathway is:

```text
Reconnaissance
      |
      v
Public Information Leakage
      |
      v
Steganographic Artefact
      |
      v
Cryptographic Weakness
      |
      v
Reverse Engineering
      |
      v
Internal API Information
      |
      v
Web Application Weakness
      |
      v
Network Evidence
      |
      v
Linux Access
      |
      v
Privilege Escalation
      |
      v
Internal Network Pivot
      |
      v
Final ECLIPSE Vault
      |
      v
FINAL FLAG
```

Each challenge therefore produces either:

* A flag,
* Credentials,
* A key,
* A hostname,
* A token,
* A file,
* Or information required for the following stage.

---

# 6. Selected Domains

Project ECLIPSE covers the following cybersecurity domains.

| Domain                             | Challenges         |
| ---------------------------------- | ------------------ |
| OSINT / Reconnaissance             | Challenge 1        |
| Steganography                      | Challenge 2        |
| Cryptography                       | Challenge 3        |
| Programming / Scripting            | Challenges 3, 5, 6 |
| Reverse Engineering                | Challenge 4        |
| Web Security                       | Challenge 5        |
| Digital Forensics                  | Challenge 6        |
| Networking                         | Challenges 6 and 8 |
| Linux / System Security            | Challenge 7        |
| Network Pivoting / Hybrid Security | Challenge 8        |

The project therefore covers substantially more than the required four domains.

---

# 7. Difficulty Progression

| Stage | Challenge            | Difficulty      |
| ----- | -------------------- | --------------- |
| 1     | Shadow Profile       | Moderate        |
| 2     | Fragments in Silence | Moderate        |
| 3     | Broken Trust         | Moderate-Hard   |
| 4     | Blackbox             | Moderate-Hard   |
| 5     | Blind Relay          | Hard            |
| 6     | Echoes on the Wire   | Hard            |
| 7     | Broken Boundary      | Hard            |
| 8     | Zero Hour            | Hard / Capstone |

The first challenges remain solvable without advanced exploitation knowledge but require considerably more analysis than basic CTF tasks.

---

# 8. Flag Format

Flags use:

`ECLIPSE{stage_identifier_randomvalue}`

For example:

`ECLIPSE{S3_xxxxxxxxx}`

Real flag values will be randomly generated during implementation and will not be included in player-accessible documentation.

---

# 9. Challenge Dependency Flow

```text
+---------------------------+
| C1 - Shadow Profile       |
| Advanced Recon            |
+------------+--------------+
             |
             v
+---------------------------+
| C2 - Fragments in Silence |
| Steganography             |
+------------+--------------+
             |
             v
+---------------------------+
| C3 - Broken Trust         |
| Cryptography              |
+------------+--------------+
             |
             v
+---------------------------+
| C4 - Blackbox             |
| Reverse Engineering       |
+------------+--------------+
             |
             v
+---------------------------+
| C5 - Blind Relay          |
| Web Security              |
+------------+--------------+
             |
             v
+---------------------------+
| C6 - Echoes on the Wire   |
| Network Forensics         |
+------------+--------------+
             |
             v
+---------------------------+
| C7 - Broken Boundary      |
| Linux Security            |
+------------+--------------+
             |
             v
+---------------------------+
| C8 - Zero Hour            |
| Pivoting / Capstone       |
+------------+--------------+
             |
             v
        FINAL FLAG
```

---

# 10. Challenge 1 – Shadow Profile

## Stage ID

ECL-01

## Domain

OSINT / Reconnaissance

## Difficulty

Moderate

## Scenario

HelixGrid suspects that the attacker performed extensive reconnaissance before gaining access.

Participants receive access to a locally recreated public-facing HelixGrid environment containing:

* Corporate website
* Employee profiles
* Archived development posts
* Simulated source-code repository pages
* Technical documentation
* Historical DNS-style records
* Public project announcements

The information appears harmless individually.

However, several artefacts can be correlated.

## Learning Objectives

Participants learn to:

* Perform systematic reconnaissance.
* Correlate usernames across multiple services.
* Identify information leakage.
* Examine repository history.
* Identify abandoned development resources.
* Understand why seemingly harmless information may support attacks.

## Environment

Docker containers provide:

* Corporate website
* Simulated Git repository viewer
* Documentation portal

All resources remain local.

No real Internet OSINT is required.

## Player Task

Identify:

1. The employee connected to the original ECLIPSE development environment.
2. Their development username.
3. The codename of an archived project.
4. The hidden path leading to Challenge 2.

## Advanced Element

Instead of simply finding a username directly on a webpage, players must correlate several sources.

Example correlation:

```text
Corporate biography
       +
Archived project post
       +
Repository commit author
       +
Old project codename
       =
Challenge identity
```

## Flag Logic

The correct correlation reveals the Stage 1 flag.

A separate clue identifies the Challenge 2 artefact.

## Tools

* Browser
* curl
* wget
* Developer tools
* grep
* Git-related analysis tools where appropriate

## Dependencies

None.

## Intended Solution Path

1. Enumerate available HelixGrid resources.
2. Inspect employees and projects.
3. Identify references to discontinued development work.
4. Examine repository history.
5. Correlate developer aliases.
6. Discover hidden resource path.
7. Submit flag.

## Validation

CTFd validates the flag.

## Hints

Hint 1:

> Current information is not always the most useful information.

Penalty: 5 points.

Hint 2:

> Historical development data may contain identities that no longer appear on the main site.

Penalty: 15 points.

## Reset

Static challenge containers can be rebuilt from Docker images.

---

# 11. Challenge 2 – Fragments in Silence

## Stage ID

ECL-02

## Domain

Advanced Steganography / File Analysis

## Difficulty

Moderate

## Scenario

Challenge 1 identifies an archived image uploaded by an ECLIPSE developer.

Initial metadata inspection reveals unusual information, but the complete secret is not stored in one location.

## Learning Objectives

Participants learn:

* File structure analysis.
* Metadata analysis.
* LSB steganography.
* Appended data identification.
* Multi-layer artefact reconstruction.
* File signature recognition.

## Challenge Environment

Participants receive:

`eclipse_architecture.png`

The image contains several intentionally created layers:

### Layer 1 – Metadata

A small encoded hint is stored in metadata.

### Layer 2 – Image Steganography

LSB data contains another fragment.

### Layer 3 – Appended Content

Additional data exists beyond the logical end of the PNG.

### Layer 4 – Reconstruction

Fragments must be combined in the correct order.

## Player Task

Determine that the file contains multiple hidden artefacts and reconstruct the secret.

## Advanced Element

The flag is **not directly hidden using one steganography command**.

Players must recognize that:

```text
Metadata fragment
       +
LSB fragment
       +
Appended archive fragment
       =
Complete secret
```

## Tools

Possible tools:

* file
* strings
* ExifTool
* binwalk
* xxd
* zsteg
* Python
* unzip

## Flag Logic

Reconstructed content contains:

* Stage 2 flag
* Two RSA public-key files
* An encrypted message used in Challenge 3

## Dependencies

Challenge 1 reveals the correct artefact.

## Intended Solution Path

1. Identify file format.
2. Examine metadata.
3. Examine binary structure.
4. Identify appended content.
5. Analyze pixel data.
6. Recover fragments.
7. Reconstruct hidden archive.
8. Obtain Stage 2 flag.
9. Extract Challenge 3 files.

## Validation

Static flag validation through CTFd.

## Reset / Recovery

Original file remains immutable on the CTF server.

---

# 12. Challenge 3 – Broken Trust

## Stage ID

ECL-03

## Domain

Cryptography / Programming

## Difficulty

Moderate-Hard

## Scenario

Participants recover two public keys and encrypted project material.

Both keys appear to use strong RSA key lengths.

However, a mistake occurred when the keys were generated.

## Learning Objectives

Participants learn:

* Public-key cryptography fundamentals.
* Importance of secure prime generation.
* RSA key structure.
* Mathematical analysis of public keys.
* Greatest common divisor analysis.
* Python cryptographic scripting.

## Intended Weakness

Two intentionally generated RSA public keys share a prime factor.

Conceptually:

```text
N1 = p × q1
N2 = p × q2
```

Because the same prime `p` appears in both moduli:

```text
GCD(N1, N2) = p
```

Participants can therefore reconstruct the corresponding private-key material.

## Player Task

Analyze the public keys, identify the cryptographic implementation weakness, derive the required private key, and decrypt the challenge message.

## Environment

File-based challenge.

Files include:

* `dev_public.pem`
* `backup_public.pem`
* `project.enc`

## Advanced Element

The key itself is not brute-forced.

Participants must understand why two independently generated RSA keys should not share a prime.

## Tools

* Python
* OpenSSL
* PyCryptodome, optionally
* CyberChef, optionally
* Mathematical utilities

## Expected Solution Path

1. Parse RSA public keys.
2. Extract moduli.
3. Compare the keys.
4. Calculate GCD.
5. Identify common prime.
6. Reconstruct private key parameters.
7. Decrypt message.
8. Obtain flag and Challenge 4 binary password.

## Flag Logic

Decrypted plaintext contains:

* Stage 3 flag
* Challenge 4 identifier

## Dependencies

Challenge 2 provides cryptographic artefacts.

## Validation

Flag submitted to CTFd.

## Hints

Hint 1:

> Strong algorithms can still fail when key generation fails.

Hint 2:

> Compare the mathematical components of both public keys.

## Reset

Files are immutable.

---

# 13. Challenge 4 – Blackbox

## Stage ID

ECL-04

## Domain

Reverse Engineering

## Difficulty

Moderate-Hard

## Scenario

The recovered information references an internal diagnostic client.

Participants obtain a compiled Linux executable used by HelixGrid developers.

The source code is unavailable.

## Learning Objectives

Participants learn:

* Static binary analysis.
* Function identification.
* Strings and symbol analysis.
* Control-flow analysis.
* Simple anti-analysis mechanisms.
* Reconstruction of application logic.

## Environment

64-bit Linux ELF executable:

`eclipse_diag`

The binary will be:

* Stripped of symbols.
* Compiled with optimization.
* Contain limited decoy strings.
* Contain an obfuscated configuration blob.

## Application Logic

The executable performs several operations:

1. Reads a challenge key.
2. Transforms it through several operations.
3. Validates the result.
4. Decrypts an internal API configuration.
5. Prints a limited diagnostic message.

Players must determine how the hidden configuration is reconstructed.

## Player Task

Reverse engineer the executable and obtain:

* Internal API hostname.
* Application token.
* Stage 4 flag.

## Tools

Possible tools include:

* Ghidra
* Cutter
* radare2
* objdump
* strings
* ltrace
* gdb

## Advanced Element

Running `strings` alone will not reveal the final token.

The internal configuration is decoded only during application execution.

## Expected Solution Path

1. Identify executable type.
2. Perform static analysis.
3. Locate key validation routine.
4. Analyze configuration-decoding function.
5. Reconstruct logic.
6. Recover API token.
7. Obtain Stage 4 flag.

## Dependencies

Challenge 3 provides data accepted by the diagnostic tool.

## Validation

CTFd flag validation.

## Reset

Binary remains immutable.

---

# 14. Challenge 5 – Blind Relay

## Stage ID

ECL-05

## Domain

Advanced Web Security

## Difficulty

Hard

## Scenario

Challenge 4 reveals an internal HelixGrid development portal.

The application contains a feature that allows developers to request previews of remote resources.

The system trusts the server to retrieve the resource instead of the user's browser.

## Learning Objectives

Participants learn:

* Web application reconnaissance.
* Trust-boundary analysis.
* Server-side request behavior.
* Internal versus external service exposure.
* Authentication versus authorization.
* API analysis.
* Request automation.

## Environment

Docker environment containing:

```text
Public Web Container
        |
        |
        +------ Internal API
        |
        +------ Internal Admin Service
```

Only the public web container is directly reachable.

The internal services exist on an isolated Docker network.

## Intended Vulnerability

The URL-preview functionality performs insufficient destination validation.

This creates an intentionally vulnerable **server-side request mechanism** inside the CTF.

Participants must use it to determine that an internal service exists.

A second authorization weakness prevents the challenge from being solvable through a single request.

## Player Task

1. Authenticate using the token recovered in Challenge 4.
2. Analyze the preview feature.
3. Determine server-side network behavior.
4. Enumerate the intentionally exposed internal service.
5. Access a protected synthetic project record.
6. Recover the Stage 5 flag.

## Advanced Element

This is a chained challenge:

```text
Reverse-engineered token
       |
       v
Authenticated application
       |
       v
Server-side request weakness
       |
       v
Internal service discovery
       |
       v
Authorization weakness
       |
       v
Protected project record
```

## Tools

* Burp Suite
* curl
* Browser developer tools
* Python requests
* ffuf, optionally within the defined CTF scope

## Flag Logic

Flag exists inside a synthetic internal incident report.

The record also contains a reference to Challenge 6 network evidence.

## Dependencies

Challenge 4 provides API access information.

## Intended Solution Path

1. Authenticate.
2. Map application functionality.
3. Observe preview behavior.
4. Determine that requests originate from the server.
5. Identify internal service.
6. Examine internal API responses.
7. Identify authorization boundary failure.
8. Obtain record and flag.

## Validation

CTFd validation.

## Hints

Hint 1:

> Ask where the request actually originates.

Hint 2:

> A service that is unreachable by the browser may still be reachable by the application server.

## Reset

Docker Compose recreates:

* Web application
* Internal API
* Internal admin service
* Clean database

---

# 15. Challenge 6 – Echoes on the Wire

## Stage ID

ECL-06

## Domain

Network Forensics / Digital Forensics

## Difficulty

Hard

## Scenario

The internal record references unusual network traffic captured shortly before the incident.

HelixGrid provides participants with a packet capture.

The attacker attempted to disguise outbound data within apparently normal network traffic.

## Learning Objectives

Participants learn:

* PCAP triage.
* Conversation analysis.
* DNS analysis.
* Protocol filtering.
* Payload reconstruction.
* Encoded data identification.
* Network timeline creation.
* Automation with Python or tshark.

## Environment

Participant receives:

`eclipse_incident.pcapng`

The capture contains synthetic traffic including:

* DNS
* HTTP
* SSH handshakes
* Noise traffic
* Normal workstation behavior
* Intentionally generated suspicious communication

## Intended Challenge

Part of the attacker's synthetic exfiltration data has been divided into small encoded fragments carried inside DNS queries.

The participant must:

1. Separate suspicious DNS traffic from legitimate requests.
2. Determine sequence order.
3. Reconstruct fragments.
4. Decode recovered data.

## Advanced Element

The suspicious traffic is mixed with benign DNS requests.

A simple `strings capture.pcap` operation will not reveal the answer.

Players need protocol filtering and reconstruction.

## Player Task

Determine:

* Compromised source address.
* Destination involved.
* Exfiltration mechanism.
* Reconstructed data.
* Stage 6 flag.

The recovered data also includes Stage 7 credentials.

## Tools

* Wireshark
* tshark
* Python
* Scapy, optionally
* CyberChef
* Standard text-processing tools

## Intended Solution Path

1. Establish traffic baseline.
2. Identify abnormal DNS queries.
3. Isolate suspicious client.
4. Extract encoded labels.
5. Sort by sequence.
6. Reconstruct data.
7. Decode content.
8. Recover Stage 6 flag and Linux credentials.

## Validation

CTFd validates Stage 6 flag.

## Reset

The PCAP is immutable.

---

# 16. Challenge 7 – Broken Boundary

## Stage ID

ECL-07

## Domain

Linux / System Security

## Difficulty

Hard

## Scenario

Credentials recovered from network evidence allow access to a development Linux server.

The account itself has very limited privileges.

However, a maintenance mechanism has been configured incorrectly.

## Learning Objectives

Participants learn:

* Linux enumeration methodology.
* File permissions.
* User/group privilege boundaries.
* Scheduled service analysis.
* Process investigation.
* Trust relationships.
* Privilege-escalation reasoning.

## Environment

Ubuntu Server virtual machine.

Example:

`10.77.30.70`

Services:

* SSH
* Local maintenance daemon
* Logging service

## Intended Weakness

A privileged maintenance process loads configuration or helper content from a location that can be influenced by the low-privileged development account.

The design intentionally demonstrates the principle:

> A privileged process should not trust writable input controlled by a less privileged user.

## Player Task

1. Connect to the system.
2. Enumerate users and groups.
3. Inspect services and scheduled processes.
4. Identify writable components affecting privileged execution.
5. Use the intended CTF weakness to obtain elevated privileges.
6. Retrieve Stage 7 flag.

## Advanced Element

The system will contain multiple decoy files and processes.

The participant must determine which permission issue represents a genuine privilege boundary crossing.

## Tools

* ssh
* id
* groups
* ps
* ss
* find
* stat
* systemctl
* journalctl
* Standard Bash utilities

## Dependencies

Challenge 6 provides credentials.

## Flag Logic

Flag exists in a directory accessible only after the intended privilege escalation.

The system also contains network information required for Challenge 8.

## Expected Solution Path

1. Authenticate.
2. Enumerate identity and permissions.
3. Identify scheduled privileged process.
4. Inspect referenced configuration/helper resources.
5. Find unsafe permission relationship.
6. Trigger intended privilege escalation.
7. Retrieve Stage 7 flag.
8. Discover internal network route.

## Validation

CTFd validation.

## Recovery

A clean VM snapshot is restored after testing or competition rounds.

---

# 17. Challenge 8 – Zero Hour

## Stage ID

ECL-08

## Domain

Network Pivoting / Internal Enumeration / Capstone

## Difficulty

Hard – Capstone

## Scenario

After compromising the Linux development server, participants discover that it is connected to a second network that was not reachable from their original participant machine.

The segment contains the final ECLIPSE vault service.

## Learning Objectives

Participants learn:

* Multi-homed host analysis.
* Network segmentation.
* Routing and pivoting concepts.
* Internal service enumeration.
* Attack-path construction.
* Correlation of information obtained during previous challenges.

## Architecture

```text
Participant Network
10.77.10.0/24
        |
        |
        v
Linux Development Server
10.77.10.70
10.77.40.10
        |
        |
        v
Internal Secure Network
10.77.40.0/24
        |
        +---- Vault API
        |
        +---- Internal Service
```

Participants cannot directly reach `10.77.40.0/24`.

## Player Task

Use the compromised Linux host as an authorized pivot point inside the CTF.

Participants must:

1. Discover the second network interface.
2. Identify the internal subnet.
3. Establish a permitted tunnel through the compromised CTF host.
4. Enumerate the internal network.
5. Identify the ECLIPSE vault.
6. Use information collected in earlier challenges to authenticate or construct the final access sequence.
7. Retrieve final flag.

## Advanced Element

Challenge 8 cannot be solved solely from Challenge 7.

Information accumulated throughout the CTF is required.

For example:

```text
C1 → Employee identifier
C2 → Hidden project identifier
C3 → Cryptographic secret
C4 → Application token
C5 → Incident record ID
C6 → Internal username
C7 → Internal network location
                  |
                  v
        Final access material
```

The participant must understand that previous information forms part of the final authentication logic.

## Internal Vault

The vault application is reachable only from the internal challenge network.

It does not contain a real-world vulnerability.

Instead, the final challenge combines:

* Internal enumeration
* Routing
* Prior challenge correlation
* Authentication logic

This reduces unnecessary exploit complexity while making the capstone dependent on the complete attack chain.

## Tools

* ip
* route
* ss
* ssh
* Proxy-aware tooling
* curl
* Nmap within the authorized internal CTF subnet
* Python

## Intended Solution Path

1. Inspect network interfaces.
2. Identify additional subnet.
3. Determine available internal routing.
4. Establish CTF pivot.
5. Enumerate authorized internal addresses.
6. Identify vault application.
7. Combine previously recovered secrets.
8. Authenticate.
9. Retrieve final flag.

## Final Flag

`ECLIPSE{FINAL_<random-value>}`

## Validation

CTFd records successful final submission.

## Reset / Recovery

* Linux VM snapshot restored.
* Internal vault container rebuilt.
* Temporary session state cleared.
* Network topology recreated through Docker Compose / virtualization templates.

---

# 18. Proposed Platform Architecture

```text
                         PARTICIPANT
                        Kali Linux VM
                             |
                             |
                  +----------v-----------+
                  | Participant Network  |
                  |   10.77.10.0/24      |
                  +----------+-----------+
                             |
              +--------------+--------------+
              |                             |
              v                             v
      +---------------+              +---------------+
      | CTFd Platform |              | Challenge 7   |
      | 10.77.10.10   |              | Linux Server  |
      +-------+-------+              | 10.77.10.70   |
              |                      | 10.77.40.10   |
              |                      +-------+-------+
              |                              |
              v                              |
      +-------------------+                  |
      | Docker Challenge  |                  |
      | Infrastructure    |                  |
      | 10.77.20.0/24     |                  |
      +---------+---------+                  |
                |                            |
     +----------+-----------+                |
     |          |           |                |
     v          v           v                |
    C1         C5       Supporting           |
   OSINT       Web       Services             |
                                               
                                    +-----------v---------+
                                    | Internal Network    |
                                    | 10.77.40.0/24       |
                                    +-----------+---------+
                                                |
                                                v
                                      +----------------+
                                      | ECLIPSE Vault  |
                                      | Challenge 8    |
                                      +----------------+
```

---

# 19. Logical Network Segmentation

Project ECLIPSE uses three principal networks.

## Zone A – Participant Network

`10.77.10.0/24`

Contains:

* Participants
* CTFd
* Challenge 7 external interface

## Zone B – Challenge Service Network

`10.77.20.0/24`

Contains:

* Web services
* API containers
* Internal challenge services

Access is restricted using firewall and Docker-network rules.

## Zone C – Internal Vault Network

`10.77.40.0/24`

Contains:

* Final vault application
* Supporting internal service

Participants can access this network only through the intended Challenge 8 pathway.

---

# 20. CTFd Design

CTFd will manage:

* Participant accounts
* Team registration
* Challenge descriptions
* Challenge dependencies
* Downloadable artefacts
* Hint penalties
* Flag validation
* Scoreboard
* Administrative logs

Challenge dependencies will prevent later stages being accidentally exposed before required earlier tasks are completed.

---

# 21. Proposed Technology Stack

| Component           | Technology                                      |
| ------------------- | ----------------------------------------------- |
| CTF Platform        | CTFd                                            |
| Host OS             | Ubuntu Server                                   |
| Containerization    | Docker                                          |
| Orchestration       | Docker Compose                                  |
| Web Framework       | Flask / FastAPI                                 |
| Reverse Proxy       | Nginx                                           |
| Database            | PostgreSQL / SQLite                             |
| Programming         | Python                                          |
| Binary Challenge    | C / C++                                         |
| Reverse Engineering | Ghidra-compatible ELF                           |
| Network Analysis    | Wireshark / tshark                              |
| Linux Target        | Ubuntu Server VM                                |
| Virtualization      | VirtualBox / VMware / Hyper-V depending on host |
| Logging             | Docker logs + Linux journal                     |
| Firewall            | Host firewall / isolated virtual networking     |

---

# 22. Estimated Infrastructure

## Development Environment

Minimum:

* 4 CPU cores
* 8 GB RAM
* 60 GB storage

Recommended:

* 8 CPU cores
* 16 GB RAM
* 100 GB SSD storage

## Participant Machine

Recommended:

* Kali Linux
* 4 GB RAM minimum
* 2 CPU cores
* 20 GB storage

---

# 23. Security Controls

Because intentionally vulnerable systems are included, the following security controls will be implemented.

## 23.1 Network Isolation

No vulnerable challenge will be exposed directly to the Internet.

## 23.2 No Production Data

All:

* Accounts
* Emails
* Network captures
* Keys
* Passwords
* Source code
* Employee records

will be synthetic.

## 23.3 Restricted Internet Access

Challenge systems will not require outbound Internet connectivity.

## 23.4 Container Restrictions

Containers will avoid:

* Privileged mode
* Host network mode
* Host filesystem mounts
* Docker socket exposure

unless absolutely required for administration and unavailable to participants.

## 23.5 VM Snapshots

Linux targets will have clean snapshots.

## 23.6 Management Isolation

Administrative interfaces will reside outside the participant-accessible network.

## 23.7 Resource Limits

Docker services will have CPU and memory limits where appropriate.

---

# 24. Deployment Plan

## Phase 1 – Infrastructure

* Prepare isolated server.
* Create virtual networks.
* Install Docker.
* Install CTFd.
* Configure firewall.
* Configure logging.

## Phase 2 – Static Challenges

Prepare:

* C1 OSINT resources
* C2 Steganography artefact
* C3 Cryptography files
* C4 Reverse-engineering binary
* C6 PCAP

## Phase 3 – Dynamic Challenges

Deploy:

* C5 web environment
* C7 Linux VM
* C8 internal network/vault

## Phase 4 – Integration

Link challenge outputs and dependencies.

## Phase 5 – Testing

Test all eight challenges independently.

## Phase 6 – End-to-End Test

A tester attempts:

```text
C1 → C2 → C3 → C4 → C5 → C6 → C7 → C8
```

without receiving developer solutions.

---

# 25. Proposed Scoring

| Challenge                 | Difficulty    | Score |
| ------------------------- | ------------- | ----: |
| C1 – Shadow Profile       | Moderate      |   150 |
| C2 – Fragments in Silence | Moderate      |   175 |
| C3 – Broken Trust         | Moderate-Hard |   250 |
| C4 – Blackbox             | Moderate-Hard |   300 |
| C5 – Blind Relay          | Hard          |   400 |
| C6 – Echoes on the Wire   | Hard          |   450 |
| C7 – Broken Boundary      | Hard          |   500 |
| C8 – Zero Hour            | Hard/Capstone |   650 |

Total:

**2,875 points**

---

# 26. Testing Strategy

## Functional Testing

Verify:

* All containers start.
* Web pages render.
* Files are downloadable.
* Binaries execute.
* Network capture loads.
* Linux server accepts intended credentials.
* Internal vault is reachable only through intended network path.

## Flag Testing

For every challenge:

* Correct flag accepted.
* Incorrect flags rejected.
* Flag cannot be retrieved accidentally.
* Flag is not exposed in source or downloadable files unless intended.

## Solution Testing

Each challenge will have:

* Developer solution.
* Independent tester.
* Expected solving time.
* Hint review.

## End-to-End Testing

Test dependency chain from C1 through C8.

## Recovery Testing

Verify:

* Docker rebuild works.
* Database resets correctly.
* VM snapshot restores correctly.
* Vault sessions are removed.
* Participant modifications do not persist.

---

# 27. Validation Matrix

| Stage | Validation Mechanism                |
| ----- | ----------------------------------- |
| C1    | Correct reconnaissance flag         |
| C2    | Correct reconstructed artefact flag |
| C3    | Correct decrypted flag              |
| C4    | Correct reverse-engineered flag     |
| C5    | Correct internal-record flag        |
| C6    | Correct reconstructed network flag  |
| C7    | Correct privileged-access flag      |
| C8    | Final vault flag                    |

---

# 28. Risk Register

| Risk                                   | Severity | Mitigation                 |
| -------------------------------------- | -------- | -------------------------- |
| Vulnerable service exposed publicly    | Critical | Network isolation          |
| Participant reaches management network | High     | Firewall segmentation      |
| Container escape                       | High     | Least privilege            |
| Accidental host mount                  | High     | Deployment review          |
| Challenge solution leaked              | Medium   | Restricted developer files |
| Challenge impossible                   | High     | Independent testing        |
| Challenge unintentionally trivial      | Medium   | Peer review                |
| VM corrupted                           | Medium   | Snapshot restoration       |
| High CPU/RAM usage                     | Medium   | Resource limits            |
| Stage dependency failure               | High     | End-to-end testing         |
| Team contribution imbalance            | Medium   | Contribution evidence      |
| Real data accidentally used            | High     | Synthetic data only        |

---

# 29. Four-Member Contribution Matrix

A balanced structure for eight challenges is:

| Member   | Primary Challenge Responsibility | Additional Responsibility                  |
| -------- | -------------------------------- | ------------------------------------------ |
| Member 1 | C1 and C8                        | Architecture & networking                  |
| Member 2 | C2 and C3                        | Artefact generation & cryptographic design |
| Member 3 | C4 and C5                        | Binary/web challenge engineering           |
| Member 4 | C6 and C7                        | Forensics, Linux, integration & testing    |

## Member 1

Responsible for:

* Overall architecture
* Network segmentation
* CTFd deployment planning
* Challenge 1
* Challenge 8
* Final pivoting architecture

## Member 2

Responsible for:

* Challenge 2
* Steganography artefact generation
* Challenge 3
* RSA challenge-generation scripts
* Verification of cryptographic solution

## Member 3

Responsible for:

* Challenge 4 binary
* Reverse-engineering logic
* Challenge 5 web environment
* Internal API architecture
* Web vulnerability validation

## Member 4

Responsible for:

* Challenge 6 PCAP generation
* Network forensic solution
* Challenge 7 Linux VM
* Reset mechanism
* Integration testing
* Documentation consolidation

All members will participate in:

* Peer testing
* Security review
* Final walkthrough
* Documentation
* Presentation preparation

---

# 30. Evidence of Individual Contribution

Each member should maintain:

* Git commits
* Screenshots
* Architecture changes
* Challenge code
* Testing notes
* Docker configuration
* Scripts
* Design documents
* Meeting notes

A Git repository structure could be:

```text
project-eclipse/
|
+-- infrastructure/
|
+-- challenge01-osint/
|
+-- challenge02-stego/
|
+-- challenge03-crypto/
|
+-- challenge04-reversing/
|
+-- challenge05-web/
|
+-- challenge06-forensics/
|
+-- challenge07-linux/
|
+-- challenge08-capstone/
|
+-- testing/
|
+-- documentation/
|
+-- diagrams/
```

---

# 31. Expected Learning Outcome Mapping

| Challenge              | LO1 | LO2 | LO3 |
| ---------------------- | --- | --- | --- |
| C1 Recon               | ✓   | ✓   |     |
| C2 Stego               | ✓   | ✓   |     |
| C3 Crypto              |     | ✓   | ✓   |
| C4 Reverse Engineering | ✓   | ✓   | ✓   |
| C5 Web Security        | ✓   | ✓   | ✓   |
| C6 Network Forensics   | ✓   | ✓   | ✓   |
| C7 Linux               | ✓   | ✓   |     |
| C8 Pivoting            | ✓   | ✓   | ✓   |

---

# 32. Why This CTF Is Technically Advanced

Project ECLIPSE avoids challenges where the participant simply runs one command and immediately obtains a flag.

Instead, advanced challenges use:

### Information Correlation

Multiple artefacts must be combined.

### Multi-Layer Steganography

Several concealment techniques exist in one file.

### Cryptographic Failure Analysis

Participants investigate implementation weaknesses rather than simply decoding Base64.

### Reverse Engineering

A compiled executable must be understood without source code.

### Chained Web Weaknesses

One vulnerability alone does not reveal the flag.

### Network Reconstruction

Data must be reconstructed from protocol traffic.

### Linux Privilege Boundaries

Participants must understand how a privileged process interacts with lower-trust resources.

### Network Pivoting

The final system cannot be directly accessed from the participant network.

### Cross-Challenge Dependency

Knowledge from earlier challenges becomes relevant again during the capstone.

---

# 33. Ethical Considerations

The CTF environment will follow the following rules:

* Participants receive explicit authorized scope.
* Targets use private IP addresses.
* Vulnerabilities are intentionally created.
* Public Internet targets are prohibited.
* Real credentials are prohibited.
* Real employee data is prohibited.
* Production software environments are not attacked.
* CTF infrastructure is isolated.
* Participants are informed that techniques may only be used against authorized systems.

---

# 34. Limitations

Project ECLIPSE has several limitations.

The environment is intentionally simplified compared with a real enterprise environment.

Advanced challenges require more development effort than simple CTF challenges.

Challenge 7 and Challenge 8 require virtualization and additional memory.

Network pivoting can become difficult to demonstrate if the laboratory infrastructure is limited.

Reverse engineering difficulty may vary significantly depending on participant experience.

Therefore, pilot testing is required before final deployment.

---

# 35. Future Implementation Tasks

Following approval of the initiation design, the development stage should proceed in this order:

```text
1. Build infrastructure
       ↓
2. Deploy CTFd
       ↓
3. Build C1
       ↓
4. Generate C2 artefact
       ↓
5. Generate C3 keys/data
       ↓
6. Compile C4 binary
       ↓
7. Build C5 web environment
       ↓
8. Generate C6 network capture
       ↓
9. Configure C7 Linux VM
       ↓
10. Create C8 internal network
       ↓
11. Connect all dependencies
       ↓
12. Security review
       ↓
13. Peer testing
       ↓
14. Reset testing
       ↓
15. Final CTF deployment
```

---

# 36. Conclusion

Project ECLIPSE proposes an advanced eight-stage Capture The Flag Play Box representing the compromise of the fictional HelixGrid Laboratories environment.

The challenge sequence covers reconnaissance, steganography, cryptography, reverse engineering, web security, programming, digital forensics, network analysis, Linux security, and internal network pivoting.

The design intentionally avoids isolated one-command challenges. Instead, participants are required to analyze information, correlate artefacts, understand security boundaries, automate selected tasks, and progressively reproduce an attack chain.

The use of CTFd, Docker, virtual machines, network segmentation, synthetic data, snapshots, reset procedures, and restricted connectivity allows the platform to remain technically realistic while limiting risk.

The final Zero Hour challenge integrates knowledge obtained throughout the previous seven stages, creating a capstone scenario in which participants must use both technical exploitation skills and attack-path reasoning.

Project ECLIPSE therefore provides a technically feasible and educational foundation for the later implementation of an advanced penetration-testing CTF environment.

---

# Appendix A – Challenge Overview

| ID     | Challenge            | Domain                 | Difficulty      |
| ------ | -------------------- | ---------------------- | --------------- |
| ECL-01 | Shadow Profile       | OSINT / Recon          | Moderate        |
| ECL-02 | Fragments in Silence | Steganography          | Moderate        |
| ECL-03 | Broken Trust         | Cryptography           | Moderate-Hard   |
| ECL-04 | Blackbox             | Reverse Engineering    | Moderate-Hard   |
| ECL-05 | Blind Relay          | Web Security           | Hard            |
| ECL-06 | Echoes on the Wire   | Networking / Forensics | Hard            |
| ECL-07 | Broken Boundary      | Linux Security         | Hard            |
| ECL-08 | Zero Hour            | Pivoting / Hybrid      | Hard / Capstone |

---

# Appendix B – Complete Dependency Map

```text
ECL-01
Reconnaissance
      |
      | Developer identity
      v
ECL-02
Steganography
      |
      | RSA artefacts
      v
ECL-03
Cryptography
      |
      | Binary key
      v
ECL-04
Reverse Engineering
      |
      | Internal token
      v
ECL-05
Web Security
      |
      | Evidence reference
      v
ECL-06
Network Forensics
      |
      | Linux credentials
      v
ECL-07
Privilege Escalation
      |
      | Internal route
      v
ECL-08
Network Pivot
      |
      v
FINAL ECLIPSE VAULT
```

---

# Appendix C – AI Prompt Log

Because generative AI was used during scenario and challenge brainstorming, the actual prompts used must be retained.

Example:

| No. | Prompt Purpose                      |
| --- | ----------------------------------- |
| 1   | Clarify Assignment 01 requirements  |
| 2   | Develop an eight-stage advanced CTF |
| 3   | Improve challenge difficulty        |
| 4   | Develop architecture                |
| 5   | Review technical feasibility        |
| 6   | Improve testing and isolation plan  |

Paste the actual prompts and responses or required prompt records according to lecturer instructions.

---

# Appendix D – Pre-Submission Checklist

* [ ] Cover page completed
* [ ] Four real member names added
* [ ] Student IDs added
* [ ] Executive summary included
* [ ] Objectives included
* [ ] CTF concept explained
* [ ] Eight challenges documented
* [ ] Four or more domains covered
* [ ] Difficulty progression justified
* [ ] Scenario included for every challenge
* [ ] Learning objective included for every challenge
* [ ] Environment included for every challenge
* [ ] Player task included for every challenge
* [ ] Flag logic included for every challenge
* [ ] Tools included for every challenge
* [ ] Dependencies documented
* [ ] Intended solution path documented
* [ ] Validation documented
* [ ] Hints documented
* [ ] Reset procedure documented
* [ ] Architecture diagram added
* [ ] Network diagram added
* [ ] Deployment plan included
* [ ] Security isolation included
* [ ] Resource requirements included
* [ ] Testing plan included
* [ ] Contribution matrix included
* [ ] Risks included
* [ ] Limitations included
* [ ] References included
* [ ] AI prompt log included
* [ ] Technical claims checked
* [ ] No system described as implemented unless actually built and tested
