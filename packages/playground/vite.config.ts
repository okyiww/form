import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJSX from "@vitejs/plugin-vue-jsx";
import path from "path";

export default defineConfig({
  base: "/form-playground",
  plugins: [vue(), vueJSX()],
  server: {
    port: 9751,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
