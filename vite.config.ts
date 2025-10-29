import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url"; // <-- 1. IMPORT `fileURLToPath` and `url`
import { defineConfig } from "vite";

// --- 2. DEFINE THE MODERN EQUIVALENTS for __filename and __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // --- 3. USE THE NEW `__dirname` VARIABLE ---
      // This will now work correctly in an ES Module environment.
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  build: {
    outDir: "dist",
  },
});