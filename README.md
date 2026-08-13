# SocketTalk

A full-stack realtime chat application. The backend is a Spring Boot WebSocket server with MongoDB persistence, and the frontend is a React + TypeScript single-page app built with Vite.

## Architecture

```
SocketTalk/
├── websocket/                  # Spring Boot backend
│   ├── docker-compose.yml      # MongoDB + mongo-express
│   └── src/main/java/com/saketh/websocket/
│       ├── chat/               # chat messages, notifications, STOMP handling
│       ├── chatroom/           # chat room grouping (deterministic chat ids)
│       ├── config/             # WebSocket broker, CORS, user interceptor
│       └── user/               # registration, login, logout, presence
└── chat-client/                # React + TypeScript frontend (Vite)
    └── src/
        ├── api/                # REST calls to the backend
        ├── components/         # chat window, sidebar, protected route, etc.
        ├── context/            # auth + toast contexts
        ├── hooks/              # socket connection, forms, admin dashboard
        └── pages/              # login, register, chat home, admin dashboard
```

## Tech stack

### Backend (`websocket/`)
- Java 17, Spring Boot, Maven
- Spring WebSocket with STOMP (SockJS endpoint at `/ws`)
- Spring Data MongoDB (persistence)
- Spring Security Crypto (BCrypt password hashing)

### Frontend (`chat-client/`)
- React 19 + TypeScript
- Vite (with `/auth`, `/users`, `/messages`, `/ws` dev proxy to port 8088)
- Tailwind CSS 4
- `@stomp/stompjs` + `sockjs-client` for realtime messaging
- React Router 7 for routing
- Axios for REST calls

## Features

- User registration, login, and logout with BCrypt-hashed passwords
- Realtime presence (online/offline) across connected clients
- One-to-one messaging with historical message loading from MongoDB
- Chat rooms grouped deterministically per sender/recipient pair
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
cd websocket
docker compose up -d
```

This starts MongoDB on `localhost:27017` and mongo-express on `localhost:8081`.

### 2. Run the backend

```bash
cd websocket
./mvnw spring-boot:run
```

The server runs on port `8088`. Connection details live in `src/main/resources/application.yml`.

### 3. Run the frontend

```bash
cd chat-client
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

In development, Vite proxies `/users`, `/messages`, `/auth`, and `/ws` to `http://localhost:8088`, so no CORS issues arise.

## Configuration

### Frontend environment variables (`chat-client/.env`)

| Variable             | Default                  | Purpose                              |
| -------------------- | ------------------------ | ------------------------------------ |
| `VITE_API_BASE_URL`  | `http://localhost:8088`  | Base URL for REST calls              |
| `VITE_WS_URL`        | (unset)                  | WebSocket endpoint, e.g. `http://localhost:8088/ws` |

For a deployed client, set both variables, e.g. `VITE_API_BASE_URL=https://api.example.com` and `VITE_WS_URL=https://api.example.com/ws`.

## REST API

All endpoints are served by the backend on port `8088`.

| Method | Endpoint                          | Description                            |
| ------ | --------------------------------- | -------------------------------------- |
| POST   | `/auth/register`                  | Register a new user (username + password) |
| POST   | `/auth/login`                     | Log in and mark the user online        |
| POST   | `/auth/logout`                    | Log out and mark the user offline      |
| GET    | `/users`                          | List currently online users            |
| GET    | `/messages/{senderId}/{recipientId}` | Chat history between two users      |

## WebSocket / STOMP

Connect to the SockJS endpoint `/ws` (with login header for the principal).

| Destination                    | Direction | Purpose                              |
| ------------------------------ | --------- | ------------------------------------ |
| `/app/chat`                    | client → server | Send a `ChatMessage` (senderId, recipientId, content) |
| `/user/queue/messages`         | server → client | Receive a `ChatNotification` for incoming messages |
| `/app/user.addUser`            | client → server | Broadcast presence on connect         |
| `/app/user.disconnectUser`     | client → server | Broadcast presence on disconnect      |
| `/user/topic`                  | server → client | Presence updates for connected users  |

## Data model

- `User` — `slug` (username, PK), `fullName`, `password` (hashed, JSON-ignored), `userStatus` (ONLINE/OFFLINE)
- `ChatMessage` — `id`, `chatId`, `senderId`, `recipientId`, `content`, `timestamp`
- `ChatRoom` — `id`, `chatId`, `senderId`, `recipientId` (a deterministic `chatId` is generated per sender/recipient pair, so both sides can look up the same conversation)

## Tests

Backend tests (Spring Boot test slices) can be run with:

```bash
cd websocket
./mvnw test
```
