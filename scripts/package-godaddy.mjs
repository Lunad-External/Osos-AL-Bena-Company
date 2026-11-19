// Packages the built site for GoDaddy Node.js Hosting (Upload ZIP).
// Run `npm run build` first, then `npm run package:godaddy`.
// The zip holds the prebuilt client (dist), the SSR bundle (dist-server),
// server.mjs and a package.json with runtime dependencies only. GoDaddy runs
// `npm install`, `npm run build` (a no-op here) and `npm start`.
// Pass --no-pdf to leave the catalogue PDF out (upload it separately).
import { cp, mkdir, readFile, rm, writeFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const noPdf = process.argv.includes("--no-pdf");
const out = "deploy/godaddy";
await rm("deploy", { recursive: true, force: true });
await mkdir(out, { recursive: true });

const pkg = JSON.parse(await readFile("package.json", "utf8"));
await writeFile(
  `${out}/package.json`,
  JSON.stringify(
    {
      name: pkg.name,
      version: pkg.version,
      private: true,
      type: "module",
      main: "server.mjs",
      scripts: {
        build: 'echo "Prebuilt: dist and dist-server are included"',
        start: "NODE_ENV=production node server.mjs",
      },
      dependencies: pkg.dependencies,
      engines: pkg.engines,
    },
    null,
    2,
  ) + "\n",
);
await cp("server.mjs", `${out}/server.mjs`);
await cp("dist-server", `${out}/dist-server`, {
  recursive: true,
  // The SSR build copies public/ too; only the JavaScript bundle is needed.
  filter: (src) => src === "dist-server" || src.endsWith(".js"),
});
await cp("dist", `${out}/dist`, {
  recursive: true,
  filter: (src) => !src.includes("/.vite") && !(noPdf && src.endsWith(".pdf")),
});

// Leave out images no page references (old uploads kept in the repo).
const code =
  (await readFile(`${out}/dist-server/entry-server.js`, "utf8")) +
  (await readFile("dist/index.html", "utf8")) +
  (
    await Promise.all(
      (await readdir("dist/assets")).map((f) =>
        readFile(`dist/assets/${f}`, "utf8").catch(() => ""),
      ),
    )
  ).join("");
let removed = 0;
for (const f of await readdir(`${out}/dist/images`)) {
  const base = f.replace(/-480(\.\w+)$/, "$1");
  if (!code.includes(`images/${f}`) && !code.includes(`images/${base}`)) {
    await rm(`${out}/dist/images/${f}`);
    removed++;
  }
}

execFileSync("zip", ["-qr", "../obc-website-godaddy.zip", "."], { cwd: out });
console.log(
  `deploy/obc-website-godaddy.zip ready (${removed} unused images left out${noPdf ? ", catalogue PDF left out" : ""}).`,
);
