import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  // GitHub Pages 用: リポジトリ名に合わせる
  base: "/taost6/tb-questionnaire/",
});
