Yes. This is a better direction. We can keep the **technical structure of your original 8 challenges**, but replace HelixGrid Laboratories with a realistic **IT company that has a public customer platform, staff portal, payment functionality, internal APIs, servers, and a protected internal network**. 

# 🏢 CTF Story — "Project ECLIPSE: The OrionTech Breach"

## 1. Company Background

The fictional company is:

### **OrionTech Solutions**

OrionTech is a growing IT services company that provides:

* Cloud services
* Software development
* IT support
* Cybersecurity services
* Managed infrastructure
* Software subscriptions
* Online technical services

The company operates a web platform called:

### **OrionHub**

Customers use OrionHub to:

* Create accounts
* Purchase software subscriptions
* Make online payments
* View invoices
* Submit support tickets
* Manage their services
* Contact technical support

At the same time, **OrionTech employees use the same platform** through a separate staff login.

Staff members can access additional functionality such as:

* Customer management
* Support tickets
* Payment records
* Internal reports
* Service management
* Incident records

However, some of these internal services are supposed to be accessible **only from the company's internal network**.

---

# 🚨 The Incident

One Monday morning, OrionTech's security team notices something unusual.

Several customer accounts show suspicious activity.

More importantly, the security team discovers that:

> **A restricted internal payment record was accessed from an external location.**

The IT team checks the logs but cannot determine exactly how the attacker entered the system.

They discover several suspicious clues:

```text
Public website activity
        ↓
Unusual staff account activity
        ↓
Internal API requests
        ↓
Suspicious network traffic
        ↓
Linux server access
        ↓
Internal network communication
```

The company believes the attacker may have moved from the **public-facing OrionHub platform into the internal corporate network**.

Your team has been hired to investigate the incident.

---

# 🎯 Your Mission

You are given access to the company's **CTF investigation environment**.

Your objective is:

> **Trace the attacker's complete path through OrionTech's infrastructure, starting from publicly available information and ending at the protected internal Finance Vault.**

You don't know:

* Who the attacker was
* Which employee account was involved
* How the attacker obtained internal information
* How they accessed the Linux server
* How they reached the internal network
* What information was stolen

You must discover the attack chain yourself.

---

# 🔥 Complete 8-Challenge Story

The important part is that **every challenge gives you information needed for the next challenge**.

```text
                    ORIONTECH SOLUTIONS
                           │
                           ▼
                    🌐 Public Website
                           │
                           ▼
                  C1 — Shadow Profile
                           │
                           ▼
                  Developer Information
                           │
                           ▼
                C2 — Fragments in Silence
                           │
                           ▼
                  Hidden Crypto Files
                           │
                           ▼
                   C3 — Broken Trust
                           │
                           ▼
                Recovered API Secret
                           │
                           ▼
                     C4 — Blackbox
                           │
                           ▼
              Internal Service Information
                           │
                           ▼
                    C5 — Blind Relay
                           │
                           ▼
             Internal Incident Information
                           │
                           ▼
                 C6 — Echoes on the Wire
                           │
                           ▼
                  Linux Credentials
                           │
                           ▼
                 C7 — Broken Boundary
                           │
                           ▼
                Internal Network Access
                           │
                           ▼
                    C8 — Zero Hour
                           │
                           ▼
                   💰 Finance Vault
                           │
                           ▼
                     🏆 FINAL FLAG
```

---

# 🟢 C1 — Shadow Profile

### Advanced Reconnaissance / OSINT

The investigation starts outside OrionTech.

The player is given the company's public domain:

```text
oriontech.local
```

The public website contains normal company information:

```text
About Us
Services
Careers
Blog
Support
OrionHub
```

During investigation, the player discovers information about an employee/developer who worked on OrionHub.

For example:

```text
Name: Daniel Perera
Position: Senior Software Engineer
Project: OrionHub
Username: dperera
```

The player finds an old developer profile or abandoned project containing a reference to:

```text
OrionHub Payment Gateway v1
```

The old project contains a clue pointing toward a hidden image/document.

### C1 objective

Identify the developer associated with the legacy OrionHub payment system and find the artifact left behind by that developer.

### C1 → C2

The player obtains:

```text
Developer identity
+
Hidden artifact location
```

Flag:

```text
ECLIPSE{shadow_profile}
```

---

# 🟡 C2 — Fragments in Silence

### Advanced Steganography

The player obtains an apparently harmless image from the old OrionHub project.

Example:

```text
orionhub_architecture.png
```

At first it appears to be an ordinary architecture diagram.

But investigation reveals hidden information.

The player can investigate:

```text
EXIF metadata
Strings
Embedded files
LSB data
Steganography
```

Eventually they discover:

```text
orion_crypto/
    ├── rsa_key_01.txt
    ├── rsa_key_02.txt
    └── legacy_notes.txt
```

The notes say:

> "The payment gateway was migrated after a cryptographic key-generation issue was discovered."

Now the player knows that something is wrong with the company's old payment system.

### C2 → C3

The player obtains the RSA artifacts required for the next stage.

Flag:

```text
ECLIPSE{fragments_in_silence}
```

---

# 🔴 C3 — Broken Trust

### Applied Cryptography

The player examines the two RSA public keys.

They discover that both keys were generated incorrectly.

For example:

```text
RSA Key 1
n1 = ...

RSA Key 2
n2 = ...
```

The player notices that:

```text
gcd(n1,n2) ≠ 1
```

Therefore the keys share a prime factor.

The player reconstructs the vulnerable private key and decrypts an old OrionTech configuration message.

The decrypted information contains something like:

```text
ORIONHUB LEGACY CONFIGURATION

Internal API:
api.internal.oriontech

Service:
Payment Management API

Legacy token:
OT-LEGACY-********
```

This is the first major step from the **public side** of OrionTech toward its internal infrastructure.

### C3 → C4

The player obtains:

```text
Internal API hostname
+
Legacy service token
```

Flag:

```text
ECLIPSE{broken_trust}
```

---

# 🟣 C4 — Blackbox

### Reverse Engineering

The player now discovers an old OrionTech client application.

For example:

```text
orion-admin-client
```

It is a stripped Linux executable.

The player has no source code.

They need to reverse engineer it using tools such as:

* Ghidra
* strings
* objdump
* file
* Linux debugging tools

During analysis they discover that the application communicates with internal services.

Eventually they find:

```text
INTERNAL_API = api.internal.oriontech
ADMIN_SERVICE = admin.internal.oriontech
SERVICE_TOKEN = OT-...
```

They also discover an endpoint:

```text
/internal/incident
```

This tells the player where the next part of the investigation is located.

### C4 → C5

The player receives:

```text
Internal API information
+
Authentication token
+
Internal service hostname
```

Flag:

```text
ECLIPSE{blackbox}
```

---

# 🔵 C5 — Blind Relay

### Advanced Web Security

This becomes the **main OrionHub web application challenge**.

The player visits:

```text
OrionHub
```

They can log in using the credentials/token obtained from C4.

The platform looks like a normal IT service portal:

```text
ORIONHUB
────────────────────

Dashboard
My Services
Payments
Invoices
Support
URL Preview
Profile
Logout
```

The interesting feature is:

### URL Preview

For example:

```text
Enter URL:

https://example.com

[ Preview ]
```

The player investigates how the feature works.

The server fetches the requested URL.

They discover that the application can communicate with an **internal service**.

The player then discovers the internal API:

```text
http://api.internal.oriontech
```

The internal API contains a restricted incident record.

The player eventually obtains:

```text
Incident ID:
OT-INC-2026-041

Status:
CONFIDENTIAL

Evidence:
eclipse_incident.pcapng
```

The incident record also contains the C5 flag.

```text
ECLIPSE{blind_relay}
```

Most importantly, the record tells the player:

> **Network evidence from the incident has been preserved in `eclipse_incident.pcapng`.**

---

# 🟤 C6 — Echoes on the Wire

### Network Forensics

Now the player investigates:

```text
eclipse_incident.pcapng
```

The capture contains normal OrionTech network traffic.

For example:

```text
DNS
HTTP
SSH
NTP
DHCP
```

But hidden among the normal traffic is suspicious communication.

The player discovers unusual DNS requests such as:

```text
01.xxxxxx.orion-monitor.local
02.xxxxxx.orion-monitor.local
03.xxxxxx.orion-monitor.local
...
```

The data is split into multiple encoded fragments.

The player needs to:

1. Filter DNS traffic
2. Identify the suspicious domain
3. Identify the compromised host
4. Extract the fragments
5. Sort them
6. Reconstruct the message
7. Decode the data

Eventually they recover:

```text
SSH ACCESS

Username:
backupsvc

Password:
************

Server:
10.77.10.70
```

They also obtain:

```text
ECLIPSE{echoes_on_the_wire}
```

Now they have credentials to access an OrionTech Linux server.

---

# ⚫ C7 — Broken Boundary

### Linux Privilege Escalation

The player connects to:

```text
10.77.10.70
```

using:

```text
backupsvc
```

They are not root.

They investigate the system.

For example:

```text
whoami
id
sudo -l
find / -writable
```

They discover an intentionally vulnerable OrionTech maintenance process.

For example:

```text
/opt/orion/maintenance/backup.sh
```

The script is writable by the low-privileged account but executed by root.

The player uses the weakness to obtain:

```text
root
```

Once they become root, they discover a network configuration file:

```text
/etc/orion/internal-network.conf
```

It contains:

```text
Corporate Internal Network:

10.77.40.0/24

Finance Vault:
10.77.40.20
```

They now realize:

> The server they compromised has access to a second, isolated network.

C7 flag:

```text
ECLIPSE{broken_boundary}
```

---

# 🔥 C8 — Zero Hour

### Network Pivoting / Final Compromise

The player is currently on:

```text
10.77.10.70
```

But the Finance Vault exists on:

```text
10.77.40.0/24
```

The player cannot access that network directly.

The compromised OrionTech server has two network interfaces:

```text
eth0
10.77.10.70

eth1
10.77.40.10
```

Therefore the player must use the compromised server as a **pivot**.

After establishing access to the internal network, they discover:

```text
10.77.40.20
```

### Finance Vault

The final internal service contains sensitive synthetic company information:

```text
ORIONTECH FINANCE VAULT
──────────────────────────

Customer Payments
Subscription Records
Internal Invoices
Incident Reports
Backup Records
```

The player discovers the final investigation report.

It reveals:

> The attacker originally obtained information from a legacy OrionTech development project, used weaknesses in the company's old payment infrastructure, moved through the public OrionHub application, obtained access to an internal server, escalated privileges, and finally reached the isolated Finance network.

Then:

```text
ECLIPSE{oriontech_complete_compromise}
```

🏆 **FINAL FLAG**

---

# 🌐 The OrionTech Architecture

This story also gives you a logical architecture for the actual test environment:

```text
                         INTERNET
                            │
                            ▼
                 ┌────────────────────┐
                 │  OrionTech Public  │
                 │      Website       │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │     ORIONHUB       │
                 │  Customer Portal   │
                 │  Staff Login       │
                 │  Payments          │
                 │  Support           │
                 └─────────┬──────────┘
                           │
                           │
                 ┌─────────▼──────────┐
                 │    Internal API    │
                 │ api.internal...    │
                 └─────────┬──────────┘
                           │
                 ┌─────────▼──────────┐
                 │  Admin/Incident    │
                 │      Service       │
                 └────────────────────┘


                    INTERNAL NETWORK
                           │
                           ▼
                 ┌────────────────────┐
                 │   Linux Server     │
                 │   10.77.10.70      │
                 │   10.77.40.10      │
                 └─────────┬──────────┘
                           │
                     NETWORK PIVOT
                           │
                           ▼

                  FINANCE NETWORK
                    10.77.40.0/24
                           │
                           ▼
                 ┌────────────────────┐
                 │    FINANCE VAULT   │
                 │    10.77.40.20     │
                 └────────────────────┘
```

This fits very nicely with the original proposal's participant, challenge-service, and internal-vault network separation. 

---

# 👨‍💻 Staff Login Makes the Story Better

I would definitely include **staff authentication** in OrionHub.

The public side could look like:

```text
ORIONHUB

[ Customer Login ]
[ Staff Login ]
```

### Customer

Can access:

```text
Dashboard
Services
Payments
Invoices
Support Tickets
```

### Staff

Can access:

```text
Staff Dashboard
Customer Management
Payment Records
Support Tickets
Incident Management
Internal Reports
```

But here's the important design:

**Don't make the staff login itself the vulnerability.**

Instead, the player should gradually obtain legitimate-looking staff/service credentials from previous challenges and then discover that some **staff-only functionality incorrectly trusts requests coming through the public application**.

That makes C5 much more interesting because the player is not simply:

> "Find password → login → flag."

Instead:

> **Recon → hidden developer → cryptographic weakness → service credentials → reverse-engineering → staff application → server-side request behavior → internal API → incident evidence → PCAP → Linux credentials → privilege escalation → pivot → Finance Vault.**

---

# 🎬 The Story in One Sentence

If you need to explain the entire CTF to your lecturer:

> **Project ECLIPSE is an eight-stage penetration-testing CTF in which participants investigate a simulated compromise of OrionTech Solutions, beginning with public information leakage and progressing through cryptography, reverse engineering, web application security, network forensics, Linux privilege escalation, and network pivoting before reaching an isolated internal Finance Vault.**

That gives you a **single continuous attack narrative**, while every one of the original eight technical areas still has a clear purpose. 
