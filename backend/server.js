import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import gigRoutes from './routes/gigs.js';
import bidRoutes from './routes/bids.js';

dotenv.config();

const app = express();
const server = createServer(app);

// ---------------------------
// ALLOWED ORIGINS FOR CORS
// ---------------------------
// Use the frontend deployed URL in production
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL] // must match your frontend domain
    : ['http://localhost:5173', 'http://localhost:5174'];

// ---------------------------
// SOCKET.IO CONFIG
// ---------------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // allow frontend to connect
    credentials: true,      // required to send cookies
  },
});

connectDB();

// ---------------------------
// EXPRESS CORS CONFIG
// ---------------------------
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // allow cookies in cross-origin requests
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------------
//  MIDDLEWARE
// ---------------------------
app.use(express.json());
app.use(cookieParser());

// ---------------------------
//  ROUTES
// ---------------------------
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);

// ---------------------------
//  HEALTH CHECK ROUTE
// ---------------------------
app.get('/api/health', (req, res) => {
  res.json({ message: 'GigFlow API is running', status: 'OK' });
});

// ---------------------------
//  SOCKET.IO EVENTS
// ---------------------------
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinUserRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Store io instance in app
app.set('socketio', io);

// ---------------------------
//  START SERVER
// ---------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server running`);
});
