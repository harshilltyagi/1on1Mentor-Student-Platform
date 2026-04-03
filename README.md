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

How It Works

Authentication

Users can sign up and log in as either:
	•	Mentor
	•	Student

Session Flow
	•	Mentor creates a session
	•	Student joins using the meeting code
	•	Both users enter the same room

Inside the Room
	•	Video call starts using WebRTC
	•	Chat works using Socket.IO
	•	Both users can edit the same code in real time using Yjs + Monaco
	•	Users can see who is online
	•	Mentor can end the session by leaving

Editor Persistence
	•	Code can be saved to the database
	•	Saved code is loaded back when the room is reopened


└── yjs-server.js

👨‍💻 Author
Harshil Tyagi

GitHub
https://github.com/harshilltyagi

Live Demo: https://1on1-mentor-student-platform.vercel.app/
Backend link : https://oneon1mentor-student-platform-1.onrender.com

