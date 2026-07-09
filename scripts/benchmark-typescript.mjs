import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { spawnSync } from "node:child_process";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const label = process.argv[2] ?? "typescript";
const safeLabel = label.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-|-$/g, "");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const logDir = join(repoRoot, "logs", "typescript-benchmarks");
const logPath = join(logDir, `${timestamp}-${safeLabel || "typescript"}.log`);
const tscBin = join(
  repoRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsc.cmd" : "tsc",
);

mkdirSync(logDir, { recursive: true });

const sections = [];

function run(command, args) {
  const started = performance.now();
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
  });
  const elapsedMs = performance.now() - started;

  sections.push([
    `$ ${[command, ...args].join(" ")}`,
    `exitCode: ${result.status}`,
    `wallClockMs: ${elapsedMs.toFixed(2)}`,
    result.stdout.trimEnd(),
    result.stderr.trimEnd(),
  ].filter(Boolean).join("\n"));

  return result;
}

sections.push([
  `label: ${label}`,
  `startedAt: ${new Date().toISOString()}`,
  `node: ${process.version}`,
  `platform: ${process.platform} ${process.arch}`,
].join("\n"));

const version = run(tscBin, ["--version"]);
const clean = run(tscBin, ["-b", "--clean"]);
const benchmark = run(tscBin, ["-b", "--extendedDiagnostics"]);

writeFileSync(logPath, `${sections.join("\n\n")}\n`, "utf8");

console.log(`TypeScript benchmark log: ${logPath}`);

if (version.status !== 0 || clean.status !== 0 || benchmark.status !== 0) {
  process.exit(benchmark.status || clean.status || version.status || 1);
}
