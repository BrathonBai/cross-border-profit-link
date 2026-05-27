import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: false,
    proxy: {
      "/api/usitc": {
        target: "https://hts.usitc.gov",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/usitc/, "")
      }
    }
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: "es2020",
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG
  }
});
