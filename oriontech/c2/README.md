# C2 — Hidden in Plain Sight

**Category:** Digital Forensics / Steganography  
**Difficulty:** Easy  
**Flag Format:** `ECLIPSE{...}`

## Challenge Description

During an investigation of OrionTech Solutions, a PNG image was recovered from a website. Although the image appears ordinary, it may contain hidden information relevant to the investigation.

Your task is to examine the image and recover the concealed information.

## Objective

Analyze the provided PNG file, identify any hidden data, and recover the flag.

## Hints

**Hint 1 — Look beyond the visible image**

An image can contain information that is not immediately visible when you open it normally.

**Hint 2 — Examine the file**

Inspect the PNG's metadata, properties, and internal contents for anything unusual.

**Hint 3 — Use forensic tools**

Try command-line tools that can reveal readable text, metadata, or additional data embedded in a file.

**Hint 4 — Investigate further**

If the initial inspection does not reveal the flag, consider whether information has been hidden using a steganography technique. Check which methods are appropriate for the evidence you discover.

## Recommended Tools

- `file` — identify the file type
- `strings` — search for readable text
- `exiftool` — inspect metadata, if installed
- `binwalk` — look for embedded or appended data, if installed
- A suitable PNG steganography analysis tool, if required

## Completion Criteria

Recover the flag and submit it through the CTF platform. Confirm that the platform accepts your answer.

## Learning Outcomes

- Examining image file properties and metadata
- Identifying suspicious or concealed data
- Practicing basic digital forensics
- Understanding introductory steganography techniques