# SocketTalk

A full-stack realtime chat application. The backend is a Spring Boot WebSocket server with MongoDB persistence, and the frontend is a React + TypeScript single-page app built with Vite.

## Architecture

```
SocketTalk/
├── talkloop-server/            # Spring Boot backend
│   ├── docker-compose.yml      # MongoDB + mongo-express
│   └── src/main/java/com/saketh/talkloop/
│       ├── chat/               # chat messages, notifications, STOMP handling
│       ├── chatroom/           # chat room grouping (deterministic chat ids)
│       ├── config/             # WebSocket broker, CORS, user interceptor
│       └── user/               # registration, login, logout, presence
└── talkloop-client/            # React + TypeScript frontend (Vite)
    └── src/
        ├── api/                # REST calls to the backend
        ├── components/         # chat window, sidebar, emoji picker, etc.
        ├── context/            # auth, theme, and toast contexts
        ├── hooks/              # socket connection, forms, admin dashboard
        └── pages/              # login, register, chat home, admin dashboard
```

## Tech stack

### Backend (`talkloop-server/`)
- Java 17, Spring Boot, Maven
- Spring WebSocket with STOMP (SockJS endpoint at `/ws`)
- Spring Data MongoDB (persistence)
- Spring Security Crypto (BCrypt password hashing)

### Frontend (`talkloop-client/`)
- React 19 + TypeScript
- Vite (with `/auth`, `/users`, `/messages`, `/uploads`, `/ws` dev proxy to port 8088)
- Material UI (MUI) for UI components
- CSS Modules for scoped styling
- `@stomp/stompjs` + `sockjs-client` for realtime messaging
- React Router 7 for routing
- Axios for REST calls

## Features

- User registration, login, and logout with BCrypt-hashed passwords
- Chat list shows all users, offline ones marked offline
- Messages to offline users are stored and delivered when they sign in
- Server-side session stored in an HttpOnly + SameSite cookie (restored via `/auth/me`)
- Auto-logout after 1 hour of inactivity
- Realtime presence (online/offline) across connected clients
- One-to-one messaging with historical message loading from MongoDB
- Chat rooms grouped deterministically per sender/recipient pair
- Edit and delete messages (for me or for everyone)
- Read receipts with double-tick indicators
- Share images and files as attachments (inline preview for images)
- Dark mode / light mode toggle persisted server-side per user
- Admin dashboard to view connected users and force logout
- Auto-reconnecting WebSocket client (5s reconnect delay)
- Protected routes that redirect unauthenticated users to `/login`

## Prerequisites

- Java 17+
- Node.js 18+ and npm
- Docker (for MongoDB)

## Run locally

### 1. Start MongoDB

```bash
cd talkloop-server
docker compose up -d
```

This starts MongoDB on `localhost:27017` and mongo-express on `localhost:8081`.

### 2. Run the backend

```bash
cd talkloop-server
./mvnw spring-boot:run
```

The server runs on port `8088`. Connection details live in `src/main/resources/application.yml`.

### 3. Run the frontend

```bash
cd talkloop-client
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

In development, Vite proxies `/users`, `/messages`, `/auth`, and `/ws` to `http://localhost:8088`, so no CORS issues arise.

## Configuration

### Frontend environment variables (`talkloop-client/.env`)

| Variable             | Default                  | Purpose                              |
| -------------------- | ------------------------ | ------------------------------------ |
| `VITE_API_BASE_URL`  | `http://localhost:8088`  | Base URL for REST calls              |
| `VITE_WS_URL`        | (unset)                  | WebSocket endpoint, e.g. `http://localhost:8088/ws` |

For a deployed client, set both variables, e.g. `VITE_API_BASE_URL=https://api.example.com` and `VITE_WS_URL=https://api.example.com/ws`.

## REST API

All endpoints are served by the backend on port `8088`.

| Method | Endpoint                              | Description                                    |
| ------ | ------------------------------------- | ---------------------------------------------- |
| POST   | `/auth/register`                      | Register a new user (username + password)      |
| POST   | `/auth/login`                         | Log in, mark user online, issue session cookie |
| POST   | `/auth/logout`                        | Log out, mark user offline, clear cookie       |
| GET    | `/auth/me`                            | Restore the current user from session cookie   |
| PATCH  | `/auth/preferences`                   | Update user preferences (e.g. `{ "theme": "dark" }`) |
| GET    | `/users`                              | List all registered users (online + offline)   |
| GET    | `/users/online`                       | List currently online users                    |
| POST   | `/uploads`                            | Upload an image or file (multipart form-data)  |
| GET    | `/messages/{senderId}/{recipientId}`  | Chat history between two users                 |
| POST   | `/messages/{senderId}/{recipientId}/read` | Mark messages as read                      |
| PUT    | `/messages/{messageId}`               | Edit a message's content and/or attachments    |
| DELETE | `/messages/{messageId}/for-me`        | Delete a message for the current user only     |
| DELETE | `/messages/{messageId}/for-everyone`  | Delete a message for all participants          |

## Authentication

Login issues a server-side session token in an `HttpOnly` + `SameSite=Strict` cookie named `chatSession`. The token never reaches JavaScript (no `localStorage`), so it is safe from XSS. On startup the client calls `GET /auth/me` to restore the session; an invalid or expired session redirects to `/login`. Sessions expire after 1 hour, and the client additionally logs the user out after 1 hour of inactivity.

## WebSocket / STOMP

Connect to the SockJS endpoint `/ws` (with login header for the principal).

| Destination                    | Direction       | Purpose                                        |
| ------------------------------ | --------------- | ---------------------------------------------- |
| `/app/chat`                    | client → server | Send a `ChatMessage`                           |
| `/user/queue/messages`         | server → client | Receive a `ChatNotification` (message, read receipt, edit, or delete) |
| `/app/user.addUser`            | client → server | Broadcast presence on connect                  |
| `/app/user.disconnectUser`     | client → server | Broadcast presence on disconnect               |
| `/user/topic`                  | server → client | Presence updates for connected users           |

Notification types: `MESSAGE`, `MESSAGE_READ`, `MESSAGE_EDITED`, `MESSAGE_DELETED`.

## Data model

- `User` — `slug` (username, PK), `fullName`, `password` (hashed, JSON-ignored), `userStatus` (ONLINE/OFFLINE), `preferences` (map, e.g. `{ "theme": "dark" }`)
- `Session` — `id` (SHA-256 hash of token), `username`, `expiresAt` (TTL-indexed, 1 hour)
- `ChatMessage` — `id`, `chatId`, `senderId`, `recipientId`, `content`, `attachments[]`, `timestamp`, `edited`, `deletedForEveryone`, `readByRecipient`
- `ChatAttachment` — `url`, `fileName`, `contentType`, `fileSize`
- `ChatRoom` — `id`, `chatId`, `senderId`, `recipientId` (deterministic `chatId` per sender/recipient pair)

## Tests

Backend tests (Spring Boot test slices) can be run with:

```bash
cd talkloop-server
./mvnw test
```

Frontend unit tests (Jest + Testing Library) can be run with:

```bash
cd talkloop-client
npm test
```

Run in watch mode with `npm run test:watch`.
