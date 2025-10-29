import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];

// Determine the root of the project (e.g., D:/Taka_ni_Mali)
const projectRoot = path.resolve(import.meta.dirname);
// Determine the root of the client app (e.g., D:/Taka_ni_Mali/client)
const clientRoot = path.resolve(projectRoot, 'client');


export default defineConfig({
  plugins,

  // --- CHANGE #1: The root is now the client folder itself ---
  root: clientRoot,
  
  // --- CHANGE #2: The envDir points to the project root to find your .env files ---
  envDir: projectRoot,

  resolve: {
    // --- CHANGE #3: Update aliases to be relative to the client/src folder ---
    alias: {
      "@": path.resolve(clientRoot, "src"),
      "@shared": path.resolve(projectRoot, "shared"),
      "@assets": path.resolve(projectRoot, "attached_assets"),
    },
  },

  publicDir: "public", // This will now correctly resolve to `client/public`

  build: {
    // --- CHANGE #4: The output directory is now a simple `dist` folder ---
    // This will correctly create the output at `client/dist`, which Vercel expects.
    outDir: "dist",
    emptyOutDir: true,
  },
  
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});