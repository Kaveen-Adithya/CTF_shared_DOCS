import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = 3001;

// Define simulated Linux root
const FAKE_ROOT = path.resolve(__dirname, "../c3/OS");

// ============================================================
// Static OrionTech website
// ============================================================
app.use(
  express.static(
    path.join(__dirname, "../public")
  )
);

// ============================================================
// C3 - Path Traversal Vulnerability with Custom Directory Listing
// ============================================================
app.get("/view", async (req, res) => {
  const queryPath = req.query.file;
  if (queryPath !== undefined && typeof queryPath !== "string") {
    return res.status(400).send("Parameter 'file' must be a single path.");
  }

  const userPath = queryPath ?? "";
  const targetPath = path.resolve(FAKE_ROOT, userPath);
  const relativePath = path.relative(FAKE_ROOT, targetPath);

  // Reject traversal outside the simulated OS instead of rewriting the requested path.
  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    return res.status(403).send("403 Forbidden: Access is denied.");
  }

  try {
    const [realRoot, realTarget] = await Promise.all([
      fs.promises.realpath(FAKE_ROOT),
      fs.promises.realpath(targetPath),
    ]);
    const realRelativePath = path.relative(realRoot, realTarget);

    // Also block symlinks inside the simulated OS that point to host files.
    if (
      realRelativePath === ".." ||
      realRelativePath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(realRelativePath)
    ) {
      return res.status(403).send("403 Forbidden: Access is denied.");
    }

    const relativeToRoot = realRelativePath.replace(/\\/g, "/");
    const stats = await fs.promises.stat(realTarget);

    if (stats.isDirectory()) {
      const files = await fs.promises.readdir(realTarget);

      // Rule: If the directory is a dead end (empty), deny access
      if (files.length === 0) {
        return res.status(403).send("403 Forbidden: Cannot read directory contents.");
        }

      const displayPath = relativeToRoot === "" ? "/" : `/${relativeToRoot}/`;
      const formatModified = (date: Date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      const escapeHtml = (value: string) =>
        value.replace(/[&<>"']/g, (char) => {
          const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          };
          return entities[char]!;
        });
      let fileRows = "";

      if (relativeToRoot !== "") {
        const parentRelative = path.dirname(relativeToRoot).replace(/\\/g, "/");
        const parentPath = parentRelative === "." ? "" : parentRelative;
        const parentStats = await fs.promises.stat(path.dirname(realTarget));
        const parentModified = escapeHtml(formatModified(parentStats.mtime));
        fileRows += `<tr><td><span aria-hidden="true">↰ </span><a href="?file=${encodeURIComponent(parentPath)}">Parent Directory</a></td><td>${parentModified}</td><td>-</td></tr>\n`;
      }

      for (const file of files.sort((a, b) => a.localeCompare(b))) {
        const filePath = path.join(realTarget, file);
        try {
          const fileStats = await fs.promises.lstat(filePath);
          const isDir = fileStats.isDirectory();
          const displayName = escapeHtml(`${file}${isDir ? "/" : ""}`);
          const size = isDir ? "-" : fileStats.size;
          const mtime = escapeHtml(formatModified(fileStats.mtime));
          const fileRelativePath = relativeToRoot === "" ? file : `${relativeToRoot}/${file}`;

          fileRows += `<tr>
            <td><span aria-hidden="true">${isDir ? "📁 " : ""}</span><a href="?file=${encodeURIComponent(fileRelativePath)}">${displayName}</a></td>
            <td>${mtime}</td>
            <td>${size}</td>
          </tr>\n`;
        } catch (error) {
          if (
            error instanceof Error &&
            "code" in error &&
            (error.code === "ENOENT" || error.code === "EACCES" || error.code === "EPERM")
          ) {
            continue;
          }
          throw error;
        }
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Index of ${escapeHtml(displayPath)}</title>
          <style>
            body { color: #000; background: #fff; font-family: "Times New Roman", serif; }
            h1 { font-size: 2em; margin-block: 0.67em; }
            a { color: #00e; }
            a:visited { color: #551a8b; }
            table { min-width: 300px; border-spacing: 2px 8px; }
            th { text-align: center; }
            td:nth-child(2) { white-space: nowrap; }
            td:last-child { text-align: right; }
            hr { width: 300px; margin-left: 0; }
            address { margin-top: 12px; }
          </style>
        </head>
        <body>
          <h1>Index of ${escapeHtml(displayPath)}</h1>
          <hr>
          <table>
            <thead>
              <tr>
                <th><a href="#">Name</a></th>
                <th><a href="#">Last modified</a></th>
                <th><a href="#">Size</a></th>
              </tr>
            </thead>
            <tbody>
              ${fileRows}
            </tbody>
          </table>
          <hr>
          <address>Apache Server</address>
        </body>
        </html>
      `;
      return res.send(html);
    }

    if (stats.isFile()) {
      return res.sendFile(realTarget);
    }

    return res.status(403).send("403 Forbidden: Invalid file type.");

  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return res.status(404).send("404 Not Found: File or directory does not exist.");
    }
    if (
      error instanceof Error &&
      "code" in error &&
      (error.code === "EACCES" || error.code === "EPERM")
    ) {
      return res.status(403).send("403 Forbidden: Cannot access this path.");
    }
    console.error("[C3] Failed to read simulated OS path:", error);
    return res.status(500).send("500 Internal Server Error.");
  }
});

// ============================================================
// C4 - OrionDesk Enterprise 4.2 Trial
// ============================================================
//
// The binary is intentionally kept outside /public.
//
// Player download:
//     /downloads/OrionDesk
//
// Actual file:
//     /c4/build/OrionDesk
// ============================================================
const orionDeskBinary = path.join(
  __dirname,
  "../c4/build/OrionDesk"
);

app.get(
  "/downloads/OrionDesk",
  (_req, res) => {
    res.download(
      orionDeskBinary,
      "OrionDesk",
      (error) => {
        if (error) {
          console.error(
            "[C4] OrionDesk download error:",
            error
          );
        }
      }
    );
  }
);

// ============================================================
// robots.txt
// ============================================================
app.get(
  "/robots.txt",
  (_req, res) => {
    res
      .type("text/plain")
      .send(`User-agent: *
Disallow: /team/
Disallow: /projects/legacy-orionhub.html
Disallow: /view?file=
`);
  }
);

// ============================================================
// Start server
// ============================================================
app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `OrionTech C1 running on http://0.0.0.0:${PORT}`
    );
  }
);