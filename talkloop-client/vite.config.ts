import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/auth": "http://localhost:8088",
      "/users": "http://localhost:8088",
      "/messages": "http://localhost:8088",
      "/uploads": "http://localhost:8088",
      "/ws": { target: "http://localhost:8088", ws: true },
    },
  },
});
