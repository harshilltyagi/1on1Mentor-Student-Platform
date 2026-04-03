# 1on1 Mentor Student Platform

A real-time 1-to-1 mentoring platform* where a mentor and student can join a shared room, do a *video call, **chat in real time, and **collaboratively code* together.

## Features

- User authentication (Signup / Login)
- Role-based access (Mentor / Student)
- Create and join mentoring sessions using a meeting code
- Real-time 1-to-1 video calling with WebRTC
- Real-time chat with Socket.IO
- Collaborative code editor using Yjs + Monaco Editor
- Live online user awareness
- Save and load code editor state from database
- Mentor-controlled session flow

## Tech Stack (PERN)

### Frontend
- React
- Vite
- Monaco Editor
- Yjs
- y-websocket
- y-monaco
- Socket.IO Client
- React Router DOM

### Backend
- Node.js
- Express.js
- Socket.IO
- Prisma
- JWT Authentication
- BCrypt
- CORS
- dotenv

### Realtime / Collaboration
- WebRTC for video calling
- Socket.IO for chat and signaling
- Yjs CRDT for collaborative coding

### Deployment
- Frontend: Vercel
- Backend: Render
- Yjs WebSocket Server: Render

## Project Structure

```bash
1on1Mentor-Student-Platform/
│
├── client/1on1Mentor
│   ├── src
│   │   ├── pages
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Room.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env
│
├── server
│   ├── controllers
│   ├── middleware
│   ├── prisma
│   ├── routes
│   ├── utils
│   ├── .env
│   └── index.js
│
└── yjs-server.js
