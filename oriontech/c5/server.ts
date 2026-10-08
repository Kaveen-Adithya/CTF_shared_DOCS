import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const internal = express();

const PUBLIC_PORT = 3005;
const INTERNAL_PORT = 9105;

const BASE_DIR = path.resolve(process.cwd());
const EVIDENCE_FILE = path.join(
  BASE_DIR,
  "c5",
  "evidence",
  "network-diagnostics-041.pcapng"
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

internal.use(express.urlencoded({ extended: true }));
internal.use(express.json());


// ============================================================
// HTML helpers
// ============================================================

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ============================================================
// Public OrionHub
// ============================================================

app.get("/", (_req, res) => {
  res.type("html").send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OrionHub</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f4f6f8;
            color: #222;
        }

        header {
            background: #17212b;
            color: white;
            padding: 20px 40px;
        }

        header h1 {
            margin: 0;
        }

        nav {
            background: #243442;
            padding: 12px 40px;
        }

        nav a {
            color: white;
            text-decoration: none;
            margin-right: 25px;
        }

        main {
            max-width: 1000px;
            margin: 40px auto;
            padding: 0 20px;
        }

        .card {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,.08);
        }

        code {
            background: #eee;
            padding: 2px 5px;
        }
    </style>
</head>

<body>

<header>
    <h1>OrionHub</h1>
</header>

<nav>
    <a href="/">Home</a>
    <a href="/customer-login">Customer Login</a>
    <a href="/staff-login">Staff Login</a>
    <a href="/services">Services</a>
    <a href="/payments">Payments</a>
    <a href="/invoices">Invoices</a>
    <a href="/support">Support</a>
</nav>

<main>

    <div class="card">
        <h2>Welcome to OrionHub</h2>
        <p>
            OrionTech's central customer and staff platform.
        </p>
    </div>

    <div class="card">
        <h3>Document Services</h3>
        <p>
            OrionHub provides document and attachment processing
            services for authorized users.
        </p>
    </div>

    <div class="card">
        <h3>Customer Services</h3>
        <p>
            Manage payments, invoices, support requests and
            account information.
        </p>
    </div>

</main>

</body>
</html>
  `);
});


// ============================================================
// Public placeholder routes
// ============================================================

app.get(
  [
    "/customer-login",
    "/staff-login",
    "/services",
    "/payments",
    "/invoices",
    "/support"
  ],
  (req, res) => {

    res.type("html").send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OrionHub</title>
</head>

<body>

<h1>OrionHub</h1>

<h2>${escapeHtml(req.path)}</h2>

<p>
    OrionHub service endpoint.
</p>

<p>
    This functionality is currently available
    to authorized OrionHub users.
</p>

<a href="/">Return to OrionHub</a>

</body>
</html>
    `);
  }
);


// ============================================================
// Hidden document preview page
// ============================================================

app.get("/tools/document-preview", (_req, res) => {

  res.type("html").send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Document Preview</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 50px auto;
        }

        input {
            width: 80%;
            padding: 10px;
        }

        button {
            padding: 10px 20px;
        }

        .notice {
            background: #f4f4f4;
            padding: 15px;
            margin-top: 20px;
        }
    </style>
</head>

<body>

<h1>Document / Attachment Preview</h1>

<p>
    Enter the URL of a document that OrionHub should preview.
</p>

<form method="POST" action="/tools/document-preview">

    <input
        type="text"
        name="url"
        placeholder="https://example.com/report.pdf"
    >

    <button type="submit">
        Preview
    </button>

</form>

<div class="notice">
    Supported document preview service.
</div>

</body>
</html>
  `);
});


// ============================================================
// Vulnerable document preview
//
// INTENTIONAL CTF SSRF
// ============================================================

app.post("/tools/document-preview", async (req, res) => {

  const target = String(req.body?.url || "").trim();

  if (!target) {

    return res.status(400).type("text").send(
      "Missing required parameter: url"
    );
  }


  let parsed: URL;

  try {

    parsed = new URL(target);

  } catch {

    return res.status(400).type("text").send(
      "Invalid URL."
    );
  }


  try {

    /*
     * INTENTIONAL VULNERABILITY:
     *
     * The server makes an outbound request to the
     * user-controlled URL without restricting destinations.
     *
     * This is the C5 SSRF condition.
     */

    const response = await fetch(parsed.toString(), {
      redirect: "manual",
    });


    const body = await response.text();

    res.status(200).type("html").send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Document Preview</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1100px;
            margin: 40px auto;
        }

        pre {
            background: #111;
            color: #eee;
            padding: 20px;
            overflow-x: auto;
            white-space: pre-wrap;
        }

        .meta {
            background: #eee;
            padding: 15px;
            margin-bottom: 20px;
        }
    </style>
</head>

<body>

<h1>Document Preview</h1>

<div class="meta">

<strong>Requested URL:</strong>
${escapeHtml(target)}

<br>

<strong>HTTP Status:</strong>
${response.status}

</div>

<pre>${escapeHtml(body)}</pre>

</body>
</html>
    `);

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    res.status(502).type("text").send(
      `Document preview request failed: ${message}`
    );
  }
});


// ============================================================
// Internal service
//
// IMPORTANT:
// This service listens ONLY on 127.0.0.1.
// It is not directly exposed to external players.
//
// C5 relies on OrionHub SSRF to reach this service.
// ============================================================

internal.get("/", (_req, res) => {

  res.type("text").send(`
OrionTech Internal Service
==========================

Available internal endpoints:

/internal/status
/internal/api
/internal/incidents

Internal service version: 2.4.1
  `);
});


// ============================================================
// Internal status
// ============================================================

internal.get("/internal/status", (_req, res) => {

  res.type("text").send(`
ORIONTECH INTERNAL SERVICE STATUS

Service: Incident Management Service
Version: 2.4.1
Status: Operational

Services:
- Incident Management
- Evidence Repository
- Internal Audit
- Security Operations

Network:
Internal OrionTech Service Network

Authorization:
Internal network trust assumed.
  `);
});


// ============================================================
// Internal API discovery
// ============================================================

internal.get("/internal/api", (_req, res) => {

  res.type("text").send(`
ORIONTECH INTERNAL API

Available endpoints:

GET /internal/status
GET /internal/api
GET /internal/incidents

Incident API:

GET /internal/incidents
GET /internal/incidents/OT-INC-2026-041

Evidence API:

GET /internal/evidence
GET /internal/evidence/network-diagnostics-041.pcapng
  `);
});


// ============================================================
// Incident listing
// ============================================================

internal.get("/internal/incidents", (_req, res) => {

  res.type("text").send(`
ORIONTECH INCIDENT DATABASE

Available incidents:

OT-INC-2026-041
  `);
});


// ============================================================
// Target incident
// ============================================================

internal.get(
  "/internal/incidents/OT-INC-2026-041",
  (_req, res) => {

    res.type("text").send(`
ORIONTECH INTERNAL INCIDENT RECORD

Incident: OT-INC-2026-041

Title:
Unexpected internal network communication

Status:
Under Investigation

Severity:
High

Affected Component:
OrionHub Document Preview Service

Evidence:
network-diagnostics-041.pcapng

Evidence Location:
/internal/evidence/network-diagnostics-041.pcapng

Further analysis of PCAP evidence is required.

C5_FLAG: ECLIPSE{blind_relay}
    `);
  }
);


// ============================================================
// Evidence repository listing
// ============================================================

internal.get("/internal/evidence", (_req, res) => {

  res.type("text").send(`
ORIONTECH INTERNAL EVIDENCE REPOSITORY

Available evidence:

network-diagnostics-041.pcapng

Access:
Internal service only.
  `);
});


// ============================================================
// Actual PCAP evidence
//
// IMPORTANT:
// This route exists ONLY on the internal service.
//
// There is NO equivalent public route.
//
// Therefore:
//
// External Player
//       |
//       v
// OrionHub SSRF
//       |
//       v
// 127.0.0.1:9105
//       |
//       v
// PCAP
// ============================================================

internal.get(
  "/internal/evidence/network-diagnostics-041.pcapng",
  (_req, res) => {

    if (!fs.existsSync(EVIDENCE_FILE)) {

      return res.status(404).type("text").send(
        "Evidence file unavailable."
      );
    }


    const stat = fs.statSync(
      EVIDENCE_FILE
    );


    res.setHeader(
      "Content-Type",
      "application/vnd.tcpdump.pcap"
    );

    res.setHeader(
      "Content-Length",
      stat.size.toString()
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="network-diagnostics-041.pcapng"'
    );


    res.sendFile(
      EVIDENCE_FILE
    );
  }
);


// ============================================================
// Start public OrionHub
// ============================================================

app.listen(
  PUBLIC_PORT,
  "0.0.0.0",
  () => {

    console.log(
      `OrionHub listening on 0.0.0.0:${PUBLIC_PORT}`
    );

  }
);


// ============================================================
// Start internal service
// ============================================================

internal.listen(
  INTERNAL_PORT,
  "127.0.0.1",
  () => {

    console.log(
      `Internal service listening on 127.0.0.1:${INTERNAL_PORT}`
    );

    console.log(
      `Evidence file: ${EVIDENCE_FILE}`
    );

  }
);
