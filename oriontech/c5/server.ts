import express, { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const publicApp = express();
const internalApp = express();

const PUBLIC_PORT = 3005;
const INTERNAL_PORT = 9105;

const HOST = "0.0.0.0";
const INTERNAL_HOST = "127.0.0.1";

const C5_FLAG = "ECLIPSE{blind_relay}";

const EVIDENCE_FILE = path.join(
  process.cwd(),
  "c5",
  "evidence",
  "network-diagnostics-041.pcapng"
);

const INCIDENT_ID = "OT-INC-2026-041";
const EVIDENCE_NAME = "network-diagnostics-041.pcapng";
const SUPPORT_UPLOADS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "uploads"
);

const MAX_SUPPORT_UPLOAD_SIZE = 10 * 1024 * 1024;
const MAX_SUPPORT_REQUEST_SIZE = MAX_SUPPORT_UPLOAD_SIZE + 64 * 1024;

interface SupportAttachment {
  originalName: string;
  buffer: Buffer;
}

function safeUploadName(originalName: string): string {
  const baseName = path.posix.basename(originalName.replace(/\\/g, "/"));
  const safeName = baseName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 180);

  if (!safeName || safeName === "." || safeName === "..") {
    throw new SupportUploadError("The uploaded file name is invalid.");
  }

  return safeName;
}

class SupportUploadError extends Error {
  constructor(
    message: string,
    readonly statusCode: number = 400
  ) {
    super(message);
    this.name = "SupportUploadError";
  }
}

async function parseSupportAttachment(
  req: Request
): Promise<SupportAttachment | undefined> {
  const contentType = req.headers["content-type"] || "";

  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return undefined;
  }

  const contentLength = Number(req.headers["content-length"]);

  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_SUPPORT_REQUEST_SIZE
  ) {
    throw new SupportUploadError(
      "The uploaded file must be no larger than 10 MB.",
      413
    );
  }

  const chunks: Buffer[] = [];
  let requestSize = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    requestSize += buffer.length;

    if (requestSize > MAX_SUPPORT_REQUEST_SIZE) {
      throw new SupportUploadError(
        "The uploaded file must be no larger than 10 MB.",
        413
      );
    }

    chunks.push(buffer);
  }

  const body = Buffer.concat(chunks);
  const multipartRequest = new globalThis.Request(
    "http://localhost/support",
    {
      method: "POST",
      headers: { "content-type": contentType },
      body: new Uint8Array(body)
    }
  );
  const formData = await multipartRequest.formData();
  let attachment: SupportAttachment | undefined;
  let fileCount = 0;

  for (const [fieldName, value] of formData.entries()) {
    if (typeof value === "string") {
      continue;
    }

    if (value.name === "" && value.size === 0) {
      continue;
    }

    fileCount += 1;

    if (fieldName !== "paymentSlip" || fileCount > 1) {
      throw new SupportUploadError(
        "Upload only one file using the provided upload field."
      );
    }

    if (value.size > MAX_SUPPORT_UPLOAD_SIZE) {
      throw new SupportUploadError(
        "The uploaded file must be no larger than 10 MB.",
        413
      );
    }

    attachment = {
      originalName: value.name,
      buffer: Buffer.from(await value.arrayBuffer())
    };
  }

  return attachment;
}

publicApp.use(express.urlencoded({ extended: true }));
publicApp.use(express.json());

internalApp.use(express.urlencoded({ extended: true }));
internalApp.use(express.json());

/* ============================================================
   Common HTML
   ============================================================ */

function page(
  title: string,
  content: string,
  active: string = ""
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | OrionHub</title>

<style>
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: #f4f6f8;
    color: #202630;
}

header {
    background: #17212b;
    color: white;
    padding: 0;
}

.nav {
    max-width: 1180px;
    margin: auto;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
}

.logo {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.4px;
}

.nav-links {
    display: flex;
    gap: 22px;
}

.nav-links a {
    color: #dce3ea;
    text-decoration: none;
    font-size: 14px;
}

.nav-links a:hover {
    color: white;
}

.container {
    max-width: 1180px;
    margin: 40px auto;
    padding: 0 24px;
}

.hero {
    background: white;
    border: 1px solid #e0e5ea;
    border-radius: 8px;
    padding: 38px;
    margin-bottom: 24px;
}

.hero h1 {
    margin-top: 0;
    font-size: 32px;
}

.hero p {
    color: #5f6b76;
    line-height: 1.7;
}

.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
}

.card {
    background: white;
    border: 1px solid #e0e5ea;
    border-radius: 8px;
    padding: 24px;
}

.card h3 {
    margin-top: 0;
}

.card p {
    color: #66717d;
    line-height: 1.6;
}

.btn {
    display: inline-block;
    background: #2563eb;
    color: white;
    padding: 11px 18px;
    border-radius: 5px;
    text-decoration: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
}

.btn:hover {
    background: #1d4ed8;
}

input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ccd3da;
    border-radius: 5px;
    margin: 8px 0 16px;
    font-size: 14px;
}

label {
    font-weight: 600;
    font-size: 14px;
}

.notice {
    padding: 14px 16px;
    border-radius: 6px;
    background: #eef5ff;
    border: 1px solid #cfe0ff;
    margin-bottom: 20px;
}

pre {
    background: #111827;
    color: #e5e7eb;
    padding: 20px;
    border-radius: 7px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
}

footer {
    max-width: 1180px;
    margin: 60px auto 30px;
    padding: 0 24px;
    color: #89939d;
    font-size: 13px;
}

@media (max-width: 800px) {
    .grid {
        grid-template-columns: 1fr;
    }

    .nav-links {
        display: none;
    }
}
</style>
</head>

<body>

<header>
    <div class="nav">
        <div class="logo">OrionHub</div>

        <div class="nav-links">
            <a href="/">Dashboard</a>
            <a href="/services">Services</a>
            <a href="/payments">Payments</a>
            <a href="/invoices">Invoices</a>
            <a href="/support">Support</a>
            <a href="/documents">Documents</a>
        </div>
    </div>
</header>

<div class="container">
${content}
</div>

<footer>
    OrionHub &copy; 2026 OrionTech Solutions
</footer>

</body>
</html>`;
}

/* ============================================================
   Public OrionHub
   ============================================================ */

publicApp.get("/", (_req: Request, res: Response) => {
  res.send(
    page(
      "Dashboard",
      `
<div class="hero">
    <h1>Welcome to OrionHub</h1>

    <p>
        OrionHub is the central customer and service management platform
        used by OrionTech Solutions.
    </p>

    <p>
        Manage services, payments, invoices, support requests and
        documents from one platform.
    </p>
</div>

<div class="grid">

    <div class="card">
        <h3>Services</h3>
        <p>
            View OrionTech services and active subscriptions.
        </p>
        <a class="btn" href="/services">View Services</a>
    </div>

    <div class="card">
        <h3>Payments</h3>
        <p>
            Review payment activity and transaction information.
        </p>
        <a class="btn" href="/payments">Payments</a>
    </div>

    <div class="card">
        <h3>Support</h3>
        <p>
            Contact the OrionTech support team and review requests.
        </p>
        <a class="btn" href="/support">Support</a>
    </div>

</div>
`
    )
  );
});

publicApp.get("/services", (_req: Request, res: Response) => {
  res.send(
    page(
      "Services",
      `
<div class="hero">
    <h1>Services</h1>

    <div class="grid">

        <div class="card">
            <h3>Cloud Infrastructure</h3>
            <p>
                Managed infrastructure and cloud deployment services.
            </p>
        </div>

        <div class="card">
            <h3>Managed IT</h3>
            <p>
                Enterprise infrastructure monitoring and support.
            </p>
        </div>

        <div class="card">
            <h3>Security Services</h3>
            <p>
                Security assessment and managed security services.
            </p>
        </div>

    </div>
</div>
`
    )
  );
});

publicApp.get("/payments", (_req: Request, res: Response) => {
  res.send(
    page(
      "Payments",
      `
<div class="hero">
    <h1>Payments</h1>

    <p>
        Recent payment activity associated with your OrionHub account.
    </p>

    <table style="width:100%; border-collapse:collapse;">
        <tr>
            <th style="text-align:left;padding:12px;border-bottom:1px solid #ddd;">
                Transaction
            </th>

            <th style="text-align:left;padding:12px;border-bottom:1px solid #ddd;">
                Status
            </th>

            <th style="text-align:left;padding:12px;border-bottom:1px solid #ddd;">
                Amount
            </th>
        </tr>

        <tr>
            <td style="padding:12px;">TXN-2026-1024</td>
            <td style="padding:12px;">Completed</td>
            <td style="padding:12px;">LKR 18,500</td>
        </tr>

        <tr>
            <td style="padding:12px;">TXN-2026-1017</td>
            <td style="padding:12px;">Completed</td>
            <td style="padding:12px;">LKR 7,250</td>
        </tr>

    </table>
</div>
`
    )
  );
});

publicApp.get("/invoices", (_req: Request, res: Response) => {
  res.send(
    page(
      "Invoices",
      `
<div class="hero">
    <h1>Invoices</h1>

    <div class="card">
        <h3>INV-2026-041</h3>
        <p>Enterprise Cloud Services</p>
        <p><strong>Status:</strong> Paid</p>
    </div>

    <br>

    <div class="card">
        <h3>INV-2026-038</h3>
        <p>Managed IT Services</p>
        <p><strong>Status:</strong> Paid</p>
    </div>
</div>
`
    )
  );
});

publicApp.get("/support", (_req: Request, res: Response) => {
  res.send(
    page(
      "Support",
      `
<div class="hero">
    <h1>Support</h1>

    <p>
        Submit a support request to OrionTech Solutions.
    </p>

    <form method="POST" action="/support" enctype="multipart/form-data">

        <label>Subject</label>
        <input
            name="subject"
            placeholder="Describe your issue"
            required
        >

        <label>Description</label>
        <input
            name="description"
            placeholder="Describe the problem"
            required
        >

        <label for="payment-slip">Upload a file (up to 10 MB)</label>
        <input
            id="payment-slip"
            name="paymentSlip"
            type="file"
        >

        <button class="btn" type="submit">
            Submit Request
        </button>

    </form>
</div>
`
    )
  );
});

publicApp.post(
  "/support",
  async (req: Request, res: Response) => {
    let attachment: SupportAttachment | undefined;

    try {
      attachment = await parseSupportAttachment(req);
    } catch (error) {
      const statusCode =
        error instanceof SupportUploadError ? error.statusCode : 400;
      const message =
        error instanceof SupportUploadError
          ? error.message
          : "The upload could not be processed. Please try again with one file.";

      res.status(statusCode).send(
        page(
          "Support Request",
          `
<div class="hero">
    <h1>Upload Failed</h1>
    <div class="notice">${message}</div>
    <a class="btn" href="/support">Back to Support</a>
</div>
`
        )
      );

      return;
    }

    let uploadedName: string | undefined;
    if (attachment) {
      uploadedName = safeUploadName(attachment.originalName);
      await fs.promises.mkdir(SUPPORT_UPLOADS_DIR, { recursive: true });
      try {
        await fs.promises.writeFile(
          path.join(SUPPORT_UPLOADS_DIR, uploadedName),
          attachment.buffer,
          { flag: "wx", mode: 0o600 }
        );
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") {
          res.status(409).send(
            page(
              "Support Request",
              `
<div class="hero">
    <h1>Upload Failed</h1>
    <div class="notice">A file with that name already exists. Rename the file and try again.</div>
    <a class="btn" href="/support">Back to Support</a>
</div>
`
            )
          );
          return;
        }
        throw error;
      }
    }

    res.send(
      page(
        "Support Request",
        `
<div class="hero">
    <h1>Support Request Submitted</h1>

    <div class="notice">
        Your support request has been submitted successfully.${uploadedName ? ` Uploaded: ${escapeHtml(uploadedName)}.` : ""}
    </div>

    <a class="btn" href="/support/uploads">View uploaded files</a>
    <a class="btn" href="/">Return to Dashboard</a>
</div>
`
      )
    );
  }
);

publicApp.get("/support/uploads", async (_req: Request, res: Response) => {
  try {
    const entries = await fs.promises.readdir(SUPPORT_UPLOADS_DIR, {
      withFileTypes: true
    });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));

    const fileLinks = files.length
      ? files
          .map(
            (name) =>
              `<li><a href="/support/uploads/${encodeURIComponent(name)}">${escapeHtml(name)}</a></li>`
          )
          .join("\n")
      : "<li>No uploaded files yet.</li>";

    res.send(
      page(
        "Uploaded Files",
        `
<div class="hero">
    <h1>Uploaded Files</h1>
    <p>Select a file to view it. PHP files run when opened.</p>
    <ul>${fileLinks}</ul>
    <a class="btn" href="/support">Upload another file</a>
</div>
`
      )
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      res.send(
        page(
          "Uploaded Files",
          `
<div class="hero">
    <h1>Uploaded Files</h1>
    <p>No uploaded files yet.</p>
    <a class="btn" href="/support">Upload a file</a>
</div>
`
        )
      );
      return;
    }

    console.error("[C5] Failed to list support uploads:", error);
    res.status(500).send("Unable to list uploaded files.");
  }
});

publicApp.get(
  "/support/uploads/:filename",
  async (req: Request, res: Response) => {
    const filename = path.basename(req.params.filename);

    if (!filename || filename !== req.params.filename) {
      res.sendStatus(400);
      return;
    }

    const filePath = path.join(SUPPORT_UPLOADS_DIR, filename);

    try {
      const fileStats = await fs.promises.stat(filePath);
      if (!fileStats.isFile()) {
        res.sendStatus(404);
        return;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        res.sendStatus(404);
        return;
      }
      throw error;
    }

    if (path.extname(filename).toLowerCase() !== ".php") {
      res.type("application/octet-stream").download(filePath, filename);
      return;
    }

    const queryString = new URL(
      req.originalUrl,
      "http://localhost"
    ).searchParams.toString();

    // Intentional CTF behavior: execute the uploaded PHP script in this challenge container.
    execFile(
      "php",
      [
        "-r",
        "parse_str(getenv('CTF_QUERY_STRING') ?: '', $_GET); $_REQUEST = $_GET; include $argv[1];",
        "--",
        filePath
      ],
      {
        cwd: SUPPORT_UPLOADS_DIR,
        timeout: 5000,
        maxBuffer: 1024 * 1024,
        windowsHide: true,
        env: {
          PATH: process.env.PATH || "",
          HOME: SUPPORT_UPLOADS_DIR,
          CTF_QUERY_STRING: queryString
        }
      },
      (error, stdout, stderr) => {
        if (error) {
          const output = stdout + stderr;
          const message =
            error.code === "ENOENT"
              ? "PHP CLI is not installed in the application container."
              : output || error.message;
          res.status(error.code === "ENOENT" ? 503 : 500)
            .type("text/plain")
            .send(message);
          return;
        }

        res.status(200).type("html").send(stdout);
      }
    );
  }
);

/* ============================================================
   Document Preview
   ============================================================ */

/*
 * IMPORTANT:
 *
 * This functionality is intentionally vulnerable for the CTF.
 *
 * It accepts a user-controlled URL and performs a server-side
 * HTTP request to that URL.
 *
 * This is the SSRF vulnerability used by C5.
 */

publicApp.get("/documents", (_req: Request, res: Response) => {
  res.send(
    page(
      "Document Preview",
      `
<div class="hero">

    <h1>Document Preview</h1>

    <p>
        OrionHub can retrieve publicly available documents and
        generate a preview.
    </p>

    <p>
        Enter the URL of a document below.
    </p>

    <form method="POST" action="/tools/document-preview">

        <label for="url">
            Document URL
        </label>

        <input
            id="url"
            name="url"
            type="url"
            placeholder="https://example.com/report.pdf"
            required
        >

        <button class="btn" type="submit">
            Preview Document
        </button>

    </form>

</div>
`
    )
  );
});

/* ============================================================
   SSRF Helper
   ============================================================ */

async function performServerSideRequest(
  targetUrl: string
): Promise<Response> {
  return await fetch(targetUrl, {
    method: "GET",
    redirect: "manual",
    signal: AbortSignal.timeout(5000),

    headers: {
      "User-Agent": "OrionHub-Document-Preview/1.0"
    }
  });
}

/* ============================================================
   Vulnerable Document Preview Endpoint
   ============================================================ */

publicApp.post(
  "/tools/document-preview",
  async (req: Request, res: Response) => {
    const targetUrl = String(req.body?.url || "").trim();

    if (!targetUrl) {
      res.status(400).send(
        page(
          "Document Preview",
          `
<div class="hero">
    <h1>Document Preview</h1>

    <div class="notice">
        A document URL is required.
    </div>

    <a class="btn" href="/documents">
        Back
    </a>
</div>
`
        )
      );

      return;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      res.status(400).send(
        page(
          "Document Preview",
          `
<div class="hero">
    <h1>Invalid URL</h1>

    <div class="notice">
        The supplied document URL is invalid.
    </div>
</div>
`
        )
      );

      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      res.status(400).send(
        page(
          "Document Preview",
          `
<div class="hero">
    <h1>Unsupported URL</h1>

    <div class="notice">
        Only HTTP and HTTPS URLs are supported.
    </div>
</div>
`
        )
      );

      return;
    }

    try {
      /*
       * INTENTIONAL SSRF
       *
       * No hostname allow-list is used here.
       *
       * This is deliberately vulnerable inside the isolated
       * CTF environment.
       */

      const upstream = await performServerSideRequest(targetUrl);

      const contentType =
        upstream.headers.get("content-type") ||
        "application/octet-stream";

      const contentDisposition =
        upstream.headers.get("content-disposition");

      const buffer = Buffer.from(await upstream.arrayBuffer());

      /*
       * Binary evidence such as the PCAP must be returned
       * unchanged.
       */

      if (
        contentType.includes("application/vnd.tcpdump.pcap") ||
        contentType.includes("application/octet-stream") ||
        contentType.includes("application/pcap") ||
        contentDisposition?.toLowerCase().includes("attachment")
      ) {
        res.status(upstream.status);

        res.setHeader("Content-Type", contentType);

        if (contentDisposition) {
          res.setHeader(
            "Content-Disposition",
            contentDisposition
          );
        }

        res.setHeader(
          "Content-Length",
          buffer.length.toString()
        );

        res.send(buffer);

        return;
      }

      /*
       * Normal text/HTML/JSON responses are displayed inside
       * the preview page.
       */

      const body = buffer.toString("utf-8");

      res.status(upstream.status);

      res.send(
        page(
          "Document Preview",
          `
<div class="hero">

    <h1>Document Preview</h1>

    <div class="notice">
        Remote document retrieved successfully.
    </div>

    <p>
        Source:
        <strong>${escapeHtml(targetUrl)}</strong>
    </p>

    <p>
        HTTP Status:
        <strong>${upstream.status}</strong>
    </p>

    <p>
        Content-Type:
        <strong>${escapeHtml(contentType)}</strong>
    </p>

    <pre>${escapeHtml(body)}</pre>

</div>
`
        )
      );

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown request error";

      res.status(502).send(
        page(
          "Document Preview",
          `
<div class="hero">

    <h1>Preview Failed</h1>

    <div class="notice">
        OrionHub could not retrieve the requested document.
    </div>

    <pre>${escapeHtml(message)}</pre>

    <a class="btn" href="/documents">
        Back
    </a>

</div>
`
        )
      );
    }
  }
);

/* ============================================================
   Utility
   ============================================================ */

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ============================================================
   Internal Incident Service
   ============================================================ */

/*
 * This service is deliberately bound to 127.0.0.1.
 *
 * A player cannot directly connect to this service from outside
 * the machine.
 *
 * The intended route is:
 *
 * Player → OrionHub :3005 → SSRF → 127.0.0.1:9105
 */

internalApp.get("/", (_req: Request, res: Response) => {
  res.type("html").send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>OrionTech Internal Service</title>
</head>
<body>
<h1>OrionTech Internal Service</h1>

<p>Service: Incident Management</p>
<p>Status: Operational</p>
<p>Version: 1.4.2</p>

</body>
</html>
`);
});

internalApp.get(
  "/internal/status",
  (_req: Request, res: Response) => {
    res.json({
      service: "OrionTech Incident Management",
      status: "operational",
      version: "1.4.2",
      environment: "internal",
      authorization: "internal-network-trust"
    });
  }
);

internalApp.get(
  "/internal/api",
  (_req: Request, res: Response) => {
    res.json({
      service: "OrionTech Incident Management",
      version: "1.4.2",
      endpoints: [
        "/internal/status",
        "/internal/api",
        "/internal/incidents"
      ]
    });
  }
);

internalApp.get(
  "/internal/incidents",
  (_req: Request, res: Response) => {
    res.json({
      incidents: [
        {
          id: "OT-INC-2026-038",
          status: "Resolved"
        },
        {
          id: "OT-INC-2026-039",
          status: "Closed"
        },
        {
          id: INCIDENT_ID,
          status: "Under Investigation"
        }
      ]
    });
  }
);

internalApp.get(
  `/internal/incidents/${INCIDENT_ID}`,
  (_req: Request, res: Response) => {
    res.type("text").send(`
ORIONTECH INCIDENT MANAGEMENT
========================================

Incident:
${INCIDENT_ID}

Title:
Unexpected internal network communication

Status:
Under Investigation

Severity:
High

Affected Component:
OrionHub Document Preview Service

Description:
An unexpected communication pattern was detected
between the OrionHub document preview component and
an internal OrionTech service.

The incident requires network-level investigation.

Evidence:
${EVIDENCE_NAME}

Evidence Location:
/internal/evidence/${EVIDENCE_NAME}

Further analysis of PCAP is required.

C5_FLAG:
${C5_FLAG}
`);
  }
);

/*
 * The evidence file is intentionally NOT listed from
 * /internal/api.
 *
 * The player must first discover the incident record.
 */

internalApp.get(
  `/internal/evidence/${EVIDENCE_NAME}`,
  (_req: Request, res: Response) => {
    if (!fs.existsSync(EVIDENCE_FILE)) {
      res.status(404).type("text").send(
        "Evidence file is unavailable."
      );

      return;
    }

    const stats = fs.statSync(EVIDENCE_FILE);

    res.status(200);

    res.setHeader(
      "Content-Type",
      "application/vnd.tcpdump.pcap"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${EVIDENCE_NAME}"`
    );

    res.setHeader(
      "Content-Length",
      stats.size.toString()
    );

    res.sendFile(EVIDENCE_FILE);
  }
);

/* ============================================================
   Direct Access Protection
   ============================================================ */

/*
 * The internal service is NOT exposed on the public application.
 *
 * Therefore:
 *
 * http://SERVER:3005/internal/status
 *
 * should NOT work.
 *
 * Only:
 *
 * http://127.0.0.1:9105/internal/status
 *
 * works from the server itself.
 */

/* ============================================================
   Start Servers
   ============================================================ */

publicApp.listen(PUBLIC_PORT, HOST, () => {
  console.log(
    `[C5] Public OrionHub listening on http://${HOST}:${PUBLIC_PORT}`
  );
});

internalApp.listen(
  INTERNAL_PORT,
  INTERNAL_HOST,
  () => {
    console.log(
      `[C5] Internal incident service listening on http://${INTERNAL_HOST}:${INTERNAL_PORT}`
    );

    console.log(
      `[C5] Evidence file: ${EVIDENCE_FILE}`
    );

    if (fs.existsSync(EVIDENCE_FILE)) {
      const stats = fs.statSync(EVIDENCE_FILE);

      console.log(
        `[C5] PCAP found: ${stats.size} bytes`
      );
    } else {
      console.error(
        `[C5] ERROR: PCAP not found`
      );
    }
  }
);
