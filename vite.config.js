import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  // GitHub Pages用: リポジトリ名に合わせる
  // Render等の他のホスティングサービスでは base を設定しない
  base: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true' 
    ? "/tb-questionnaire" 
    : "/",
});
