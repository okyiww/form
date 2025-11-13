import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts"],
  format: ["esm"],
  outDir: "dist",
  bundle: true,
  clean: true,
  sourcemap: false,
  noExternal: [/.*/],
  splitting: false,
});
