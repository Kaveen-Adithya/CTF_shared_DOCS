import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = 3001;


// ============================================================
// Static OrionTech website
// ============================================================

app.use(
  express.static(
    path.join(__dirname, "../public")
  )
);


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
