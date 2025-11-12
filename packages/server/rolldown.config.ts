import { defineConfig } from "rolldown";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: "[name].js",
    chunkFileNames: "chunks/[name]-[hash].js",
  },
  platform: "node",
  external: [],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
