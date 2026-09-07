# Project ECLIPSE — C1 Shadow Profile

## Challenge
ECL-01 — Shadow Profile

## Domain
OSINT / Web Reconnaissance

## Intended Difficulty
Easy

## Intended Player Flow

Home
→ People
→ investigate all three personnel profiles
→ compare project associations
→ identify Daniel Perera as the historical infrastructure developer
→ discover `dperera-dev`
→ discover `ECLIPSE Infrastructure`
→ follow the historical archive trail
→ infer `robots.txt` from the crawler-policy clue
→ `/archive/index`
→ `/repository/legacy`
→ recover `shadow_profile_complete`
→ submit `ECLIPSE{shadow_profile_complete}` to CTFd

## Important Design Decision

The main navigation intentionally exposes only **People**. Projects, Archive, and Repository are not shown as direct navigation links. This prevents a player from immediately clicking through to the answer and encourages the intended reconnaissance/correlation path.

## Decoys

- Maya Chan has an ECLIPSE connection through security/research review, but not infrastructure maintenance.
- Ravi Fernando has infrastructure experience but no ECLIPSE development association.
- Daniel Perera connects both the infrastructure role and archived ECLIPSE infrastructure.

## Run

```powershell
python -m venv venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
python -m flask --version
python app.py
```

Open:

`http://127.0.0.1:5000/`

If PowerShell activation is blocked, run:

```powershell
.\venv\Scripts\python.exe app.py
```

## CTF Flag

`ECLIPSE{shadow_profile_complete}`

The website displays only the verification string `shadow_profile_complete`, not the complete CTF flag.
