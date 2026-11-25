// TDD-lite checks for the worst-fix-ever entry (kit: program/v1, Node 22, stdlib-only).
// Run: node test.mjs  (from the entry dir)
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
}

// 1. main.ts exists and imports only node: stdlib modules.
const src = readFileSync(new URL("./main.ts", import.meta.url), "utf8");
const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
check("stdlib-only imports", imports.every((i) => i.startsWith("node:")), imports.join(", "));

// 2. Run twice into two temp dirs; outputs must be identical (determinism).
function runOnce() {
  const dir = mkdtempSync(join(tmpdir(), "worst-fix-"));
  const r = spawnSync(process.execPath, ["main.ts"], {
    cwd: new URL(".", import.meta.url).pathname,
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: dir },
    encoding: "utf8",
  });
  const text = r.status === 0 ? readFileSync(join(dir, "entry.txt"), "utf8") : null;
  rmSync(dir, { recursive: true, force: true });
  return { status: r.status, text, stderr: r.stderr };
}
const a = runOnce();
const b = runOnce();
check("runs exit 0", a.status === 0 && b.status === 0, a.stderr || b.stderr || "");
check("deterministic output", a.text !== null && a.text === b.text);

// 3. Gate: entry.txt is UTF-8 text, 1–100 chars, not only whitespace.
const t = a.text ?? "";
check("gate: 1–100 chars", t.length >= 1 && t.length <= 100, `${t.length} chars`);
check("gate: not only whitespace", t.trim().length > 0);
check("gate: single line, no trailing newline bloat", !t.includes("\n"));

// 4. Reads like a commit message about a fix that backfired.
check("looks like a commit subject", /^fix:/.test(t.trim()), JSON.stringify(t));

console.log(failures === 0 ? "ALL GREEN" : `${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
