import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts"],
  format: ["esm"],
  outDir: "dist",
  bundle: false,
  clean: true,
  sourcemap: false,
});
