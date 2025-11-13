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
  ssr: {
    // 关键：告诉 Vite 打包所有依赖
    noExternal: /^(?!node:)/,
  },
  build: {
    ssr: true,
    lib: {
      entry: resolve(__dirname, "./src/index.ts"),
      name: "lib",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: [/^node:.*/],
    },
    minify: mode === "production" ? "esbuild" : false,
    esbuildOptions:
      mode === "production"
        ? {
            drop: ["console", "debugger"],
          }
        : undefined,
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
