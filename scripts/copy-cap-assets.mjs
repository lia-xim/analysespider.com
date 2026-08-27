import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const destination = join(projectRoot, "public", "vendor", "cap");

await mkdir(destination, { recursive: true });
await Promise.all([
  copyFile(
    join(
      projectRoot,
      "node_modules",
      "@cap.js",
      "wasm",
      "browser",
      "cap_wasm_bg.wasm",
    ),
    join(destination, "cap_wasm_bg.wasm"),
  ),
  copyFile(
    join(projectRoot, "node_modules", "pako", "dist", "pako_inflate.min.js"),
    join(destination, "pako_inflate.min.js"),
  ),
]);
