import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vitePackage = join(root, "node_modules", "vite", "package.json");

if (!existsSync(vitePackage)) {
  execSync("npm install", { stdio: "inherit", cwd: root });
}

execSync("npm run build --prefix web", { stdio: "inherit", cwd: root });
