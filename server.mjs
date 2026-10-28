import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const root = dirname(fileURLToPath(import.meta.url));
const page = resolve(root, "preview.html");
createServer(async (_request, response) => {
  try {
    const html = await readFile(page);
    response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    response.end(html);
  } catch {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end("Could not load preview.html");
  }
}).listen(port, host, () => console.log(`OAuth Atlas folder preview ready at http://localhost:${port}`));
