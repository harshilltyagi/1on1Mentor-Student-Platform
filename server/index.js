import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import editorRoutes from "./routes/editorRoutes.js";

import auth from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/editor", editorRoutes);

// Test routes
app.get("/", (req, res) => {
  res.send("API is working");
});

app.get("/api/protected", auth, (req, res) => {
  res.status(200).json({
    message: "Access granted",
    user: req.user,
  });
});

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, userName, role }) => {
    socket.join(roomId);

    socket.userName = userName;
    socket.role = role;
    socket.roomId = roomId;

    socket.to(roomId).emit("user-joined", {
      socketId: socket.id,
      userName,
      role,
    });

    console.log(`${userName} joined room: ${roomId}`);
  });

  socket.on("send-message", ({ roomId, message, user }) => {
    io.to(roomId).emit("receive-message", {
      message,
      user,
    });
  });

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", {
      offer,
      sender: socket.id,
      userName: socket.userName,
      role: socket.role,
    });
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", {
      answer,
      sender: socket.id,
      userName: socket.userName,
      role: socket.role,
    });
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", {
      candidate,
      sender: socket.id,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (socket.role === "mentor" && socket.roomId) {
      socket.to(socket.roomId).emit("mentor-left");
    }
  });
});
