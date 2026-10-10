# C1 — Shadow Profile

**Category:** Digital Forensics / Git Investigation  
**Difficulty:** Easy  
**Flag Format:** `ECLIPSE{...}`

## Challenge Description

OrionTech Solutions has archived its legacy OrionHub Payment Gateway repository. During an investigation, analysts discovered that some historical deployment information may have been retained in the repository's Git history.

Your task is to investigate the archived repository and recover the hidden reference.

## Objective

Investigate the Git repository and reconstruct the flag from historical records.

## Hints

**Hint 1 — Look beyond the files**

The current source code may not contain everything you need. Historical records can preserve information that is no longer visible in the latest version.

**Hint 2 — Investigate the commit history**

Review the repository's commit messages and examine commits related to archived deployment information, legacy records, and historical references.

**Hint 3 — Read the full commit details**

A commit's description can contain additional information beyond its short title. Inspect suspicious commits carefully.

**Hint 4 — Combine your findings**

The required information is split across multiple historical records. Recover each fragment and combine them in the correct order.

## Recommended Tools

- Git
- Terminal or PowerShell
- A text editor

## Completion Criteria

Submit the reconstructed flag through the CTF platform and confirm that it is accepted.

## Learning Outcomes

- Investigating Git commit history
- Identifying sensitive information retained in historical records
- Using Git forensic techniques
- Reconstructing a flag from multiple evidence fragments