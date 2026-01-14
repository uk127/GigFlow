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
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://your-production-domain.com']
      : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
  }
});

connectDB();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-production-domain.com']
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'GigFlow API is running', status: 'OK' });
});

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

app.set('socketio', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server running`);
});
