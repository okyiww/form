import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: resolve(__dirname, "./src"),
      },
    ],
  },
  build: {
    ssr: true,
    lib: {
      entry: resolve(__dirname, "./src/index.ts"),
      name: "lib",
      fileName: "index",
      formats: ["es"],
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    sourcemap: mode === "development" ? "inline" : false,
  },
  plugins: [
    dts({
      cleanVueFileName: true,
      outDir: "dist/types",
      include: ["./**/*"],
      exclude: ["**/*.spec.ts", "**/*.spec.tsx"],
    }),
  ],
}));
