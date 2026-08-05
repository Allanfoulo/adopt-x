import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mastraDir = path.join(rootDir, "adoptx-mastra");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

const services = [
  { name: "app", cwd: rootDir, command: npmCommand, args: ["run", "dev"] },
  { name: "convex", cwd: rootDir, command: npxCommand, args: ["convex", "dev"] },
  { name: "mastra", cwd: mastraDir, command: npxCommand, args: ["mastra", "dev"] },
];

const children = [];
let shuttingDown = false;

function stopChild(child) {
  if (!child.pid) return;

  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
      windowsHide: true,
    });
    return;
  }

  child.kill("SIGTERM");
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) stopChild(child);
  setTimeout(() => process.exit(exitCode), 250);
}

for (const service of services) {
  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
    windowsHide: false,
  });

  children.push(child);
  child.once("error", (error) => {
    console.error(`[${service.name}] failed to start: ${error.message}`);
    shutdown(1);
  });
  child.once("exit", (code) => {
    if (!shuttingDown && code !== 0) {
      console.error(`[${service.name}] exited with code ${code ?? 1}`);
      shutdown(code ?? 1);
    }
  });
}

process.once("SIGINT", () => shutdown());
process.once("SIGTERM", () => shutdown());
