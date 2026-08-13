# Realtime Chat Client

React and TypeScript frontend for the Spring chat backend in the parent directory.

## Run locally

1. Start MongoDB (`docker compose up -d`) and the Spring backend on port 8088.
2. In this directory, run `npm install` and then `npm run dev`.
3. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The Vite proxy forwards `/users`, `/messages`, and `/ws` to `http://localhost:8088`, avoiding browser CORS issues during development.

For a deployed client, configure `VITE_API_BASE_URL` (for example, `https://api.example.com`) and `VITE_WS_URL` (for example, `https://api.example.com/ws`).
