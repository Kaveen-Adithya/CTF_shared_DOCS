# PROJECT ECLIPSE

## OrionTech Solutions --- Complete CTF Challenge Design

### CTF Theme

**Project ECLIPSE** is an eight-stage penetration-testing CTF based on
the investigation of a simulated compromise of **OrionTech Solutions**,
a fictional IT software and services company.

The player begins with publicly available information and progressively
moves through OrionTech's software ecosystem, web infrastructure,
network traffic, Linux server, and isolated internal Finance network.

The challenges form a continuous attack chain:

``` text
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

------------------------------------------------------------------------

# Challenge 1 --- Shadow Profile

## Domain

**Advanced Reconnaissance / OSINT**

## Difficulty

Moderate

## Scenario

The investigation begins with the public-facing OrionTech Solutions
website.

OrionTech is a legitimate-looking IT company providing:

-   Software development
-   Cloud services
-   Managed IT services
-   Cybersecurity services
-   Technical support
-   Software subscriptions

The player is given the public OrionTech website and must investigate
information available through public sources.

During reconnaissance, the player discovers information about an old
OrionTech developer.

For example:

``` text
Developer:
Daniel Perera

Position:
Senior Software Engineer

Project:
OrionHub Payment Gateway

Username:
dperera
```

The developer previously worked on an abandoned OrionTech software
project.

The player eventually discovers an abandoned project page containing an
image.

The image becomes the starting point for Challenge 2.

## Player Objective

Identify the developer connected to the legacy OrionHub project and
locate the abandoned project artifact.

## Expected Techniques

-   Website enumeration
-   Search-engine investigation
-   Public metadata analysis
-   Username correlation
-   OSINT
-   Source-code repository investigation

## C1 Output

The player discovers:

``` text
Abandoned OrionTech project
+
Image artifact
```

## Flag

``` text
ECLIPSE{shadow_profile}
```

## Dependency

C1 → C2

------------------------------------------------------------------------

# Challenge 2 --- Fragments in Silence

## Domain

**Steganography / Digital Artifact Analysis**

## Difficulty

Moderate

## Scenario

The abandoned OrionTech project discovered during C1 contains an
apparently ordinary image.

Example:

``` text
legacy_orionhub.png
```

The image appears to be a normal technical image related to the old
software project.

However, OrionTech's developer used the image to hide information.

The player must investigate the image.

The hidden information contains an encrypted message.

The important part is that **the encrypted message itself is the
Challenge 2 flag**.

For example, the hidden content may look like:

``` text
4f52494f4e7b........
```

or another intentionally encrypted/encoded representation.

The player must identify the concealment method, extract the hidden
text, and recover the Challenge 2 flag.

## Player Objective

Analyze the image and recover the hidden encrypted message.

The player must determine how the message was concealed.

## Possible Techniques

-   Metadata analysis
-   `strings`
-   Hex analysis
-   Steganography analysis
-   LSB extraction
-   Embedded-data inspection
-   Image structure analysis

## Important Design Decision

Unlike the previous design, **do not make C2 unnecessarily
complicated**.

The intended chain should be:

``` text
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

The image can also contain a second piece of information pointing toward
the RSA material used in C3.

## C2 Output

Example:

``` text
Hidden encrypted message
+
RSA challenge artifact location
```

## Flag

``` text
ECLIPSE{fragments_in_silence}
```

## Dependency

C1 → C2 → C3

------------------------------------------------------------------------

# Challenge 3 --- Broken Trust

## Domain

**Applied Cryptography**

## Difficulty

Moderate-Hard

## Scenario

The information recovered from the abandoned OrionTech project leads to
two RSA public keys used by the company's old payment software.

Example:

``` text
orion_payment_public.pem
orion_backup_public.pem
```

The keys appear to use strong RSA encryption.

However, the old developer made a serious key-generation mistake.

The two RSA moduli share a prime factor.

Conceptually:

``` text
N1 = p × q1

N2 = p × q2
```

Therefore:

``` text
gcd(N1, N2) = p
```

The player must identify the cryptographic implementation weakness and
reconstruct the required private-key information.

The recovered private key allows the player to decrypt an encrypted
message.

That message provides the information required for Challenge 4.

## Player Objective

Identify the RSA weakness, recover the private key material, decrypt the
message, and obtain the Challenge 4 software information.

## Expected Techniques

-   RSA analysis
-   Public-key inspection
-   GCD calculation
-   Mathematical reasoning
-   OpenSSL
-   Cryptographic scripting
-   File analysis

## C3 Output

The decrypted message contains:

``` text
OrionTech software product
+
Trial download information
+
Challenge 4 clue
```

For example:

``` text
Product:
OrionDesk Enterprise

Version:
4.2 Trial

Download:
oriondesk_trial.exe
```

## Flag

``` text
ECLIPSE{broken_trust}
```

## Dependency

C2 → C3 → C4

------------------------------------------------------------------------

# Challenge 4 --- Blackbox

## Domain

**Reverse Engineering**

## Difficulty

Hard

## Scenario

OrionTech develops software products for customers.

One of its commercial products is:

### OrionDesk Enterprise

The player discovers the product through OrionTech's public
software/product page.

The company offers a **trial version** of the software.

The C3 information allows the player to identify the correct product and
obtain the trial version.

The trial application is intentionally designed as a CTF artifact.

For example:

``` text
OrionDesk Enterprise
Version 4.2 Trial
```

The player installs or executes the software in the controlled CTF
environment.

The trial version contains an intentional licensing restriction.

For example:

``` text
ORIONDESK ENTERPRISE

Trial Version

Remaining:
7 days

[ Activate License ]
```

The player must reverse engineer the application to understand how the
trial restriction works.

The application should **not** simply contain the flag as a plaintext
string.

Instead, the licensing logic should require analysis of the compiled
program.

The player discovers the internal license-validation logic and
determines how the trial restriction can be bypassed.

After successfully modifying or manipulating the program in the isolated
CTF environment, the software operates as a simulated lifetime/full
version.

The full version reveals the Challenge 4 flag.

## Player Objective

Reverse engineer the OrionDesk trial application and bypass its
simulated trial restriction to activate the lifetime version.

## Expected Techniques

-   Static binary analysis
-   Dynamic analysis
-   Strings analysis
-   Function identification
-   Control-flow analysis
-   Debugging
-   Ghidra
-   `objdump`
-   `strings`
-   Linux binary analysis

## Recommended Implementation

The binary should contain logic conceptually similar to:

``` text
check_license()
       ↓
check_trial_status()
       ↓
validate_activation()
       ↓
show_trial_features()
```

The player must understand the control flow and modify the appropriate
condition.

The flag should only become visible after the intended activation state
is reached.

## C4 Output

Successful activation:

``` text
ORIONDESK ENTERPRISE
LIFETIME LICENSE

License Status:
ACTIVE

ECLIPSE{blackbox}
```

## Dependency

C3 → C4

------------------------------------------------------------------------

# Challenge 5 --- Blind Relay

## Domain

**Advanced Web Application Security**

## Difficulty

Hard

## Scenario

After completing C4, the player has enough information to investigate
**OrionHub**, OrionTech's central customer and staff platform.

OrionHub provides:

``` text
Customer Login
Staff Login
Services
Payments
Invoices
Support
Document / Attachment Preview
```

The player must investigate the web application and identify
functionality that can be abused to reach internal services.

The challenge is designed as a practical web application assessment in
which the player uses **Burp Suite extensively** to intercept, inspect,
modify, and replay HTTP requests.

The intended attack chain is:

``` text
Web Enumeration
       ↓
Discover Hidden Preview Functionality
       ↓
Intercept Request with Burp Suite
       ↓
Manipulate URL Parameter
       ↓
Identify SSRF Behaviour
       ↓
Reach Internal Service
       ↓
Discover Internal API
       ↓
Exploit Broken Internal Trust
       ↓
Access Incident Record
       ↓
Retrieve PCAP Evidence
```

------------------------------------------------------------------------

## Stage 1 --- Web Application Enumeration

The player begins by investigating OrionHub's exposed functionality.

Some functionality is intentionally not linked from the normal
interface.

The player can use:

-   Burp Suite
-   ffuf
-   Browser developer tools
-   curl

The objective is to discover an obscure document-preview endpoint.

For example, the final endpoint could be conceptually similar to:

``` text
/tools/document-preview
```

The exact endpoint should not be obvious from the public navigation.

------------------------------------------------------------------------

## Stage 2 --- Burp Suite Request Analysis

Once the preview functionality is discovered, the player interacts with
it normally while **Burp Proxy** is running.

A legitimate request may look conceptually like:

``` http
POST /tools/document-preview HTTP/1.1

url=https://example.com/report.pdf
```

The player sends the captured request to **Burp Repeater** for further
testing.

The challenge should encourage the player to understand:

-   HTTP methods
-   Parameters
-   Cookies / sessions
-   Server-side processing
-   Request/response behaviour

------------------------------------------------------------------------

## Stage 3 --- SSRF Discovery

The player modifies the URL parameter and tests a CTF-local internal
destination.

For example:

``` text
http://127.0.0.1/
```

or another isolated internal service address.

The application response demonstrates that the **server itself is making
the request**.

The player therefore identifies a server-side request forgery condition.

Conceptually:

``` text
Player
  ↓
Burp Suite
  ↓
OrionHub
  ↓
Server-side URL request
  ↓
Internal OrionTech service
```

The challenge should not simply reveal the internal API immediately. The
player must investigate the application's behaviour and enumerate the
reachable internal service.

------------------------------------------------------------------------

## Stage 4 --- Internal Service Discovery

The SSRF functionality allows the player to interact with an internal
OrionTech service that is not directly exposed to the player.

The internal service can contain endpoints conceptually similar to:

``` text
/internal/status
/internal/api
/internal/incidents
```

The player must identify the useful endpoint through HTTP response
analysis and controlled request manipulation.

------------------------------------------------------------------------

## Stage 5 --- Broken Internal Trust

The internal incident service contains an intentionally weak trust
model.

The developers assumed that:

``` text
Only requests originating from OrionHub's internal network
can reach the incident service.
```

The service therefore relies on the internal network boundary rather
than implementing proper authorization.

Because OrionHub can be manipulated through SSRF, the player can cause
the trusted server to access the internal API on their behalf.

This creates the vulnerability chain:

``` text
SSRF
 +
Broken Internal Trust
 ↓
Unauthorized Internal API Access
```

This is the key advanced web-security concept of C5.

------------------------------------------------------------------------

## Player Objective

1.  Enumerate OrionHub.
2.  Discover the hidden document-preview functionality.
3.  Capture the request using Burp Suite.
4.  Send the request to Burp Repeater.
5.  Manipulate the URL parameter.
6.  Identify the SSRF behaviour.
7.  Reach the isolated internal service.
8.  Discover the hidden incident endpoint.
9.  Abuse the internal trust assumption.
10. Retrieve the incident record and PCAP evidence.

------------------------------------------------------------------------

## Expected Techniques

-   Web application enumeration
-   Burp Suite Proxy
-   Burp Suite Repeater
-   HTTP request manipulation
-   Parameter analysis
-   SSRF identification
-   Internal service enumeration
-   Broken authorization / trust-boundary analysis
-   ffuf
-   curl
-   Browser developer tools

------------------------------------------------------------------------

## C5 Output

The internal incident record contains:

``` text
Incident:
OT-INC-2026-041

Status:
Under Investigation

Evidence:
network-diagnostics-041.pcapng
```

The player can retrieve:

``` text
network-diagnostics-041.pcapng
```

The incident record also contains the C5 flag.

## Flag

``` text
ECLIPSE{blind_relay}
```

## Dependency

C4 → C5 → C6

------------------------------------------------------------------------

# Challenge 6 --- Echoes on the Wire

## Domain

**Network Forensics / Packet Reconstruction**

## Difficulty

Hard

## Scenario

The player obtains:

``` text
network-diagnostics-041.pcapng
```

from C5.

The PCAP represents traffic captured from an isolated OrionTech internal
environment.

The capture contains a mixture of legitimate and suspicious traffic.

For example:

``` text
DNS
ARP
HTTP
TCP
UDP
ICMP
```

The player is **not told which packets contain the important evidence**.

Instead, they must investigate the capture and identify the suspicious
communication.

------------------------------------------------------------------------

## Investigation

The player begins by analysing:

``` text
network-diagnostics-041.pcapng
```

using tools such as:

-   Wireshark
-   tshark
-   Follow TCP Stream
-   Display filters
-   Hex inspection

The PCAP contains several conversations.

One internal TCP communication contains an image transferred as
application data.

The relevant traffic is intentionally mixed with normal background
traffic so that the player must identify the correct stream rather than
simply selecting ten pre-labelled packets.

Conceptually:

``` text
PCAP
 ↓
Identify suspicious connection
 ↓
Inspect TCP stream
 ↓
Identify transferred binary data
 ↓
Recover ten relevant data segments
 ↓
Reconstruct image
```

------------------------------------------------------------------------

## Packet Reconstruction

The image is transmitted across **ten relevant TCP application-data
segments**.

The player is not given their packet numbers.

They must identify the correct stream and reconstruct the transferred
data.

The ten segments collectively contain the complete image.

The challenge therefore tests genuine packet-level investigation rather
than simply providing ten unrelated packets containing image fragments.

The intended evidence path is:

``` text
Mixed PCAP
      ↓
Find suspicious internal communication
      ↓
Follow TCP stream
      ↓
Identify image payload
      ↓
Reassemble / export data
      ↓
Recover original image
```

------------------------------------------------------------------------

## Recovered Image

The reconstructed image is an OrionTech internal diagnostic/location
artifact.

Example:

``` text
ORIONTECH NETWORK OPERATIONS

Incident:
OT-INC-2026-041

Diagnostic Location:

Latitude:
06°55'xx.x"N

Longitude:
79°5x'xx.x"E
```

The coordinates are **synthetic CTF data**.

They provide the information required to obtain the C6 flag.

------------------------------------------------------------------------

## Player Objective

1.  Open the PCAP obtained from C5.
2.  Identify suspicious network traffic.
3.  Determine which TCP communication contains the relevant data.
4.  Follow and analyse the TCP stream.
5.  Identify the ten relevant application-data segments.
6.  Reconstruct the transferred image.
7.  Extract the synthetic GPS coordinates.
8.  Recover the C6 flag.

------------------------------------------------------------------------

## Expected Techniques

-   Wireshark
-   tshark
-   TCP stream analysis
-   Packet filtering
-   Protocol analysis
-   Hexadecimal inspection
-   Binary data reconstruction
-   File extraction

------------------------------------------------------------------------

## Important Technical Design

The ten packets should be part of a **realistic network conversation**.

Do not label them:

``` text
Packet 1
Packet 2
Packet 3
...
Packet 10
```

for the player.

Instead, generate a realistic capture containing background traffic and
one suspicious transfer.

The player should discover the relevant packets through forensic
analysis.

This makes C6 a genuine **Network Forensics / Packet Reconstruction**
challenge.

------------------------------------------------------------------------

## C6 Output

Recovered image:

``` text
ORIONTECH NETWORK OPERATIONS

Diagnostic Location:
<synthetic GPS coordinates>
```

The recovered information reveals the C6 flag.

## Flag

``` text
ECLIPSE{echoes_on_the_wire}
```

## Dependency

C5 → C6 → C7

------------------------------------------------------------------------

# Challenge 7 --- Broken Boundary

## Domain

**Web File Upload + Linux Initial Access**

## Difficulty

Hard

## Scenario

During the web enumeration performed in C5, the player discovers another
obscure OrionTech page.

The page belongs to an old developer support/ticket system.

Example:

``` text
/legacy/support/ticket-request
```

The page is intentionally difficult to discover.

It contains an old customer ticket submission form.

The form allows users to upload attachments.

The intended restriction says:

``` text
Allowed:
PDF documents only
```

However, the upload validation is intentionally vulnerable.

The player discovers that a server-executable file can be uploaded
despite the supposed PDF restriction.

The player uses the vulnerability in the isolated CTF environment to
obtain a shell as a **low-privileged OrionTech user**.

For example:

``` text
www-data
```

or:

``` text
ticketuser
```

The player is not root.

After obtaining access, they investigate the system and find:

``` text
/home/ticketuser/user.txt
```

The file contains the C7 flag.

## Player Objective

Discover the hidden legacy ticket system, identify the upload weakness,
obtain low-privileged system access, and locate the user-level flag.

## Expected Skills

-   Web enumeration
-   File-upload security analysis
-   Burp Suite
-   ffuf
-   HTTP request manipulation
-   Linux shell
-   System enumeration

## Important Isolation Requirement

The upload vulnerability must exist **only inside the CTF environment**.

The server should:

-   Contain synthetic data
-   Have no access to production systems
-   Have no sensitive host mounts
-   Have no unnecessary outbound Internet access
-   Run inside the isolated challenge network

These isolation requirements are consistent with the original project
design.

## C7 Output

The player obtains:

``` text
Low-privileged Linux shell
+
user.txt
+
Internal server information
```

Example:

``` text
ECLIPSE{broken_boundary}
```

The system also contains information that becomes useful for C8.

## Dependency

C6 → C7 → C8

------------------------------------------------------------------------

# Challenge 8 --- Zero Hour

## Domain

**Linux Privilege Escalation + Network Pivoting**

## Difficulty

Hard / Capstone

## Scenario

The player now has low-privileged access to the OrionTech Linux server.

The player investigates the server.

They discover an OrionTech backup mechanism:

``` text
/opt/orion/backup/backup.sh
```

The backup process is executed automatically by root every five minutes.

Conceptually:

``` text
root
 │
 └── cron
      │
      └── backup.sh
```

However, the script has an intentional permission weakness.

The low-privileged user can modify the script.

The player identifies this privilege boundary and uses it to execute
code with root privileges.

The player becomes:

``` text
root
```

## Root Access

After obtaining root access, the player investigates the network
configuration.

They discover that the Linux server has two network interfaces:

``` text
eth0
10.77.10.70

eth1
10.77.40.10
```

The second interface connects to the isolated Finance network.

``` text
10.77.40.0/24
```

The player must use the compromised Linux system as a pivot.

------------------------------------------------------------------------

# Internal Finance Network

The player discovers:

``` text
10.77.40.20
```

This host contains:

### OrionTech Finance Vault

``` text
Customer Payments
Invoices
Subscription Records
Incident Reports
Internal Finance Documents
```

All data is synthetic and created specifically for the CTF.

The player must enumerate the authorized internal network and identify
the Finance Vault.

The final access sequence also requires information accumulated during
previous challenges.

------------------------------------------------------------------------

# Cross-Challenge Dependency

The final challenge should demonstrate that the previous challenges were
not independent.

The attack chain is:

``` text
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

The player therefore reconstructs the complete compromise rather than
solving eight unrelated puzzles.

## C8 Objective

1.  Investigate the Linux system.
2.  Identify the root-executed backup process.
3.  Exploit the intended privilege boundary.
4.  Obtain root access.
5.  Inspect network interfaces.
6.  Identify the Finance network.
7.  Establish the intended pivot.
8.  Enumerate the authorized internal subnet.
9.  Identify the Finance Vault.
10. Retrieve the final flag.

## Final Flag

``` text
ECLIPSE{oriontech_complete_compromise}
```

------------------------------------------------------------------------

# Final Challenge Summary

  ---------------------------------------------------------------------------------
  ID   Challenge     Domain                Main Skill               Difficulty
  ---- ------------- --------------------- ------------------------ ---------------
  C1   Shadow        OSINT / Recon         Public information       Moderate
       Profile                             gathering                

  C2   Fragments in  Steganography         Hidden image analysis    Moderate
       Silence                                                      

  C3   Broken Trust  Cryptography          RSA shared-prime attack  Moderate-Hard

  C4   Blackbox      Reverse Engineering   Trial software analysis  Hard

  C5   Blind Relay   Advanced Web          Burp Suite +             Hard
                     Application Security  Enumeration + SSRF +     
                                           internal trust           

  C6   Echoes on the Network Forensics     PCAP investigation + TCP Hard
       Wire                                stream + packet          
                                           reconstruction           

  C7   Broken        Web + Linux           File upload → initial    Hard
       Boundary                            access                   

  C8   Zero Hour     Privilege             Root → internal network  Hard / Capstone
                     Escalation + Pivoting → vault                  
  ---------------------------------------------------------------------------------

------------------------------------------------------------------------

# Complete Attack Chain

``` text
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
                │ Burp Suite +    │
                │ Web Security    │
                │ SSRF + Trust    │
                └────────┬────────┘
                         │
                 Incident + PCAP
                         │
                         ▼
                ┌─────────────────┐
                │ C6 Echoes on    │
                │ the Wire        │
                │ Network         │
                │ Forensics +     │
                │ Reconstruction  │
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

The revised design still covers the major technical domains required by
the original proposal:

  Assignment Area                             Revised Challenge
  ------------------------------------------- -------------------
  Reconnaissance                              C1
  Steganography                               C2
  Cryptography                                C3
  Reverse Engineering                         C4
  Advanced Web Application Security           C5
  Network Forensics / Packet Reconstruction   C6
  Linux Security / Privilege Escalation       C7 + C8
  Network Pivoting                            C8
  Cross-Challenge Dependency                  C1 → C8
  Scripting / Automation                      C3, C5, C6, C8
  Network Segmentation                        C8
  CTFd                                        All challenges
  Docker / Virtualization                     C5, C7, C8

The original assignment specifically maps the eight stages to learning
outcomes and emphasizes cross-challenge dependency, with C8 using
information accumulated from earlier challenges.

# Important Implementation Requirements

For the implementation, all vulnerable components must remain inside the
authorized CTF environment.

Use:

``` text
Synthetic accounts
Synthetic company data
Synthetic payment records
Synthetic employee identities
Synthetic GPS coordinates
Synthetic network traffic
Synthetic credentials
```

Do not use real:

``` text
Credit cards
Employee information
Customer information
Production credentials
Production software
Real company infrastructure
```

The original proposal explicitly requires synthetic data, private IP
addresses, isolated infrastructure, and no production systems.

# Recommended Scoring

The original scoring model totaled **2,875 points**, with difficulty
increasing toward C8.

A revised distribution can remain:

  Challenge         Score
  ----------- -----------
  C1                  150
  C2                  175
  C3                  250
  C4                  300
  C5                  400
  C6                  450
  C7                  500
  C8                  650
  **Total**     **2,875**

This maintains the original progression toward the capstone.

# Recent Design Changes

The following changes were made to strengthen C5 and C6 while preserving
the overall OrionTech attack chain:

### C5 --- Blind Relay

-   Added **Burp Suite** as a central tool rather than an optional tool.
-   Added a dedicated Burp Proxy → Repeater workflow.
-   Changed the web challenge into a multi-stage investigation:
    -   Web enumeration
    -   Hidden document-preview discovery
    -   HTTP request interception
    -   Parameter manipulation
    -   SSRF identification
    -   Internal service discovery
    -   Broken internal trust / authorization weakness
    -   Incident evidence retrieval
-   Kept the OrionHub story and the existing C5 → C6 dependency.
-   C5 still provides the PCAP required by C6.

### C6 --- Echoes on the Wire

-   Removed the artificial design where the player is directly told
    which ten packets contain the image.
-   The PCAP now contains realistic mixed/background traffic.
-   The player must identify the suspicious internal TCP communication.
-   The player follows the TCP stream and identifies the relevant
    application-data segments.
-   Exactly ten relevant segments can still make up the transferred
    image, preserving the original challenge requirement.
-   The reconstructed image contains synthetic GPS coordinates leading
    to the C6 flag.

These changes make C5 more clearly aligned with **Advanced Web
Application Security** and make C6 a more authentic **Network Forensics
/ Packet Reconstruction** challenge.

# Final Assessment

**Yes --- I would approve this revised challenge structure for the
project.**

The strongest changes are:

-   **C4:** The commercial software trial gives the reverse-engineering
    challenge a believable reason to exist.
-   **C5:** The web challenge becomes a practical Burp Suite-based
    investigation combining enumeration, HTTP request manipulation,
    SSRF, and a broken internal trust boundary.
-   **C6:** The PCAP now contains realistic mixed traffic, requiring the
    player to discover the suspicious TCP stream and reconstruct the ten
    relevant application-data segments rather than being told which ten
    packets to use.
-   **C7:** The hidden legacy ticket system creates a believable bridge
    from web enumeration to Linux access.
-   **C8:** Root escalation followed by network pivoting provides a
    strong capstone.

Most importantly, the eight stages still satisfy the original design
principle that the player should **progressively reproduce an attack
chain rather than solve isolated puzzles**.
