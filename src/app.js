const express = require('express')
const http = require('http') // 1. Import native HTTP module
const { Server } = require('socket.io') // 2. Import Socket.IO
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth.routes')
const roomRoutes = require('./routes/room.routes')
const patientRoutes = require('./routes/patient.routes')
const cors = require('cors')

const app = express()

// 3. Create the HTTP server wrapper around your Express app
const server = http.createServer(app)

// Define allowed origins dynamically
const allowedOrigins = [
  "http://localhost:5173",
  "https://wait-free-frontend.vercel.app",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL.replace(/\/$/, "")] : [])
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// 4. Initialize Socket.IO with dynamic CORS settings
const io = new Server(server, {
  cors: corsOptions,
});

// 5. ATTACH IO TO REQ OBJECT
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions));

// Basic Socket connection listener for debugging
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // Join a specific room channel
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`👤 Socket ${socket.id} joined room: ${roomId}`);
  });

  // Leave a specific room channel
  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`🚪 Socket ${socket.id} left room: ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔥 Client disconnected: ${socket.id}`);
  });
});

app.use("/api/auth", authRoutes)
app.use("/api/room", roomRoutes)
app.use("/api/patient", patientRoutes)

// 6. EXPORT THE SERVER WRAPPER
module.exports = server