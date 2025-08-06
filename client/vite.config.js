import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const isGitHubPages = process.env.NODE_ENV === "production" && process.env.GITHUB_PAGES === "true";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 4173,
  },
  preview: {
    port: 80,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  base: isGitHubPages ? "/tb-questionnaire/" : "/",
});