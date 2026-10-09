import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = 3001;



app.use(
  express.static(
    path.join(__dirname, "../public")
  )
);




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




app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `OrionTech C1 running on http://0.0.0.0:${PORT}`
    );

  }
);
