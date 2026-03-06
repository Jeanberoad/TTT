import { build } from "esbuild";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

console.log("Building client...");
execSync("npx vite build", { cwd: root, stdio: "inherit" });

console.log("Building server...");
await build({
  entryPoints: [path.join(root, "server/index.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: path.join(root, "dist/index.cjs"),
  external: ["pg-native"],
  alias: {
    "@shared": path.join(root, "shared"),
  },
});

console.log("Build complete!");
