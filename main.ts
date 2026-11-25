// Worst Fix Ever: Funniest Commit Message
// Writes one commit message (<= 100 chars) for a bug fix that made
// everything worse, to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Node 22, stdlib-only, deterministic: same input always yields the same line.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The entry: a fix that "worked" — login now succeeds for everyone,
// because the password check was removed. Triumphant framing, horrifying
// method; the irony lands in one read, no explanation needed.
const ENTRY =
  "fix: login works for everyone now, password check removed";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const inputDir = process.env.MAKEFUN_INPUT_DIR ?? "/input";
void inputDir; // this bounty takes no input data; the line is fixed by design.

// Resolve paths from this script's own location, never from process.cwd().
const repoDir = dirname(fileURLToPath(import.meta.url));
void repoDir;

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
